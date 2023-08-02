# Noir with Next and Hardhat

[![Netlify Status](https://api.netlify.com/api/v1/badges/e4bd1ebc-6be1-4ed2-8be8-18f70382ae22/deploy-status)](https://app.netlify.com/sites/spiffy-lollipop-5d763a/deploys)

This example uses [Next.js](https://nextjs.org/) as the frontend framework, and [Hardhat](https://hardhat.org/) to deploy and test.

It also features multiple files and different entry points by resolving multiple files and using the `entry_point` parameter to the `compile` function.

## Getting Started

1. [Install nargo](https://noir-lang.org/getting_started/nargo_installation#option-1-noirup) version 0.9.0 with `noirup -v 0.9.0`

2. Install dependencies with

```bash
yarn
```

3. Write circuits in `./circuits/src`.

You can read more about writing circuits in Noir on the [Noir docs](https://noir-lang.org/).

4. Create the verifier contract

Navigate to the `.circuits/` directory and run `nargo codegen-verifier`

5. Compile your circuit

Compile your circuits with `nargo compile main`.

6. Deploy

- Start a local development EVM at <http://localhost:8545>, for example with `npx hardhat node`.
- Copy `./.env.example` to `./.env` and add keys for alchemy (to act as a node) and the deployer's private key. Make sure you have funds in this account.
- Run `NETWORK=localhost yarn build` to build the project and deploy contracts to the local development chain

You can choose any other network in `hardhat.config.ts` and deploy there using this `NETWORK` environment variable. For example, `NETWORK=mumbai yarn build` or `NETWORK=sepolia yarn build`. Feel free to contribute with other networks in `hardhat.config.ts`

Once your contracts are deployed and the build is finished, start the web app with `yarn start`.

## Testing

There is a basic [example test file](./test/index.ts) that shows the usage of Noir in a typescript `node.js` environment.
You can run the tests with:

```sh
yarn test
```
