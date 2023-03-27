import { writeFileSync, readFileSync, unlinkSync, rmdirSync, existsSync } from 'fs';
import { opendir } from 'node:fs/promises';
import { ethers } from 'hardhat';
import generateCaptcha from './genCaptchas';
import { readFile, rm, rmdir } from 'fs/promises';
import path from 'path';
const ipfsClient = require('ipfs-http-client');

async function main() {
  const Verifier = await ethers.getContractFactory('TurboVerifier');
  const verifier = await Verifier.deploy();

  const verifierAddr = await verifier.deployed();

  const Game = await ethers.getContractFactory('Waldo');
  const game = await Game.deploy(verifierAddr.address);

  if (process.env.NODE_ENV !== 'production') {
    let captchas: any = [];
    for (let i = 0; i < (process.env.CAPTCHAS_NUMBER as unknown as number); i++) {
      captchas.push(generateCaptcha());
    }
    captchas = await Promise.all(captchas);

    const projectId = process.env.IPFS_PROJECT_ID;
    const projectSecret = process.env.IPFS_PROJECT_SECRET;

    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

    const client = ipfsClient.create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth,
      },
    });

    captchas.reduce(
      (obj: any, item: any) => Object.assign(obj, { [item.key]: item.solutionHash }),
      {},
    );

    for await (const _ of client.pin.rmAll(client.pin.ls({ type: 'recursive' }))) {
    }

    if (existsSync(path.join(__dirname, '../tmp'))) {
      opendir('tmp')
        .then(async () => {
          for await (const captcha of captchas) {
            const file = await readFile(`tmp/${captcha.key}.bmp`);
            const results = await client.add(file);
            await game.addPuzzle(results.path, captcha.solutionHash);
          }
        })
        .then(async () => {
          await rm('tmp', { recursive: true });
        });
    }
  }

  const config = {
    chainId: ethers.provider.network.chainId,
    verifier: verifierAddr.address,
    game: game.address,
  };

  console.log('Config', config);
  writeFileSync('utils/addresses.json', JSON.stringify(config), { flag: 'w' });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
