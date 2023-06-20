#!/bin/bash
if [ "$#" -ne 1 ]
then
  echo "Usage: ./createFile.sh [TESTNAME_STRING]"
  exit 1
fi
if [ ! -d "/tmp/$1" ]; then
  mkdir /tmp/$1
fi

cp ./circuits/Nargo.toml /tmp/$1/Nargo.toml
cp ./circuits/Verifier.toml /tmp/$1/Verifier.toml
cp -r ./circuits/src /tmp/$1/
echo "" > /tmp/$1/Prover.toml && echo "File created"
