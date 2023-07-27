# Noir with Next and Hardhat

[![Netlify Status](https://api.netlify.com/api/v1/badges/e4bd1ebc-6be1-4ed2-8be8-18f70382ae22/deploy-status)](https://app.netlify.com/sites/spiffy-lollipop-5d763a/deploys)

This example uses [Next.js](https://nextjs.org/) as the frontend framework, and [Hardhat](https://hardhat.org/) to deploy and test.

It also features multiple files and different entry points by resolving multiple files and using the `entry_point` parameter to the `compile` function.

## Getting Started

1. Install dependencies with

```bash
yarn
```

1. Write circuits in `./circuits/src`.

You can read more about writing circuits in Noir on the [Noir docs](https://noir-lang.org/).

2. Create the verifier contract

Navigate to the `.circuits/` directory and run `nargo codegen-verifier`

3. Compile your circuit

Compile your circuits if you haven't already with `nargo compile main`.

4. Deploy

- Start a local development EVM at <http://localhost:8545>, for example with `npx hardhat node`.
- Copy `./.env.example` to `./.env` and add keys for alchemy (to act as a node) and the deployer's private key. Make sure you have funds in this account.
- Run `NETWORK=localhost yarn build` to build the project and deploy contracts to the local development chain

You can choose any other network in `hardhat.config.ts` and deploy there using this `NETWORK` environment variable. For example, `NETWORK=mumbai yarn build` or `NETWORK=sepolia yarn build`. Feel free to contribute with other networks in `hardhat.config.ts`

## Testing

There is a basic [example test file](./test/index.ts) that shows the usage of Noir in a typescript `node.js` environment.
You can run the tests with:

```sh
yarn t
```
