import { expect, beforeAll, describe, test } from 'bun:test';
import { Noir } from '@noir-lang/noir_js';
import { ProofData } from '@noir-lang/types';
import { UltraHonkBackend } from '@aztec/bb.js';
import { execSync } from 'child_process';
const hre = require('hardhat');

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let correctProof: ProofData;
  let noir: Noir;
  let backend: UltraHonkBackend;
  hre.run('node');

  beforeAll(async () => {
    ({ noir, backend } = await hre.noirenberg.compile());
    await hre.noirenberg.getSolidityVerifier();
    execSync('npx hardhat compile');
  });

  test('Should generate valid proof for correct input', async () => {
    const input = { x: 1, y: 2 };
    const { witness } = await noir.execute(input);
    correctProof = await backend.generateProof(witness);
    expect(correctProof.proof instanceof Uint8Array).toBeTrue;
  });

  test('Should verify valid proof for correct input', async () => {
    const verification = await backend.verifyProof(correctProof);
    expect(verification).toBeTrue;
  });

  // test('Should verify valid proof for correct input on a smart contract', async () => {
  //   const verifier = await hre.viem.deployContract('HonkVerifier');
  //   const res = await verifier.read.verify([
  //     bytesToHex(correctProof.proof),
  //     correctProof.publicInputs as `0x${string}`[],
  //   ]);
  //   expect(res).toBeTrue;
  // });

  test('Should fail to generate valid proof for incorrect input', async () => {
    try {
      const input = { x: 1, y: 1 };
      const { witness } = await noir.execute(input);
      const incorrectProof = await backend.generateProof(witness);
    } catch (err) {
      // TODO(Ze): Not sure how detailed we want this it to be
      expect(err instanceof Error).toBeTrue;
      const error = err as Error;
      expect(error.message).toContain('Cannot satisfy constraint');
    }
  });
});
