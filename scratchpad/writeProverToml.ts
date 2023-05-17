// this file must be run from the project root (same dir as package.json)

import { SigningKey, ethers } from "ethers";
import fs, { readFileSync } from "fs";

const message = "test message";

const hexToUint8Array = (hex: string) =>
  Uint8Array.from(Buffer.from(hex, "hex"));

  const writeToProverToml = (
    pub_key_x: string, // these are all hex strings
    pub_key_y: string,
    signature: string,
    message_hash: string
  ) => {
    const abi = {
      pub_key_x: hexToUint8Array(pub_key_x),
      pub_key_y: hexToUint8Array(pub_key_y),
      signature: Uint8Array.from(
        Buffer.from(signature.slice(2).slice(0, 128), "hex")
      ),
      message_hash: hexToUint8Array(message_hash.slice(2)),
    };
  
    console.log("\x1b[35m%s\x1b[0m", "Writing to Prover/Verifier.toml: ");
    Object.entries(abi).forEach(([key, value]) => {
      console.log("\x1b[33m%s\x1b[0m", key, value.toString());
    });
  
    const proverToml = `pub_key_x = [${abi.pub_key_x}]\npub_key_y = [${abi.pub_key_y}]\nsignature = [${abi.signature}]\nmessage_hash = [${abi.message_hash}]`;
  
    const verifierToml = `hashed_message = [${abi.message_hash}]\nsetpub = []`;
    fs.writeFileSync("circuits/Prover.toml", proverToml);
    // fs.writeFileSync("Verifier.toml", verifierToml);
  };

async function main(){

    // hardhat wallet 0
    const sender = new ethers.Wallet(
      "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    );
    const digest = ethers.hashMessage(message); // this hash digest of the message as defined in EIP -
    console.log('message hash bytes', digest.slice);

    console.log("\x1b[34m%s\x1b[0m", "signing message 🖋: ", message);
    const signature = await sender.signMessage(message); // get the signature of the message, this will be 130 bytes (r, s, and v)
    console.log("\x1b[34m%s\x1b[0m", "signature bytes 📝: ", signature);
    
    // recoverPublicKey returns `0x{hex"4"}{pubKeyXCoord}{pubKeyYCoord}` - so slice 0x04 to expose just the concatenated x and y
    let pubKey = SigningKey.recoverPublicKey(digest, signature).slice(4);
    console.log("\x1b[34m%s\x1b[0m", "uncompressed pubkey: ", pubKey);
    let pub_key_x = pubKey.substring(0, 64);
    let pub_key_y = pubKey.substring(64);
    console.log("\x1b[34m%s\x1b[0m", "public key x coordinate 📊: ", pub_key_x);
    console.log("\x1b[34m%s\x1b[0m", "public key y coordinate 📊: ", pub_key_y);

    writeToProverToml(pub_key_x, pub_key_y, signature, digest);
  }

main()
  .then(() => process.exit(0))
  .catch(console.log);
