pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "../contract/Starter.sol";
//import "../circuits/contract/plonk_vk.sol";

contract StarterTest is Test {
    Starter public starter;
    UltraVerifier public verifier;

    bytes32[] public correct = new bytes32[](1);
    bytes32[] public wrong = new bytes32[](1);

    function setUp() public {
        verifier = new UltraVerifier();
        starter = new Starter(verifier);

        correct[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000003);
        wrong[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000004);
    }

    function testVerifyProof() public {
        string memory proof = vm.readLine("./circuits/proofs/p.proof");
        bytes memory proofBytes = vm.parseBytes(proof);
        starter.verifyEqual(proofBytes, correct);
    }

    function test_wrongProof() public {
        vm.expectRevert();
        string memory proof = vm.readLine("./circuits/proofs/p.proof");
        bytes memory proofBytes = vm.parseBytes(proof);
        starter.verifyEqual(proofBytes, wrong);
    }

    function test_dynamicProof() public {
        string[] memory _fieldNames = new string[](2);
        string[] memory _fieldValues = new string[](2);

        _fieldNames[0] = "x";
        _fieldNames[1] = "y";
        _fieldValues[0] = "3";
        _fieldValues[1] = "3";
        bytes memory proofBytes = generateDynamicProof(_fieldNames,_fieldValues);
        starter.verifyEqual(proofBytes, correct);
    }
    function generateDynamicProof(string[] memory _fields, string[] memory _fieldValues) public returns (bytes memory) {
        require(_fields.length == _fieldValues.length,"generateProof: Input arrays not the same length");
        string memory _file = "./circuits/Prover.toml";
        vm.writeFile(_file,"");
        for(uint256 i; i < _fields.length; i++)
        {
            vm.writeLine(_file, string.concat( _fields[i] , " = " , _fieldValues[i]));
        }

        // now generate the proof by calling the script using ffi
        string[] memory ffi_command = new string[] (1);
        ffi_command[0] = "./script/prove.sh";
        bytes memory commandResponse = vm.ffi(ffi_command);
        console.log(string(commandResponse));
        string memory _newProof = vm.readLine("./circuits/proofs/d.proof");
        return vm.parseBytes(_newProof);

    }
}
