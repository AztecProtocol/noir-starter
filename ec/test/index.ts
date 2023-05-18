// @ts-ignore
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Ethers } from '../utils/ethers';
import { Contract } from 'ethers';
import { Noir } from '../utils/noir';
import path from 'path';
import { execSync } from 'child_process';
import { TypedDataUtils, signTypedData_v4, MsgParams } from 'eth-sig-util';
import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { Bytes, concat } from '@ethersproject/bytes';
import fs from 'fs';

const noir = new Noir();

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let tokenContract: Contract;
  let verifierContract: Contract;
  let correctProof: any;

  // before(async () => {
  //   await noir.compile();

  //   expect(noir.compiled).to.have.property('circuit');
  //   expect(noir.compiled).to.have.property('abi');
  //   expect(noir.acir).to.have.property('opcodes');
  //   expect(noir.acir).to.have.property('current_witness_index');
  //   expect(noir.acir).to.have.property('public_inputs');
  // });

  before('Deploy contract', async () => {
    // await noir.getSmartContract();
    // console.log('Deploying verifier contract...');

    // // workaround for race condition
    // execSync('npx hardhat compile', { cwd: path.join(__dirname, '../contract') });
    const Verifier = await ethers.getContractFactory('UltraVerifier');
    verifierContract = await Verifier.deploy();
    const verifierAddr = await verifierContract.deployed();
    console.log(`Verifier deployed to ${verifierAddr.address}`);

    const Token = await ethers.getContractFactory('MyToken');
    tokenContract = await Token.deploy(verifierAddr.address);
    const tokenAddr = await tokenContract.deployed();
    console.log(`Token deployed to ${tokenAddr.address}`);
  });

  it('Generate signature', async () => {
    const functionSignature = ethers.utils.id('mint(address,uint256)');
    const funcSig = functionSignature.substr(0, 10);
    const to = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const amount = ethers.utils.hexlify(42);
    const nonce = ethers.utils.hexlify(1);

    let functionCall: string | Uint8Array = ethers.utils.defaultAbiCoder.encode(
      ['bytes4', 'address', 'uint256', 'uint256'],
      [funcSig, to, amount, nonce],
    );
    // console.log('hashMessage: ', ethers.utils.hashMessage(functionCall));

    const sender = new ethers.Wallet(process.env.SIGNATURE_PRIVATE_KEY as unknown as string);
    const hashedMessage = ethers.utils.arrayify(ethers.utils.hashMessage(functionCall));
    const signature = await sender.signMessage(functionCall);
    const signatureBytes = ethers.utils.arrayify(signature).slice(0, 64);
    console.log('Signature: ', signatureBytes);
    console.log('HashedMessage', hashedMessage);
    console.log('hexlified', ethers.utils.hexlify(hashedMessage));

    const proof = '0x' + fs.readFileSync(path.join(__dirname, '../proofs/p.proof'));

    console.log('--------------');
    await tokenContract.entryPoint(proof, functionCall);
  });
});
