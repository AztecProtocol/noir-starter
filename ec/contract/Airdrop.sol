pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Airdrop {
    address public tokenAddress;
    bytes32 public signThis;
    bytes32 public merkleRoot;

    mapping(bytes32 => bool) public nullifiers; // Keep track of claimed Merkle roots

    event TokensAirdropped(address indexed recipient, uint256 amount);

    constructor(address _tokenAddress, bytes32 _merkleRoot, bytes32 _signThis) {
        tokenAddress = _tokenAddress;
        merkleRoot = _merkleRoot;
        signThis = _signThis;
    }

    function getRoot() public view returns (bytes32) {
        return merkleRoot;
    }

    function getMessage() public view returns (bytes32) {
        return signThis;
    }
}
