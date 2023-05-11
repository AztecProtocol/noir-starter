pragma solidity ^0.8.17;

import {Vm} from "forge-std/Vm.sol";
import {strings} from "stringutils/strings.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./plonk_vk.sol";

contract Starter {
    using strings for *;
    using Strings for uint256;

    Vm public constant vm = Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    UltraVerifier public verifier;

    constructor(UltraVerifier _verifier) {
        verifier = _verifier;
    }

    function verifyEqual(bytes calldata proof, bytes32[] calldata y) public view returns (bool) {
        bool proofResult = verifier.verify(proof, y);
        require(proofResult, "Proof is not valid");
        return proofResult;
    }
}
