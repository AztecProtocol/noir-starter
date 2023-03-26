import { ethers } from 'ethers';
import addresses from "./addresses.json"
import artifacts from "../artifacts/contract/game.sol/Waldo.json"

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
      addresses.game,
      artifacts.abi,
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
