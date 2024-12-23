// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {Vm} from "./Vm.sol";

library StdStyle {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    // ANSI escape codes for styles
    string constant RED = "\u001b[91m";
    string constant GREEN = "\u001b[92m";
    string constant YELLOW = "\u001b[93m";
    string constant BLUE = "\u001b[94m";
    string constant MAGENTA = "\u001b[95m";
    string constant CYAN = "\u001b[96m";
    string constant BOLD = "\u001b[1m";
    string constant DIM = "\u001b[2m";
    string constant ITALIC = "\u001b[3m";
    string constant UNDERLINE = "\u001b[4m";
    string constant INVERSE = "\u001b[7m";
    string constant RESET = "\u001b[0m";

    // Universal style application
    function style(string memory styleCode, string memory text) private pure returns (string memory) {
        return string(abi.encodePacked(styleCode, text, RESET));
    }

    // Overloaded style functions for different types
    function style(string memory styleCode, uint256 value) internal pure returns (string memory) {
        return style(styleCode, vm.toString(value));
    }

    function style(string memory styleCode, int256 value) internal pure returns (string memory) {
        return style(styleCode, vm.toString(value));
    }

    function style(string memory styleCode, address value) internal pure returns (string memory) {
        return style(styleCode, vm.toString(value));
    }

    function style(string memory styleCode, bool value) internal pure returns (string memory) {
        return style(styleCode, vm.toString(value));
    }

    function style(string memory styleCode, bytes memory value) internal pure returns (string memory) {
        return style(styleCode, vm.toString(value));
    }

    function style(string memory styleCode, bytes32 value) internal pure returns (string memory) {
        return style(styleCode, vm.toString(value));
    }

    // Predefined styles
    function red(string memory text) internal pure returns (string memory) {
        return style(RED, text);
    }

    function green(string memory text) internal pure returns (string memory) {
        return style(GREEN, text);
    }

    function yellow(string memory text) internal pure returns (string memory) {
        return style(YELLOW, text);
    }

    function blue(string memory text) internal pure returns (string memory) {
        return style(BLUE, text);
    }

    function magenta(string memory text) internal pure returns (string memory) {
        return style(MAGENTA, text);
    }

    function cyan(string memory text) internal pure returns (string memory) {
        return style(CYAN, text);
    }

    function bold(string memory text) internal pure returns (string memory) {
        return style(BOLD, text);
    }

    function dim(string memory text) internal pure returns (string memory) {
        return style(DIM, text);
    }

    function italic(string memory text) internal pure returns (string memory) {
        return style(ITALIC, text);
    }

    function underline(string memory text) internal pure returns (string memory) {
        return style(UNDERLINE, text);
    }

    function inverse(string memory text) internal pure returns (string memory) {
        return style(INVERSE, text);
    }
}
