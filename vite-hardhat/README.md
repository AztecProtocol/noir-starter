# Noir with Vite and Hardhat

[![Netlify Status](https://api.netlify.com/api/v1/badges/e4bd1ebc-6be1-4ed2-8be8-18f70382ae22/deploy-status)](https://app.netlify.com/sites/noir-vite-hardhat/deploys)

This example uses [Vite](https://vite.dev/) as the frontend framework, and
[Hardhat](https://hardhat.org/) to deploy and test.

## Getting Started

Want to get started in a pinch? Start your project in a free Github Codespace!

[![Start your project in a free Github Codespace!](https://github.com/codespaces/badge.svg)](https://codespaces.new/noir-lang/noir-starter/tree/main)

In the meantime, follow these simple steps to work on your own machine:

1. Install [yarn](https://yarnpkg.com/) (tested on yarn v1.22.19)
2. Install [Node.js >20.10 (latest LTS)](https://nodejs.org/en) (tested on v18.17.0)
3. Install [noirup](https://noir-lang.org/docs/getting_started/installation/#installing-noirup) with

   ```bash
   curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
   ```

4. Install Nargo with

   ```bash
   noirup
   ```

5. Install dependencies with

   ```bash
   yarn
   ```

6. Generate the verifier contract

   ```bash
   yarn prep
   ```

### Test locally

1. Start a local development EVM at <http://localhost:8545> with

   ```bash
   npx hardhat node
   ```

   or if foundry is preferred, with

   ```bash
   anvil
   ```

2. Run the [example test file](./test/index.test.ts) with

   ```bash
   yarn test
   ```

The test demonstrates basic usage of Noir in a TypeScript Node.js environment.

### Deploy locally

1. Start a local development EVM at <http://localhost:8545> with

   ```bash
   npx hardhat node
   ```

   or if foundry is preferred, with

   ```bash
   anvil
   ```

2. Build the project and deploy contracts to the local development chain with

   ```bash
   yarn build
   ```

3. Once your contracts are deployed and the build is finished, you can preview the built website with

   ```bash
   yarn preview
   ```

### On-chain verification

The app will verify your proof locally. If you have a wallet, it will prompt you to connect to the relevant network and use it for on-chain verification.

### Deploy on testnets

For convenience, we added two configurations for deployment on various testnets. You can find them in `hardhat.config.cts`.

To deploy on these testnets, rename `.env.example` to `.env` and add your own [alchemy](https://www.alchemy.com/) keys for these networks.

Then, prepend your commands with your desired network in a `NETWORK` environment variable. For example, to deploy on sepolia:

```bash
NETWORK=sepolia yarn build`
```

Feel free to add more networks, just make sure you:

- Add deployer private keys and alchemy API keys in `.env`
- Have funds in these accounts
- Add a configuration in `hardhat.config.cts`
