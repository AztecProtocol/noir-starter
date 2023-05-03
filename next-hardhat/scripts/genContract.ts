import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
import { NoirServer } from '../utils/noir/noirServer';

async function main() {
  const noir = new NoirServer();
  await noir.compile();
  noir.getSmartContract()
  process.exit();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
