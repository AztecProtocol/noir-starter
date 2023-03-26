// @ts-ignore
import { initialiseResolver } from "@noir-lang/noir-source-resolver";
import { acir_read_bytes, compile } from "@noir-lang/noir_wasm";

import fs from "fs";
import { expect } from 'chai';
// @ts-ignore
import { create_proof, verify_proof, setup_generic_prover_and_verifier} from '@noir-lang/barretenberg';
import { ethers } from 'hardhat'; 
import Ethers from '../utils/ethers';
import { Captcha, Puzzle } from "../types/index"
import { Contract } from "ethers";
import generateCaptcha from "../scripts/genCaptchas";
import { opendir, readFile, rm } from "fs/promises";
import { convertSolutionToArrayBytes, getSolutionHash, convertSolutionHashToArrayBytes, toArrayBytes } from "../utils/captcha";
const ipfsClient = require('ipfs-http-client');

const MAIN_NR_PATH = "src/main.nr";


describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
    let compiled : any;
    let acir : any;
    let prover : any;
    let verifier : any;

    let game : Contract;
    let puzzle : Puzzle;

    let ipfsData : {path: string};
    let captcha : Captcha;

    let correctProof : any;


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

        captcha = await generateCaptcha();

        const projectId = process.env.IPFS_PROJECT_ID;
        const projectSecret = process.env.IPFS_PROJECT_SECRET;

        const auth =
            'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

        const client = ipfsClient.create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https',
            headers: {
                authorization: auth
            },
        });


        return opendir("tmp")
        .then(async () => {
            const file = await readFile(`tmp/${captcha.key}.bmp`)
            ipfsData = await client.add(file)
            await game.addPuzzle(ipfsData.path, captcha.solutionHash)
        })
        .then(async () => {
            await rm("tmp", { recursive: true })
            puzzle = await game.getPuzzle();
        })
    })

    it("Should get a puzzle from the contract", async () => {
        expect(puzzle.url).to.equal(ipfsData.path)
    })


    before("Generate proof", async () => {
        const solutionBytes = convertSolutionToArrayBytes(captcha.key)
        const solutionHashBytes = convertSolutionHashToArrayBytes(puzzle.solutionHash)
        const input = {solution: solutionBytes, solutionHash: solutionHashBytes};
        correctProof = await create_proof(prover, acir, input) 
    })

    it("Should generate valid proof for correct input", async () => {
        expect(correctProof instanceof Buffer).to.be.true
        const verification = await verify_proof(verifier, correctProof)
        expect(verification).to.be.true
    })

    it("Should fail with incorrect input", async () => {
        try {
            const wrongSolutionBytes = convertSolutionToArrayBytes("00000")
            const solutionHashBytes = convertSolutionHashToArrayBytes(puzzle.solutionHash)
            const input = {solution: wrongSolutionBytes, solutionHash: solutionHashBytes};
            await create_proof(prover, acir, input)
        } catch(e) {
            expect(e instanceof Error).to.be.true
        }
    })

    it("Should verify the proof on-chain", async () => {
        const ver = await game.submitSolution(correctProof)
        expect(ver).to.be.true
    })

});
