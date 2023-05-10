#!/bin/bash

source addresses.txt

proof=$(nargo prove)

# Running this makes each line of Verifier.toml available as a variable
while read -r line; do
  if [[ $line == *=* ]]; then
    key=$(echo "$line" | cut -d '=' -f 1 | tr -d '[:space:]')
    value=$(echo "$line" | cut -d '=' -f 2 | tr -d '[:space:]' | tr -d '"')
    declare "$key=$value"
  fi
done < Verifier.toml

# echo "Starter address: $starter_address"
# echo "Verifier address: $verifier_address"
# echo "Proof: 0x$proof"
# echo "Public input: $y"

echo "proof=$proof" > args.txt
echo "public_input=$y" >> args.txt

