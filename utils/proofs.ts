import initNoirWasm, { acir_read_bytes, compile } from "@noir-lang/noir_wasm";
import initialiseAztecBackend from "@noir-lang/aztec_backend";
// @ts-ignore
import { initialiseResolver } from "@noir-lang/noir-source-resolver";


export const compileCircuit = async () => {
  await initNoirWasm();

  return await fetch(new URL("../src/main.nr", import.meta.url))
  .then(r => r.text())
  .then(code => {
    initialiseResolver((id : any) => {
      return code;
    })
  })
  .then(() => {
    try {
      const compiled_noir = compile({});
      return compiled_noir;
    } catch (e) {
        console.log("Error while compiling:", e);
    }
  })
}

export const getAcir = async () => {
    const { circuit, abi } = await compileCircuit();
    await initialiseAztecBackend();

    let acir_bytes = new Uint8Array(Buffer.from(circuit, "hex"));
    return acir_read_bytes(acir_bytes);
  }
