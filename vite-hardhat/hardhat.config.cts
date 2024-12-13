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

<<<<<<< HEAD
  return superRes;
});

// export async function compileCircuit(path = './circuit') {
//   const basePath = resolve(join(path));
//   const fm = createFileManager(basePath);
//   const result = await compile(fm);
//   if (!('program' in result)) {
//     throw new Error('Compilation failed');
//   }
//   return result as CompiledCircuit;
// }

export async function generateArtifacts(path = './circuit', crsPath = './crs') {
  // const circuit = await compileCircuit(path);

  const circuitFile = readFileSync(resolve('artifacts/circuit.json'), 'utf-8');
  const circuit = JSON.parse(circuitFile);
  const backend = new UltraHonkBackend(circuit);
  // const contract = await backend.acirGetSolidityVerifier(acirComposer);
  return { circuit };
}

task('compile', 'Compile and generate circuits and contracts').setAction(
  async (_, __, runSuper) => {
    const { circuit } = await generateArtifacts();
    mkdirSync('artifacts', { recursive: true });
    writeFileSync('artifacts/circuit.json', JSON.stringify(circuit), { flag: 'w' });
    // writeFileSync('artifacts/contract.sol', contract, { flag: 'w' });
    await runSuper();
  },
);

task('deploy', 'Deploys the verifier contract')
  .addOptionalParam('attach', 'Attach to an existing address', '', types.string)
  .setAction(async ({ attach }, hre) => {
    let verifier;
    if (attach) {
      verifier = await hre.viem.getContractAt('UltraVerifier', attach);
    } else {
      verifier = await hre.viem.deployContract('UltraVerifier');
    }

    const networkConfig = (await import(`viem/chains`))[hre.network.name] as Chain;
    console.log(networkConfig);
    const config = {
      name: hre.network.name,
      address: verifier.address,
      networkConfig: {
        ...networkConfig,
        id: hre.network.config.chainId || networkConfig.id,
      },
    };

    console.log(
      `Attached to address ${verifier.address} at network ${hre.network.name} with chainId ${config.networkConfig.id}...`,
    );
    writeFileSync('artifacts/deployment.json', JSON.stringify(config), { flag: 'w' });
  });

subtask('generateHooks', 'Generates hooks for the verifier contract').setAction(async (_, hre) => {
  exec('wagmi generate');
});

subtask('prep', 'Compiles and deploys the verifier contract')
  .addParam('attach', 'Attach to an already deployed contract', '', types.string)
  .setAction(async ({ attach }, hre) => {
    console.log('Preparing...');
    console.log('Compiling circuits and generating contracts...');

    await hre.run('compile');
    await hre.run('deploy', { attach });

    console.log('Generating hooks...');
    await hre.run('generateHooks');
  });

task('dev', 'Deploys and starts in a development environment')
  .addOptionalParam('attach', 'Attach to an existing address', '', types.string)
  .setAction(async ({ attach }, hre) => {
    await hre.run('prep', { attach });
    exec('vite dev');
  });

task('build', 'Builds the frontend project')
  .addOptionalParam('attach', 'Attach to an existing address', '', types.string)
  .setAction(async ({ attach }, hre) => {
    await hre.run('prep', { attach });
    exec('vite build');
  });

task('serve', 'Serves the frontend project').setAction(async (_, hre) => {
  exec('vite preview');
=======
  console.log(
    `Attached to address ${verifier.address} at network ${hre.network.name} with chainId ${networkConfig.id}...`,
  );
  writeFileSync('deployment.json', JSON.stringify(config), { flag: 'w' });
>>>>>>> main
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
