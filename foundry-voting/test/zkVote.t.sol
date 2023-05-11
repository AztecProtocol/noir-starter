// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/zkVote.sol";
import "../src/plonk_vk.sol";

contract zkVoteTest is Test {
    zkVote public voteContract;
    UltraVerifier public verifier;

    bytes proofBytes;

    function setUp() public {
        verifier = new UltraVerifier();
        voteContract = new zkVote(0x02b54b6daa0b81c12a9d75f44d39e52dcbfa2ef2ab04dbe9159559a547a9ae82, address(verifier));
        voteContract.propose("First proposal", block.timestamp + 10000000);
        
        string memory proof = vm.readLine("./circuits/proofs/p.proof");
        proofBytes = vm.parseBytes(proof);
    }


    function testFailInvalidProof() public {
        bytes32[] memory inputs = new bytes32[](4);
        inputs[0] = 0x02b54b6daa0b81c12a9d75f44d39e52dcbfa2ef2ab04dbe9159559a547a9ae82;
        inputs[1] = bytes32(0);
        inputs[2] = bytes32(abi.encodePacked(uint(1)));
        inputs[3] = 0x00b698152e6728b3ac8d6a4f0465741afb38617dee54c60672038d483d0e7f7b;
        verifier.verify(hex"01", inputs);
    }

    function testValidVote() public {
        voteContract.castVote(
            proofBytes,
            0, // proposal ID
            1, // vote in favor
            0x00b698152e6728b3ac8d6a4f0465741afb38617dee54c60672038d483d0e7f7b // nullifier hash
        );
    }


    function test_Revert_DoubleVote() public {
        testValidVote();
        vm.expectRevert();
        voteContract.castVote(
            proofBytes,
            0, // proposal ID
            1, // vote in favor
            0x00b698152e6728b3ac8d6a4f0465741afb38617dee54c60672038d483d0e7f7b // nullifier hash
        );
    }
}
