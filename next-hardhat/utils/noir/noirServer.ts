import initNoirWasm, { acir_read_bytes, compile } from '@noir-lang/noir_wasm';
// @ts-ignore
import { initialiseResolver } from '@noir-lang/noir-source-resolver';
import initialiseAztecBackend from '@noir-lang/aztec_backend';
// @ts-ignore
import { setup_generic_prover_and_verifier } from '@noir-lang/barretenberg';
import path from 'path';
import fs from "fs"
import { Noir } from './noir';


export class NoirServer extends Noir {
    async compile() {
        // I'm running on the server so I can use the file system
        initialiseResolver((id: any) => {
            try {
                const code = fs.readFileSync(`circuits/src/${id}`, { encoding: 'utf8' }) as string;
                return code
            } catch (err) {
                console.error(err);
                throw err;
            }
        });

        const compiled_noir = compile({
            entry_point: 'file1.nr',
        });
        this.compiled = compiled_noir;

        this.acir = acir_read_bytes(this.compiled.circuit);

        [this.prover, this.verifier] = await setup_generic_prover_and_verifier(this.acir);

    };

    getSmartContract() {
        const sc = this.verifier.SmartContract();

        // The user must have a folder called 'contract' in the root directory. If not, we create it.
        if (!fs.existsSync(path.join(__dirname, '../../contract'))) {
            console.log('Contract folder does not exist. Creating...');
            fs.mkdirSync(path.join(__dirname, '../../contract'));
        }

        // If the user already has a file called 'plonk_vk.sol' in the 'contract' folder, we delete it.
        if (fs.existsSync(path.join(__dirname, '../../contract/plonk_vk.sol'))) {
            fs.unlinkSync(path.join(__dirname, '../../contract/plonk_vk.sol'));
        }

        // We write the contract to a file called 'plonk_vk.sol' in the 'contract' folder.
        fs.writeFileSync(path.join(__dirname, '../../contract/plonk_vk.sol'), sc, {
            flag: 'w',
        });

        return sc;
    }

}
