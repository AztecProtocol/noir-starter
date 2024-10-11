#!/usr/bin/env node
import { Command } from 'commander';
import select from '@inquirer/select';
import input from '@inquirer/input';
const program = new Command();
import tiged from 'tiged';

program.action(async () => {
  const appType = await select({
    message: 'Please choose an option:',
    choices: [
      { value: 'vite-hardhat', name: 'Browser App using Vite' },
      { value: 'with-foundry', name: 'Solidity App using Foundry' },
    ],
  });

  console.log(`You chose: ${appType}`);

  const appName = await input({
    message: 'Your app name:',
    default: 'my-noir-app',
  });

  const emitter = tiged(`noir-lang/noir-starter/${appType}`, {
    disableCache: true,
    force: true,
    verbose: true,
  });

  emitter.on('info', info => {
    console.log(info.message);
  });

  emitter.clone(`./${appName}`).then(() => {
    console.log('done');
  });
});

program.parse();
