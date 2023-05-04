// @ts-ignore
import {
  create_proof,
  verify_proof,
  setup_generic_prover_and_verifier,
  // @ts-ignore
} from '@noir-lang/barretenberg';
// @ts-ignore
import { initialiseResolver } from '@noir-lang/noir-source-resolver';
// @ts-ignore
import { acir_read_bytes, compile } from '@noir-lang/noir_wasm';
import path from 'path';
import fs from 'fs';
const hexToUint8Array = (hex: string) => Uint8Array.from(Buffer.from(hex, 'hex'));

export class Noir {
  prover: any;
  verifier: any;
  acir: any;
  compiled: any;

  async createProof({ input }: { input: any }) {
    console.log(input);
    const abi = {
      pub_key_x: hexToUint8Array(input.pub_key_x),
      pub_key_y: hexToUint8Array(input.pub_key_y),
      signature: Uint8Array.from(Buffer.from(input.signature.slice(2).slice(0, 128), 'hex')),
      hashed_message: hexToUint8Array(input.hashed_message.slice(2)),
    };
    console.log(abi);

    const proof = await create_proof(this.prover, this.acir, input);
    return proof;
  }

  async verifyProof({ proof }: { proof: any }) {
    const verification = await verify_proof(this.verifier, proof);
    return verification;
  }

  async compile() {
    // I'm running on the server so I can use the file system
    initialiseResolver((id: any) => {
      try {
        const code = fs.readFileSync(`circuits/src/${id}`, { encoding: 'utf8' }) as string;
        console.log(code);
        return code;
      } catch (err) {
        console.error(err);
        throw err;
      }
    });

    const compiled_noir = compile({});
    this.compiled = compiled_noir;

    this.acir = acir_read_bytes(this.compiled.circuit);

    [this.prover, this.verifier] = await setup_generic_prover_and_verifier(this.acir);
  }

  getSmartContract() {
    const sc = this.verifier.SmartContract();

    // The user must have a folder called 'contract' in the root directory. If not, we create it.
    if (!fs.existsSync(path.join(__dirname, '../contract'))) {
      console.log('Contract folder does not exist. Creating...');
      fs.mkdirSync(path.join(__dirname, '../contract'));
    }

    // If the user already has a file called 'plonk_vk.sol' in the 'contract' folder, we delete it.
    if (fs.existsSync(path.join(__dirname, '../contract/plonk_vk.sol'))) {
      fs.unlinkSync(path.join(__dirname, '../contract/plonk_vk.sol'));
    }

    // We write the contract to a file called 'plonk_vk.sol' in the 'contract' folder.
    fs.writeFileSync(path.join(__dirname, '../contract/plonk_vk.sol'), sc, {
      flag: 'w',
    });

    return sc;
  }
}
