// @ts-ignore
import { initialiseResolver } from '@noir-lang/noir-source-resolver';
import { acir_read_bytes, compile } from '@noir-lang/noir_wasm';

import fs from 'fs';
import { expect } from 'chai';
import {
  create_proof,
  verify_proof,
  setup_generic_prover_and_verifier,
  // @ts-ignore
} from '@noir-lang/barretenberg';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let compiled: any;
  let acir: any;
  let prover: any;
  let verifier: any;

  let verifierContract: Contract;

  let correctProof: any;

  before(async () => {
    initialiseResolver((id: string) => {
      try {
        const string = fs.readFileSync(`circuit/${id}`, { encoding: 'utf8' });
        return string;
      } catch (err) {
        console.error(err);
        throw err;
      }
    });
    compiled = await compile({
      entry_point: 'file1.nr',
    });

    expect(compiled).to.have.property('circuit');
    expect(compiled).to.have.property('abi');

    let acir_bytes = new Uint8Array(Buffer.from(compiled.circuit, 'hex'));
    acir = acir_read_bytes(acir_bytes);

    expect(acir).to.have.property('opcodes');
    expect(acir).to.have.property('current_witness_index');
    expect(acir).to.have.property('public_inputs');

    [prover, verifier] = await setup_generic_prover_and_verifier(acir);
  });

  before('Deploy contract', async () => {
    const Verifier = await ethers.getContractFactory('TurboVerifier');
    verifierContract = await Verifier.deploy();

    const verifierAddr = await verifierContract.deployed();
    console.log(`Verifier deployed to ${verifierAddr.address}`);
  });

  before('Generate proof', async () => {
    const input = { x: 1, y: 1 };
    correctProof = await create_proof(prover, acir, input);
  });

  it('Should generate valid proof for correct input', async () => {
    expect(correctProof instanceof Buffer).to.be.true;
    const verification = await verify_proof(verifier, correctProof);
    expect(verification).to.be.true;
  });

  it('Should fail with incorrect input', async () => {
    try {
      const input = { x: 1, y: 2 };
      await create_proof(prover, acir, input);
    } catch (e) {
      expect(e instanceof Error).to.be.true;
    }
  });

  it('Should verify the proof on-chain', async () => {
    const ver = await verifierContract.verify(correctProof);
    expect(ver).to.be.true;
  });
});
