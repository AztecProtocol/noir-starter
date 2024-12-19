'use client';

import { ProofData } from '@noir-lang/types';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { UltraPlonkBackend } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';

export function useOffChainVerification(
  backend: UltraPlonkBackend,
  noir?: Noir,
  proofData?: ProofData,
) {
  useEffect(() => {
    if (!proofData || !noir) return;

    toast.promise(backend.verifyProof(proofData), {
      pending: 'Verifying proof off-chain',
      success: 'Proof verified off-chain',
      error: 'Error verifying proof off-chain',
    });
  }, [proofData]);
}
