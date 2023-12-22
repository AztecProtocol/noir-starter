pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import "../circuits/contract/with_foundry/plonk_vk.sol";
import "../contract/Starter.sol";

contract StarterScript is Script {
    Starter public starter;
    UltraVerifier public verifier;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("LOCALHOST_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        verifier = new UltraVerifier();
        starter = new Starter(verifier);
    }
}
