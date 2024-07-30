#!/bin/bash
if [ "$#" -ne 1 ]; then
  echo "Usage: ./prove.sh [TESTNAME_STRING]"
  exit 1
fi
cd /tmp/$1 && nargo execute witness && bb prove -b ./target/with_foundry.json -w ./target/witness.gz -o ./target/with_foundry.proof && echo "Proof Generated"
