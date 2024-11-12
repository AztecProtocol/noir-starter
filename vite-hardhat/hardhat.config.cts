import '@nomicfoundation/hardhat-toolbox-viem';
import '@nomicfoundation/hardhat-viem';
import '@nomicfoundation/hardhat-chai-matchers';
import 'hardhat-plugin-noir';

import hre, { vars, HardhatUserConfig, task } from 'hardhat/config';
import { writeFileSync } from 'fs';
import { Chain } from 'viem';

task('deploy', 'Deploys the verifier contract').setAction(async ({ attach }, hre) => {
  const verifier = await hre.viem.deployContract('UltraVerifier');

  const networkConfig = (await import(`viem/chains`))[hre.network.name] as Chain;
  const config = {
    name: hre.network.name,
    address: verifier.address,
    networkConfig: {
      ...networkConfig,
      id: hre.network.config.chainId,
    },
  };

  console.log(
    `Attached to address ${verifier.address} at network ${hre.network.name} with chainId ${networkConfig.id}...`,
  );
  writeFileSync('deployment.json', JSON.stringify(config), { flag: 'w' });
});

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.21',
    settings: {
      optimizer: { enabled: true, runs: 5000 },
    },
  },
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
      accounts: vars.has('localhost')
        ? [vars.get('localhost')]
        : ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'],
    },
    scrollSepolia: {
      url: 'https://sepolia-rpc.scroll.io',
      accounts: vars.has('scrollSepolia') ? [vars.get('scrollSepolia')] : [],
    },
    holesky: {
      url: 'https://holesky.drpc.org',
      accounts: vars.has('holesky') ? [vars.get('holesky')] : [],
    },
  },
  noir: {
    version: '0.36.0',
  },
  paths: {
    root: 'packages',
    tests: 'tests',
  },
};

export default config;
