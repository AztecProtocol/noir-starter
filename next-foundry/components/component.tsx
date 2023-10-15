import { useState, useEffect, SetStateAction } from 'react';

import { toast } from 'react-toastify';
import { ethers } from "ethers";
import React from 'react';

import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import circuit from '../circuits/target/next_foundry.json';
import circuitContract from "../out/Starter.sol/Starter.json"

function Component() {
  const [input, setInput] = useState({ x: 0, y: 0 });
  const [proof, setProof] = useState(Uint8Array.from([]));
  const [noir, setNoir] = useState<Noir | null>(null);
  const [backend, setBackend] = useState<BarretenbergBackend | null>(null);
  const contractAddress = ""; // Edit this to the deployed contract address

  // Handles input state
  const handleChange = e => {
    e.preventDefault();
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  // Calculates proof
  const calculateProof = async () => {
    const calc = new Promise(async (resolve, reject) => {
      const proof = await noir!.generateFinalProof(input);
      console.log('Proof created: ', proof);
      setProof(proof);
      resolve(proof);
    });
    toast.promise(calc, {
      pending: 'Calculating proof...',
      success: 'Proof calculated!',
      error: 'Error calculating proof',
    });
  };

  const verifyProof = async () => {
    const verifyOffChain = new Promise(async (resolve, reject) => {
      if (proof) {
        const verification = await noir!.verifyFinalProof(proof);
        console.log('Proof verified: ', verification);
        resolve(verification);
      }
    });

    const verifyOnChain = new Promise(async (resolve, reject) => {
      if (!proof) return reject(new Error('No proof'));
      if (!window.ethereum) return reject(new Error('No ethereum provider'));
      try {
        // const ethers = new ethers();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const publicInputs = proof.slice(0, 32);
        const slicedProof = proof.slice(32);
        const contract =new ethers.Contract(contractAddress, circuitContract.abi, signer);
        const verification = await contract.verifyEqual(slicedProof, [publicInputs]);
        resolve(verification);
      } catch (err) {
        console.log(err);
        reject(new Error("Couldn't verify proof on-chain"));
      }
    });

    toast.promise(verifyOffChain, {
      pending: 'Verifying proof off-chain...',
      success: 'Proof verified off-chain!',
      error: 'Error verifying proof',
    });

    toast.promise(verifyOnChain, {
      pending: 'Verifying proof on-chain...',
      success: 'Proof verified on-chain!',
      error: {
        render({ data }: any) {
          return `Error: ${data.message}`;
        },
      },
    });
  };

  // Verifier the proof if there's one in state
  useEffect(() => {
    if (proof.length > 0) {
      verifyProof();

      return () => {
        // TODO: Backend should be destroyed by Noir JS so we don't have to
        // store backend in state
        backend!.destroy();
      };
    }
  }, [proof]);

  const initNoir = async () => {
    const backend = new BarretenbergBackend(circuit);
    setBackend(backend);
    const noir = new Noir(circuit, backend);
    await toast.promise(noir.init(), {
      pending: 'Initializing Noir...',
      success: 'Noir initialized!',
      error: 'Error initializing Noir',
    });
    setNoir(noir);
  };

  useEffect(() => {
    initNoir();
  }, []);

  return (
    <div className="container">
      <h1>Example starter</h1>
      <h2>This circuit checks that x and y are different</h2>
      <p>Try it!</p>
      <input name="x" type={'number'} onChange={handleChange} value={input.x} />
      <input name="y" type={'number'} onChange={handleChange} value={input.y} />
      <button onClick={calculateProof}>Calculate proof</button>
    </div>
  );
}

export default Component;
