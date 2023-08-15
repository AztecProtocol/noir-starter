# Noir with Next and Hardhat

[![Netlify Status](https://api.netlify.com/api/v1/badges/e4bd1ebc-6be1-4ed2-8be8-18f70382ae22/deploy-status)](https://app.netlify.com/sites/noir-next-hardhat/deploys)

This example uses [Next.js](https://nextjs.org/) as the frontend framework, and
[Hardhat](https://hardhat.org/) to deploy and test.

It also features multiple files and different entry points by resolving multiple files and using the
`entry_point` parameter to the `compile` function.

## Getting Started

1. [Install Node.js ≥v18](https://nodejs.org/en) (tested on v18.17.0)

2. [Install noirup](https://noir-lang.org/getting_started/nargo_installation/#option-1-noirup)

3. Install Nargo with the following instructions. We are working on a stable release that is
   maintains compatibility across packages and will make it easier to install these packages.

   > 1. [Install Nix](https://noir-lang.org/getting_started/nargo_installation#installing-nix)
   >
   > 2. Install Nargo with
   >
   > ```bash
   > nix profile install github:noir-lang/noir/7d0178987641f5cb8f8e95507c54c3cc367bf7d2
   > ```

4. Install dependencies with

```bash
yarn
```

5. Write circuits in `./circuits/src`.

You can read more about writing circuits in Noir on the [Noir docs](https://noir-lang.org/).

6. Create the verifier contract

Navigate to the `.circuits/` directory and run

```bash
nargo codegen-verifier
```

7. Compile your circuit

Compile your circuits with

```bash
nargo compile
```

## Testing locally

1. Copy `./.env.example` to a new file `./.env`.

2. Start a local development EVM at <http://localhost:8545>, for example with `npx hardhat node` or
   `anvil`.

3. Run the [example test file](./test/index.test.ts) with

```sh
yarn test
```

The test demonstrates basic usage of Noir in a typescript `node.js` environment.

## Deploy locally (WIP)

1. Copy `./.env.example` to a new file `./.env`.

2. Start a local development EVM at <http://localhost:8545>, for example with `npx hardhat node` or
   `anvil`.

3. Run `NETWORK=localhost yarn build` to build the project and deploy contracts to the local
   development chain.

   If the deployment fails, try removing `yarn.lock` and reinstalling dependencies with `yarn`.

4. Once your contracts are deployed and the build is finished, start the web app with `yarn start`.

## Deploying on other networks

You can choose any other network in `hardhat.config.ts` and deploy there using this `NETWORK`
environment variable. For example, `NETWORK=mumbai yarn build` or `NETWORK=sepolia yarn build`.

Make sure you:

- Update the deployer private keys in `./.env`
- Have funds in the deployer account
- Add keys for alchemy (to act as a node) in `./.env`

Feel free to contribute with other networks in `hardhat.config.ts`
