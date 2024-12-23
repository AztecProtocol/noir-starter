// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

/// @dev Optimized version of `console2` library to reduce redundancy.
/// This version uses dynamic function calls with encoding instead of hardcoding multiple variants.
library console2 {
    address constant CONSOLE_ADDRESS = address(0x000000000000000000636F6e736F6c652e6c6f67);

    function _sendLogPayload(bytes memory payload) private view {
        /// @solidity memory-safe-assembly
        assembly {
            let success := staticcall(gas(), CONSOLE_ADDRESS, add(payload, 32), mload(payload), 0, 0)
            // Silence warnings in case the logging fails.
        }
    }

    function log() internal view {
        _sendLogPayload(abi.encodeWithSignature("log()"));
    }

    function logInt(int256 value) internal view {
        _sendLogPayload(abi.encodeWithSignature("log(int256)", value));
    }

    function logUint(uint256 value) internal view {
        _sendLogPayload(abi.encodeWithSignature("log(uint256)", value));
    }

    function logString(string memory value) internal view {
        _sendLogPayload(abi.encodeWithSignature("log(string)", value));
    }

    function logBool(bool value) internal view {
        _sendLogPayload(abi.encodeWithSignature("log(bool)", value));
    }

    function logAddress(address value) internal view {
        _sendLogPayload(abi.encodeWithSignature("log(address)", value));
    }

    function logBytes(bytes memory value) internal view {
        _sendLogPayload(abi.encodeWithSignature("log(bytes)", value));
    }

    function logDynamic(string memory methodName, bytes memory encodedParams) internal view {
        _sendLogPayload(abi.encodeWithSignature(methodName, encodedParams));
    }
}
