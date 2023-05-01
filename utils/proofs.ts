import initNoirWasm, { acir_read_bytes, compile } from '@noir-lang/noir_wasm';
import initialiseAztecBackend from '@noir-lang/aztec_backend';
// @ts-ignore
import { initialiseResolver } from '@noir-lang/noir-source-resolver';
import { readdirSync } from 'fs';

const listCircuits = async () => {
  const response = await fetch('/api/listDirectory');
  const data = await response.json();
  const files = data.files;
  console.log(files);
  return files;
};

const prepareCode = async () => {
  let code = {};
  for (const path of await listCircuits()) {
    const fileUrl = `/api/readCircuitFile?filename=${path.replace('/', '')}`;
    code[path.replace('/', '')] = await fetch(fileUrl)
      .then(r => r.text())
      .then(code => code);
  }
  return code;
};

export const compileCircuit = async () => {
  await initNoirWasm();

  const code = await prepareCode();
  initialiseResolver((id: any) => {
    console.log(id);
    return code[id];
  });

  try {
    const compiled_noir = compile({
      entry_point: 'file1.nr',
    });
    return compiled_noir;
  } catch (e) {
    console.log('Error while compiling:', e);
  }
};

export const getAcir = async () => {
  const response = await fetch('/api/getAcir');
  const data = await response.json();
  await initialiseAztecBackend();

  let acir_bytes = new Uint8Array(Buffer.from(data.bytecode, 'hex'));
  console.log(acir_bytes)

  return acir_read_bytes(acir_bytes);
};

export const compileAcir = async () => {
  const { circuit } = await compileCircuit();
  await initialiseAztecBackend();
  console.log(circuit)
  return acir_read_bytes(circuit);
};
