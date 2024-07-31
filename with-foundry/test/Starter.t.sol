pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "../contract/Starter.sol";
import "../circuits/target/contract.sol";
import "forge-std/console.sol";

contract StarterTest is Test {
    Starter public starter;
    UltraVerifier public verifier;

    bytes32[] public dynamicCorrect = new bytes32[](2);
    bytes32[] public correct = new bytes32[](2);
    bytes32[] public wrong = new bytes32[](1);

    function setUp() public {
        verifier = new UltraVerifier();
        starter = new Starter(verifier);

        correct[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000003);
        correct[1] = correct[0];
        wrong[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000004);
    }

    function testVerifyProof() public view {
        bytes memory proof_w_inputs = vm.readFileBinary("./circuits/target/with_foundry.proof");
        bytes memory last = sliceAfter64Bytes(proof_w_inputs);
        starter.verifyEqual(last, correct);
    }

    function test_wrongProof() public {
        vm.expectRevert();
        bytes memory proof_w_inputs = vm.readFileBinary("./circuits/target/with_foundry.proof");
        bytes memory proof = sliceAfter64Bytes(proof_w_inputs);
        starter.verifyEqual(proof, wrong);
    }

    function test_dynamicProof() public {
        string[] memory _fieldNames = new string[](2);
        string[] memory _fieldValues = new string[](2);

        _fieldNames[0] = "x";
        _fieldNames[1] = "y";
        _fieldValues[0] = "5";
        _fieldValues[1] = "5";

        // Set expected dynamic proof outcome
        dynamicCorrect[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000005);
        dynamicCorrect[1] = dynamicCorrect[0];
        bytes memory proofBytes = generateDynamicProof("test1", _fieldNames, _fieldValues);
        bytes memory proof = sliceAfter64Bytes(proofBytes);
        starter.verifyEqual(proof, dynamicCorrect);
    }

    function test_dynamicProofSecondTest() public {
        string[] memory _fieldNames = new string[](2);
        string[] memory _fieldValues = new string[](2);

        _fieldNames[0] = "x";
        _fieldNames[1] = "y";
        _fieldValues[0] = "8";
        _fieldValues[1] = "8";

        // Set expected dynamic proof outcome
        dynamicCorrect[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000008);
        dynamicCorrect[1] = dynamicCorrect[0];
        bytes memory proofBytes = generateDynamicProof("test2", _fieldNames, _fieldValues);
        bytes memory proof = sliceAfter64Bytes(proofBytes);
        starter.verifyEqual(proof, dynamicCorrect);
    }

    function test_dynamicProofThirdTest() public {
        string[] memory _fieldNames = new string[](2);
        string[] memory _fieldValues = new string[](2);

        _fieldNames[0] = "x";
        _fieldNames[1] = "y";
        _fieldValues[0] = "7";
        _fieldValues[1] = "7";

        // Set expected dynamic proof outcome
        dynamicCorrect[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000007);
        dynamicCorrect[1] = dynamicCorrect[0];
        bytes memory proofBytes = generateDynamicProof("test3", _fieldNames, _fieldValues);
        bytes memory proof = sliceAfter64Bytes(proofBytes);
        starter.verifyEqual(proof, dynamicCorrect);
    }

    /// @dev This function generates dynamic proofs using 2 scripts in the /script directory
    ///
    /// @param _testName a random string to identify the test by, this is used to create a unique folder name in the /tmp directory
    /// @param _fields The field names within the Prover.toml file
    /// @param _fieldValues The field values associated with fields names within the Prover.toml file
    function generateDynamicProof(string memory _testName, string[] memory _fields, string[] memory _fieldValues)
        public
        returns (bytes memory)
    {
        require(_fields.length == _fieldValues.length, "generateProof: Input arrays not the same length");

        // Copy files and create Prover.toml in /tmp directory
        string[] memory filecreateCommand = new string[] (2);
        filecreateCommand[0] = "./script/createFile.sh";
        filecreateCommand[1] = _testName;
        bytes memory fileCreateResponse = vm.ffi(filecreateCommand);
        console.log(string(fileCreateResponse));

        string memory _file = string.concat("/tmp/", _testName, "/Prover.toml");
        vm.writeFile(_file, "");
        for (uint256 i; i < _fields.length; i++) {
            vm.writeLine(_file, string.concat(_fields[i], " = ", _fieldValues[i]));
        }

        // now generate the proof by calling the script using ffi
        string[] memory ffi_command = new string[] (2);
        ffi_command[0] = "./script/prove.sh";
        ffi_command[1] = _testName;
        bytes memory commandResponse = vm.ffi(ffi_command);
        console.log(string(commandResponse));
        bytes memory _newProof = vm.readFileBinary(string.concat("/tmp/", _testName, "/target/with_foundry.proof"));
        return _newProof;
    }

    // Utility function, because the proof file includes the public inputs at the beginning
    function sliceAfter64Bytes(bytes memory data) internal pure returns (bytes memory) {
        uint256 length = data.length - 64;
        bytes memory result = new bytes(data.length - 64);
        for (uint i = 0; i < length; i++) {
            result[i] = data[i + 64];
        }
        return result;
    }
   
}
