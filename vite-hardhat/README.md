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
   bun i
   ```

3. Run a local ethereum node:

   ```bash
   bun node
   ```

4. Run the app:

   ```bash
   bun dev
   ```

### Test locally

You can run the [example test file](./test/index.test.ts) with

```bash
bun test
```

This test starts a local ethereum node and shows the basic usage of Noir in a TypeScript Node.js environment.

### Testnets

The default scripting targets a local environment run with `hardhat`. For convenience, we added some configurations for deployment on various testnets. You can find them in `hardhat.config.cts`.

To deploy on these testnets, rename `.env.example` to `.env` and add your own [alchemy](https://www.alchemy.com/) keys for these networks.

Then, prepend your commands with your desired network in a `NETWORK` environment variable. For example, to deploy on sepolia:

```bash
NETWORK=sepolia bun dev
```

Feel free to add more networks, just make sure you:

- Add deployer private keys and alchemy API keys in `.env`
- Have funds in these accounts
- Add a configuration in `hardhat.config.cts`

### Deployment

As you may have guessed, this example runs completely on the client side as a static website. To build it, run:

```bash
bun build # add NETWORK=<your network> if you want to
```

You can then preview the final page with:

```bash
bun serve
```
