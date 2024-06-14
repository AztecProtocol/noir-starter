#!/bin/bash
NODE_OPTIONS='--experimental-loader ts-node/esm/transpile-only --no-warnings=ExperimentalWarning' 

NODE_OPTIONS=$NODE_OPTIONS hardhat compile
NODE_OPTIONS=$NODE_OPTIONS hardhat test
