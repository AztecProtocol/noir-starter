// https://gist.github.com/Turupawn/6a4391fb54d09aae7a091ad2478c1f62#file-zkvoting-sol

//SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

import {UltraVerifier} from '../circuits/contract/plonk_vk.sol';

contract zkVote {

    UltraVerifier verifier;

    struct Proposal {
        string description;
        uint deadline;
        uint forVotes;
        uint againstVotes;
    }

    bytes32 merkleRoot;
    uint proposalCount;
    mapping (uint proposalId => Proposal) public proposals;
    mapping(bytes32 hash => bool isNullified) nullifiers;

    constructor(bytes32 _merkleRoot, address _verifier) {
        merkleRoot = _merkleRoot;
        verifier = UltraVerifier(_verifier);
    }

    function propose(string memory description, uint deadline) public returns (uint) {
        proposals[proposalCount] = Proposal(description, deadline, 0, 0);
        proposalCount += 1;
        return proposalCount;
    }

    function castVote(bytes calldata proof, uint proposalId, uint vote, bytes32 nullifierHash) public returns (bool) {
        require(!nullifiers[nullifierHash], "Proof has been already submitted");
        require(block.timestamp < proposals[proposalId].deadline, "Voting period is over.");
        nullifiers[nullifierHash] = true;

        bytes32[] memory publicInputs = new bytes32[](4);
        publicInputs[0] = merkleRoot;
        publicInputs[1] = bytes32(proposalId);
        publicInputs[2] = bytes32(vote);
        publicInputs[3] = nullifierHash;
        require(verifier.verify(proof, publicInputs), "Invalid proof");

        if(vote == 1)
            proposals[proposalId].forVotes += 1;
        else // vote = 0
            proposals[proposalId].againstVotes += 1;

        return true;
    }
}