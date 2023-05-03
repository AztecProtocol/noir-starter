// @ts-ignore
import { expect } from 'chai';
import {
  create_proof,
  verify_proof,
  // @ts-ignore
} from '@noir-lang/barretenberg';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { NoirServer } from '../utils/noir/noirServer';
import path from 'path';
import { execSync } from 'child_process';

const noir = new NoirServer();

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let verifierContract: Contract;
  let correctProof: any;

  before(async () => {
    await noir.compile();

    expect(noir.compiled).to.have.property('circuit');
    expect(noir.compiled).to.have.property('abi');

    expect(noir.acir).to.have.property('opcodes');
    expect(noir.acir).to.have.property('current_witness_index');
    expect(noir.acir).to.have.property('public_inputs');

  });

  before('Deploy contract', async () => {
    await noir.getSmartContract();
    console.log('Deploying verifier contract...')

    // workaround for race condition
    execSync('npx hardhat compile', { cwd: path.join(__dirname, '../contract') });

    
    const Verifier = await ethers.getContractFactory('TurboVerifier');
    verifierContract = await Verifier.deploy();

    const verifierAddr = await verifierContract.deployed();
    console.log(`Verifier deployed to ${verifierAddr.address}`);
  });

  before('Generate proof', async () => {
    const input = { x: 1, y: 1 };
    correctProof = await create_proof(noir.prover, noir.acir, input);
  });

  it('Should generate valid proof for correct input', async () => {
    expect(correctProof instanceof Buffer).to.be.true;
    const verification = await verify_proof(noir.verifier, correctProof);
    expect(verification).to.be.true;
  });

  it('Should fail with incorrect input', async () => {
    try {
      const input = { x: 1, y: 2 };
      await create_proof(noir.prover, noir.acir, input);
    } catch (e) {
      expect(e instanceof Error).to.be.true;
    }
  });

  it('Should verify the proof on-chain', async () => {
    const ver = await verifierContract.verify(correctProof);
    expect(ver).to.be.true;
  });
});
