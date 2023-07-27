import initNoirWasm, { compile } from '@noir-lang/noir_wasm';
import initACVM, { WitnessMap, executeCircuit, compressWitness } from '@noir-lang/acvm_js';
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
import { unzipSync, decompressSync } from 'fflate';
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
  acirBuffer: Uint8Array = Uint8Array.from([]);
  acirBufferUncompressed: Uint8Array = Uint8Array.from([]);

  async fetchCode() {
    let code: { [key: string]: string } = {};
    for (const path of await listCircuits()) {
      const fileUrl = `/api/readCircuitFile?filename=${path}`;
      code[`/${path}`] = await fetch(fileUrl)
        .then(r => r.text())
        .then(code => code);
    }
    return code;
  }

  async init() {
    await initNoirWasm();
    const code = await this.fetchCode();
    console.log(code);

    initialiseResolver((id: any) => {
      return code[id];
    });

    const compiled_noir = compile({});
    const { wasm, worker } = await BarretenbergWasm.newWorker(NUM_THREADS);
    const api = new BarretenbergApiAsync(worker, wasm);

    this.acirBuffer = Buffer.from(compiled_noir.circuit, 'base64');
    this.acirBufferUncompressed = decompressSync(this.acirBuffer);

    const circuitSize = await getGates(api, this.acirBufferUncompressed);

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

  destroy() {
    this.api.destroy();
  }

  async generateWitness(input: any): Promise<Uint8Array> {
    await initACVM();

    const initialWitness: WitnessMap = new Map<number, string>();
    initialWitness.set(1, ethers.utils.hexZeroPad(`0x${input.x.toString(16)}`, 32));
    initialWitness.set(2, ethers.utils.hexZeroPad(`0x${input.y.toString(16)}`, 32));

    const witnessMap = await executeCircuit(this.acirBuffer, initialWitness, () => {
      throw Error('unexpected oracle');
    });

    const witnessBuff = compressWitness(witnessMap);
    return witnessBuff;
  }

  async generateProof(witness: Uint8Array) {
    const proof = await this.api.acirCreateProof(
      this.acirComposer,
      this.acirBufferUncompressed,
      decompressSync(witness),
      false,
    );
    return proof;
  }

  async verifyProof(proof: Uint8Array) {
    await this.api.acirInitProvingKey(this.acirComposer, this.acirBufferUncompressed);
    const verified = await this.api.acirVerifyProof(this.acirComposer, proof, false);
    return verified;
  }
}
