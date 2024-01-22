import { expect } from 'chai';
import hre from 'hardhat';

import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';

import { compile, PathToFileSourceMap } from '@noir-lang/noir_wasm';
import { join } from 'path';
import { ProofData } from '@noir-lang/types';
import { readFileSync } from 'fs';

const getCircuit = async (name: string) => {
  const sourcePath = new URL('../circuits/src/main.nr', import.meta.url);
  const sourceMap = new PathToFileSourceMap();

  sourceMap.add_source_code(sourcePath.pathname, readFileSync(join(sourcePath.pathname), 'utf-8'));
  const compiled = compile(sourcePath.pathname, undefined, undefined, sourceMap);
  return compiled;
};

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let noir: Noir;
  let correctProof: ProofData;

  before(async () => {
    const compiled = await getCircuit('main');
    const verifierContract = await hre.viem.deployContract('UltraVerifier');

    const verifierAddr = verifierContract.address;
    console.log(`Verifier deployed to ${verifierAddr}`);

    // @ts-ignore
    const backend = new BarretenbergBackend(compiled.program);
    // @ts-ignore
    noir = new Noir(compiled.program, backend);
  });

  it('Should generate valid proof for correct input', async () => {
    const input = { x: 1, y: 2 };
    // Generate proof
    correctProof = await noir.generateFinalProof(input);
    expect(correctProof.proof instanceof Uint8Array).to.be.true;
  });

  it('Should verify valid proof for correct input', async () => {
    const verification = await noir.verifyFinalProof(correctProof);
    expect(verification).to.be.true;
  });

  it('Should fail to generate valid proof for incorrect input', async () => {
    try {
      const input = { x: 1, y: 1 };
      const incorrectProof = await noir.generateFinalProof(input);
    } catch (err) {
      // TODO(Ze): Not sure how detailed we want this test to be
      expect(err instanceof Error).to.be.true;
      const error = err as Error;
      expect(error.message).to.contain('Cannot satisfy constraint');
    }
  });
});
