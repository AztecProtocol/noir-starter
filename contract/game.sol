// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

interface IVerifier {
    function verify(bytes calldata) external view returns (bool);
}

struct Puzzle {
    string url;
    bytes32 solutionHash;
}

import "hardhat/console.sol";

contract Waldo {
    IVerifier public verifier;

    mapping(uint => Puzzle) puzzles;
    uint length = 0;
    uint nonce = 0;

    constructor(IVerifier _verifier) {
        verifier = _verifier;
        length = 0;
    }

    function addPuzzle(string memory url, bytes32 solutionHash) public {
        puzzles[length] = Puzzle(url, solutionHash);
        length++;
    }

    function pseudoRandom() private view returns (uint) {
        uint randomHash = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
        return randomHash % length;
    } 

    function getPuzzle() public view returns (Puzzle memory) {
        uint random = pseudoRandom();
        Puzzle memory puzzle = puzzles[random];
        return puzzle;
    }

    function submitSolution(bytes calldata solution) public view returns (bool) {
        bool proofResult = verifier.verify(solution);
        require(proofResult, "Proof is not valid");

        return proofResult;
    }
}
