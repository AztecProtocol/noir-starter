import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
// @ts-ignore
import { initialiseResolver } from '@noir-lang/noir-source-resolver';
import { acir_read_bytes, compile } from '@noir-lang/noir_wasm';
// @ts-ignore
import { setup_generic_prover_and_verifier } from '@noir-lang/barretenberg';

async function main() {
  // The user must have a folder called 'contract' in the root directory. If not, we create it.
  if (!existsSync(path.join(__dirname, '../contract'))) {
    console.log('Contract folder does not exist. Creating...');
    mkdirSync(path.join(__dirname, '../contract'));
  }

  // If the user already has a file called 'plonk_vk.sol' in the 'contract' folder, we delete it.
  if (existsSync(path.join(__dirname, '../contract/plonk_vk.sol'))) {
    unlinkSync(path.join(__dirname, '../contract/plonk_vk.sol'));
  }

  // We initialise the resolver, which will allow us to import files from the user's project.
  initialiseResolver((id: any) => {
    try {
      return readFileSync(`circuit/${id}`, { encoding: 'utf8' }) as string;
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  // We compile the Noir program.
  const compiled = await compile({
    entry_point: 'file1.nr',
  });

  // We read the ACIR circuit.
  const acir = acir_read_bytes(compiled.circuit);

  // We generate the prover and verifier.
  const [prover, verifier] = await setup_generic_prover_and_verifier(acir);
  console.log('Generating contract...');

  // We generate the Solidity contract.
  const sc = verifier.SmartContract();

  console.log('Contract generated!');
  // We write the contract to a file called 'plonk_vk.sol' in the 'contract' folder.
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
