import { ethers } from 'ethers';

const verifierABI = [
    // "struct Puzzle {  uint id; bytes32 solution; }",
    
    "function addSolution(uint id, bytes32 solution) public",

    "function getPuzzle() public view returns (uint id, bytes32 solution)",
    "function submitSolution(uint level, bytes calldata solution) public returns (bool)"
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
      '0x53973982F8099F0Ed3b96BE12fA66FE08d9Dbb3F',
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
