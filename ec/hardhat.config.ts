import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';

import { HardhatUserConfig } from 'hardhat/config';

import * as dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.9',
    settings: {
      evmVersion: 'london',
      optimizer: { enabled: true, runs: 5000 },
    },
  },
  mocha: {
    timeout: 100000000,
  },
  networks: {
    // mumbai: {
    //   url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_ALCHEMY_KEY}`,
    //   accounts: [process.env.MUMBAI_DEPLOYER_PRIVATE_KEY as string],
    // },
    // sepolia: {
    //   url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_ALCHEMY_KEY}`,
    //   accounts: [process.env.SEPOIA_DEPLOYER_PRIVATE_KEY as string],
    // },
    local: {
      url: 'http://127.0.0.1:8545',
      accounts: [process.env.USER_PRIVATE_KEY as string],
    },
    hardhat: {
      mining: {
        auto: true,
        interval: 1000,
      },
      blockGasLimit: 1000000000,
    },
  },

  paths: {
    sources: './contract',
  },
};

export default config;
