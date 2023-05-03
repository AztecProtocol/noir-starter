import { ethers } from 'ethers';
import addresses from './addresses.json';
import artifacts from '../artifacts/contract/plonk_vk.sol/TurboVerifier.json';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    ethereum: any;
  }
}

// Ethers class to handle the connection to the blockchain
class Ethers {
  provider: ethers.providers.JsonRpcProvider;
  signer: ethers.providers.JsonRpcSigner;
  contract: ethers.Contract;
  utils: typeof ethers.utils;

  // constructor instantiantes the underlying ethers provider and signer
  // and connects to the contract
  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.utils = ethers.utils;
    this.signer = this.provider.getSigner();

    this.contract = new ethers.Contract(addresses.verifier, artifacts.abi, this.signer);
    this.connect();
  }

  async connect() {
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const currentNetworkId = parseInt(await window.ethereum.request({ method: 'net_version' }));
      if (currentNetworkId !== addresses.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${addresses.chainId.toString(16)}` }],
          });
        } catch (error) {
          console.error('Error switching network:', error);
          if (error.code === 4902) {
            toast('Please add the network to your MetaMask wallet', { type: 'error' });
          } else {
            console.error('User rejected the request.');
          }
        }
      }
      this.contract = this.contract.connect(this.signer);
    }
  }
}

export default Ethers;
