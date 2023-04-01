// @ts-ignore
import { verify_proof, setup_generic_prover_and_verifier } from '@noir-lang/barretenberg';
import initializeAztecBackend from '@noir-lang/aztec_backend';

// // Add an event listener for the message event
onmessage = async event => {
  try {
    await initializeAztecBackend();
    const { acir, proof } = event.data;
    const [prover, verifier] = await setup_generic_prover_and_verifier(acir);
    const verification = await verify_proof(verifier, proof);
    postMessage(verification);
  } catch (er) {
    postMessage(er);
  } finally {
    close();
  }
};
