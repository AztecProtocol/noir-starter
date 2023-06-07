# Stealthdrop example

WARNING: THIS IS UNSAFE. ECDSA signature is malleable, which means this app has a vulnerability. Check out this [twitter thread](https://twitter.com/0xPARC/status/1493704577002049537?s=20&t=X-5Bs1oWNjmbTASp2T82DA) to understand why.

This example mimics the great [Stealthdrop](https://github.com/stealthdrop/stealthdrop) example, while massively reducing the complexity of the circuit, proving time, resources, and improving readability.

## How to run

Just clone the repo, run `yarn` and `yarn test`. It currently has two tests: a happy path and a sad path.

## How does it work

In the `circuits` folder you'll find a circuit, roughtly divided in four steps:

- Step 1 - Recover the address: Verify ECDSA signature and recover the address. Initially I implemented this by myself, but then found the amazing `ecrecover` library by [Colin](https://github.com/colinnielsen/ecrecover-noir) already provided a module for this. In this step, we prove that the verification of the provided (private) signature was made with the private key that is elligible to claim the airdrop. We also recover the elligible address from it.
- Step 2 - Prevent double-claims: We prove that the nullifier that will be stored in the contract is hash of the signature.
- Step 3 - Prove elligibility: We prove that the address is part of the merkle tree of elligible accounts.
- Step 4 - Allow claimer to claim the airdrop: We prove that the claimer address is the msg.sender

Each step is roughly two lines of code.
