import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getAppTargets() {
  const names = new Set<string>();
  let identifier = '';

  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name) names.add(String(pkg.name));
      if (pkg.displayName) names.add(String(pkg.displayName));
    } catch {}
  }

  const tauriConfPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
  if (fs.existsSync(tauriConfPath)) {
    try {
      const conf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
      const prod = conf.productName || conf.package?.productName;
      if (prod) names.add(String(prod));
      if (conf.identifier) identifier = String(conf.identifier);
    } catch {}
  }

  const cargoPath = path.join(rootDir, 'src-tauri', 'Cargo.toml');
  if (fs.existsSync(cargoPath)) {
    try {
      const cargo = fs.readFileSync(cargoPath, 'utf8');
      const binMatch = cargo.match(/\[\[bin\]\][\s\S]*?name\s*=\s*"([^"]+)"/);
      const pkgMatch = cargo.match(/\[package\][\s\S]*?name\s*=\s*"([^"]+)"/);
      if (binMatch?.[1]) names.add(binMatch[1]);
      if (pkgMatch?.[1]) names.add(pkgMatch[1]);
    } catch {}
  }

  return { names: Array.from(names).filter(Boolean), identifier };
}

if (process.platform === 'win32') {
  try {
    const { names, identifier } = getAppTargets();
    const currentPid = process.pid;
    const escapedNames = names.map((n) => n.replace(/'/g, "''"));
    const nameList = escapedNames.map((n) => `'${n}'`).join(', ');

    const commands: string[] = [];
    if (nameList) {
      commands.push(
        `Get-Process -Name ${nameList} -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne ${currentPid} } | Stop-Process -Force -ErrorAction SilentlyContinue`
      );
    }
    if (identifier) {
      const safeId = identifier.replace(/'/g, "''");
      commands.push(
        `Get-CimInstance Win32_Process -Filter "Name = 'msedgewebview2.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*${safeId}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`
      );
    }

    if (commands.length > 0) {
      execSync(`powershell -NoProfile -Command "${commands.join('; ')}"`, { stdio: 'ignore' });
    }
  } catch {
    // No running processes or safe to continue
  }
}
