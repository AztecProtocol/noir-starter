import initNoirWasm, { acir_read_bytes, compile } from '@noir-lang/noir_wasm';
// @ts-ignore
import { initialiseResolver } from '@noir-lang/noir-source-resolver';
import initialiseAztecBackend from '@noir-lang/aztec_backend';
// @ts-ignore
import { setup_generic_prover_and_verifier } from '@noir-lang/barretenberg';
import { Noir } from './noir';

const listCircuits = async () => {
  const response = await fetch('/api/listDirectory');
  const data = await response.json();
  const files = data.files;
  return files;
};


const getCode = async () => {
  let code : {[key:string]: string}= {};
  for (const path of await listCircuits()) {
    const fileUrl = `/api/readCircuitFile?filename=${path.replace('/', '')}`;
    code[path.replace('/', '')] = await fetch(fileUrl)
      .then(r => r.text())
      .then(code => code);
  }
  return code;
};

export class NoirBrowser extends Noir {

    async compile() {
        // if running on the browser, we need to fetch the code from the server
        // that's why we have this parameter codeURL
        await initNoirWasm();
        const code = await getCode();
        initialiseResolver((id: any) => {
            console.log(id);
            return code[id];
        });
        
        const compiled_noir = compile({
            entry_point: 'file1.nr',
        });
        this.compiled = compiled_noir;
        await initialiseAztecBackend();

        this.acir = acir_read_bytes(this.compiled.circuit);

        [this.prover, this.verifier] = await setup_generic_prover_and_verifier(this.acir);

    };

    getSmartContract() {
        const sc = this.verifier.SmartContract();
        return sc;
    }

}
