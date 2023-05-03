// @ts-ignore
import { create_proof, verify_proof } from '@noir-lang/barretenberg';

export class Noir {
    prover: any;
    verifier: any;
    acir: any;
    compiled: any;

    async createProof({input} : {input: any}) {
        const proof = await create_proof(this.prover, this.acir, input);
        return proof;
    }

    async verifyProof({proof} : {proof: any}) {
        const verification = await verify_proof(this.verifier, proof);
        return verification;
    }
}
