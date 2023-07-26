import { compile } from '@noir-lang/noir_wasm';
import { WitnessMap, executeCircuit, compressWitness } from '@noir-lang/acvm_js';
import { ethers } from 'ethers';

import {
  Crs,
  BarretenbergApiAsync,
  BarretenbergApiSync,
  newBarretenbergApiSync,
  newBarretenbergApiAsync,
  RawBuffer,
} from '@aztec/bb.js/dest';
import { Ptr } from '@aztec/bb.js/dest/types';

import { gunzipSync } from 'zlib';
import fs, { readFileSync } from 'fs';

// Maximum we support.
const MAX_CIRCUIT_SIZE = 2 ** 19;

function getJsonData(jsonPath: string) {
  const json = readFileSync(jsonPath, 'utf-8');
  const parsed = JSON.parse(json);
  return parsed;
}

function getBytecode(jsonPath: string) {
  const parsed = getJsonData(jsonPath);
  return parsed.bytecode;
}

async function getGates(api: BarretenbergApiAsync, bytecode: Uint8Array) {
  const { total } = await computeCircuitSize(api, bytecode);
  return total;
}

async function computeCircuitSize(api: BarretenbergApiAsync, bytecode: Uint8Array) {
  const [exact, total, subgroup] = await api.acirGetCircuitSizes(bytecode);
  return { exact, total, subgroup };
}

export class NoirNode {
  acir: string = '';
  acirBuffer: Uint8Array = Uint8Array.from([]);
  acirBufferUncompressed: Uint8Array = Uint8Array.from([]);

  api = {} as BarretenbergApiAsync;
  acirComposer = {} as Ptr;

  async init() {
    this.acir = getBytecode('circuits/target/main.json');
    this.acirBuffer = Buffer.from(this.acir, 'base64');
    this.acirBufferUncompressed = gunzipSync(this.acirBuffer);

    const api = await newBarretenbergApiAsync(4);

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

  async generateWitness(input: any): Promise<Uint8Array> {
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
      gunzipSync(witness),
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
