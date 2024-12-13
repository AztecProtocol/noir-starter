import { defineConfig } from '@wagmi/cli';
import { react, hardhat } from '@wagmi/cli/plugins';
import deployment from '../../deployment.json';

export default defineConfig({
  out: 'artifacts/generated.ts',
  plugins: [
    react(),
    hardhat({
      project: '.',
      artifacts: '../artifacts',
      deployments: {
        UltraVerifier: {
          [deployment.networkConfig.id]: deployment.address as `0x${string}`,
        },
      },
    }),
  ],
});
