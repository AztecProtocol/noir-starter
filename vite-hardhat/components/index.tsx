import {
  useState,
  useEffect,
  SetStateAction,
  ReactEventHandler,
  FormEvent,
  ChangeEvent,
} from 'react';

import { toast } from 'react-toastify';
import Ethers from '../utils/ethers.jsx';
import React from 'react';

import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend, flattenPublicInputs } from '@noir-lang/backend_barretenberg';
import { CompiledCircuit, ProofData } from '@noir-lang/types';
import { compile } from '@noir-lang/noir_wasm';

// @ts-ignore
import { initializeResolver } from '@noir-lang/source-resolver';
import axios from 'axios';

async function getCircuit(name: string) {
  const res = await fetch(new URL('../circuits/src/main.nr', import.meta.url));
  const noirSource = await res.text();

  initializeResolver((id: string) => {
    const source = noirSource;
    return source;
  });

  const compiled = compile('main');
  return compiled;
}

function Component() {
  const [input, setInput] = useState({ x: 0, y: 0 });
  const [proof, setProof] = useState<ProofData>();
  const [noir, setNoir] = useState<Noir | null>(null);
  const [backend, setBackend] = useState<BarretenbergBackend | null>(null);

  // Handles input state
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target) setInput({ ...input, [e.target.name]: e.target.value });
  };

  // Calculates proof
  const calculateProof = async () => {
    const calc = new Promise(async (resolve, reject) => {
      const { proof, publicInputs } = await noir!.generateFinalProof(input);
      console.log('Proof created: ', proof);
      setProof({ proof, publicInputs });
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
        const verification = await noir!.verifyFinalProof({
          proof: proof.proof,
          publicInputs: proof.publicInputs,
        });
        console.log('Proof verified: ', verification);
        resolve(verification);
      }
    });

    const verifyOnChain = new Promise(async (resolve, reject) => {
      if (!proof) return reject(new Error('No proof'));
      if (!window.ethereum) return reject(new Error('No ethereum provider'));
      try {
        const ethers = new Ethers();

        const verification = await ethers.contract.verify(
          proof.proof,
          flattenPublicInputs(proof.publicInputs),
        );
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
    if (proof) {
      verifyProof();

      return () => {
        // TODO: Backend should be destroyed by Noir JS so we don't have to
        // store backend in state
        backend!.destroy();
      };
    }
  }, [proof]);

  const initNoir = async () => {
    const circuit = await getCircuit('main');

    // @ts-ignore
    const backend = new BarretenbergBackend(circuit.program, { threads: 8 });
    setBackend(backend);

    // @ts-ignore
    const noir = new Noir(circuit.program, backend);
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
