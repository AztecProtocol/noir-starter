pragma solidity ^0.8.17;

import {Vm} from "forge-std/Vm.sol";
import {strings} from "stringutils/strings.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "forge-std/console2.sol";

interface IVerifier {
    function verify(bytes calldata, bytes32[] calldata publicInputs) external view returns (bool);
}

contract Starter {
    using strings for *;
    using Strings for uint256;

    Vm public constant vm = Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    IVerifier public verifier;

    constructor(IVerifier _verifier) {
        verifier = _verifier;
    }

    function verifyEqual(bytes calldata proof, bytes32[] calldata y) public view returns (bool) {
        bool proofResult = verifier.verify(proof, y);
        require(proofResult, "Proof is not valid");
        return proofResult;
    }
}
