import { ProofData } from '@noir-lang/types';
import { useAccount, useConnect, useReadContract } from 'wagmi';
import { config, contractCallConfig } from '../utils/wagmi.jsx';
import { bytesToHex } from 'viem';
import { useEffect, useState } from 'react';
import { Id, toast } from 'react-toastify';

export function useOnChainVerification(proofData?: ProofData) {
  const { isConnected } = useAccount();
  const [args, setArgs] = useState<[string, string[]] | undefined>();

  const { connect } = useConnect();
  const { data, error } = useReadContract({
    ...contractCallConfig,
    args,
    query: {
      enabled: !!args,
    },
  });

  const [onChainToast, setOnChainToast] = useState<Id>(0);

  useEffect(() => {
    if (!proofData || !isConnected) {
      return;
    }

    setArgs([bytesToHex(proofData.proof), proofData.publicInputs]);

    if (!onChainToast)
      setOnChainToast(toast.loading('Verifying proof on-chain', { autoClose: 10000 }));
  }, [proofData]);

  useEffect(() => {
    if (!isConnected) {
      connect({ connector: config.connectors[0] });
    }
  }, [isConnected]);

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
      console.error(error);
    }
  }, [data, error]);
}
