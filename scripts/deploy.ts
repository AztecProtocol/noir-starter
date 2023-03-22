import { writeFileSync } from 'fs';
import { ethers } from 'hardhat'; 

async function main() {
  const Verifier = await ethers.getContractFactory('TurboVerifier');
  const verifier = await Verifier.deploy();

  const verifierAddr = await verifier.deployed();

  const Game = await ethers.getContractFactory('Waldo');
  const game = await Game.deploy(verifierAddr.address);

  if (process.env.NODE_ENV !== "production") {
    await game.addSolution(0, "0x206c6a688c2560a664cae4d0f8eef08d0c2364b0f3bd041038870c909c3be1c1")
  }

  const config = {
    chainId: ethers.provider.network.chainId,
    verifier: verifierAddr.address,
    game: game.address,
  }

  writeFileSync('utils/addresses.json', JSON.stringify(config), { flag: 'w' });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
