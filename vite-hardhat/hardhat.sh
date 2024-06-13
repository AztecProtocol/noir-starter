#!/bin/bash

NODE_OPTIONS='--experimental-loader ts-node/esm/transpile-only --no-warnings=ExperimentalWarning'
hardhat $@
