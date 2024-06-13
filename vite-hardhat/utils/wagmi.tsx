import { http, createConfig } from 'wagmi';
import { scrollSepolia, holesky, hardhat } from 'wagmi/chains';
import { chainId, verifier } from '../artifacts/deployment.json';

import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [hardhat, scrollSepolia, holesky],
  transports: {
    [hardhat.id]: http(),
    [scrollSepolia.id]: http(),
    [holesky.id]: http(),
  },
  connectors: [injected()],
});

export const contractCallConfig = {
  address: verifier.address as `0x${string}`,
  abi: verifier.abi,
  chainId: chainId,
  functionName: 'verify',
};
