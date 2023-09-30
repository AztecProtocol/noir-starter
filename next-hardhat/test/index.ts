import { expect } from 'chai';
import hre from 'hardhat';

import circuit from '../circuits/target/noirstarter.json';
import { Noir } from '@kevaundray/noir_js';
import { BarretenbergBackend } from '@kevaundray/backend_barretenberg';

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {

  before(async () => {
    const verifierContract = await hre.ethers.deployContract('UltraVerifier');

    const verifierAddr = await verifierContract.deployed();
    console.log(`Verifier deployed to ${verifierAddr.address}`);
  });

  it('Should generate valid proof for correct input', async () => {
    const input = { x: 1, y: 2 };

    const backend = new BarretenbergBackend(circuit);
    // Initialize program
    const program = new Noir(circuit, backend);
    // Generate proof
    const proof = await program.generateFinalProof(input);

    // Proof verification
    const isValid = await program.verifyFinalProof(proof);
    expect(isValid).to.be.true;
  });

  // TODO(Ze): My understanding is that this test was previously using a global noir instance
  // TODO: Why was this the case and is this more indicative of the real workflow? 
  // it('Should verify valid proof for correct input', async () => {
  //   const verification = await program.verifyFinalProof(correctProof);
  //   expect(verification).to.be.true;
  // });

  it('Should fail to generate valid proof for incorrect input', async () => {
    try {
      const input = { x: 1, y: 1 };
      
      const backend = new BarretenbergBackend(circuit);
      // Initialize program
      const program = new Noir(circuit, backend);
      // Generate proof
      await program.generateFinalProof(input);
    } catch (err) {

      // TODO(Ze): Not sure how detailed we want this test to be
      expect(err instanceof Error).to.be.true;
      const error = err as Error;
      expect(error.message).to.contain('Cannot satisfy constraint');
    }
  });
});
