// @ts-ignore
import { expect } from 'chai';
import ethers, { Contract } from 'ethers';
import { NoirServer } from '../utils/noir/noirServer';
import path from 'path';
import { execSync } from 'child_process';

const noir = new NoirServer();
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

  // beforeAll(async () => {
  //   await noir.compile();

  //   expect(noir.compiled).to.have.property('circuit');
  //   expect(noir.compiled).to.have.property('abi');

  //   expect(noir.acir).to.have.property('opcodes');
  //   expect(noir.acir).to.have.property('current_witness_index');
  //   expect(noir.acir).to.have.property('public_inputs');
  // });

  beforeAll(async () => {
    const Verifier = new ethers.ContractFactory(verifier.abi, verifier.bytecode, deployerWallet);
    verifierContract = await Verifier.deploy();

    const verifierAddr = await verifierContract.deployed();
    console.log(`Verifier deployed to ${verifierAddr.address}`);
  });

  // beforeAll('Generate proof', async () => {});

  it('Should generate valid proof for correct input', async () => {
    const input = { x: 1, y: 2 };
    const witness = await noir.generateWitness(input);
    const proof = await noir.generateProof(noir.compiled, witness);
    // correctProof = await create_proof(noir.prover, noir.acir, input);

    // expect(correctProof instanceof Buffer).to.be.true;
    // const verification = await verify_proof(noir.verifier, correctProof);
    // expect(verification).to.be.true;
  });

  // it('Should fail with incorrect input', async () => {
  //   try {
  //     const input = { x: 1, y: 2 };
  //     await create_proof(noir.prover, noir.acir, input);
  //   } catch (e) {
  //     expect(e instanceof Error).to.be.true;
  //   }
  // });

  // it('Should verify the proof on-chain', async () => {
  //   const ver = await verifierContract.verify(correctProof);
  //   expect(ver).to.be.true;
  // });
});
