pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './plonk_vk.sol';
import 'hardhat/console.sol';

import './lib/uint2str.sol';

contract Airdrop {
    IERC20 public tokenAddress;
    bytes32 public signThis;
    bytes32 public merkleRoot;
    UltraVerifier public verifier;

    mapping(bytes32 => bool) public nullifiers; // Keep track of claimed Merkle roots

    event TokensAirdropped(address indexed recipient, uint256 amount);

    constructor(
        IERC20 _tokenAddress,
        bytes32 _merkleRoot,
        bytes32 _signThis, // TODO put this off-chain like the merkle tree
        UltraVerifier _verifier
    ) {
        tokenAddress = _tokenAddress;
        merkleRoot = _merkleRoot;
        signThis = _signThis;
        verifier = _verifier;
    }

    function preparePublicInputs(
        bytes32[] memory _publicInputs,
        bytes32 publicInput,
        uint256 offset
    ) private pure returns (bytes32[] memory) {
        for (uint256 i = 0; i < 32; i++) {
            _publicInputs[i + offset] = (publicInput >> ((31 - i) * 8)) & bytes32(uint256(0xFF));
        } // TODO not cool, padding 31 bytes with 0s
        return _publicInputs;
    }

    function claim(
        bytes calldata proof,
        bytes32[2] memory publicKey,
        bytes32 nullifier
    ) public view {
        bytes32[] memory _publicInputs = new bytes32[](129);
        _publicInputs = preparePublicInputs(_publicInputs, publicKey[0], 0);
        _publicInputs = preparePublicInputs(_publicInputs, publicKey[1], 32);
        _publicInputs = preparePublicInputs(_publicInputs, signThis, 64);
        _publicInputs = preparePublicInputs(_publicInputs, nullifier, 96);
        _publicInputs[128] = merkleRoot;

        verifier.verify(proof, _publicInputs);

        // calculate address
        // mint tokens
    }

    function getRoot() public view returns (bytes32) {
        return merkleRoot;
    }

    function getMessage() public view returns (bytes32) {
        return signThis;
    }
}
