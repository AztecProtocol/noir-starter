# zk Voting with Foundry

This example project shows how to create a simple zk voting circuit in Noir with a corresponding Solidity contract to track eligible voters, proposals and votes.

1. Create a set of voters. A merkle root is stored in the zkVote Solidity contract that voters will use to verify membership against.
2. Users will input their information into the circuit and generate a proof (see inputs in [Prover.toml](./circuits/Prover.toml) and run `nargo prove p` to generate the proof.)
   1. Public inputs and outputs are printed in [Verifier.toml](./circuits/Verifier.toml).
3. The generated proof + the contents of Verifier.toml are sent in a transaction to the `castVote` function in the [zkVote](./src/zkVote.sol) contract. The function verifies that the sender is authorized to vote on the proposal, that they haven't already voted and tallies their vote.

## Testing

See the test file [here](./test/zkVote.t.sol). Run tests with `forge test`.

## Development

If you change the circuit at `./circuits/src/main.nr` you will need to recompile (`nargo compile p`) the circuit, regenerate the Solidity verifier (saved to `./circuits/contract/plonk_vk.sol`) and replace `./src/plonk_vk.sol`.
