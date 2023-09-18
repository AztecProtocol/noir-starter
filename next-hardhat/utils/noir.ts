// TODO use the JSON directly for now
// import { compile } from '@noir-lang/noir_wasm';
import { decompressSync } from 'fflate';
import { executeCircuit, compressWitness } from '@noir-lang/acvm_js';
import { ethers } from 'ethers'; // I'm lazy so I'm using ethers to pad my input
import circuit from '../circuits/target/noirstarter.json';
import { Barretenberg } from '@aztec/bb.js/dest/node';

export class Noir {
  acir: string = '';
  acirBuffer: Uint8Array = Uint8Array.from([]);
  acirBufferUncompressed: Uint8Array = Uint8Array.from([]);

  api: Barretenberg = {} as any;
  acirComposer = {} as any;

  async init() {
    // TODO disabled until we get a fix for std
    // const compiled_noir = compile({
    //   entry_point: `${__dirname}/../../circuits/src/main.nr`,
    // });

    let Barretenberg, RawBuffer, Crs;

    if (typeof window !== 'undefined') {
      // init ACVM needed for browser
      const { default: initACVM } = await import('@noir-lang/acvm_js');
      await initACVM();

      // Dynamic import for browser
      const bbjs = await import('@aztec/bb.js');
      // @ts-ignore
      ({ Barretenberg, RawBuffer, Crs } = bbjs);
    } else {
      // Dynamic import for node
      const { loadModule } = await import('@aztec/bb.js');
      ({ Barretenberg, RawBuffer, Crs } = await loadModule());
    }

    // Rest of your existing code
    this.acirBuffer = Buffer.from(circuit.bytecode, 'base64');
    this.acirBufferUncompressed = decompressSync(this.acirBuffer);
    // ... (rest of your

    this.acirBuffer = Buffer.from(circuit.bytecode, 'base64');
    this.acirBufferUncompressed = decompressSync(this.acirBuffer);

    this.api = (await Barretenberg.new(4)) as Barretenberg;
    const [exact, total, subgroup] = await this.api.acirGetCircuitSizes(
      this.acirBufferUncompressed,
    );

    const subgroupSize = Math.pow(2, Math.ceil(Math.log2(total)));
    const crs = await Crs.new(subgroupSize + 1);
    await this.api.commonInitSlabAllocator(subgroupSize);
    await this.api.srsInitSrs(
      new RawBuffer(crs.getG1Data()),
      crs.numPoints,
      new RawBuffer(crs.getG2Data()),
    );

    this.acirComposer = await this.api.acirNewAcirComposer(subgroupSize);
  }

  async generateWitness(input: any): Promise<Uint8Array> {
    const initialWitness = new Map<number, string>();
    initialWitness.set(1, ethers.utils.hexZeroPad(`0x${input.x.toString(16)}`, 32));
    initialWitness.set(2, ethers.utils.hexZeroPad(`0x${input.y.toString(16)}`, 32));

    const witnessMap = await executeCircuit(this.acirBuffer, initialWitness, () => {
      throw Error('unexpected oracle');
    });

    const witnessBuff = compressWitness(witnessMap);
    console.log('witnessBuff: ', witnessBuff);
    return witnessBuff;
  }

  async generateProof(witness: Uint8Array) {
    const proof = await this.api.acirCreateProof(
      this.acirComposer,
      this.acirBufferUncompressed,
      decompressSync(witness),
      false,
    );
    console.log('proof: ', proof);
    return proof;
  }

  async verifyProof(proof: Uint8Array) {
    await this.api.acirInitProvingKey(this.acirComposer, this.acirBufferUncompressed);
    const verified = await this.api.acirVerifyProof(this.acirComposer, proof, false);
    console.log('verified: ', verified);
    return verified;
  }

  async destroy() {
    await this.api.destroy();
  }
}
