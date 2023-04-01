import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import { getAcir } from '../utils/proofs';
import Ethers from '../utils/ethers';
import React from 'react';

import { ThreeDots } from 'react-loader-spinner';

function Component() {
  const [input, setInput] = useState({ x: '', y: '' });
  const [pending, setPending] = useState(false);
  const [acir, setAcir] = useState(null);
  const [proof, setProof] = useState(null);
  const [verification, setVerification] = useState(false);

  // Handles input state
  const handleChange = e => {
    e.preventDefault();
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  // Calculates proof
  const calculateProof = async () => {
    // only launch if we do have an acir to calculate the proof from
    const acir = await getAcir();
    setAcir(acir);

    // set a pending state to show a spinner
    setPending(true);

    if (acir) {
      // launching a new worker for the proof calculation
      const worker = new Worker(new URL('../utils/prover.ts', import.meta.url));

      // handling the response from the worker
      worker.onmessage = e => {
        if (e.data instanceof Error) {
          toast.error('Error while calculating proof');
          setPending(false);
        } else {
          toast.success('Proof calculated');
          setProof(e.data);
          setPending(false);
        }
      };

      // sending the acir and input to the worker
      worker.postMessage({ acir, input });
    }
  };

  const verifyProof = async () => {
    // only launch if we do have an acir and a proof to verify
    if (acir && proof) {
      // launching a new worker for the verification
      const worker = new Worker(new URL('../utils/verifier.ts', import.meta.url));
      console.log('worker launched');

      // handling the response from the worker
      worker.onmessage = async e => {
        if (e.data instanceof Error) {
          toast.error('Error while verifying proof');
        } else {
          toast.success('Proof verified');

          // Verifies proof on-chain
          const ethers = new Ethers();
          const ver = await ethers.contract.verify(proof);
          if (ver) {
            toast.success('Proof verified on-chain!');
            setVerification(true);
          } else {
            toast.error('Proof failed on-chain verification');
            setVerification(false);
          }
        }
      };

      // sending the acir and proof to the worker
      worker.postMessage({ acir, proof });
    }
  };

  // Verifier the proof if there's one in state
  useEffect(() => {
    if (proof) {
      verifyProof();
    }
  }, [proof]);

  useEffect(() => {
    new Ethers();
  }, []);

  // Shows verification result
  useEffect(() => {
    if (verification) {
      toast.success('Proof verified!');
    }
  }, [verification]);

  return (
    <div className="gameContainer">
      <h1>Example starter</h1>
      <h2>This circuit checks that x and y are the same</h2>
      <p>Try it!</p>
      <input name="x" type={'text'} onChange={handleChange} value={input.x} />
      <input name="y" type={'text'} onChange={handleChange} value={input.y} />
      <button onClick={calculateProof}>Calculate proof</button>
      {pending && <ThreeDots wrapperClass="spinner" color="#000000" height={100} width={100} />}
    </div>
  );
}

export default Component;
