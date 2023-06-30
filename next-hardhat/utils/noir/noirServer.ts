import { compile } from '@noir-lang/noir_wasm';
import { executeCircuit, compressWitness, decompressWitness } from '@noir-lang/avcm.js';
import path from 'path';
import fs from 'fs';
import { Noir } from './noir';
import { ethers } from 'ethers';

import * as bbjs from '@aztec/bb.js/dest/node/barretenberg_wasm';
import {
  Crs,
  BarretenbergApiAsync,
  newBarretenbergApiAsync,
  RawBuffer,
} from '@aztec/bb.js/dest/node';
import { Buffer32, Fr } from '@aztec/bb.js/dest/node/types';

// Maximum we support.
const MAX_CIRCUIT_SIZE = 2 ** 19;

async function getGates(api: BarretenbergApiAsync, bytecode: Buffer) {
  const { total } = await computeCircuitSize(api, bytecode);
  return total;
}

async function computeCircuitSize(api: BarretenbergApiAsync, bytecode: Buffer) {
  const [exact, total, subgroup] = await api.acirGetCircuitSizes(bytecode);
  return { exact, total, subgroup };
}

async function init(bytecode: Buffer) {
  const api = await newBarretenbergApiAsync();

  const circuitSize = await getGates(api, bytecode);
  const subgroupSize = Math.pow(2, Math.ceil(Math.log2(circuitSize)));
  if (subgroupSize > MAX_CIRCUIT_SIZE) {
    throw new Error(`Circuit size of ${subgroupSize} exceeds max supported of ${MAX_CIRCUIT_SIZE}`);
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

  const acirComposer = await api.acirNewAcirComposer(subgroupSize);
  return { api, acirComposer, circuitSize: subgroupSize };
}

export class NoirServer extends Noir {
  // async function init(jsonPath: string) {
  //   const api = await newBarretenbergApiAsync();

  //   async function getGates(jsonPath: string, api: BarretenbergApiAsync) {
  //     const parsed = getJsonData(jsonPath);
  //     if (parsed.gates) {
  //       return +parsed.gates;
  //     }
  //     const { total } = await computeCircuitSize(jsonPath, api);
  //     const jsonData = getJsonData(jsonPath);
  //     jsonData.gates = total;
  //     writeFileSync(jsonPath, JSON.stringify(jsonData));
  //     return total;
  //   }

  //   const circuitSize = await getGates(jsonPath, api);
  //   const subgroupSize = Math.pow(2, Math.ceil(Math.log2(circuitSize)));

  //   // Plus 1 needed! (Move +1 into Crs?)
  //   const crs = await Crs.new(subgroupSize + 1);

  //   // Important to init slab allocator as first thing, to ensure maximum memory efficiency.
  //   await api.commonInitSlabAllocator(subgroupSize);

  //   // Load CRS into wasm global CRS state.
  //   // TODO: Make RawBuffer be default behaviour, and have a specific Vector type for when wanting length prefixed.
  //   await api.srsInitSrs(new RawBuffer(crs.getG1Data()), crs.numPoints, new RawBuffer(crs.getG2Data()));

  //   const acirComposer = await api.acirNewAcirComposer(subgroupSize);
  //   return { api, acirComposer, circuitSize: subgroupSize };
  // }

  async compile() {
    // I'm running on the server so I can use the file system
    // initialiseResolver(() => `circuits/src/main.nr`);

    const compiled_noir = compile({ entry_point: 'circuits/src/main.nr' });
    this.compiled = compiled_noir;

    return this.compiled;
  }

  async generateWitness(input: any) {
    const compiled = await this.compile();

    const initialWitness = new Map<number, string>();
    initialWitness.set(1, ethers.utils.hexZeroPad(`0x${input.x.toString(16)}`, 32));
    initialWitness.set(2, ethers.utils.hexZeroPad(`0x${input.y.toString(16)}`, 32));
    const witness = await executeCircuit(compiled.circuit, initialWitness, () => {
      throw Error('unexpected oracle');
    });
    const witnessBuff = compressWitness(witness);
    return witnessBuff;
  }

  async generateProof(compiledCircuit, input) {
    const { api, acirComposer, circuitSize } = await init(compiledCircuit.circuit);

    const proof = await api.acirCreateProof(acirComposer, compiledCircuit.circuit, input, false);

    console.log('proof', proof);
  }

  // getSmartContract() {
  //   const sc = this.verifier.SmartContract();

  //   // The user must have a folder called 'contract' in the root directory. If not, we create it.
  //   if (!fs.existsSync(path.join(__dirname, '../../contract'))) {
  //     console.log('Contract folder does not exist. Creating...');
  //     fs.mkdirSync(path.join(__dirname, '../../contract'));
  //   }

  //   // If the user already has a file called 'plonk_vk.sol' in the 'contract' folder, we delete it.
  //   if (fs.existsSync(path.join(__dirname, '../../contract/plonk_vk.sol'))) {
  //     fs.unlinkSync(path.join(__dirname, '../../contract/plonk_vk.sol'));
  //   }

  //   // We write the contract to a file called 'plonk_vk.sol' in the 'contract' folder.
  //   fs.writeFileSync(path.join(__dirname, '../../contract/plonk_vk.sol'), sc, {
  //     flag: 'w',
  //   });

  //   return sc;
  // }
}
