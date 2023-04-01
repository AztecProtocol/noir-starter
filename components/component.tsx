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

  const handleChange = e => {
    e.preventDefault();
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const calculateProof = async () => {
    const acir = await getAcir();
    setAcir(acir);
    setPending(true);

    if (acir) {
      const worker = new Worker(new URL('../utils/prover.ts', import.meta.url));
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

      worker.postMessage({ acir, input });
    }
  };

  const verifyProof = async () => {
    if (acir && proof) {
      const worker = new Worker(new URL('../utils/verifier.ts', import.meta.url));
      console.log('worker launched');
      worker.onmessage = async e => {
        if (e.data instanceof Error) {
          toast.error('Error while verifying proof');
        } else {
          toast.success('Proof verified');

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
      worker.postMessage({ acir, proof });
    }
  };

  useEffect(() => {
    if (proof) {
      verifyProof();
    }
  }, [proof]);

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
