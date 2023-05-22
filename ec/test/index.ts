// @ts-ignore
import { Contract } from 'ethers';
import fs from 'fs';
import { ethers } from 'hardhat';
import path from 'path';
import { execSync } from 'child_process';
import { expect } from 'chai';

const hexToUint8Array = (hex: string) => Uint8Array.from(Buffer.from(hex, 'hex'));

async function prove(
  hashedMessage: string,
  signature: string,
  proofName: string,
  useExistentProof = true,
) {
  let pubKey = ethers.utils.recoverPublicKey(hashedMessage, signature).slice(4);
  let pub_key_x = pubKey.substring(0, 64);
  let pub_key_y = pubKey.substring(64);

  const abi = {
    pub_key_x: hexToUint8Array(pub_key_x),
    pub_key_y: hexToUint8Array(pub_key_y),
    signature: Uint8Array.from(Buffer.from(signature.slice(2).slice(0, 128), 'hex')),
    hashed_message: hexToUint8Array(hashedMessage.slice(2)),
  };

  console.log('Writing to Prover/Verifier.toml...');
  const proverToml = `pub_key_x = [${abi.pub_key_x}]\npub_key_y = [${abi.pub_key_y}]\nsignature = [${abi.signature}]\nhashed_message = [${abi.hashed_message}]`;

  fs.writeFileSync('Prover.toml', proverToml);

  console.log('Proving...');
  if (!useExistentProof) execSync(`nargo prove ${proofName}`);

  console.log('Generating smart contract...');
  // execSync('nargo codegen-verifier');

  const proof = '0x' + fs.readFileSync(path.join(__dirname, `../proofs/${proofName}.proof`));
  return proof;
}

async function getFuncSig(functionCall: string) {
  const functionSignature = ethers.utils.id(functionCall);
  return functionSignature.substr(0, 10);
}

async function getHashedMessage(functionSignature: string, functionCall: string) {
  const functionCallBytes = ethers.utils.arrayify(functionCall);

  return ethers.utils.hashMessage([
    ...ethers.utils.arrayify(functionSignature),
    ...functionCallBytes,
  ]);
}

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let tokenContract: Contract;
  let verifierContract: Contract;
  let correctProof: any;
  let hashedMessageBytes: any;

  let functionCall: string;
  const user1 = new ethers.Wallet(
    process.env.USER1_PRIVATE_KEY as unknown as string,
    ethers.provider,
  );
  const user2 = new ethers.Wallet(
    process.env.USER2_PRIVATE_KEY as unknown as string,
    ethers.provider,
  );
  const runner = new ethers.Wallet(
    process.env.TOKEN_CONTRACT_OWNER as unknown as string,
    ethers.provider,
  );
  const thirdParty = new ethers.Wallet(
    process.env.THIRD_PARTY_PRIVATE_KEY as unknown as string,
    ethers.provider,
  );

  before('Deploy contract', async () => {
    const Verifier = await ethers.getContractFactory('UltraVerifier');
    verifierContract = await Verifier.deploy();
    const verifierAddr = await verifierContract.deployed();
    console.log(`Verifier deployed to ${verifierAddr.address}`);

    const Token = await ethers.getContractFactory('MyToken');
    tokenContract = await Token.deploy(verifierAddr.address);
    const tokenAddr = await tokenContract.deployed();
    console.log(`Token deployed to ${tokenAddr.address}`);
  });

  it('Mints tokens to user1', async () => {
    await tokenContract.mint(user1.address, 1000000000);
  });

  it("Approves the contract to transfer user1's tokens", async () => {
    const funcSig = await getFuncSig('approve(address,uint256)');

    functionCall = ethers.utils.defaultAbiCoder.encode(
      ['address', 'uint256'],
      [runner.address, ethers.utils.hexlify(1000000000)],
    );

    const hashedMessage = await getHashedMessage(funcSig, functionCall);
    const signature = await user1.signMessage(functionCall);
    const proof = prove(hashedMessage, signature, 'approve', true);

    await tokenContract
      .connect(user1)
      .entryPoint(proof, funcSig, functionCall, { gasLimit: 100000000 });

    expect(await tokenContract.allowance(user1.address, runner.address)).to.equal(1000000000);
  });

  it('Transfers user1 funds to user2', async () => {
    const funcSig = await getFuncSig('transferFrom(address,address,uint256)');

    functionCall = ethers.utils.defaultAbiCoder.encode(
      ['address', 'address', 'uint256'],
      [user1.address, user2.address, ethers.utils.hexlify(42)],
    );

    const hashedMessage = await getHashedMessage(funcSig, functionCall);
    const signature = await runner.signMessage(functionCall);
    const proof = prove(hashedMessage, signature, 'transfer1to2', true);

    await tokenContract
      .connect(runner)
      .entryPoint(proof, funcSig, functionCall, { gasLimit: 100000000 });

    expect(await tokenContract.balanceOf(user1.address)).to.equal(999999958);
    expect(await tokenContract.balanceOf(user2.address)).to.equal(42);
  });

  it('Transfers directly from user2 to user1', async () => {
    const funcSig = await getFuncSig('transfer(address,uint256)');

    functionCall = ethers.utils.defaultAbiCoder.encode(
      ['address', 'uint256'],
      [user1.address, ethers.utils.hexlify(42)],
    );

    const hashedMessage = await getHashedMessage(funcSig, functionCall);
    const signature = await user2.signMessage(functionCall);
    const proof = prove(hashedMessage, signature, 'transfer2to1', true);

    await tokenContract
      .connect(thirdParty)
      .entryPoint(proof, funcSig, functionCall, { gasLimit: 100000000 });

    expect(await tokenContract.balanceOf(user1.address)).to.equal(1000000000);
    expect(await tokenContract.balanceOf(user2.address)).to.equal(0);
  });
});
