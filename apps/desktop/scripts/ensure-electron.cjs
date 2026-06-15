const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function log(message) {
  process.stdout.write(`[ensure-electron] ${message}\n`);
}

function resolveElectronInstallScript() {
  const electronEntry = require.resolve('electron');
  return path.join(path.dirname(electronEntry), 'install.js');
}

function canLoadElectron() {
  try {
    require('electron');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      log(`Electron binary unavailable: ${error.message}`);
    }
    return false;
  }
}

function runElectronInstaller() {
  const installScript = resolveElectronInstallScript();

  if (!fs.existsSync(installScript)) {
    throw new Error(`Electron installer script not found: ${installScript}`);
  }

  log('Downloading Electron binary...');
  const result = spawnSync(process.execPath, [installScript], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(
      'Electron installer failed. Check network access, then rerun "pnpm --filter @zzz/desktop repair-electron".',
    );
  }
}

function main() {
  if (canLoadElectron()) {
    log('Electron binary is ready.');
    return;
  }

  runElectronInstaller();

  if (!canLoadElectron()) {
    throw new Error(
      'Electron still cannot be loaded after repair. Delete node_modules/electron and reinstall dependencies.',
    );
  }

  log('Electron binary repaired successfully.');
}

main();
