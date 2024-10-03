import { execSync } from 'child_process';
import logSymbols from 'log-symbols';
import ora from 'ora';

export function sourceShellConfig() {
  const shell = execSync('echo $SHELL', { encoding: 'utf-8' }).trim();

  if (shell.includes('bash')) {
    process.env.PATH = execSync('echo $PATH', { encoding: 'utf-8' }).trim();
  } else if (shell.includes('zsh')) {
    process.env.PATH = execSync('zsh -c "echo $PATH"', { encoding: 'utf-8' }).trim();
  } else if (shell.includes('fish')) {
    process.env.PATH = execSync('fish -c "echo $PATH"', { encoding: 'utf-8' }).trim();
  }
}

export function exec(cmd: string, options = {}) {
  return execSync(cmd, {
    encoding: 'utf-8',
    stdio: 'pipe',
    ...options,
  });
}
const spinner = ora({ color: 'blue', discardStdin: false });

export function installInstallers() {
  try {
    exec('which noirup', { stdio: 'ignore' });
    spinner.succeed('noirup is already installed');
  } catch {
    spinner.start('Installing noirup');
    exec('curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash');
    spinner.stopAndPersist({ symbol: logSymbols.success });
  }
  try {
    exec('which bbup', { stdio: 'ignore' });
    spinner.succeed('bbup is already installed');
  } catch {
    spinner.start('Installing bbup');
    exec(
      'curl -L https://raw.githubusercontent.com/AztecProtocol/aztec-packages/master/barretenberg/cpp/installation/install | bash',
    );
    spinner.stopAndPersist({ symbol: logSymbols.success });
  }
  sourceShellConfig();
}
