// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

interface IVerifier {
    function verify(bytes calldata) external view returns (bool);
}

contract Waldo {
    IVerifier public verifier;

    mapping(uint => bytes32) public solutions;
    mapping(address => uint) levels;

    constructor(IVerifier _verifier) {
        verifier = _verifier;
    }

    function addSolution(uint id, bytes32 solution) public {
        if (solutions[id] == bytes32(0)) {
            solutions[id] = solution;
        }
    }

    function getNextPuzzleSolution() public view returns (bytes32) {
        uint nextLevel = levels[msg.sender] + 1;
        return solutions[nextLevel];
    }

    function submitSolution(bytes calldata solution) public returns (uint) {
        bool proofResult = verifier.verify(solution);
        require(proofResult, "Proof is not valid");

        levels[msg.sender] = levels[msg.sender] + 1;
        return levels[msg.sender];
    }
}
