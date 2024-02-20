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
    sources: './circuit',
  },
};

if (process.env.MUMBAI_ALCHEMY_KEY && config.networks) {
  config.networks.mumbai = {
    url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_ALCHEMY_KEY}`,
    accounts: [process.env.MUMBAI_DEPLOYER_PRIVATE_KEY as string],
  };
}

if (process.env.SEPOLIA_ALCHEMY_KEY && config.networks) {
  config.networks.sepolia = {
    url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_ALCHEMY_KEY}`,
    accounts: [process.env.SEPOLIA_DEPLOYER_PRIVATE_KEY as string],
  };
}

export default config;
