// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/zkVote.sol";
import "../circuits/contract/plonk_vk.sol";

contract zkVoteTest is Test {
    zkVote public voteContract;
    UltraVerifier public verifier;

    bytes proofBytes;
    bytes32 merkleRoot = 0x20c77d6d51119d86868b3a37a64cd4510abd7bdb7f62a9e78e51fe8ca615a194;
    bytes32 nullifierHash = 0x0bf0dd2fad1a8da018371f0a8dac56016d270d2e178a847a3ac724d033d1d858;


    function setUp() public {
        verifier = new UltraVerifier();
        voteContract = new zkVote(merkleRoot, address(verifier));
        voteContract.propose("First proposal", block.timestamp + 10000000);
        
        string memory proof = vm.readLine("./circuits/proofs/p.proof");
        proofBytes = vm.parseBytes(proof);
    }

    function test_ValidVote() public {
        voteContract.castVote(
            proofBytes,
            0, // proposal ID
            1, // vote in favor
            nullifierHash // nullifier hash
        );
    }

    function test_Revert_InvalidProof() public {
        vm.expectRevert();
        bytes32[] memory inputs = new bytes32[](4);
        inputs[0] = merkleRoot;
        inputs[1] = bytes32(0);
        inputs[2] = bytes32(abi.encodePacked(uint(1)));
        inputs[3] = nullifierHash;
        verifier.verify(hex"01", inputs);
    }

    function test_Revert_DoubleVote() public {
        test_ValidVote();
        vm.expectRevert();
        voteContract.castVote(
            proofBytes,
            0, // proposal ID
            1, // vote in favor
            nullifierHash // nullifier hash
        );
    }
}
