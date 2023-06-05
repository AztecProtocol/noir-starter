pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './plonk_vk.sol';
import 'hardhat/console.sol';

contract Airdrop is ERC20 {
    bytes32 public signThis;
    bytes32 public merkleRoot;
    UltraVerifier public verifier;

    uint256 public airdropAmount;

    mapping(bytes32 => bool) public nullifiers; // Keep track of claimed Merkle roots

    event TokensAirdropped(address indexed recipient, uint256 amount);

    constructor(
        bytes32 _merkleRoot,
        bytes32 _signThis,
        UltraVerifier _verifier,
        uint256 _airdropAmount
    ) ERC20('Airdrop', 'ADRP') {
        merkleRoot = _merkleRoot;
        signThis = _signThis;
        verifier = _verifier;

        airdropAmount = _airdropAmount;
        _mint(address(this), airdropAmount);
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

    function claim(bytes calldata proof, bytes32 nullifier) external {
        bytes32[] memory _publicInputs = new bytes32[](66);
        _publicInputs = preparePublicInputs(_publicInputs, signThis, 0);
        _publicInputs = preparePublicInputs(_publicInputs, nullifier, 32);
        _publicInputs[64] = merkleRoot;
        _publicInputs[65] = bytes32(uint256(uint160(msg.sender)));
        verifier.verify(proof, _publicInputs);

        // mint tokens
        _transfer(address(this), msg.sender, 1);
        emit TokensAirdropped(msg.sender, 1);
    }

    function getRoot() public view returns (bytes32) {
        return merkleRoot;
    }

    function getMessage() public view returns (bytes32) {
        return signThis;
    }
}
