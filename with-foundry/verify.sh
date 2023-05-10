#!/bin/bash

source args.txt
source addresses.txt

proof=$(nargo prove)

cast call $starter_address \
    "verifyEqual(bytes calldata proof, bytes32[] calldata y) public view returns (bool)" \
    "0x$proof" \
    "["$public_input"]"
