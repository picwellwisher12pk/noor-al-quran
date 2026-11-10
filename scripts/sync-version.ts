import fs from "fs";
import path from "path";

const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const tauriConfPath = path.join(rootDir, "src-tauri", "tauri.conf.json");
const cargoTomlPath = path.join(rootDir, "src-tauri", "Cargo.toml");

if (!fs.existsSync(packageJsonPath)) {
  console.error("package.json not found!");
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const version = packageJson.version;

if (!version) {
  console.error("No version field found in package.json!");
  process.exit(1);
}

let modified = false;

// 1. Sync src-tauri/tauri.conf.json
if (fs.existsSync(tauriConfPath)) {
  const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf-8"));
  if (tauriConf.version !== version) {
    tauriConf.version = version;
    fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n", "utf-8");
    console.log(`[sync-version] Updated src-tauri/tauri.conf.json to v${version}`);
    modified = true;
  }
}

// 2. Sync src-tauri/Cargo.toml
if (fs.existsSync(cargoTomlPath)) {
  let cargoContent = fs.readFileSync(cargoTomlPath, "utf-8");
  const versionRegex = /^version\s*=\s*"[^"]+"/m;
  const targetLine = `version = "${version}"`;
  if (versionRegex.test(cargoContent)) {
    const currentLine = cargoContent.match(versionRegex)?.[0];
    if (currentLine !== targetLine) {
      cargoContent = cargoContent.replace(versionRegex, targetLine);
      fs.writeFileSync(cargoTomlPath, cargoContent, "utf-8");
      console.log(`[sync-version] Updated src-tauri/Cargo.toml to v${version}`);
      modified = true;
    }
  }
}

if (!modified) {
  console.log(`[sync-version] All configuration files already in sync at v${version}`);
}

