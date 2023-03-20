import { useState, useEffect } from 'react'
import Image from 'next/image'

import {  toast } from 'react-toastify';
import { getAcir } from '../utils/proofs';
import Ethers from '../utils/ethers';
import React from 'react';

const waldo = require("./assets/waldo.jpeg")

interface RustComponentProps {
  number: Number
}

export type ClickABI = {
    solutionHash: string,
    coords: number[],
}


function Waldo() {
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0});
  const [acir, setAcir] = useState(null);
  const [proof, setProof] = useState(null);
  const [localVer, setLocalVer] = useState(false);
  const [verification, setVerification] = useState(false);

  const handleClick = async (event : any) => {
    const bounds = event.target.getBoundingClientRect()

    const localX = Math.round((event.clientX - bounds.left) / 100) * 100;
    const localY = Math.round((event.clientY - bounds.top) / 100) * 100;

    setLocalMousePos({ x: localX, y: localY });
  };

  const calculateProof = async () => {
    const acir = await getAcir()
    setAcir(acir);

    if (acir) {
      const worker = new Worker(new URL('../utils/prover.ts', import.meta.url));
      worker.onmessage = (e) => {
          if (e.data instanceof Error) {
            toast.error("Error while calculating proof");
          } else {
            toast.success("Proof calculated");
            setProof(e.data)
          }
      }

      const coords = Object.values(localMousePos)
      worker.postMessage({ acir, input: {coords: coords, solutionHash: "0x206c6a688c2560a664cae4d0f8eef08d0c2364b0f3bd041038870c909c3be1c1"} });
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
            const ver = await ethers.contract.verify(proof)
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
      console.log("valid click")
      calculateProof()
    };


  }, [localMousePos]);

  useEffect(() => { 
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
      <Image
        alt="Waldo"
        src={waldo}
        onClick={handleClick}/>
  )
}

export default Waldo

