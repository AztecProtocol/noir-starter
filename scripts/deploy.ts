import { ethers } from 'hardhat'; 

async function main() {
  const Verifier = await ethers.getContractFactory('TurboVerifier');
  const verifier = await Verifier.deploy();

  const verifierAddr = await verifier.deployed();
  console.log(`Verifier deployed to ${verifier.address}`);

  const Game = await ethers.getContractFactory('Waldo');
  const game = await Game.deploy(verifierAddr.address);
  console.log(`Game deployed to ${game.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
