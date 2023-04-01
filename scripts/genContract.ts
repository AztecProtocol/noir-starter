import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'fs';
import path from 'path';
// @ts-ignore
import { initialiseResolver } from '@noir-lang/noir-source-resolver';
import { acir_read_bytes, compile } from '@noir-lang/noir_wasm';
// @ts-ignore
import { setup_generic_prover_and_verifier } from '@noir-lang/barretenberg';

const MAIN_NR_PATH = 'src/main.nr';

async function main() {
  if (!existsSync(path.join(__dirname, '../contract'))) {
    console.log('Contract folder does not exist. Creating...');
    mkdirSync(path.join(__dirname, '../contract'));
  }

  if (existsSync(path.join(__dirname, '../contract/plonk_vk.sol'))) {
    unlinkSync(path.join(__dirname, '../contract/plonk_vk.sol'));
  }

  initialiseResolver(() => {
    try {
      const string = readFileSync(MAIN_NR_PATH, { encoding: 'utf8' });
      return string;
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  console.log('Compiling...');
  const compiled = await compile({});

  const acir = acir_read_bytes(compiled.circuit);

  const [prover, verifier] = await setup_generic_prover_and_verifier(acir);
  console.log('Generating contract...');

  const sc = verifier.SmartContract();

  console.log('Contract generated!');
  writeFileSync(path.join(__dirname, '../contract/plonk_vk.sol'), sc, {
    flag: 'w',
  });
  console.log('Contract saved!');
  process.exit();
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
