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
        string memory prefix = '\x19Ethereum Signed Message:\n194';
        bytes32[] memory publicInputs = new bytes32[](32);
        bytes32 hash = keccak256(abi.encodePacked(prefix, params));

        for (uint256 i = 0; i < 32; i++) {
            publicInputs[i] = (hash >> ((31 - i) * 8)) & bytes32(uint256(0xFF));
        }

        return publicInputs;
    }

    function entryPoint(bytes calldata _proof, string memory params) public view {
        // console.log(params);
        bytes32[] memory publicInputs = hashMessage(params);
        verifier.verify(_proof, publicInputs);
    }

    function mint(address to, uint256 amount) private {
        _mint(to, amount);
    }
}
