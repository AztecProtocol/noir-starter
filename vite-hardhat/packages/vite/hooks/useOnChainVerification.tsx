import React from 'react';
import { ProofData } from '@noir-lang/types';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { bytesToHex } from 'viem';
import { useEffect, useState } from 'react';
import { Id, toast } from 'react-toastify';
import { useReadUltraVerifierVerify } from '../artifacts/generated.js';
import deployment from '../../../deployment.json';

export function useOnChainVerification(proofData?: ProofData) {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();
  const [args, setArgs] = useState<[`0x${string}`, `0x${string}`[]] | undefined>();

  const { chains, switchChain } = useSwitchChain();
  const { data, error } = useReadUltraVerifierVerify({
    args,
    query: {
      enabled: !!args,
    },
  });

  const [onChainToast, setOnChainToast] = useState<Id>(0);

  useEffect(() => {
    switchChain({ chainId: chains[0].id });
    if (!proofData || !isConnected) {
      return;
    }

    setArgs([bytesToHex(proofData.proof), proofData.publicInputs as `0x${string}`[]]);

    if (!onChainToast)
      setOnChainToast(toast.loading('Verifying proof on-chain', { autoClose: 10000 }));
  }, [isConnected, proofData]);

  useEffect(() => {
    if (data) {
      toast.update(onChainToast, {
        type: 'success',
        render: 'Proof verified on-chain!',
        isLoading: false,
      });
    } else if (error) {
      toast.update(onChainToast, {
        type: 'error',
        render: 'Error verifying proof on-chain!',
        isLoading: false,
      });
      console.error(error.message);
    }
  }, [data, error]);

  if (!isConnected) {
    return (
      <div style={{ padding: '20px 0' }}>
        <button
          key={connectors[0].uid}
          onClick={() =>
            connect({ connector: connectors[0], chainId: deployment.networkConfig.id })
          }
        >
          Connect wallet
        </button>
      </div>
    );
  } else {
    return (
      <div style={{ padding: '20px 0' }}>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }
}
