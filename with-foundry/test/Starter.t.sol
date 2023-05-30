pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "../contract/Starter.sol";
import "../circuits/contract/plonk_vk.sol";

import {NoirHelper} from "utils/NoirHelper.sol";

contract StarterTest is Test, NoirHelper {
    Starter public starter;
    UltraVerifier public verifier;

    function setUp() public {
        verifier = new UltraVerifier();
        starter = new Starter(verifier);
    }

    function testVerifyProof() public {
        this.withInput("x", 3).withInput("y", 3);
        bytes memory proof = generateProof();

        bytes32[] memory inputs = new bytes32[](1);
        inputs[0] = bytes32(uint256(3));

        starter.verifyEqual(proof, inputs);
    }

    function test_wrongProof() public {
        this.withInput("x", 3).withInput("y", 3);
        bytes memory proof = generateProof();
        // vm.expectRevert();

        bytes32[] memory inputs = new bytes32[](1);
        inputs[0] = bytes32(uint256(3));

        starter.verifyEqual(proof, inputs);
    }
}
