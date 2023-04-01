import { writeFileSync } from 'fs';
import { ethers } from 'hardhat';

async function main() {
  const Verifier = await ethers.getContractFactory('TurboVerifier');
  const verifier = await Verifier.deploy();

  const verifierAddr = await verifier.deployed();

  const config = {
    chainId: ethers.provider.network.chainId,
    verifier: verifierAddr.address,
  };
  console.log('Deployed at', config);
  writeFileSync('utils/addresses.json', JSON.stringify(config), { flag: 'w' });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
