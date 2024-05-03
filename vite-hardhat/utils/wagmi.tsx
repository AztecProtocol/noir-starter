import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { hardhat, polygonMumbai, sepolia } from 'viem/chains';
import abi from './verifierAbi.json';
import { chainId, verifier } from './addresses.json';

const connector = injected({ target: 'metaMask' });

export const config = createConfig({
  connectors: [connector],
  chains: [hardhat, polygonMumbai, sepolia],
  transports: {
    [polygonMumbai.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http('http://127.0.0.1:8545/'),
  },
});

export const contractCallConfig = {
  address: verifier as `0x${string}`,
  abi,
  chainId: chainId,
  functionName: 'verify',
};
