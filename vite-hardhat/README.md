# Noir with Vite and Hardhat

[![Netlify Status](https://api.netlify.com/api/v1/badges/e4bd1ebc-6be1-4ed2-8be8-18f70382ae22/deploy-status)](https://app.netlify.com/sites/noir-vite-hardhat/deploys)

This example uses [Vite](https://vite.dev/) as the frontend framework, and
[Hardhat](https://hardhat.org/) to deploy and test.

## Getting Started

Want to get started in a pinch? Start your project in a free Github Codespace!

[![Start your project in a free Github Codespace!](https://github.com/codespaces/badge.svg)](https://codespaces.new/noir-lang/noir-starter/tree/main)

## Locally

1. Install your favorite package manager. We'll use [bun](https://bun.sh/docs/installation) but feel
   free to use `yarn` or others:

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Install dependencies:

   ```bash
   bun i # "npm i" or "yarn"
   ```

3. Run the app

You can run a separate Ethereum node from the dev environment:

```bash
bunx hardhat node
```

and run the dev environment separately:

```bash
bunx hardhat dev
```

### Testing

You can run the [example test file](./test/index.test.ts) with

```bash
bun test
```

This test shows the basic usage of Noir in a TypeScript Node.js environment.

> [!NOTE] The test is a script, not an executable (we're running `bun test` or `yarn test` instead
> of `bunx` or `npx`). This is because the test runs its own network and executables.

### Deploying on other networks

The default scripting targets a local environment. For convenience, we added some configurations for
deployment on various other networks. You can see the existing list by running:

```bash
bunx hardhat vars setup
```

If you want to deploy on any of them, just pass in a private key, for example for the holesky
network:

```bash
bunx hardhat vars set holesky <your_testnet_private_key>
```

You can then run all the commands using that network by passing the `--network` flag. For example:

```bash
bunx hardhat dev --network holesky # deploys and runs a development server on holesky
bunx hardhat deploy --network holesky # deploys on holesky
bunx hardhat build --network holesky # builds the frontend with the holesky target
```

Feel free to add more networks, as long as they're supported by `wagmi`
([list here](https://wagmi.sh/react/api/chains#available-chains)). Just make sure you:

- Have funds in these accounts
- Add their configuration in the `networks` property in `hardhat.config.cts`
- Use the name that wagmi expects (for example `ethereum` won't work, as `wagmi` calls it `mainnet`)

#### Attaching to an existing contract

You probably don't want to redeploy everytime you build your project. To attach the build to an
already deployed contract, pass the `--attach` flag:

```bash
bunx hardhat deploy --network mainnet # deploys on ethereum mainnet $$$$$!
bunx hardhat dev --network mainnet --attach 0x<yourethereumcontract> # you're now developing using an existing verifier contract
```
