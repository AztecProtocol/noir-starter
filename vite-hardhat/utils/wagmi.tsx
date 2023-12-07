import { createConfig, configureChains } from 'wagmi';
import { localhost, polygonMumbai, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import abi from './verifierAbi.json';
import addresses from './addresses.json';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [localhost, polygonMumbai, sepolia],
  [publicProvider()],
);

export const config = createConfig({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  publicClient,
  webSocketPublicClient,
});

export const contractCallConfig = {
  address: addresses.verifier as `0x${string}`,
  abi,
};
