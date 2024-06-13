import '@nomicfoundation/hardhat-toolbox-viem';
import '@nomicfoundation/hardhat-viem';
import '@nomicfoundation/hardhat-chai-matchers';

import { HardhatUserConfig, task } from 'hardhat/config';

import * as dotenv from 'dotenv';
import { subtask } from 'hardhat/config';
import { TASK_COMPILE_SOLIDITY } from 'hardhat/builtin-tasks/task-names';
import { join, resolve } from 'path';
import { writeFile } from 'fs/promises';
import { mkdirSync, writeFileSync } from 'fs';
import { gunzipSync } from 'zlib';
import { Barretenberg, RawBuffer, Crs } from '@aztec/bb.js';
import { createFileManager, compile } from '@noir-lang/noir_wasm';
import { CompiledCircuit } from '@noir-lang/types';

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

export async function compileCircuit(path = './circuit') {
  const basePath = resolve(join(path));
  const fm = createFileManager(basePath);
  const result = await compile(fm);
  if (!('program' in result)) {
    throw new Error('Compilation failed');
  }
  return result.program as CompiledCircuit;
}

export async function generateArtifacts(path = './circuit', crsPath = './crs') {
  const circuit = await compileCircuit(path);
  const decompressed = gunzipSync(Buffer.from(circuit.bytecode, 'base64'));
  const api = await Barretenberg.new({ threads: 8 });
  const [exact, total, subgroup] = await api.acirGetCircuitSizes(decompressed);
  const subgroupSize = Math.pow(2, Math.ceil(Math.log2(total)));

  const crs = await Crs.new(subgroupSize + 1, crsPath);
  await api.commonInitSlabAllocator(subgroupSize);
  await api.srsInitSrs(
    new RawBuffer(crs.getG1Data()),
    crs.numPoints,
    new RawBuffer(crs.getG2Data()),
  );

  const acirComposer = await api.acirNewAcirComposer(subgroupSize);
  await api.acirInitProvingKey(acirComposer, decompressed);
  await api.acirInitVerificationKey(acirComposer);

  const contract = await api.acirGetSolidityVerifier(acirComposer);
  return { circuit, contract };
}

task('compile', 'Compile and generate circuits and contracts').setAction(
  async (_, __, runSuper) => {
    const { circuit, contract } = await generateArtifacts();
    mkdirSync('artifacts', { recursive: true });
    writeFileSync('artifacts/circuit.json', JSON.stringify(circuit), { flag: 'w' });
    writeFileSync('artifacts/contract.sol', contract, { flag: 'w' });
    await runSuper();
  },
);

task('deploy', 'Deploys the verifier contract').setAction(async (taskArguments, hre) => {
  console.log(await hre.viem.getWalletClients());
  const publicClient = await hre.viem.getPublicClient();

  // Deploy the verifier contract
  const verifier = await hre.viem.deployContract('UltraVerifier');

  // Create a config object
  const config = {
    chainId: publicClient.chain.id,
    verifier,
  };

  // Print the config
  console.log('Deployed at', config.verifier.address);
  writeFileSync('artifacts/deployment.json', JSON.stringify(config), { flag: 'w' });
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
    sources: './artifacts',
    artifacts: './artifacts/hardhat',
  },
};

if (process.env.SEPOLIA_SCROLL_DEPLOYER_PRIVATE_KEY) {
  config.networks = {
    ...config.networks,
    scrollSepolia: {
      url: 'https://sepolia-rpc.scroll.io',
      accounts: [process.env.SEPOLIA_SCROLL_DEPLOYER_PRIVATE_KEY as string],
    },
  };
}

if (process.env.HOLESKY_DEPLOYER_PRIVATE_KEY) {
  config.networks = {
    ...config.networks,
    holesky: {
      url: 'https://holesky.drpc.org',
      accounts: [process.env.HOLESKY_DEPLOYER_PRIVATE_KEY as string],
    },
  };
}

export default config;
