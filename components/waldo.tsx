import { useState, useEffect } from 'react'
import Image from 'next/image'

import {  toast } from 'react-toastify';
import { getAcir } from '../utils/proofs';
import Ethers from '../utils/ethers';
import React from 'react';

import { ThreeDots } from "react-loader-spinner";
<<<<<<< Updated upstream

export type ClickABI = {
    solutionHash: string,
    coords: number[],
}

export type Puzzle = {
    solution: string,
    id: number,
}

=======
import { Puzzle } from "../types/index"
import { create } from 'ipfs-core';
import axios from "axios"
>>>>>>> Stashed changes

function Waldo() {
  const [input, setInput] = useState(0);
  const [pending, setPending] = useState(false);
  const [acir, setAcir] = useState(null);
  const [proof, setProof] = useState(null);
  const [localVer, setLocalVer] = useState(false);
  const [verification, setVerification] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState({url: "", solutionHash: ""} as Puzzle);

  const handleChange = (e) => {
    e.preventDefault();
    setInput(e.target.value);
  }

  const calculateProof = async () => {
    const acir = await getAcir()
    setAcir(acir);
    setPending(true)

    if (acir) {
      const worker = new Worker(new URL('../utils/prover.ts', import.meta.url));
      worker.onmessage = (e) => {
          if (e.data instanceof Error) {
            toast.error("Error while calculating proof");
            setPending(false)

          } else {
            toast.success("Proof calculated");
            setProof(e.data)
            setPending(false)
          }
      }

<<<<<<< Updated upstream
      const coords = Object.values(localMousePos)
      worker.postMessage({ acir, input: {coords: coords, solutionHash: "0x206c6a688c2560a664cae4d0f8eef08d0c2364b0f3bd041038870c909c3be1c1"} });
=======

      worker.postMessage({ acir, solution: input, solutionHash: currentPuzzle.solutionHash });
>>>>>>> Stashed changes
    }
  }

  const verifyProof = async () => {
    if (acir && proof) {
      const worker = new Worker(new URL('../utils/verifier.ts', import.meta.url));
      console.log("worker launched")
      worker.onmessage = async (e) => {
          console.log(e.data)
          if (e.data instanceof Error) {
            toast.error("Error while verifying proof");
          } else {
            toast.success("Proof verified");
            setLocalVer(true)

            const ethers = new Ethers()
            const ver = await ethers.contract.submitSolution(proof)
            if (ver) {
              toast.success("Proof verified on-chain!");
              setVerification(true)
            } else {
              toast.error("Proof failed on-chain verification");
              setVerification(false);
            }
          }
      }
      worker.postMessage({ acir, proof })
    }
  }

  useEffect(() => { 
    // don't get the proof if mousepos is 0,0
    // if (input !== 0)) {
    //   calculateProof()
    // };
    console.log(input)
  }, [input]);


  const getPuzzle = async () => {
    const ethers = new Ethers()
    const { url, solutionHash } = await ethers.contract.getPuzzle();
    console.log(url)
    setCurrentPuzzle({ url, solutionHash })
  }

  useEffect(() => {
    // getting the next puzzle
    getPuzzle()

    if (proof) {
      verifyProof();
    }
  }, [proof]);

  useEffect(() => {
    if (verification) {
      toast.success("You found Waldo!");
    }
  }, [verification])

  return (
    <div className='gameContainer'>
      {currentPuzzle && currentPuzzle.url && <Image
        alt="Waldo"
        className={pending ? "faded" : ""}
        width={450}
        height={200}
        src={`https://waldo.infura-ipfs.io/ipfs/${currentPuzzle.url}`}/>}
      <input type={"text"} onChange={handleChange} value={input}/>
      <button onClick={calculateProof}>Calculate proof</button>
      {pending && 
        <ThreeDots
          wrapperClass='spinner'
          color="#000000"
          height={100}
          width={100} />}
    </div>      
  )


}

export default Waldo

