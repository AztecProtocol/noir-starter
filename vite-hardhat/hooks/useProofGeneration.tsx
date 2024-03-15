import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { getCircuit } from '../utils/compile.js';
import { BarretenbergBackend, ProofData } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';

export function useProofGeneration(inputs?: { [key: string]: string }) {
  const [proofData, setProofData] = useState<ProofData | undefined>();
  const [noir, setNoir] = useState<Noir | undefined>();

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

    const data = await toast.promise(noir.generateProof(inputs), {
      pending: 'Generating proof',
      success: 'Proof generated',
      error: 'Error generating proof',
    });

    setProofData(data);
    setNoir(noir);
  };

  useEffect(() => {
    if (!inputs) return;
    proofGeneration();
  }, [inputs]);

  return { noir, proofData };
}
