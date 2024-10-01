#!/usr/bin/env node
import { Command, Option } from 'commander';
import select from '@inquirer/select';
import input from '@inquirer/input';
import shelljs from 'shelljs';
const program = new Command();
import tiged from 'tiged';
import { sourceShellConfig, exec, installInstallers } from './bin/shell.js';
import ora from 'ora';
import logSymbols from 'log-symbols';
import { getBbVersion } from './bin/versions.js';
import { execSync } from 'child_process';

const spinner = ora({ color: 'blue', discardStdin: false });

program
  .command('install', { isDefault: true })
  .description('Installs compatible versions of Noir and Barretenberg.')
  .addOption(
    new Option(
      '-n --nightly',
      'Install the nightly version of Noir and the compatible version of Barretenberg',
    ).conflicts('version'),
  )
  .option(
    '-v, --version <version>',
    'Install a specific version of Noir and the compatible version of Barretenberg',
  )
  .hook('preAction', () => {
    installInstallers();
  })
  .action(async ({ nightly, version }) => {
    try {
      spinner.start(
        `Installing nargo ${nightly ? 'nightly' : version ? `version ${version}` : 'stable'}`,
      );
      exec(`noirup ${nightly ? '-n' : version ? `-v ${version}` : ''}`);
      sourceShellConfig();
      const output = exec('nargo --version');
      const nargoVersion = output.match(/nargo version = (\d+\.\d+\.\d+)/)!;
      spinner.succeed(`Installed nargo version ${nargoVersion[1]}`);

      spinner.start(`Getting compatible barretenberg version`);
      const compatibleVersion = await getBbVersion(nargoVersion[1]);
      exec(`bbup -v ${compatibleVersion}`);
      const bbVersion = exec('bb --version');
      spinner.text = `Installed barretenberg version ${bbVersion}`;
      spinner.succeed();
    } catch (error) {
      spinner.fail(`Error installing Noir and Barretenberg`);
      throw error;
    }
  });

program
  .command('new')
  .description('Bootstraps a ready-to-go Noir project with Noir and Barretenberg')
  .option('-v, --verbose', 'Show verbose output')
  .option('-f, --force', 'Force overwriting existing files')
  .action(async ({ verbose, force }) => {
    const appType = await select({
      message: 'Please choose an option:',
      choices: [
        { value: 'vite-hardhat', name: 'Browser App using Vite' },
        { value: 'with-foundry', name: 'Solidity App using Foundry' },
      ],
    });

    const appName = await input({
      message: 'Your app name:',
      default: 'my-noir-app',
    });

    spinner.start(`Bootstrapping ${appType}`);
    const emitter = tiged(`noir-lang/noir-starter/${appType}`, {
      disableCache: true,
      force,
      verbose,
    });

    emitter.on('info', info => {
      verbose && spinner.info(info.message);
    });

    emitter.clone(`./${appName}`).then(() => {
      spinner.succeed(`Bootstrapped ${appType} at ${appName}`);
    });
  });

program.parse();
