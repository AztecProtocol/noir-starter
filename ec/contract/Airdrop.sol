pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './plonk_vk.sol';

contract Airdrop {
    IERC20 public tokenAddress;
    bytes32 public signThis;
    bytes32 public merkleRoot;
    TurboVerifier public verifier;

    mapping(bytes32 => bool) public nullifiers; // Keep track of claimed Merkle roots

    event TokensAirdropped(address indexed recipient, uint256 amount);

    constructor(
        IERC20 _tokenAddress,
        bytes32 _merkleRoot,
        bytes32 _signThis,
        TurboVerifier _verifier
    ) {
        tokenAddress = _tokenAddress;
        merkleRoot = _merkleRoot;
        signThis = _signThis;
        verifier = _verifier;
    }

    function claim(bytes calldata proof) public view {
        verifier.verify(proof);
    }

    function getRoot() public view returns (bytes32) {
        return merkleRoot;
    }

    function getMessage() public view returns (bytes32) {
        return signThis;
    }
}
