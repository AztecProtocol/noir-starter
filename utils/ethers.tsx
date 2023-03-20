import { ethers } from 'ethers';

const verifierABI = [
  'function verify(bytes calldata) external view returns (bool result)',
];

declare global {
  interface Window {
    ethereum: any;
  }
}

class Ethers {
  provider: ethers.providers.JsonRpcProvider;
  signer: ethers.providers.JsonRpcSigner;
  contract: ethers.Contract;
  utils: typeof ethers.utils;

  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.utils = ethers.utils;
    this.signer = this.provider.getSigner();

    this.contract = new ethers.Contract(
      '0x11550241DbeE0F29a2658CAFAf17d92e2664888a',
      verifierABI,
      this.signer,
    );
    this.connect();
  }

  async connect() {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      this.contract = this.contract.connect(this.signer);
    }
  }
}

export default Ethers;
