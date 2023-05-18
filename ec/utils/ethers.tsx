import { ethers } from 'ethers';

// Ethers class to handle the connection to the blockchain
export class Ethers {
  utils: typeof ethers.utils;

  // constructor instantiantes the underlying ethers provider and signer
  // and connects to the contract
  constructor() {
    this.utils = ethers.utils;
  }

  async signMessage(message: string) {
    const sender = new ethers.Wallet(process.env.SIGNATURE_PRIVATE_KEY as unknown as string);
    const signature = await sender.signMessage(message);
    return { signature };
  }

  async recoverPublicKey(hash: string, signature: string) {
    let pubKey = ethers.utils.recoverPublicKey(hash, signature).slice(4);
    const publicKey = [];
    publicKey.push(pubKey.substring(0, 64));
    publicKey.push(pubKey.substring(64));
    return publicKey;
  }
}
