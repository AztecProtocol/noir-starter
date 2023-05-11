pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "../contract/Starter.sol";
import "../contract/plonk_vk.sol";
import "forge-std/console2.sol";

contract StarterTest is Test {
    Starter public starter;
    UltraVerifier public verifier;

    bytes32[] public correct = new bytes32[](1);
    bytes32[] public wrong = new bytes32[](1);

    function setUp() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        verifier = new UltraVerifier();
        starter = new Starter(verifier);

        correct[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000003);
        wrong[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000004);
    }

    function testVerifyProof() public {
        string memory proof = vm.readLine("./proofs/p.proof");
        bytes memory proofBytes = vm.parseBytes(proof);
        starter.verifyEqual(proofBytes, correct);
    }

    function test_wrongProof() public {
        vm.expectRevert();
        string memory proof = vm.readLine("./proofs/p.proof");
        bytes memory proofBytes = vm.parseBytes(proof);
        starter.verifyEqual(proofBytes, wrong);
    }
}
