// @ts-ignore
import acvm from '@noir-lang/acvm_js/web/acvm_js_bg.wasm?url';
// @ts-ignore
import noirc from '@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url';
import initNoirC from '@noir-lang/noirc_abi';
import initACVM from '@noir-lang/acvm_js';
// @ts-ignore
await Promise.all([initACVM(fetch(acvm)), initNoirC(fetch(noirc))]);

import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Component from './components/index.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { defineChain, createClient } from 'viem';
import { injected } from 'wagmi/connectors';
import { networkConfig } from '../../deployment.json';

const queryClient = new QueryClient();

const { id, name, nativeCurrency, rpcUrls } = networkConfig;
const chain = defineChain({
  id,
  name,
  nativeCurrency,
  rpcUrls,
});

const config = createConfig({
  connectors: [injected()],
  chains: [chain],
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{mounted && children}</QueryClientProvider>
    </WagmiProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Providers>
    <Component />
    <ToastContainer />
  </Providers>,
);
