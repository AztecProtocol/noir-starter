import { expect, beforeAll, describe, test } from 'bun:test';
import { Noir } from '@noir-lang/noir_js';
import { ProofData } from '@noir-lang/types';
import { UltraHonkBackend } from '@aztec/bb.js';
import fs from 'fs';
import { resolve } from 'path';

describe('UltraHonk', () => {
  let correctProof: ProofData;
  let noir: Noir;
  let backend: UltraHonkBackend;

  beforeAll(async () => {
    const contractsDir = resolve('packages', 'contracts');
    if (fs.existsSync(contractsDir)) fs.rmdirSync(contractsDir, { recursive: true });

    const hre = require('hardhat');

    hre.run('node');
    hre.config.noirenberg = { provingSystem: 'UltraHonk' };

    console.log(hre);
    ({ noir, backend } = await hre.noirenberg.compile());
    await hre.noirenberg.getSolidityVerifier();
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

  test('Should fail to generate valid proof for incorrect input', async () => {
    try {
      const input = { x: 1, y: 1 };
      const { witness } = await noir.execute(input);
      const incorrectProof = await backend.generateProof(witness);
    } catch (err) {
      expect(err instanceof Error).toBeTrue;
      const error = err as Error;
      expect(error.message).toContain('Cannot satisfy constraint');
    }
  });
});
