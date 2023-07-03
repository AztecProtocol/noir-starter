import { writeFileSync } from 'fs';
import { ethers } from 'hardhat';
import {
  create_proof,
  verify_proof,
  // @ts-ignore
} from '@noir-lang/barretenberg';
import { NoirNode } from '../utils/noirNode';

const input = { x: 1, y: 1 };

async function main() {
  // Deploy the verifier contract
  const Verifier = await ethers.getContractFactory('TurboVerifier');
  const verifier = await Verifier.deploy();

  // Get the address of the deployed verifier contract
  const verifierAddr = await verifier.deployed();

  const noir = new NoirNode();

  await noir.init();
  const witness = await noir.generateWitness(input);
  const proof = await noir.generateProof(witness);
  const functionGasFees = await verifierAddr.estimateGas.verify(proof);

  console.log('Gas cost to call verify(),', functionGasFees.toString());

  process.exit();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
