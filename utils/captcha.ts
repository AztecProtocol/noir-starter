
const { createHash } = require('crypto');
// @ts-ignore
import { buildMimc7 } from 'circomlibjs';



export function toArrayBytes(bytes : any, range : any) {
    const arrayBytes = [];
    for (let i = 0; i < range; i++) {
        arrayBytes.push(bytes.readUInt8(i))
    }
    return arrayBytes;
}

function hex_decode(string : string) {
    const bytes : Array<number> = [];
    // @ts-ignore
    string.replace(/../g, (pair : any) => {
        bytes.push(parseInt(pair, 16));
    });
    return new Uint8Array(bytes);
}

function getUInt32Bytes(x : any) {
    const bytes = Buffer.alloc(32);
    bytes.writeUInt32LE(x);
    return bytes;
}

export function convertSolutionToArrayBytes(value : any) {
    const bytes = getUInt32Bytes(value)
    const solution = toArrayBytes(bytes, 32)
    return solution;
}

export function convertSolutionHashToArrayBytes(value : any) {
    const hex = hex_decode(value).slice(1, 33)
    return Array.from(hex)
}

export function getSolutionHash(value : any) {
    const bytes = getUInt32Bytes(value)
    const h = createHash('sha256').update(bytes).digest()
    const solutionHash = toArrayBytes(h, 32)
    return solutionHash
}


