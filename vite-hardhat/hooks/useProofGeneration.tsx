import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { getCircuit } from '../circuit/compile.js';
// import { BarretenbergBackend, ProofData } from '@noir-lang/backend_barretenberg';
import { UltraHonkBackend, ProofData } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';

export function useProofGeneration(inputs?: { [key: string]: string }) {
  const [proofData, setProofData] = useState<ProofData | undefined>();
  const [backend, setBackend] = useState<UltraHonkBackend>();
  const [noir, setNoir] = useState<Noir | undefined>();

  const proofGeneration = async () => {
    if (!inputs) return;
    const circuit = await getCircuit();
    const backend = new UltraHonkBackend(circuit.bytecode, {
      threads: navigator.hardwareConcurrency,
    });
    const noir = new Noir(circuit);

    await toast.promise(noir.init, {
      pending: 'Initializing Noir...',
      success: 'Noir initialized!',
      error: 'Error initializing Noir',
    });

    const { witness } = await noir.execute(inputs);

    const data = await toast.promise(backend.generateProof(witness), {
      pending: 'Generating proof',
      success: 'Proof generated',
      error: 'Error generating proof',
    });

    setProofData(data);
    setNoir(noir);
    setBackend(backend);
  };

  useEffect(() => {
    if (!inputs) return;
    proofGeneration();
  }, [inputs]);

  return { noir, proofData, backend };
}
