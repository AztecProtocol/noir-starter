// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './plonk_vk.sol';
import 'hardhat/console.sol';

contract MyToken is ERC20 {
    UltraVerifier public verifier;

    constructor(UltraVerifier _verifier) ERC20('MyToken', 'MTK') {
        verifier = _verifier;
    }

    function hashMessage(string memory params) public view returns (bytes32[] memory) {
        string memory prefix = '\x19Ethereum Signed Message:\n258';
        bytes32[] memory publicInputs = new bytes32[](1);
        publicInputs[0] = keccak256(abi.encodePacked(prefix, params));
        return publicInputs;
    }

    function entryPoint(bytes calldata _proof, string memory params) public view {
        console.log(params);
        bytes32[] memory publicInputs = hashMessage(params);
        console.logBytes32(publicInputs[0]);
        console.logBytes(_proof);
        verifier.verify(_proof, publicInputs);
    }

    function mint(address to, uint256 amount) private {
        _mint(to, amount);
    }
}
