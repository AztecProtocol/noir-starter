# deCAPTCHA

Let me tell you a story, young padawan. There was a guy once that asked me to verify someone was playing a game and wasn't just a bot pretending to be playing. Use a CAPTCHA, he told me. Put the CAPTCHA on the blockchain, he told me. We'll have an ICO, he told me. You'll be rich, he told me.

Unfortunately I can't just ask a gamer "guess what number I'm thinking" while posting that number to a global network of public information. So that didn't work. That's why I'm still poor.

## Enter zk-proofs

This is a classic zk-proof situation.

![what if I told you zk-proof solve this](https://i.imgflip.com/7fu060.jpg)

## How does this work

The circuit itself is just a simple sha256 hash. If you thought I had the skills for something more complex, you were probably wrong.

Basically your browser uses a private number (the solution for the captcha) and the public hash for the solution, to generate a zk-proof. You send the proof on-chain, it says "yea" or "nay".

## How can I deploy this

First of all, put your stuff on the .env file. We're using a bunch of services to make our lives easier. But feel free to run your own nodes.

- Alchemy - A dead easy node to just send transactions and get info from the chain. I should use Infura because I'm doing it already for the IPFS. I'll refactor someday.
- Infura - We're uploading the CAPTCHA images to IPFS for the ultimate decentralization.
- Mumbai testnet - I just happen to have some Mumbai MATIC so I chose this network for testing

### Ok what now

Now you should be able to just run `npm run deploy:local`, assuming you're also running a localhost node with `npx hardhat node`. You can deploy to mumbai with the `npm run deploy:mumbai`.

This script does a few things:

1. Generates a verifier contract from the circuit inside the `src` folder
2. Deploys the verifier contract
3. Deploys the game contract
4. Generates the number of captchas set in CAPTCHAS_NUMBER env variable, then:
   1. Uploads the images themselves to IPFS and pins them in your Infura node
   2. Calculates the solution hashes from the solutions
   3. Sends both the CID of the images and the hashes to the game contract
5. Writes some useful stuff for your frontend in a JSON file
6. Drops the mic and exits

You should have the thing running. Now you just need to play the game. Run `npm run dev` (build and deployment incoming, wait wait) and hit `localhost:3000`.

You should have the best-looking website in the word. Hit a wrong answer, the proof will fail. Hit a correct answer, the proof will succeed and will be verified on-chain.

![success meme](https://i.imgflip.com/7ftzv6.jpg)

## It looks pretty shitty, can I improve it?

Of course. In the end, as long as you can translate something into an array of uints (a string, a set of coordinates, etc), feel free to remix this. Just let me know if you need any help
