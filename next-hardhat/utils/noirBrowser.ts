import initNoirWasm, { compile } from '@noir-lang/noir_wasm';
import { WitnessMap, executeCircuit, compressWitness } from '@noir-lang/acvm_js';
import { ethers } from 'ethers';

import { initialiseResolver } from '@noir-lang/noir-source-resolver';
import {
  Crs,
  BarretenbergApiAsync,
  BarretenbergApiSync,
  newBarretenbergApiSync,
  newBarretenbergApiAsync,
  RawBuffer,
  BarretenbergWasm,
} from '@aztec/bb.js/dest/browser';

import { Ptr } from '@aztec/bb.js/dest/browser/types';

// Maximum we support.
const MAX_CIRCUIT_SIZE = 2 ** 19;
const NUM_THREADS = 2;

async function getGates(api: BarretenbergApiAsync, bytecode: Uint8Array) {
  const { total } = await computeCircuitSize(api, bytecode);
  return total;
}

async function computeCircuitSize(api: BarretenbergApiAsync, bytecode: Uint8Array) {
  const [exact, total, subgroup] = await api.acirGetCircuitSizes(bytecode);
  return { exact, total, subgroup };
}

const listCircuits = async () => {
  const response = await fetch('/api/listDirectory');
  const data = await response.json();
  const files = data.files;
  return files;
};

export class NoirBrowser {
  bytecode: Uint8Array = Uint8Array.from([]);
  api = {} as BarretenbergApiAsync;
  acirComposer = {} as Ptr;

  async fetchCode() {
    let code: { [key: string]: string } = {};
    for (const path of await listCircuits()) {
      const fileUrl = `/api/readCircuitFile?filename=${path.replace('/', '')}`;
      code[path.replace('/', '')] = await fetch(fileUrl)
        .then(r => r.text())
        .then(code => code);
    }
    return code;
  }

  async init() {
    await initNoirWasm();
    const code = await this.fetchCode();
    initialiseResolver((id: any) => {
      console.log(id);
      return code[id];
    });

    const compiled_noir = compile({});

    this.bytecode = compiled_noir.circuit;

    const { wasm, worker } = await BarretenbergWasm.newWorker(NUM_THREADS);
    const api = new BarretenbergApiAsync(worker, wasm);

    const circuitSize = await getGates(api, this.bytecode);
    const subgroupSize = Math.pow(2, Math.ceil(Math.log2(circuitSize)));
    if (subgroupSize > MAX_CIRCUIT_SIZE) {
      throw new Error(
        `Circuit size of ${subgroupSize} exceeds max supported of ${MAX_CIRCUIT_SIZE}`,
      );
    }
    // Plus 1 needed! (Move +1 into Crs?)
    const crs = await Crs.new(subgroupSize + 1);

    // Important to init slab allocator as first thing, to ensure maximum memory efficiency.
    await api.commonInitSlabAllocator(subgroupSize);

    // Load CRS into wasm global CRS state.
    // TODO: Make RawBuffer be default behaviour, and have a specific Vector type for when wanting length prefixed.
    await api.srsInitSrs(
      new RawBuffer(crs.getG1Data()),
      crs.numPoints,
      new RawBuffer(crs.getG2Data()),
    );

    this.api = api;
    this.acirComposer = await api.acirNewAcirComposer(subgroupSize);
  }

  async generateWitness(input: any) {
    const initialWitness = new Map<number, string>();
    initialWitness.set(1, ethers.utils.hexZeroPad(`0x${input.x.toString(16)}`, 32));
    initialWitness.set(2, ethers.utils.hexZeroPad(`0x${input.y.toString(16)}`, 32));

    const witness = await executeCircuit(this.bytecode, initialWitness, () => {
      throw Error('unexpected oracle');
    });
    const witnessBuff = compressWitness(witness);
    return witnessBuff;
  }

  async generateProof(witness: Uint8Array) {
    const proof = await this.api.acirCreateProof(this.acirComposer, this.bytecode, witness, false);
    return proof;
  }

  async verifyProof(proof: Uint8Array) {
    const verified = await this.api.acirVerifyProof(this.acirComposer, proof, false);
    return verified;
  }
}
