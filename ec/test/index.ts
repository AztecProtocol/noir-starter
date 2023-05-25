// @ts-ignore
import { Contract } from 'ethers';
import fs from 'fs';
import { ethers } from 'hardhat';
import path from 'path';
import { execSync } from 'child_process';
import { expect } from 'chai';
import MerkleTree from 'merkletreejs'; // MerkleTree.js
import merkle from './merkle.json'; // merkle
import keccak256 from 'keccak256';

/**
 * Generate Merkle Tree leaf from address and value
 * @param {string} address of airdrop claimee
 * @param {string} value of airdrop tokens to claimee
 * @returns {Buffer} Merkle Tree node
 */
function generateLeaf(address: string, value: string): Buffer {
  return Buffer.from(
    // Hash in appropriate Merkle format
    ethers.utils.solidityKeccak256(['address', 'uint256'], [address, value]).slice(2),
    'hex',
  );
}

// async function prove(
//   pubKey: string,
//   hashedMessage: string,
//   signature: string,
//   proofName: string,
//   useExistentProof = true,
// ) {
//   let pub_key_x = pubKey.substring(0, 64);
//   let pub_key_y = pubKey.substring(64);

//   const abi = {
//     pub_key_x: hexToUint8Array(pub_key_x),
//     pub_key_y: hexToUint8Array(pub_key_y),
//     signature: Uint8Array.from(Buffer.from(signature.slice(2).slice(0, 128), 'hex')),
//     hashed_message: hexToUint8Array(hashedMessage.slice(2)),
//   };

//   console.log('Writing to Prover/Verifier.toml...');
//   const proverToml = `pub_key_x = [${abi.pub_key_x}]\npub_key_y = [${abi.pub_key_y}]\nsignature = [${abi.signature}]\nhashed_message = [${abi.hashed_message}]`;

//   fs.writeFileSync('Prover.toml', proverToml);

//   console.log('Proving...');
//   if (!useExistentProof) execSync(`nargo prove ${proofName}`);

//   console.log('Generating smart contract...');
//   execSync('nargo codegen-verifier');

//   const proof = '0x' + fs.readFileSync(path.join(__dirname, `../proofs/${proofName}.proof`));
//   return proof;
// }

describe('Airdrop', () => {
  let user = new ethers.Wallet(process.env.USER_PRIVATE_KEY as string);
  let airdrop: Contract;
  let merkleTree: MerkleTree;

  let messageToHash = '0xabfd76608112cc843dca3a31931f3974da5f9f5d32833e7817bc7e5c50c7821e'; // keccak of "signthis"

  before('Deploy contract', async () => {
    const Token = await ethers.getContractFactory('BasicToken');
    const token = await Token.deploy(100000000);

    const Airdrop = await ethers.getContractFactory('Airdrop');

    // Setup merkle tree
    merkleTree = new MerkleTree(
      // Generate leafs
      Object.entries(merkle.airdrop).map(([address, tokens]) =>
        generateLeaf(
          ethers.utils.getAddress(address),
          ethers.utils.parseUnits(tokens.toString(), merkle.decimals).toString(),
        ),
      ),
      // Hashing function
      keccak256,
      { sortPairs: true },
    );

    airdrop = await Airdrop.deploy(token.address, merkleTree.getRoot(), messageToHash);
    await airdrop.deployed();
    console.log('Airdrop deployed to:', airdrop.address);
  });

  it('Calculate proof', async () => {
    // pub_key_x: [u8; 32], // first part of public key
    // pub_key_y: [u8; 32], // second part of public key
    // signature: [u8; 64], // signature of the public message (signThis in the contract)
    // merkle_path: [u8; 32], // merkle path from the leaf to the root (root is in the contract)
    // hashed_message: pub [u8; 32], // signThis, in the contract
    // nullifier: pub [u8; 32], // calculated nullifier, this should be h(signature) FOR NOW BECAUSE IT'S UNSAFE ECDSA IS MALLEABLE
    // merkle_root: pub [u8; 32], // merkle root, in the contract
    const messageToHash = await airdrop.getMessage();
    const hashedMessage = ethers.utils.arrayify(ethers.utils.hashMessage(messageToHash));

    const pubKey = ethers.utils.arrayify(user.publicKey).slice(1);
    const signature = await user.signMessage(messageToHash);

    const proof = merkleTree.getProof(generateLeaf(user.address, '42000000000000000000'));
    const hashPath = proof.map(x => x.data.toString('hex'));

    const nullifier = ethers.utils.solidityKeccak256(['bytes'], [signature]);
    const merkleRoot = merkleTree.getRoot().toString('hex');

    const abi = {
      pub_key_x: pubKey.slice(0, 32),
      pub_key_y: pubKey.slice(32),
      signature: ethers.utils.arrayify(signature).slice(0, 64),
      merkle_path: hashPath.map(hash => `"0x${hash}"`),
      hashed_message: hashedMessage,
      nullifier: nullifier,
      merkle_root: '0x' + merkleRoot,
    };
    console.log('abi', abi);

    console.log('Writing to Prover/Verifier.toml...');
    const proverToml = `
      pub_key_x = [${abi.pub_key_x}]\n
      pub_key_y = [${abi.pub_key_y}]\n
      signature = [${abi.signature}]\n
      merkle_path = [${abi.merkle_path}]\n
      hashed_message = [${abi.hashed_message}]\n
      nullifier = "${abi.nullifier}"\n
      merkle_root = "${abi.merkle_root}"
    `;
    fs.writeFileSync('Prover.toml', proverToml);
    // execSync(`nargo prove p`);
  });
});
