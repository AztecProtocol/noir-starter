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
   bun i
   ```

3. Run a node

   ```bash
   bunx hardhat node
   ```

4. Deploy the verifier contract (UltraPlonk)

   ```bash
   bun run deploy
   ```

5. Run the dev environment

   ```bash
   bun dev
   ```

### Testing

You can run the [example test file](./test/index.test.ts) with

```bash
bun run test
```

This test shows the basic usage of Noir in a TypeScript Node.js environment. It also starts its own network and deploys the verifier contract.

If you want to test only `UltraHonk`, you can run:

```bash
bun run test:uh
```

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

You can then deploy on that network by passing the `--network` flag. For example:

```bash
bunx hardhat deploy --network holesky # deploys on holesky
```

Feel free to add more networks, as long as they're supported by `wagmi`
([list here](https://wagmi.sh/react/api/chains#available-chains)). Just make sure you:

- Have funds in these accounts
- Add their configuration in the `networks` property in `hardhat.config.cts`
- Use the name that wagmi expects (for example `ethereum` won't work, as `wagmi` calls it `mainnet`)
