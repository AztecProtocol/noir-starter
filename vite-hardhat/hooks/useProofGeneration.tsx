import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { getCircuit } from '../utils/compile.js';
import { BarretenbergBackend, ProofData } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';

export function useProofGeneration(inputs?: { [key: string]: string }) {
  const [proofData, setProofData] = useState<ProofData | undefined>();

  const proofGeneration = async () => {
    if (!inputs) return;
    const circuit = await getCircuit();
    const backend = new BarretenbergBackend(circuit, { threads: navigator.hardwareConcurrency });
    const noir = new Noir(circuit, backend);

    await toast.promise(noir.init, {
      pending: 'Initializing Noir...',
      success: 'Noir initialized!',
      error: 'Error initializing Noir',
    });

    const data = await toast.promise(noir.generateFinalProof(inputs), {
      pending: 'Generating proof',
      success: 'Proof generated',
      error: 'Error generating proof',
    });

    const res = await toast.promise(noir.verifyFinalProof(data), {
      pending: 'Verifying proof off-chain',
      success: 'Proof verified off-chain',
      error: 'Error verifying proof off-chain',
    });

    console.log(res);
  };

  useEffect(() => {
    if (!inputs) return;
    proofGeneration();
  }, [inputs]);

  return { proofData };
}
