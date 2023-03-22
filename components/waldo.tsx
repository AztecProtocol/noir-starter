import { useState, useEffect } from 'react'
import Image from 'next/image'

import {  toast } from 'react-toastify';
import { getAcir } from '../utils/proofs';
import Ethers from '../utils/ethers';
import React from 'react';

import { ThreeDots } from "react-loader-spinner";
import { Puzzle } from "../types/index"


function Waldo() {
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0});
  const [pending, setPending] = useState(false);
  const [acir, setAcir] = useState(null);
  const [proof, setProof] = useState(null);
  const [localVer, setLocalVer] = useState(false);
  const [verification, setVerification] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState({id: 0, solution: ""} as Puzzle);

  const handleClick = async (event : any) => {
    if (!pending) {

      const bounds = event.target.getBoundingClientRect()

      const localX = Math.round((event.clientX - bounds.left) / 100) * 100;
      const localY = Math.round((event.clientY - bounds.top) / 100) * 100;
      console.log("valid click")

      setLocalMousePos({ x: localX, y: localY });
    } else {
      console.log("invalid click")
    }
  };

  const calculateProof = async () => {
    const acir = await getAcir()
    setAcir(acir);

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

      const coords = Object.values(localMousePos)
      worker.postMessage({ acir, input: {coords: coords, solutionHash: currentPuzzle.solution} });
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
            const ver = await ethers.contract.submitSolution(currentPuzzle.id, proof)
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
    if (Object.values(localMousePos).every((p : number) => p !== 0)) {
      setPending(true)
      calculateProof()
    };
  }, [localMousePos]);


  const getPuzzle = async () => {
    const ethers = new Ethers()
    const { id, solution } : Puzzle = await ethers.contract.getPuzzle();
    setCurrentPuzzle({ id, solution })
    console.log({ id, solution })
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

  if (currentPuzzle.id >= (process.env.NEXT_PUBLIC_PUZZLE_COUNT as unknown as number)) {
    return (<div>
      You won!
    </div>)
  } else {
    return (
      <div className='gameContainer'>
        <Image
          alt="Waldo"
          className={pending ? "faded" : ""}
          src={require(`../puzzles/${currentPuzzle.id}.jpeg`)}
          onClick={handleClick}/>
        {pending && 
          <ThreeDots
            wrapperClass='spinner'
            color="#000000"
            height={100}
            width={100} />}
      </div>
        
        
    )
}

}

export default Waldo

