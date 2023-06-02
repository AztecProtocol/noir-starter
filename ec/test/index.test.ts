// @ts-ignore
import ethers, { Contract } from 'ethers';
import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import { expect } from 'chai';
import { MerkleTree } from '../utils/merkleTree'; // MerkleTree.js
import merkle from './merkle.json'; // merkle
import keccak256 from 'keccak256';

// @ts-ignore -- no types
import blake2 from 'blake2';

// @ts-ignore -- no types
import { BarretenbergWasm } from '@noir-lang/barretenberg';

import { Fr } from '@aztec/bb.js/dest/types';

import airdrop from '../artifacts/contract/Airdrop.sol/Airdrop.json';
import basicToken from '../artifacts/contract/Token.sol/BasicToken.json';
import verifier from '../artifacts/contract/plonk_vk.sol/UltraVerifier.json';
import { assert, test, beforeAll, describe } from 'vitest';

function generateLeaf(address: string, value: string): Fr {
  const buf = Buffer.from(
    // Hash in appropriate Merkle format
    ethers.utils.solidityKeccak256(['address', 'uint256'], [address, value]).slice(2),
    'hex',
  );
  return Fr.fromBufferReduce(buf);
}

interface AbiHashes {
  [key: string]: string;
}

// to avoid re-proving every time
// we store a hash of every input and hash of the circuit
// if they change, we re-prove
// otherwise we just use the existing proof
function prove(abi: any, testCase: string) {
  // get the existent hashes for different proof names
  const abiHashes: AbiHashes = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../proofs/abiHashes.json'), 'utf8'),
  );

  // write the TOML file string
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

  // get the hash of the circuit
  const circuit = fs.readFileSync(path.join(__dirname, '../src/main.nr'), 'utf8');

  // hash all of it together
  const abiHash = keccak256(proverToml.concat(circuit)).toString('hex');

  // we also need to prove if there's no proof already
  let existentProof: string | boolean;
  try {
    existentProof = fs.readFileSync(path.join(__dirname, `../proofs/${testCase}.proof`), 'utf8');
  } catch (e) {
    existentProof = false;
  }

  // if they differ, we need to re-prove
  if (abiHashes[testCase] !== abiHash || !existentProof) {
    console.log(`Proving "${testCase}"...`);
    fs.writeFileSync('Prover.toml', proverToml);

    execSync(`nargo prove ${testCase} --show-output`);

    abiHashes[testCase] = abiHash;
    const updatedHashes = JSON.stringify(abiHashes, null, 2);
    fs.writeFileSync(path.join(__dirname, '../proofs/abiHashes.json'), updatedHashes);
    console.log(`New proof for "${testCase}" written`);
  }

  const proof = fs.readFileSync(`proofs/${testCase}.proof`);
  return proof;
}

describe('Setup', () => {
  let airdropContract: Contract;
  let merkleTree: MerkleTree;
  let messageToHash = '0xabfd76608112cc843dca3a31931f3974da5f9f5d32833e7817bc7e5c50c7821e';
  let hashedMessage: string;
  let provider = ethers.getDefaultProvider('http://127.0.0.1:8545');
  let wallet = new ethers.Wallet(process.env.USER1_PRIVATE_KEY as unknown as string, provider);

  beforeAll(async () => {
    execSync('npx hardhat compile');
    const Token = new ethers.ContractFactory(basicToken.abi, basicToken.bytecode, wallet);
    const token = await Token.deploy(100000000);

    const Verifier = new ethers.ContractFactory(verifier.abi, verifier.bytecode, wallet);
    const verifierContract = await Verifier.deploy();
    const verifierAddr = await verifierContract.deployed();

    const Airdrop = new ethers.ContractFactory(airdrop.abi, airdrop.bytecode, wallet);
    const barretenberg = await BarretenbergWasm.new();
    await barretenberg.init();

    // Setup merkle tree
    merkleTree = new MerkleTree(4);
    await merkleTree.initialize([]);

    await Promise.all(
      Object.keys(merkle).map(async (addr: any) => {
        // @ts-ignore
        const leaf = generateLeaf(addr, merkle[addr]);
        await merkleTree.insert(leaf);
      }),
    );

    hashedMessage = ethers.utils.hashMessage(messageToHash); // keccak of "signthis"
    airdropContract = await Airdrop.deploy(
      token.address,
      merkleTree.root().toString(),
      hashedMessage,
      verifierAddr.address,
    );
    await airdropContract.deployed();
    console.log('Airdrop deployed to:', airdropContract.address);
  });

  describe('Airdrop', () => {
    let userAbi: any;
    let user: ethers.Wallet;
    let nullifier: Uint8Array;

    beforeAll(async () => {
      const provider = ethers.getDefaultProvider('http://127.0.0.1:8545');
      user = new ethers.Wallet(process.env.USER1_PRIVATE_KEY as string, provider);
      const leaf = generateLeaf(user.address, '42000000000000000000');
      const pubKey = ethers.utils.arrayify(user.publicKey).slice(1);
      const signature = await user.signMessage(messageToHash);
      const index = merkleTree.getIndex(leaf);
      const mt = merkleTree.proof(index);
      nullifier = blake2
        .createHash('blake2s')
        .update(ethers.utils.arrayify(signature).slice(0, 64))
        .digest();

      userAbi = {
        pub_key_x: pubKey.slice(0, 32),
        pub_key_y: pubKey.slice(32),
        signature: ethers.utils.arrayify(signature).slice(0, 64),
        hashed_message: ethers.utils.arrayify(hashedMessage),
        nullifier: Uint8Array.from(nullifier),
        merkle_path: mt.pathElements.map(el => `"${el.toString()}"`),
        leaf: mt.leaf.toString(),
        index: index,
        merkle_root: mt.root.toString(),
      };
    });

    test('Collects tokens from a whitelisted user', async () => {
      const pubKey = ethers.utils.arrayify(user.publicKey).slice(1);

      const proof = prove(userAbi, 'valid');
      expect(proof).to.exist;
      const res = await airdropContract.claim(
        '0x' + proof.toString(),
        [ethers.utils.hexlify(pubKey.slice(0, 32)), ethers.utils.hexlify(pubKey.slice(32))],
        ethers.utils.hexlify(nullifier),
      );
      console.log(res);
    });
  });
});
