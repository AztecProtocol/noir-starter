import { useState } from 'react';
import React from 'react';

import { useOnChainVerification } from '../hooks/useOnChainVerification.js';
import { useProofGeneration } from '../hooks/useProofGeneration.js';
import { useOffChainVerification } from '../hooks/useOffChainVerification.js';

function Component() {
  const [input, setInput] = useState<{ x: string; y: string } | undefined>();
  const { noir, proofData, backend } = useProofGeneration(input);
  useOffChainVerification(backend!, noir, proofData);
  const verifyButton = useOnChainVerification(proofData);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const elements = e.currentTarget.elements;
    if (!elements) return;

    const x = elements.namedItem('x') as HTMLInputElement;
    const y = elements.namedItem('y') as HTMLInputElement;

    setInput({ x: x.value, y: y.value });
  };

  return (
    <>
      <form className="container" onSubmit={submit}>
        <h1>Example starter</h1>
        <h2>This circuit checks that x and y are different (yey!)</h2>
        <p>Try it!</p>
        <input name="x" type="text" />
        <input name="y" type="text" />
        <button type="submit">Calculate proof</button>
      </form>
      {verifyButton}
    </>
  );
}

export default Component;
