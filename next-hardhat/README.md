# Noir with Next and Hardhat

[![Netlify Status](https://api.netlify.com/api/v1/badges/e4bd1ebc-6be1-4ed2-8be8-18f70382ae22/deploy-status)](https://app.netlify.com/sites/noir-next-hardhat/deploys)

This example uses [Next.js](https://nextjs.org/) as the frontend framework, and
[Hardhat](https://hardhat.org/) to deploy and test.

It also features multiple files and different entry points by resolving multiple files and using the
`entry_point` parameter to the `compile` function.

## Getting Started

1. Install [yarn](https://yarnpkg.com/) (tested on yarn v1.22.19)

2. Install [Node.js ≥v18](https://nodejs.org/en) (tested on v18.17.0)

3. Install [noirup](https://noir-lang.org/getting_started/nargo_installation/#option-1-noirup) with

   ```bash
   curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
   ```

4. Install Nargo v0.17.0 with

   ```bash
   noirup -v 0.17.0
   ```

If you had a lower version of `nargo` installed previously and are running into errors when
compiling, you may need to uninstall it, instructions
[here](https://noir-lang.org/getting_started/nargo_installation#uninstalling-nargo).

5. Install dependencies with

   ```bash
   yarn
   ```

6. Navigate to the circuits directory with

   ```bash
   cd circuits
   ```

7. Write your Noir program in `./circuits/src`.

   > **Note:** You can read more about writing Noir programs in the
   > [Noir docs](https://noir-lang.org/).

8. Generate the verifier contract with

   ```bash
   nargo codegen-verifier
   ```

9. Compile your Noir program with

   ```bash
   nargo compile
   ```

10. Navigate back into the _next-hardhat_ directory with

    ```bash
    cd ..
    ```

## Test locally

1. Copy `next-hardhat/.env.example` to a new file `next-hardhat/.env`.

2. Start a local development EVM at <http://localhost:8545> with

   ```bash
   npx hardhat node
   ```

   or if foundry is preferred, with

   ```bash
   anvil
   ```

3. Run the [example test file](./test/index.test.ts) with

   ```bash
   yarn test
   ```

The test demonstrates basic usage of Noir in a TypeScript Node.js environment.

## Deploy locally

1. Copy `next-hardhat/.env.example` to a new file `next-hardhat/.env`.

2. Start a local development EVM at <http://localhost:8545> with

   ```bash
   npx hardhat node
   ```

   or if foundry is preferred, with

   ```bash
   anvil
   ```

3. Build the project and deploy contracts to the local development chain with

   ```bash
   NETWORK=localhost yarn build
   ```

   > **Note:** If the deployment fails, try removing `yarn.lock` and reinstalling dependencies with
   > `yarn`.

4. Once your contracts are deployed and the build is finished, start the web app with

   ```bash
   yarn start
   ```

## Deploy on networks

You can choose any other network in `hardhat.config.ts` and deploy there using this `NETWORK`
environment variable.

For example, `NETWORK=mumbai yarn build` or `NETWORK=sepolia yarn build`.

Make sure you:

- Update the deployer private keys in `next-hardhat/.env`
- Have funds in the deployer account
- Add keys for alchemy (to act as a node) in `next-hardhat/.env`

Feel free to contribute with other networks in `hardhat.config.ts`
