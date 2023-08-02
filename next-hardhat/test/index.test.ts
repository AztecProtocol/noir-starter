// @ts-ignore
import { expect } from 'chai';
import ethers, { Contract } from 'ethers';
import path from 'path';
import { NoirNode } from '../utils/noir/noirNode';
import { execSync } from 'child_process';

const noir = new NoirNode();
import verifier from '../artifacts/circuits/contract/plonk_vk.sol/UltraVerifier.json';

import { test, beforeAll, describe } from 'vitest';

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let verifierContract: Contract;
  let correctProof: any;
  let provider = ethers.getDefaultProvider('http://127.0.0.1:8545');
  let deployerWallet = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY as unknown as string,
    provider,
  );

  beforeAll(async () => {
    const Verifier = new ethers.ContractFactory(verifier.abi, verifier.bytecode, deployerWallet);
    verifierContract = await Verifier.deploy();

    const verifierAddr = await verifierContract.deployed();
    console.log(`Verifier deployed to ${verifierAddr.address}`);
  });

  it('Should generate valid proof for correct input', async () => {
    const input = { x: 1, y: 2 };
    await noir.init();
    const witness = await noir.generateWitness(input);
    const proof = await noir.generateProof(witness);

    expect(proof instanceof Uint8Array).to.be.true;
    const verification = await noir.verifyProof(proof);
    expect(verification).to.be.true;
  });
});
