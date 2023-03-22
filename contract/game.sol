// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

interface IVerifier {
    function verify(bytes calldata) external view returns (bool);
}

struct Puzzle {
    uint id;
    bytes32 solution;
}

contract Waldo {
    IVerifier public verifier;

    mapping(uint => bytes32) solutions;
    mapping(address => uint) levels;

    constructor(IVerifier _verifier) {
        verifier = _verifier;
    }

    function addSolution(uint id, bytes32 solution) public {
        if (solutions[id] == bytes32(0)) {
            solutions[id] = solution;
        }
    }

    function getPuzzle() public view returns (Puzzle memory) {
        uint playerLevel = levels[msg.sender];
        Puzzle memory puzzle = Puzzle(playerLevel, solutions[playerLevel]);
        return puzzle;
    }

    function submitSolution(uint level, bytes calldata solution) public returns (bool) {
        require(level == levels[msg.sender], "Can't submit a solution for a level different than yours!");

        bool proofResult = verifier.verify(solution);
        require(proofResult, "Proof is not valid");

        levels[msg.sender] = levels[msg.sender] + 1;
        return proofResult;
    }
}
