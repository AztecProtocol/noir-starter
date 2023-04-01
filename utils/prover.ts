// @ts-ignore
import { create_proof, setup_generic_prover_and_verifier } from '@noir-lang/barretenberg';
import initializeAztecBackend from '@noir-lang/aztec_backend';

// // Add an event listener for the message event
onmessage = async event => {
  try {
    await initializeAztecBackend();
    const { acir, input } = event.data;

    const hexInputObj = Object.entries(input).reduce((newObj, [key, value]) => {
      newObj[key] = (value as number).toString(16).padStart(2, '0');
      return newObj;
    }, {});

    const [prover, verifier] = await setup_generic_prover_and_verifier(acir);

    const proof = await create_proof(prover, acir, hexInputObj);
    postMessage(proof);
  } catch (er) {
    console.log(er);
    postMessage(er);
  } finally {
    close();
  }
};
