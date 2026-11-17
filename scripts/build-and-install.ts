import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isSilent = process.argv.includes('--silent') || process.argv.includes('-s');
const isInstallOnly = process.argv.includes('--install-only') || process.argv.includes('-i');
const isBuildOnly = process.argv.includes('--build-only') || process.argv.includes('-b');

// Read package.json
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;
const appName = pkg.name || 'noor-al-quran';

// Detect Product Name and Binary Name from tauri.conf.json / Cargo.toml
let productName = 'Noor Al-Quran';
let binaryName = 'noor-al-quran';

const tauriConfPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
if (fs.existsSync(tauriConfPath)) {
  try {
    const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
    productName = tauriConf.productName || tauriConf.package?.productName || productName;
  } catch {}
}

const cargoTomlPath = path.join(rootDir, 'src-tauri', 'Cargo.toml');
if (fs.existsSync(cargoTomlPath)) {
  try {
    const cargo = fs.readFileSync(cargoTomlPath, 'utf8');
    const binMatch = cargo.match(/\[\[bin\]\][\s\S]*?name\s*=\s*"([^"]+)"/);
    const pkgMatch = cargo.match(/\[package\][\s\S]*?name\s*=\s*"([^"]+)"/);
    binaryName = binMatch?.[1] || pkgMatch?.[1] || binaryName;
  } catch {}
}

console.log('====================================================');
console.log(`🚀 ${productName} (v${version}): Build & Install Pipeline`);
console.log('====================================================');
if (isInstallOnly) console.log('Mode: Install Only (skipping build)');
else if (isBuildOnly) console.log('Mode: Build Only (skipping installation)');
else console.log('Mode: Full Build & Install');
console.log('----------------------------------------------------');

function run(cmd: string, description: string) {
  console.log(`\n▶ [${description}] ${cmd}`);
  execSync(cmd, { cwd: rootDir, stdio: 'inherit' });
}

// Step 1: Version Sync (if building)
if (!isInstallOnly) {
  console.log('\n[1/5] Synchronizing project version across manifests...');
  if (fs.existsSync(path.join(rootDir, 'scripts', 'sync-version.ts'))) {
    run('bun run scripts/sync-version.ts', 'Sync Version');
  } else if (pkg.scripts?.['version:sync']) {
    run('bun run version:sync', 'Sync Version');
  }
}

// Step 2: Clean Stale Locks & Stop Running Processes
console.log('\n[2/5] Stopping any running app instances...');
const stopNames = Array.from(new Set([binaryName, productName, 'noor-al-quran'])).filter(Boolean);
const stopNamesStr = stopNames.map((n) => `'${n}'`).join(', ');
try {
  execSync(
    `powershell -NoProfile -Command "Stop-Process -Name ${stopNamesStr} -Force -ErrorAction SilentlyContinue"`,
    { stdio: 'ignore' }
  );
} catch {}

// Step 3: Build Production Bundle
if (!isInstallOnly) {
  console.log(`\n[3/5] Building release binary & NSIS installer for v${version}...`);
  run('bun run tauri build --bundles nsis', 'Tauri Build');
}

// Step 4: Verify & Locate Installer
console.log('\n[4/5] Verifying installer bundle output...');
const searchDirs = [
  path.join(rootDir, 'src-tauri', 'target', 'release', 'bundle', 'nsis'),
  path.join(rootDir, 'release'),
  path.join(rootDir, 'src-tauri', 'target', 'release', 'bundle', 'msi')
];

interface InstallerCandidate {
  path: string;
  name: string;
  mtime: number;
  size: number;
}
const candidates: InstallerCandidate[] = [];

for (const dir of searchDirs) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if ((file.endsWith('.exe') || file.endsWith('.msi')) && !file.toLowerCase().includes('portable') && !file.endsWith('.pdb')) {
        const fullPath = path.join(dir, file);
        try {
          const stats = fs.statSync(fullPath);
          candidates.push({
            path: fullPath,
            name: file,
            mtime: stats.mtimeMs,
            size: stats.size
          });
        } catch {}
      }
    }
  }
}

if (candidates.length === 0) {
  console.error(`❌ Error: No installer bundle found in: \n  ${searchDirs.join('\n  ')}`);
  process.exit(1);
}

candidates.sort((a, b) => {
  const aVer = a.name.includes(version) ? 1 : 0;
  const bVer = b.name.includes(version) ? 1 : 0;
  if (aVer !== bVer) return bVer - aVer;
  return b.mtime - a.mtime;
});

const targetInstaller = candidates[0].path;
console.log(`✓ Located Installer: ${targetInstaller}`);
console.log(`  File: ${path.basename(targetInstaller)}`);
console.log(`  Size: ${(candidates[0].size / (1024 * 1024)).toFixed(2)} MB`);

// Step 5: Execute Installation (if not build-only)
if (!isBuildOnly) {
  console.log('\n[5/5] Launching installation...');
  try {
    execSync(
      `powershell -NoProfile -Command "Stop-Process -Name ${stopNamesStr} -Force -ErrorAction SilentlyContinue"`,
      { stdio: 'ignore' }
    );
  } catch {}

  if (targetInstaller.endsWith('.msi')) {
    if (isSilent) {
      console.log('⚙ Running silent MSI installation (/qn)...');
      execSync(
        `powershell -NoProfile -Command "Start-Process msiexec.exe -ArgumentList '/i \`"${targetInstaller}\`" /qn' -Wait"`,
        { stdio: 'inherit' }
      );
      console.log('✓ Silent MSI installation completed successfully!');
    } else {
      console.log('🖥 Launching MSI setup wizard...');
      execSync(
        `powershell -NoProfile -Command "Start-Process msiexec.exe -ArgumentList '/i \`"${targetInstaller}\`"'"`,
        { stdio: 'inherit' }
      );
      console.log('✓ Installer launched on your desktop screen!');
    }
  } else {
    // NSIS .exe setup
    if (isSilent) {
      console.log('⚙ Running silent NSIS installation (/S)...');
      execSync(
        `powershell -NoProfile -Command "Start-Process -FilePath '${targetInstaller}' -ArgumentList '/S' -Wait"`,
        { stdio: 'inherit' }
      );
      console.log('✓ Silent installation completed successfully!');
    } else {
      console.log('🖥 Launching Windows setup installer...');
      execSync(
        `powershell -NoProfile -Command "Start-Process -FilePath '${targetInstaller}'"`,
        { stdio: 'inherit' }
      );
      console.log('✓ Installer launched on your desktop screen!');
    }
  }
}

console.log('\n====================================================');
console.log(`🎉 ${productName} v${version} pipeline complete!`);
console.log('====================================================\n');
