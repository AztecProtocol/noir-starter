import { expect } from 'chai';
import { Contract } from 'ethers';
import { Noir } from '../utils/noir';
import hre from 'hardhat';

const noir = new Noir();

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let correctProof: any;

  before(async () => {
    const verifierContract = await hre.ethers.deployContract('UltraVerifier');

    const verifierAddr = await verifierContract.deployed();
    console.log(`Verifier deployed to ${verifierAddr.address}`);
  });

  it('Should generate valid proof for correct input', async () => {
    const input = { x: 1, y: 2 };
    await noir.init();
    const witness = await noir.generateWitness(input);
    correctProof = await noir.generateProof(witness);

    expect(correctProof instanceof Uint8Array).to.be.true;
  });

  it('Should verify valid proof for correct input', async () => {
    const verification = await noir.verifyProof(correctProof);
    expect(verification).to.be.true;
  });

  it('Should fail to generate valid proof for incorrect input', async () => {
    try {
      const input = { x: 1, y: 1 };
      await noir.init();
      const witness = await noir.generateWitness(input);
      correctProof = await noir.generateProof(witness);
    } catch (err) {
      expect(err instanceof Error).to.be.true;
    }
  });
});
