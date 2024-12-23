// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.5.0;

/**
 * @title DSTest
 * @dev A testing contract with various assertion methods and logging capabilities.
 */
contract DSTest {
    // Events for logging
    event log(string message);
    event log_bytes(bytes data);
    event log_address(address data);
    event log_bytes32(bytes32 data);
    event log_int(int data);
    event log_uint(uint data);
    event log_named_address(string key, address val);
    event log_named_bytes32(string key, bytes32 val);
    event log_named_int(string key, int val);
    event log_named_uint(string key, uint val);
    event log_named_string(string key, string val);
    event log_named_decimal_int(string key, int val, uint decimals);
    event log_named_decimal_uint(string key, uint val, uint decimals);

    // Constants
    address constant HEVM_ADDRESS = address(bytes20(uint160(uint256(keccak256("hevm cheat code")))));

    // State variables
    bool public IS_TEST = true;
    bool private _failed;

    /**
     * @notice Modifier to log gas usage.
     */
    modifier logs_gas() {
        uint startGas = gasleft();
        _;
        uint endGas = gasleft();
        emit log_named_uint("Gas used", startGas - endGas);
    }

    /**
     * @notice Modifier for optional test metadata.
     */
    modifier testopts(string memory) { _; }

    /**
     * @dev Returns the failed state.
     */
    function failed() public returns (bool) {
        if (_failed) {
            return _failed;
        }
        if (hasHEVMContext()) {
            (, bytes memory retdata) = HEVM_ADDRESS.call(
                abi.encodePacked(
                    bytes4(keccak256("load(address,bytes32)")),
                    abi.encode(HEVM_ADDRESS, bytes32("failed"))
                )
            );
            return abi.decode(retdata, (bool));
        }
        return false;
    }

    /**
     * @dev Marks the test as failed.
     */
    function fail() internal {
        if (hasHEVMContext()) {
            (bool status, ) = HEVM_ADDRESS.call(
                abi.encodePacked(
                    bytes4(keccak256("store(address,bytes32,bytes32)")),
                    abi.encode(HEVM_ADDRESS, bytes32("failed"), bytes32(uint256(0x01)))
                )
            );
            require(status, "HEVM call failed");
        }
        _failed = true;
    }

    /**
     * @dev Checks if the HEVM context is available.
     */
    function hasHEVMContext() internal view returns (bool) {
        uint256 hevmCodeSize;
        assembly {
            hevmCodeSize := extcodesize(HEVM_ADDRESS)
        }
        return hevmCodeSize > 0;
    }

    /**
     * @dev Logs and asserts that a condition is true.
     */
    function assertTrue(bool condition, string memory err) internal {
        if (!condition) {
            emit log_named_string("Error", err);
            fail();
        }
    }

    function assertTrue(bool condition) internal {
        assertTrue(condition, "Assertion failed");
    }

    /**
     * @dev Generalized equality check for integers, addresses, and bytes32.
     */
    function assertEq(uint a, uint b, string memory err) internal {
        if (a != b) {
            emit log_named_string("Error", err);
            emit log_named_uint("Left", a);
            emit log_named_uint("Right", b);
            fail();
        }
    }

    function assertEq(uint a, uint b) internal {
        assertEq(a, b, "Equality assertion failed");
    }

    function assertEq(address a, address b, string memory err) internal {
        if (a != b) {
            emit log_named_string("Error", err);
            emit log_named_address("Left", a);
            emit log_named_address("Right", b);
            fail();
        }
    }

    function assertEq(address a, address b) internal {
        assertEq(a, b, "Equality assertion failed");
    }

    function assertEq(bytes32 a, bytes32 b, string memory err) internal {
        if (a != b) {
            emit log_named_string("Error", err);
            emit log_named_bytes32("Left", a);
            emit log_named_bytes32("Right", b);
            fail();
        }
    }

    function assertEq(bytes32 a, bytes32 b) internal {
        assertEq(a, b, "Equality assertion failed");
    }

    /**
     * @dev Generalized inequality check for integers, addresses, and bytes32.
     */
    function assertNotEq(uint a, uint b, string memory err) internal {
        if (a == b) {
            emit log_named_string("Error", err);
            emit log_named_uint("Left", a);
            emit log_named_uint("Right", b);
            fail();
        }
    }

    function assertNotEq(uint a, uint b) internal {
        assertNotEq(a, b, "Inequality assertion failed");
    }

    function assertNotEq(address a, address b, string memory err) internal {
        if (a == b) {
            emit log_named_string("Error", err);
            emit log_named_address("Left", a);
            emit log_named_address("Right", b);
            fail();
        }
    }

    function assertNotEq(address a, address b) internal {
        assertNotEq(a, b, "Inequality assertion failed");
    }

    function assertNotEq(bytes32 a, bytes32 b, string memory err) internal {
        if (a == b) {
            emit log_named_string("Error", err);
            emit log_named_bytes32("Left", a);
            emit log_named_bytes32("Right", b);
            fail();
        }
    }

    function assertNotEq(bytes32 a, bytes32 b) internal {
        assertNotEq(a, b, "Inequality assertion failed");
    }
}
