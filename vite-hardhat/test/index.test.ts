import { expect } from 'chai';
import { BarretenbergBackend, UltraHonkBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';

import { ProofData } from '@noir-lang/types';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import shelljs from 'shelljs';

shelljs.exec('npx hardhat compile');

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let noir: Noir;
  let backend: UltraHonkBackend;
  let correctProof: ProofData;

  beforeEach(async () => {
    const circuitFile = readFileSync(resolve('artifacts/circuit.json'), 'utf-8');
    const circuit = JSON.parse(circuitFile);

    backend = new UltraHonkBackend(circuit);
    noir = new Noir(circuit);
  });

  it('Should generate valid proof for correct input', async () => {
    const input = { x: 1, y: 2 };
    // Generate proof
    const { witness } = await noir.execute(input);
    correctProof = await backend.generateProof(witness);
    expect(correctProof.proof instanceof Uint8Array).to.be.true;
  });

  it('Should verify valid proof for correct input', async () => {
    const verification = await backend.verifyProof(correctProof);
    expect(verification).to.be.true;
  });

  it('Should fail to generate valid proof for incorrect input', async () => {
    try {
      const input = { x: 1, y: 1 };
      const { witness } = await noir.execute(input);
      const incorrectProof = await backend.generateProof(witness);
    } catch (err) {
      // TODO(Ze): Not sure how detailed we want this it to be
      expect(err instanceof Error).to.be.true;
      const error = err as Error;
      expect(error.message).to.contain('Cannot satisfy constraint');
    }
  });
});
