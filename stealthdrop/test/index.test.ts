// @ts-ignore
import ethers, { Contract } from 'ethers';
import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import { MerkleTree } from '../utils/merkleTree'; // MerkleTree.js
import merkle from './merkle.json'; // merkle
import keccak256 from 'keccak256';

// @ts-ignore -- no types
import blake2 from 'blake2';

import { Fr } from '@aztec/bb.js/dest/types';

import airdrop from '../artifacts/circuits/contract/Airdrop.sol/Airdrop.json';
import verifier from '../artifacts/circuits/contract/plonk_vk.sol/UltraVerifier.json';

import { test, beforeAll, describe, expect } from 'vitest';
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
    fs.readFileSync(path.join(__dirname, '../circuits/proofs/abiHashes.json'), 'utf8'),
  );

  // write the TOML file string
  const proverToml = `
      pub_key = [${abi.pub_key}]\n
      signature = [${abi.signature}]\n
      hashed_message = [${abi.hashed_message}]\n
      nullifier = [${abi.nullifier}]\n
      merkle_path = [${abi.merkle_path}]\n
      index = ${abi.index}\n
      merkle_root = "${abi.merkle_root}"\n
      claimer_pub = "${abi.claimer}"\n
      claimer_priv = "${abi.claimer}"
  `;

  // get the hash of the circuit
  const circuit = fs.readFileSync(path.join(__dirname, '../circuits/src/main.nr'), 'utf8');

  // hash all of it together
  const abiHash = keccak256(proverToml.concat(circuit)).toString('hex');

  // we also need to prove if there's no proof already
  let existentProof: string | boolean;
  try {
    existentProof = fs.readFileSync(
      path.join(__dirname, `../circuits/proofs/${testCase}.proof`),
      'utf8',
    );
  } catch (e) {
    existentProof = false;
  }

  // if they differ, we need to re-prove
  if (abiHashes[testCase] !== abiHash || !existentProof) {
    console.log(`Proving "${testCase}"...`);
    fs.writeFileSync('circuits/Prover.toml', proverToml);

    execSync(`nargo prove ${testCase} --show-output`);

    abiHashes[testCase] = abiHash;
    const updatedHashes = JSON.stringify(abiHashes, null, 2);
    fs.writeFileSync(path.join(__dirname, '../circuits/proofs/abiHashes.json'), updatedHashes);
    console.log(`New proof for "${testCase}" written`);
  }

  const proof = fs.readFileSync(`circuits/proofs/${testCase}.proof`);
  return proof;
}

describe('Setup', () => {
  let airdropContract: Contract;
  let merkleTree: MerkleTree;
  let messageToHash = '0xabfd76608112cc843dca3a31931f3974da5f9f5d32833e7817bc7e5c50c7821e';
  let hashedMessage: string;
  let provider = ethers.getDefaultProvider('http://127.0.0.1:8545');
  let deployerWallet = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY as unknown as string,
    provider,
  );

  beforeAll(async () => {
    execSync('npx hardhat compile');
    const Verifier = new ethers.ContractFactory(verifier.abi, verifier.bytecode, deployerWallet);
    const verifierContract = await Verifier.deploy();
    const verifierAddr = await verifierContract.deployed();

    const Airdrop = new ethers.ContractFactory(airdrop.abi, airdrop.bytecode, deployerWallet);

    // Setup merkle tree
    merkleTree = new MerkleTree(4);
    await merkleTree.initialize([]);

    await Promise.all(
      merkle.map(async (addr: any) => {
        // @ts-ignore
        const leaf = Fr.fromString(addr);
        merkleTree.insert(leaf);
      }),
    );

    hashedMessage = ethers.utils.hashMessage(messageToHash); // keccak of "signthis"
    airdropContract = await Airdrop.deploy(
      merkleTree.root().toString(),
      hashedMessage,
      verifierAddr.address,
      '3500000000000000000000',
    );
    await airdropContract.deployed();
    console.log('Airdrop deployed to:', airdropContract.address);
  });

  describe('Airdrop', () => {
    let user1: ethers.Wallet;
    let user2: ethers.Wallet;
    let claimer1: ethers.Wallet;
    let claimer2: ethers.Wallet;

    beforeAll(async () => {
      const provider = ethers.getDefaultProvider('http://127.0.0.1:8545');
      user1 = new ethers.Wallet(process.env.USER1_PRIVATE_KEY as string, provider);
      claimer1 = new ethers.Wallet(process.env.CLAIMER1_PRIVATE_KEY as string, provider);
      claimer2 = new ethers.Wallet(process.env.CLAIMER2_PRIVATE_KEY as string, provider);
    });

    const getUserAbi = async (user: ethers.Wallet) => {
      const leaf = Fr.fromString(user.address);
      const pubKey = ethers.utils.arrayify(user.publicKey).slice(1);
      const signature = await user1.signMessage(messageToHash);
      const index = merkleTree.getIndex(leaf);
      const mt = merkleTree.proof(index);
      const nullifier = blake2
        .createHash('blake2s')
        .update(ethers.utils.arrayify(signature).slice(0, 64))
        .digest();

      const userAbi = {
        pub_key: pubKey,
        signature: ethers.utils.arrayify(signature).slice(0, 64),
        hashed_message: ethers.utils.arrayify(hashedMessage),
        nullifier: Uint8Array.from(nullifier),
        merkle_path: mt.pathElements.map(el => `"${el.toString()}"`),
        index: index,
        merkle_root: mt.root.toString(),
        claimer: claimer1.address,
      };
      return userAbi;
    };

    test('Collects tokens from an eligible user', async () => {
      const userAbi = await getUserAbi(user1);
      console.log('Valid ABI', userAbi);
      const proof = prove(userAbi, 'valid');
      expect(proof).to.exist;

      const connectedAirdropContract = airdropContract.connect(claimer1);
      const balanceBefore = await connectedAirdropContract.balanceOf(claimer1.address);
      expect(balanceBefore.toNumber()).to.equal(0);
      await connectedAirdropContract.claim(
        '0x' + proof.toString(),
        ethers.utils.hexlify(userAbi.nullifier),
      );

      const balanceAfter = await connectedAirdropContract.balanceOf(claimer1.address);
      expect(balanceAfter.toNumber()).to.equal(1);
    });

    test('Fails to collect tokens of an eligible user with a non-authorized account (front-running)', async () => {
      try {
        const userAbi = await getUserAbi(user1);
        console.log('Valid ABI', userAbi);
        const proof = prove(userAbi, 'valid');
        expect(proof).to.exist;

        const connectedAirdropContract = airdropContract.connect(claimer2);
        const balanceBefore = await connectedAirdropContract.balanceOf(claimer2.address);
        expect(balanceBefore.toNumber()).to.equal(0);
        await connectedAirdropContract.claim(
          '0x' + proof.toString(),
          ethers.utils.hexlify(userAbi.nullifier),
        );

        const balanceAfter = await connectedAirdropContract.balanceOf(claimer2.address);
        expect(balanceAfter.toNumber()).to.equal(0);
      } catch (e: any) {
        expect(e.error.reason).to.contain('PROOF_FAILURE()');
      }
    });
  });
});
