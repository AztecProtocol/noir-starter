import { compile, createFileManager } from '@noir-lang/noir_wasm';
import { CompiledCircuit } from '@noir-lang/types';

export async function getFile(file_path: string): Promise<ReadableStream<Uint8Array>> {
  const file_url = new URL(file_path, import.meta.url);
  console.log(file_url);
  const response = await fetch(file_url);

  if (!response.ok) throw new Error('Network response was not OK');

  return response.body as ReadableStream<Uint8Array>;
}

export async function getCircuit() {
  const fm = createFileManager('/');
  fm.writeFile('./src/main.nr', await getFile(`../circuit/src/main.nr`));
  fm.writeFile('./Nargo.toml', await getFile(`../circuit/Nargo.toml`));
  const result = await compile(fm);
  if (!('program' in result)) {
    throw new Error('Compilation failed');
  }
  return result.program as CompiledCircuit;
}
