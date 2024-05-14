import { http, createConfig } from 'wagmi';
import { localhost, sepolia } from 'wagmi/chains';
import abi from './verifierAbi.json';
import { chainId, verifier } from './addresses.json';

export const config = createConfig({
  chains: [localhost, sepolia],
  transports: {
    [localhost.id]: http(),
    [sepolia.id]: http(),
  },
});

export const contractCallConfig = {
  address: verifier as `0x${string}`,
  abi,
  chainId: chainId,
  functionName: 'verify',
};
