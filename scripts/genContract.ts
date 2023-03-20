import { execSync } from "child_process"
import {existsSync, rmdirSync} from "fs"
import path from "path"

async function main() {
  // if (existsSync(path.join(__dirname, "../contract/plonk_vk.sol"))) {
  //   rmdirSync(path.join(__dirname, "../contract/plonk_vk.sol"), { recursive: true })
  // }

  execSync("nargo contract")

}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
