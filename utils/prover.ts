// @ts-ignore
import { create_proof, setup_generic_prover_and_verifier} from '@noir-lang/barretenberg';
import initializeAztecBackend from '@noir-lang/aztec_backend';
import { convertSolutionToArrayBytes, getSolutionHash, convertSolutionHashToArrayBytes } from "./captcha"

// // Add an event listener for the message event
onmessage = async (event) => {
    try {
        await initializeAztecBackend();
        const { acir, solution, solutionHash } = event.data;

        console.log(solution)
        console.log(solutionHash)
        const arrBytes = convertSolutionToArrayBytes(solution)
        const [prover, verifier] = await setup_generic_prover_and_verifier(acir);
        const solHash = getSolutionHash(solution)
        console.log(solHash)

        const solutionHashBytes = convertSolutionHashToArrayBytes(solutionHash)
        console.log({solution: arrBytes, solutionHash: solutionHashBytes})
        const proof = await create_proof(prover, acir, {solution: arrBytes, solutionHash: solutionHashBytes})
        postMessage(proof)
    } catch(er) {
        console.log(er)
        postMessage(er)
    } finally {
        close();
    }
};
