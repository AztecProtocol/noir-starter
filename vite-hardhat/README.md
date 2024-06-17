# Noir with Vite and Hardhat

[![Netlify Status](https://api.netlify.com/api/v1/badges/e4bd1ebc-6be1-4ed2-8be8-18f70382ae22/deploy-status)](https://app.netlify.com/sites/noir-vite-hardhat/deploys)

This example uses [Vite](https://vite.dev/) as the frontend framework, and
[Hardhat](https://hardhat.org/) to deploy and test.

## Getting Started

Want to get started in a pinch? Start your project in a free Github Codespace!

[![Start your project in a free Github Codespace!](https://github.com/codespaces/badge.svg)](https://codespaces.new/noir-lang/noir-starter/tree/main)

In the meantime, follow these simple steps to work on your own machine:

1. Install your favorite package manager. We'll use [bun](https://bun.sh/docs/installation) but feel free to use `yarn` or others:

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Install dependencies:

   ```bash
   bun i # "npm i" or "yarn"
   ```

3. Run the app with a development Ethereum node

   ```bash
   bunx hardhat dev node # "npx hardhat dev node" or "yarn hardhat dev node
   ```

### Local development

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

### Testnets

The default scripting targets a local environment run with `hardhat`. For convenience, we added some configurations for deployment on various testnets. You can see the existing list by running:

```bash
bunx hardhat vars setup
```

If you want to deploy on any of them, just pass in a private key, for example for the holesky network:

```bash
bunx hardhat vars set holesky <your_testnet_private_key> 
```

You can then deploy on that network by passing the `--network` flag:

```bash
bunx hardhat dev --network holesky
```

Feel free to add more networks, just make sure you:

- Have (testnet) funds in these accounts
- Add their configuration in the `networks` property in `hardhat.config.cts`

### Deployment

As you may have guessed, this example runs completely on the client side as a static website. To build it, run:

```bash
bunx hardhat build # add --network <your network> if you want to
```

You can then preview the final page with:

```bash
bunx hardhat serve
```
