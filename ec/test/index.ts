// @ts-ignore
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Ethers } from '../utils/ethers';
import { Contract } from 'ethers';
import { Noir } from '../utils/noir';
import path from 'path';
import { execSync } from 'child_process';

const noir = new Noir();

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
    console.log('Deploying verifier contract...');

    // workaround for race condition
    execSync('npx hardhat compile', { cwd: path.join(__dirname, '../contract') });

    const Verifier = await ethers.getContractFactory('TurboVerifier');
    verifierContract = await Verifier.deploy();

    const verifierAddr = await verifierContract.deployed();
    console.log(`Verifier deployed to ${verifierAddr.address}`);
  });

  before('Generate signature', async () => {
    const ethers = new Ethers();
    const { hash, signature } = await ethers.signMessage('hello');
    const publicKey = await ethers.recoverPublicKey(hash, signature);
    correctProof = await noir.createProof({
      input: {
        pub_key_x: publicKey[0],
        pub_key_y: publicKey[1],
        signature,
        hashed_message: hash,
      },
    });
  });

  it('Should generate valid proof for correct input', async () => {
    expect(correctProof instanceof Buffer).to.be.true;
    const verification = await noir.verifyProof({ proof: correctProof });
    expect(verification).to.be.true;
  });

  it.skip('Should fail with incorrect input', async () => {
    try {
      const input = { x: 1, y: 2 };
      await create_proof(noir.prover, noir.acir, input);
    } catch (e) {
      expect(e instanceof Error).to.be.true;
    }
  });

  it.skip('Should verify the proof on-chain', async () => {
    const ver = await verifierContract.verify(correctProof);
    expect(ver).to.be.true;
  });
});
