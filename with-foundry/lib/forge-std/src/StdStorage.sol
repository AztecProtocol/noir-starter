// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.9.0;

import {Vm} from "./Vm.sol";

struct StdStorage {
    mapping(address => mapping(bytes4 => mapping(bytes32 => uint256))) slots;
    mapping(address => mapping(bytes4 => mapping(bytes32 => bool))) finds;
    bytes32[] _keys;
    bytes4 _sig;
    uint256 _depth;
    address _target;
}

library stdStorageSafe {
    event SlotFound(address indexed who, bytes4 indexed fsig, bytes32 keysHash, uint256 slot);

    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function sigs(string memory sigStr) internal pure returns (bytes4) {
        return bytes4(keccak256(bytes(sigStr)));
    }

    function find(StdStorage storage self) internal returns (uint256) {
        address who = self._target;
        bytes4 fsig = self._sig;
        uint256 field_depth = self._depth;
        bytes32[] memory ins = self._keys;

        if (self.finds[who][fsig][keccak256(abi.encodePacked(ins, field_depth))]) {
            return self.slots[who][fsig][keccak256(abi.encodePacked(ins, field_depth))];
        }

        bytes memory cald = abi.encodePacked(fsig, flatten(ins));
        vm.record();
        (, bytes memory rdat) = who.staticcall(cald);
        bytes32 fdat = bytesToBytes32(rdat, 32 * field_depth);

        (bytes32[] memory reads,) = vm.accesses(address(who));
        require(reads.length > 0, "No storage use detected for target.");

        for (uint256 i = 0; i < reads.length; i++) {
            bytes32 prev = vm.load(who, reads[i]);
            vm.store(who, reads[i], bytes32(hex"1337"));
            (, bytes memory rdatCheck) = who.staticcall(cald);
            bytes32 fdatCheck = bytesToBytes32(rdatCheck, 32 * field_depth);

            if (fdatCheck == bytes32(hex"1337")) {
                self.slots[who][fsig][keccak256(abi.encodePacked(ins, field_depth))] = uint256(reads[i]);
                self.finds[who][fsig][keccak256(abi.encodePacked(ins, field_depth))] = true;
                vm.store(who, reads[i], prev);
                emit SlotFound(who, fsig, keccak256(abi.encodePacked(ins, field_depth)), uint256(reads[i]));
                break;
            }

            vm.store(who, reads[i], prev);
        }

        delete self._target;
        delete self._sig;
        delete self._keys;
        delete self._depth;

        return self.slots[who][fsig][keccak256(abi.encodePacked(ins, field_depth))];
    }

    function target(StdStorage storage self, address _target) internal returns (StdStorage storage) {
        self._target = _target;
        return self;
    }

    function sig(StdStorage storage self, string memory _sig) internal returns (StdStorage storage) {
        self._sig = sigs(_sig);
        return self;
    }

    function with_key(StdStorage storage self, bytes32 key) internal returns (StdStorage storage) {
        self._keys.push(key);
        return self;
    }

    function depth(StdStorage storage self, uint256 _depth) internal returns (StdStorage storage) {
        self._depth = _depth;
        return self;
    }

    function read_uint(StdStorage storage self) internal returns (uint256) {
        address who = self._target;
        uint256 slot = find(self);
        return abi.decode(vm.load(who, bytes32(slot)), (uint256));
    }

    function bytesToBytes32(bytes memory b, uint256 offset) private pure returns (bytes32) {
        bytes32 out;
        for (uint256 i = 0; i < 32; i++) {
            out |= bytes32(b[offset + i] & 0xFF) >> (i * 8);
        }
        return out;
    }

    function flatten(bytes32[] memory b) private pure returns (bytes memory) {
        bytes memory result = new bytes(b.length * 32);
        for (uint256 i = 0; i < b.length; i++) {
            bytes32 k = b[i];
            assembly {
                mstore(add(result, add(32, mul(32, i))), k)
            }
        }
        return result;
    }
}
