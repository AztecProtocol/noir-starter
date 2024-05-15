import '@nomicfoundation/hardhat-toolbox-viem';
import '@nomicfoundation/hardhat-viem';
import '@nomicfoundation/hardhat-chai-matchers';

import { HardhatUserConfig } from 'hardhat/config';

import * as dotenv from 'dotenv';
import { subtask } from 'hardhat/config';
import { TASK_COMPILE_SOLIDITY } from 'hardhat/builtin-tasks/task-names';
import { join } from 'path';
import { writeFile } from 'fs/promises';
dotenv.config();

subtask(TASK_COMPILE_SOLIDITY).setAction(async (_, { config }, runSuper) => {
  const superRes = await runSuper();

  try {
    await writeFile(join(config.paths.root, 'artifacts', 'package.json'), '{ "type": "commonjs" }');
  } catch (error) {
    console.error('Error writing package.json: ', error);
  }

  return superRes;
});

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: { enabled: true, runs: 5000 },
    },
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
  },
  paths: {
    root: './',
    sources: './circuit',
  },
};

if (process.env.SEPOLIA_SCROLL_ETHERSCAN_KEY && config.networks) {
  config.networks.scrollSepolia = {
    url: 'https://sepolia-rpc.scroll.io',
    accounts: [process.env.SEPOLIA_SCROLL_DEPLOYER_PRIVATE_KEY as string],
  };
  config.etherscan = {
    apiKey: {
      scrollSepolia: process.env.SEPOLIA_SCROLL_ETHERSCAN_KEY,
    },
    customChains: [
      {
        network: 'sccrollSepolia',
        chainId: 534352,
        urls: {
          apiURL: 'https://api-sepolia.scrollscan.com/api',
          browserURL: 'https://sepolia.scrollscan.com/',
        },
      },
    ],
  };
}

export default config;
