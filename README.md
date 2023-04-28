# Noir Starter

This is a reference repo to help you get started with writing zero-knowledge circuits with Noir.

The root of the project is a [Next.js](https://nextjs.org/) + [Hardhat](https://hardhat.org/)
project.

## Getting Started

1. Install dependencies with

```bash
npm i
```

The `package-lock.json` defines specific versions of the `@noir-lang` packages that are compatible.
Noir is being actively developed, so the latest versions of various packages are often incompatible
with each other.

2. Write circuits in `./circuits/src`.

You can read more about writing circuits in Noir on the [Noir docs](https://noir-lang.org/).

3. Create the verifier contract

You can create the Solidity verifier contract in two ways.

- natively by navigating to the `.circuits/` directory and running `nargo codegen-verifier`. If you
  generate the verifier contract via this method, you may need to copy the file created at
  `./circuits/contract/plonk_vk.sol` to the hardhat contract directory at `./contract`.
- with wasm by running the `genContract.ts` script:

```bash
npx ts-node scripts/genContract.ts
```

4. Create proofs

**Natively**

In `./circuits`:

- Compile your circuits if you haven't already with `nargo compile <CIRCUIT_NAME>`.
- Populate the inputs in `Prover.toml`
- Generate proof with `nargo prove <proof_name>`

**With Typescript and WASM**

- See the example in [`./components/component.tsx`](./components/component.tsx)

5. Verify proofs

**Natively**

In `./circuits`:

- Verify proof with `nargo verify <proof_name>`

**With Typescript and WASM**

- See the example in [`./components/component.tsx`](./components/component.tsx)
