pragma solidity 0.8.17;

import {TestBase} from "forge-std/Base.sol";
import {console2 as console} from "forge-std/console2.sol";

// blatantly stolen from @exp-table, thanks!
contract NoirHelper is TestBase {
    struct CircuitInput {
        string name;
        uint256 value;
    }

    CircuitInput[] public inputs;

    /// Adds an input.
    /// Can be chained.
    ///
    /// # Example
    ///
    /// ```
    /// withInput("x", 1).withInput("y", 2).withInput("return", 3);
    /// ```
    function withInput(
        string memory name,
        uint256 value
    ) public returns (NoirHelper) {
        inputs.push(CircuitInput(name, value));
        return this;
    }

    /// "Empty" the inputs array.
    ///
    /// # Example
    ///
    /// ```
    /// clean();
    /// ```
    function clean() public {
        delete inputs;
    }

    /// Read a proof from a file located in circuits/proofs.
    ///
    /// # Example
    ///
    /// ```
    /// bytes memory proof = readProof("my_proof");
    /// ```
    function readProof(string memory fileName) public returns (bytes memory) {
        string memory file = vm.readFile(
            string.concat("circuits/proofs/", fileName, ".proof")
        );
        return vm.parseBytes(file);
    }

    /// Generates a proof based on inputs and returns it.
    ///
    /// # Example
    ///
    /// ```
    /// withInput("x", 1).withInput("y", 2).withInput("return", 3);
    /// bytes memory proof = generateProof();
    /// ```
    function generateProof() public returns (bytes memory) {
        // write to Prover.toml
        string memory proverTOML = "circuits/Prover.toml";
        vm.writeFile(proverTOML, "");
        // write all inputs with their values
        for (uint i; i < inputs.length; i++) {
            vm.writeLine(
                proverTOML,
                string.concat(
                    inputs[i].name,
                    " = ",
                    vm.toString(inputs[i].value)
                )
            );
        }
        // generate proof
        string[] memory ffi_cmds = new string[](1);
        ffi_cmds[0] = "./prove.sh";
        vm.ffi(ffi_cmds);
        // clean inputs
        clean();
        // read proof
        string memory proof = vm.readFile("circuits/proofs/test.proof");
        return vm.parseBytes(proof);
    }
}
