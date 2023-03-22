// @ts-ignore
import { initialiseResolver } from "@noir-lang/noir-source-resolver";
import { acir_read_bytes, compile } from "@noir-lang/noir_wasm";

import fs from "fs";
import { expect } from 'chai';
// @ts-ignore
import { create_proof, verify_proof, setup_generic_prover_and_verifier} from '@noir-lang/barretenberg';
import { ethers } from 'hardhat'; 
import Ethers from '../utils/ethers';
import { Puzzle } from "../types/index"
import { Contract } from "ethers";

const MAIN_NR_PATH = "src/main.nr";


describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
    let compiled : any;
    let acir : any;
    let prover : any;
    let verifier : any;

    let game : Contract;
    let puzzle : Puzzle;

    before(async () => {
        initialiseResolver(() => {
            try {
                const string = fs.readFileSync(MAIN_NR_PATH, { encoding: "utf8" });
                return string;
            } catch (err) {
                console.error(err);
                throw err;
            }
        });
        compiled = await compile({});


        expect(compiled).to.have.property("circuit");
        expect(compiled).to.have.property("abi");

        // await initializeAztecBackend();

        let acir_bytes = new Uint8Array(Buffer.from(compiled.circuit, "hex"));
        acir = acir_read_bytes(acir_bytes);

        expect(acir).to.have.property("opcodes");
        expect(acir).to.have.property("current_witness_index");
        expect(acir).to.have.property("public_inputs");

        [prover, verifier] = await setup_generic_prover_and_verifier(acir);
    });

    before("Deploy contract", async () => {
        const Verifier = await ethers.getContractFactory('TurboVerifier');
        const verifier = await Verifier.deploy();

        const verifierAddr = await verifier.deployed();
        console.log(`Verifier deployed to ${verifier.address}`);

        const Game = await ethers.getContractFactory('Waldo');
        game = await Game.deploy(verifierAddr.address);
        console.log(`Game deployed to ${game.address}`);

        await game.addSolution(0, "0x206c6a688c2560a664cae4d0f8eef08d0c2364b0f3bd041038870c909c3be1c1")
        puzzle = await game.getPuzzle();

        // player level should be 0 at first
        expect(puzzle.id).to.eq(0)
    })

    it("Should generate valid proof for correct input", async () => {
        const input = {coords: [400, 500], solutionHash: puzzle.solution};
        const proof = await create_proof(prover, acir, input)

        expect(proof instanceof Buffer).to.be.true

        const verification = await verify_proof(verifier, proof)

        expect(verification).to.be.true
    })

    it("Should fail with incorrect input", async () => {
        try {
            const input = {coords: [0, 0], solutionHash: puzzle.solution};
            await create_proof(prover, acir, input)
        } catch(e) {
            expect(e instanceof Error).to.be.true
        }
    })

    it("Should verify the proof on-chain", async () => {
        const input = [400, 500];
        const proof = await create_proof(prover, acir, input)

        const ver = await game.submitSolution(0, proof)
        await ver.wait()

        // player should have advanced to level 1
        const level = await game.getPuzzle()
        expect(level.id).to.eq(1)
    })

});
