#!/bin/bash

nargo codegen-verifier

verifier_output=$(forge create --rpc-url http://127.0.0.1:8545 \
 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
 --optimize \
 --optimizer-runs 5000 \
 --evm-version london \
 --contracts contract \
 contract/plonk_vk.sol:UltraVerifier)


verifier_deployed_to=$(echo "$verifier_output" | grep "Deployed to:" | awk '{print $3}')

echo "Verifier deployed to: $verifier_deployed_to"

contract_output=$(forge create --rpc-url http://127.0.0.1:8545 \
 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
 --constructor-args $verifier_deployed_to \
 --contracts contract \
 contract/Starter.sol:Starter)

starter_deployed_to=$(echo "$contract_output" | grep "Deployed to:" | awk '{print $3}')

echo "Starter deployed to: $starter_deployed_to"

echo "starter_address=$starter_deployed_to" > addresses.txt
echo "verifier_address=$verifier_deployed_to" >> addresses.txt
