const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function log(message) {
  process.stdout.write(`[ensure-better-sqlite3] ${message}\n`);
}

function resolvePackageDirectory(packageName) {
  const packageJsonPath = require.resolve(`${packageName}/package.json`);
  return path.dirname(packageJsonPath);
}

function canLoadBetterSqlite3InNode() {
  try {
    require('better-sqlite3');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      log(`Node binding unavailable: ${error.message}`);
    }
    return false;
  }
}

function runNodePrebuildInstall() {
  const packageDirectory = resolvePackageDirectory('better-sqlite3');
  const prebuildInstallScript = path.join(
    packageDirectory,
    'node_modules',
    'prebuild-install',
    'bin.js',
  );

  if (!fs.existsSync(prebuildInstallScript)) {
    throw new Error(`prebuild-install not found: ${prebuildInstallScript}`);
  }

  log('Downloading Node native binding for better-sqlite3...');
  const result = spawnSync(process.execPath, [prebuildInstallScript], {
    cwd: packageDirectory,
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_build_from_source: 'false',
    },
  });

  if (result.status !== 0) {
    throw new Error(
      'better-sqlite3 Node installer failed. Check network/build tools, then rerun "pnpm --filter @zzz/desktop repair-sqlite".',
    );
  }
}

function resolveElectronBinary() {
  const electronBinary = require('electron');

  if (typeof electronBinary !== 'string' || electronBinary.length === 0) {
    throw new Error('Unable to resolve Electron executable path.');
  }

  return electronBinary;
}

function resolveElectronVersion() {
  const electronPackageJsonPath = require.resolve('electron/package.json');
  const electronPackage = JSON.parse(
    fs.readFileSync(electronPackageJsonPath, 'utf8'),
  );

  if (typeof electronPackage.version !== 'string' || !electronPackage.version) {
    throw new Error('Unable to resolve Electron version.');
  }

  return electronPackage.version;
}

function resolveElectronRebuildCli() {
  const rebuildPackageJsonPath = require.resolve('@electron/rebuild/package.json');
  const rebuildPackageDirectory = path.dirname(rebuildPackageJsonPath);
  const rebuildPackage = JSON.parse(
    fs.readFileSync(rebuildPackageJsonPath, 'utf8'),
  );
  const cliRelativePath =
    typeof rebuildPackage.bin === 'string'
      ? rebuildPackage.bin
      : rebuildPackage.bin?.['electron-rebuild'];

  if (typeof cliRelativePath !== 'string' || !cliRelativePath) {
    throw new Error('Unable to resolve @electron/rebuild CLI path.');
  }

  return path.join(rebuildPackageDirectory, cliRelativePath);
}

function runElectronRebuild() {
  const electronBinary = resolveElectronBinary();
  const electronVersion = resolveElectronVersion();
  const rebuildCli = resolveElectronRebuildCli();
  const desktopDirectory = path.resolve(__dirname, '..');

  log(`Rebuilding better-sqlite3 for Electron ${electronVersion}...`);
  const result = spawnSync(
    process.execPath,
    [
      rebuildCli,
      '--force',
      '--only',
      'better-sqlite3',
      '--module-dir',
      desktopDirectory,
      '--electron-prebuilt-dir',
      path.dirname(electronBinary),
      '--version',
      electronVersion,
    ],
    {
      cwd: desktopDirectory,
      stdio: 'inherit',
      env: process.env,
    },
  );

  if (result.status !== 0) {
    throw new Error(
      'Electron rebuild for better-sqlite3 failed. Install Visual Studio Build Tools if source build is required, then rerun "pnpm --filter @zzz/desktop repair-sqlite".',
    );
  }
}

function main() {
  if (!canLoadBetterSqlite3InNode()) {
    runNodePrebuildInstall();

    if (!canLoadBetterSqlite3InNode()) {
      throw new Error(
        'better-sqlite3 still cannot be loaded in Node after repair. Reinstall dependencies or rebuild the package.',
      );
    }
  }

  runElectronRebuild();
  log('better-sqlite3 runtime repair completed for Electron.');
}

main();
