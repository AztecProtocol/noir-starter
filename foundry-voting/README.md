# zk Voting with Foundry

[![Run Tests on PR](https://github.com/noir-lang/noir-starter/actions/workflows/foundry-voting.yml/badge.svg)](https://github.com/noir-lang/noir-starter/actions/workflows/foundry-voting.yml)

This example project shows how to create a simple zk voting circuit in Noir with a corresponding Solidity contract to track eligible voters, proposals and votes.

## Overview

This is the model used for creating the [circuit](circuits/src/main.nr) and the [zkVote contract](src/zkVote.sol) to manage private voting.

1. Create a set of voters. A merkle root is stored in the zkVote Solidity contract that voters will use to verify membership against. In this example, there are 4 accounts in the set of voters. The private keys are 0, 1, 2, 3 and the secret value to create the commitment is 9.

| Private Key | Commitment = pedersen(private key, secret) |
|---|---|
| 0 | 0x0ae5f55a6f2c82f74bba34d9e23c7cd69d41c183c8ddbd9a440ee3de5bf1c649 |
| 1 | 0x1053e87bed5f2a4f5144b386c5403701212f4b3c21cb14683b6ebdfed16c854d |
| 2 | 0x1eff4379fbc748b53a07ce5961c24eccdfeb8f17154490d2e41c6096a9519329 |
| 3 | 0x0e0adf2416341b3d868d88043127be8e6965f3758ce6a80d11a494fe21b0cdff |

This gives intermediate hashes of `0x0fcf7577aeb374ed0a19b942e0470521d46bde86f01d3138239ccc4b995c00ae` (`pedersen(commitment0, commitment1)`) and `0x1e8e7c1e1f6f65d0d3553e0f715c335f0ccdcc21cda1df7355e6c6e851bccf54` (`pedersen(commitment2, commitment3)`) and a root hash of `0x20c77d6d51119d86868b3a37a64cd4510abd7bdb7f62a9e78e51fe8ca615a194`.

2. Users will input their information into the circuit and generate a proof (see example inputs in [Prover.toml](./circuits/Prover.toml) and run `nargo prove p` to generate the proof.)
   1. Public inputs and outputs are printed in [Verifier.toml](./circuits/Verifier.toml).
3. The generated proof + the contents of Verifier.toml are sent in a transaction to the `castVote` function in the [zkVote](./src/zkVote.sol) contract. The function verifies that the sender is authorized to vote on the proposal, that they haven't already voted and tallies their vote.

## Testing

See the test file [here](./test/zkVote.t.sol). Run tests with `forge test`.

## Development

If you change the circuit at `./circuits/src/main.nr` you will need to recompile (`nargo compile p`) the circuit and regenerate the Solidity verifier (saved to `./circuits/contract/plonk_vk.sol`).

The merkle tree will need to be recalculated whenever there are users added to the set or if there are any changes to the voters private keys (private keys are an input to the merkle membership commitment, so changing a key changes the corresponding leaf in the merkle tree, which changes the root). See `test_build_merkle_tree` for an example calculation.

Run `nargo test --show-output` in `./circuits` to print the example merkle tree.
