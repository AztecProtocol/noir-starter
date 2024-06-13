import { expect, describe, beforeAll, afterAll, test } from 'bun:test';

import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';

import { ProofData } from '@noir-lang/types';
import { exec } from 'shelljs';
import { ChildProcess } from 'child_process';
import { readFileSync } from 'fs';

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let node: ChildProcess;
  let noir: Noir;
  let correctProof: ProofData;

  beforeAll(async () => {
    node = exec('npx hardhat node', { async: true });
    exec('bun hh compile');
    exec('bun hh deploy');

    const circuitFile = readFileSync('artifacts/circuit.json', 'utf-8');
    const circuit = JSON.parse(circuitFile);

    // @ts-ignore
    const backend = new BarretenbergBackend(circuit);
    // @ts-ignore
    noir = new Noir(circuit, backend);
  });

  afterAll(() => {
    // Terminate the Hardhat node process
    node.kill();
  });

  test('Should generate valid proof for correct input', async () => {
    const input = { x: 1, y: 2 };
    // Generate proof
    correctProof = await noir.generateProof(input);
    expect(correctProof.proof instanceof Uint8Array).toBeTrue();
  });

  test('Should verify valid proof for correct input', async () => {
    const verification = await noir.verifyProof(correctProof);
    expect(verification).toBeTrue();
  });

  test('Should fail to generate valid proof for incorrect input', async () => {
    try {
      const input = { x: 1, y: 1 };
      const incorrectProof = await noir.generateProof(input);
    } catch (err) {
      // TODO(Ze): Not sure how detailed we want this test to be
      expect(err instanceof Error).toBeTrue();
      const error = err as Error;
      expect(error.message).toContain('Cannot satisfy constraint');
    }
  });
});
