import fs from 'fs';
import { ethers } from 'hardhat';
import path from 'path';
import { toUtf8Bytes } from '@ethersproject/strings';
import { Contract } from 'ethers';

const hexToUint8Array = (hex: string) => Uint8Array.from(Buffer.from(hex, 'hex'));

async function submitProof({
  tokenContract,
  hashedMessageBytes,
}: {
  tokenContract: Contract;
  hashedMessageBytes: Uint8Array;
}) {
  const proof = '0x' + fs.readFileSync(path.join(__dirname, '../proofs/p.proof'));
  console.log('proof: ', proof);

  console.log('CONTRACT LOGS:');
  console.log('--------------');
  await tokenContract.entryPoint(proof, hashedMessageBytes, { gasLimit: 100000000 });
}

async function genSigAndProof() {
  const functionSignature = ethers.utils.id('mint(address,uint256)');
  const funcSig = functionSignature.substr(0, 10);
  const to = ethers.utils.getAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  const amount = ethers.utils.hexlify(42);
  const nonce = ethers.utils.hexlify(1);

  const functionCall = ethers.utils.defaultAbiCoder.encode(
    ['uint256', 'uint256', 'address', 'bytes4'],
    [amount, nonce, to, funcSig],
  );
  const sender = new ethers.Wallet(process.env.SIGNATURE_PRIVATE_KEY as unknown as string);
  const hashedMessage = ethers.utils.hashMessage(functionCall);
  const hashedMessageBytes = toUtf8Bytes(hashedMessage);
  console.log('hashedMessage: ', hashedMessageBytes);
  const signature = await sender.signMessage(functionCall);

  let pubKey = ethers.utils.recoverPublicKey(hashedMessage, signature).slice(4);
  console.log('uncompressed pubkey: ', pubKey);
  let pub_key_x = pubKey.substring(0, 64);
  let pub_key_y = pubKey.substring(64);

  const abi = {
    pub_key_x: hexToUint8Array(pub_key_x),
    pub_key_y: hexToUint8Array(pub_key_y),
    signature: Uint8Array.from(Buffer.from(signature.slice(2).slice(0, 128), 'hex')),
    hashed_message: hexToUint8Array(hashedMessage.slice(2)),
  };

  console.log('Writing to Prover/Verifier.toml: ');
  Object.entries(abi).forEach(([key, value]) => {
    console.log(key, value.toString());
  });

  const proverToml = `pub_key_x = [${abi.pub_key_x}]\npub_key_y = [${abi.pub_key_y}]\nsignature = [${abi.signature}]\nhashed_message = [${abi.hashed_message}]`;

  const verifierToml = `hashed_message = [${abi.hashed_message}]\nsetpub = []`;
  fs.writeFileSync('Prover.toml', proverToml);
  fs.writeFileSync('Verifier.toml', verifierToml);

  return hashedMessageBytes;
}

async function main() {
  // Deploy the verifier contract
  const Verifier = await ethers.getContractFactory('UltraVerifier');
  const verifier = await Verifier.deploy();

  // Get the address of the deployed verifier contract
  const verifierAddr = await verifier.deployed();
  console.log(`Verifier deployed to ${verifierAddr.address}`);

  const Token = await ethers.getContractFactory('MyToken');
  const tokenContract = await Token.deploy(verifierAddr.address);
  const tokenAddr = await tokenContract.deployed();
  console.log(`Token deployed to ${tokenAddr.address}`);

  const hashedMessageBytes = await genSigAndProof();
  submitProof({ tokenContract, hashedMessageBytes });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
