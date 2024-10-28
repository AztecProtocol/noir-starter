import { expect, beforeAll, describe, test } from 'bun:test';
import { Noir } from '@noir-lang/noir_js';
import { ProofData } from '@noir-lang/types';
import hre from 'hardhat';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { bytesToHex } from 'viem';
import { execSync } from 'child_process';

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let correctProof: ProofData;
  let noir: Noir;
  let backend: BarretenbergBackend;
  hre.run('node');

  beforeAll(async () => {
    ({ noir, backend } = await hre.noir.getCircuit('noirstarter'));
    execSync('npx hardhat compile');
  });

  test('Should generate valid proof for correct input', async () => {
    const input = { x: 1, y: 2 };
    // Generate proof
    const { witness } = await noir.execute(input);
    correctProof = await backend.generateProof(witness);
    expect(correctProof.proof instanceof Uint8Array).toBeTrue;
  });

  test('Should verify valid proof for correct input', async () => {
    const verification = await backend.verifyProof(correctProof);
    expect(verification).toBeTrue;
  });

  test('Should verify valid proof for correct input on a smart contract', async () => {
    const verifier = await hre.viem.deployContract('UltraVerifier');
    const res = await verifier.read.verify([
      bytesToHex(correctProof.proof),
      correctProof.publicInputs as `0x${string}`[],
    ]);
    expect(res).toBeTrue;
  });

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
