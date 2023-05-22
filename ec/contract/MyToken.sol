// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './plonk_vk.sol';
import 'hardhat/console.sol';

import './lib/uint2str.sol';

contract MyToken is ERC20, ERC20Burnable, Pausable, Ownable {
    UltraVerifier public verifier;

    constructor(UltraVerifier _verifier) ERC20('MyToken', 'MTK') {
        verifier = _verifier;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function hashMessage(bytes memory params) public view returns (bytes32[] memory) {
        string memory length = uint2str.convert(params.length);
        bytes memory prefix = abi.encodePacked('\x19Ethereum Signed Message:\n', length);
        bytes32[] memory publicInputs = new bytes32[](32);
        bytes32 hash = keccak256(abi.encodePacked(prefix, params));

        for (uint256 i = 0; i < 32; i++) {
            publicInputs[i] = (hash >> ((31 - i) * 8)) & bytes32(uint256(0xFF));
        }

        return publicInputs;
    }

    function entryPoint(bytes calldata _proof, bytes4 funcSig, bytes memory params) public {
        bytes32[] memory publicInputs = hashMessage(abi.encodePacked(funcSig, params));
        verifier.verify(_proof, publicInputs);

        (bool success, bytes memory returnData) = address(this).delegatecall(
            abi.encodePacked(funcSig, params)
        );

        if (!success) {
            // If returnData is empty, use a default reason
            if (returnData.length == 0) {
                revert('Function call failed');
            }
            // If returnData is not empty, it contains a revert reason string
            else {
                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returnData_size := mload(returnData)
                    revert(add(32, returnData), returnData_size)
                }
            }
        }
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
