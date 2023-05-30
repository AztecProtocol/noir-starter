// @ts-ignore
import { Contract } from 'ethers';
import fs from 'fs';
import { ethers } from 'hardhat';
import path from 'path';
import { execSync } from 'child_process';
import { expect } from 'chai';
import { MerkleTree } from '../utils/merkleTree'; // MerkleTree.js
import merkle from './merkle.json'; // merkle
import keccak256 from 'keccak256';

// @ts-ignore -- no types
import blake2 from 'blake2';

// @ts-ignore -- no types
import { BarretenbergWasm } from '@noir-lang/barretenberg';

import { generateHashPathInput } from '../utils/helpers'; // helpers.ts

function generateLeaf(address: string, value: string): Buffer {
  return Buffer.from(
    // Hash in appropriate Merkle format
    ethers.utils.solidityKeccak256(['address', 'uint256'], [address, value]).slice(2),
    'hex',
  );
}

function prove(abi: any, testCase: string) {
  console.log('abi', abi);

  console.log('Writing to Prover/Verifier.toml...');
  const proverToml = `
      pub_key_x = [${abi.pub_key_x}]\n
      pub_key_y = [${abi.pub_key_y}]\n
      signature = [${abi.signature}]\n
      hashed_message = [${abi.hashed_message}]\n
      nullifier = [${abi.nullifier}]\n
      merkle_path = [${abi.merkle_path}]\n
      leaf = "${abi.leaf}"\n
      index = ${abi.index}\n
      merkle_root = "${abi.merkle_root}"
    `;
  fs.writeFileSync('Prover.toml', proverToml);
  execSync(`nargo prove ${testCase} --show-output`);
  const proof = fs.readFileSync(`proofs/${testCase}.proof`);
  return proof;
}

describe('Airdrop', () => {
  let airdrop: Contract;
  let merkleTree: MerkleTree;
  let messageToHash: string | Uint8Array;
  let hashedMessage: Uint8Array;

  before('Deploy contract', async () => {
    const Token = await ethers.getContractFactory('BasicToken');
    const token = await Token.deploy(100000000);

    // execSync('nargo codegen-verifier');

    const Verifier = await ethers.getContractFactory('TurboVerifier');
    const verifierContract = await Verifier.deploy();
    const verifierAddr = await verifierContract.deployed();

    const Airdrop = await ethers.getContractFactory('Airdrop');
    const barretenberg = await BarretenbergWasm.new();
    await barretenberg.init();

    // Setup merkle tree
    merkleTree = new MerkleTree(4, barretenberg);
    Object.keys(merkle).map((addr: any) => {
      // @ts-ignore
      merkleTree.insert(generateLeaf(addr, merkle[addr]).toString('hex'));
    });

    const message = '0xabfd76608112cc843dca3a31931f3974da5f9f5d32833e7817bc7e5c50c7821e'; // keccak of "signthis"
    airdrop = await Airdrop.deploy(
      token.address,
      '0x' + merkleTree.root(),
      message,
      verifierAddr.address,
    );
    await airdrop.deployed();
    console.log('Airdrop deployed to:', airdrop.address);
  });

  before(async () => {
    messageToHash = await airdrop.getMessage();
    hashedMessage = ethers.utils.arrayify(ethers.utils.hashMessage(messageToHash));
  });

  let userAbi: any;
  before('Calculates valid proof', async () => {
    const user = new ethers.Wallet(process.env.USER1_PRIVATE_KEY as string);
    const leaf = generateLeaf(user.address, '42000000000000000000').toString('hex');
    const pubKey = ethers.utils.arrayify(user.publicKey).slice(1);
    const signature = await user.signMessage(messageToHash);
    const index = merkleTree.getIndex(leaf);
    const mt = merkleTree.proof(index);
    const nullifier = blake2
      .createHash('blake2s')
      .update(ethers.utils.arrayify(signature).slice(0, 64))
      .digest();

    userAbi = {
      pub_key_x: pubKey.slice(0, 32),
      pub_key_y: pubKey.slice(32),
      signature: ethers.utils.arrayify(signature).slice(0, 64),
      hashed_message: hashedMessage,
      nullifier: Uint8Array.from(nullifier),
      merkle_path: generateHashPathInput(mt.pathElements),
      leaf: '0x' + leaf,
      index: index,
      merkle_root: '0x' + mt.root,
    };
  });

  it('Collects tokens from a whitelisted user', async () => {
    const proof = prove(userAbi, 'valid');
    console.log(proof.toString());
    expect(proof).to.exist;

    const res = await airdrop.claim('0x' + proof.toString());
    console.log(res);
  });
});
