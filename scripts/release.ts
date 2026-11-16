#!/usr/bin/env bun
/**
 * scripts/release.ts
 *
 * Local release helper for Noor Al-Quran.
 *
 * Usage:
 *   bun run scripts/release.ts [patch|minor|major|current|<x.y.z>] [options]
 *
 * Options:
 *   --prerelease     Mark GitHub release as pre-release
 *   --draft          Create GitHub release as draft
 *   --no-web         Skip web deploy
 *   --no-desktop     Skip desktop build
 *   --no-android     Skip Android build
 *   --dry-run        Show what would happen without executing git/gh commands
 *   --help, -h       Show this help message
 *
 * Examples:
 *   bun run scripts/release.ts current        ← release whatever version is already in package.json (agent already bumped it)
 *   bun run scripts/release.ts patch          ← bump patch, then release
 *   bun run scripts/release.ts minor --prerelease
 *   bun run scripts/release.ts 2.0.0 --draft --no-android
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dir, "..");

function run(cmd: string, dry = false): string {
  if (dry) {
    console.log(`  [dry-run] $ ${cmd}`);
    return "";
  }
  return execSync(cmd, { cwd: ROOT, stdio: ["inherit", "pipe", "inherit"] })
    .toString()
    .trim();
}

function readPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
  return pkg.version as string;
}

function writePackageVersion(version: string): void {
  const pkgPath = resolve(ROOT, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

function semverBump(current: string, bump: "patch" | "minor" | "major"): string {
  const parts = current.split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid semver: ${current}`);
  }
  const [maj, min, pat] = parts;
  switch (bump) {
    case "major": return `${maj + 1}.0.0`;
    case "minor": return `${maj}.${min + 1}.0`;
    case "patch": return `${maj}.${min}.${pat + 1}`;
  }
}

function isValidSemver(v: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(v);
}

function printHelp(): void {
  console.log(`
Noor Al-Quran — Local Release Script
======================================
Usage: bun run scripts/release.ts [patch|minor|major|<x.y.z>] [options]

Arguments:
  patch          Bump patch version  (1.2.3 → 1.2.4)
  minor          Bump minor version  (1.2.3 → 1.3.0)
  major          Bump major version  (1.2.3 → 2.0.0)
  current        Tag & release the version already in package.json (no bump — use this when the agent already updated it)
  <x.y.z>        Use an explicit version number

Options:
  --prerelease   Mark GitHub release as pre-release
  --draft        Create GitHub release as draft
  --no-web       Skip web deploy
  --no-desktop   Skip desktop build
  --no-android   Skip Android build
  --dry-run      Simulate without executing git or gh commands
  --help, -h     Show this message
`);
}

// ─── Parse args ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

const dry        = args.includes("--dry-run");
const yes        = args.includes("--yes") || args.includes("-y");
const prerelease = args.includes("--prerelease");
const draft      = args.includes("--draft");
const noWeb      = args.includes("--no-web");
const noDesktop  = args.includes("--no-desktop");
const noAndroid  = args.includes("--no-android");

const bumpArg = args.find(a => !a.startsWith("--"));

if (!bumpArg) {
  console.error("❌  Please supply a bump type: patch | minor | major | current | <x.y.z>");
  printHelp();
  process.exit(1);
}

// ─── Compute new version ──────────────────────────────────────────────────────

const currentVersion = readPackageVersion();
let newVersion: string;
let versionBumped = true;

if (bumpArg === "current") {
  // Agent already bumped the version — just tag and release as-is
  newVersion = currentVersion;
  versionBumped = false;
} else if (bumpArg === "patch" || bumpArg === "minor" || bumpArg === "major") {
  newVersion = semverBump(currentVersion, bumpArg);
} else if (isValidSemver(bumpArg)) {
  newVersion = bumpArg;
} else {
  console.error(`❌  Invalid argument: "${bumpArg}". Must be patch/minor/major/current or x.y.z`);
  process.exit(1);
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`
╔══════════════════════════════════════════════╗
║        Noor Al-Quran Release Script          ║
╠══════════════════════════════════════════════╣
║  Current version : ${currentVersion.padEnd(26)}║
║  New version     : ${newVersion.padEnd(26)}║
║  Pre-release     : ${String(prerelease).padEnd(26)}║
║  Draft           : ${String(draft).padEnd(26)}║
║  Build web       : ${String(!noWeb).padEnd(26)}║
║  Build desktop   : ${String(!noDesktop).padEnd(26)}║
║  Build android   : ${String(!noAndroid).padEnd(26)}║
║  Dry run         : ${String(dry).padEnd(26)}║
╚══════════════════════════════════════════════╝
`);

if (!dry && !yes) {
  const readline = require("readline").createInterface({
    input: process.stdin, output: process.stdout,
  });
  await new Promise<void>((resolve, reject) => {
    readline.question("Proceed? [y/N] ", (ans: string) => {
      readline.close();
      if (ans.trim().toLowerCase() === "y") resolve();
      else { console.log("Aborted."); process.exit(0); }
    });
  });
}

// ─── Step 1: Update package.json ─────────────────────────────────────────────

console.log(`\n[1/5] ✏️  ${versionBumped ? `Bumping version: ${currentVersion} → ${newVersion}` : `Keeping current version: ${newVersion} (no bump)`}`);
if (!dry && versionBumped) {
  writePackageVersion(newVersion);
}

// ─── Step 2: Sync version to Tauri config files ───────────────────────────────

console.log(`[2/5] 🔄  Running version:sync...`);
run("bun run version:sync", dry);

// ─── Step 3: Git commit & tag ─────────────────────────────────────────────────

console.log(`[3/5] 📦  Committing & tagging v${newVersion}...`);
run(`git add -A`, dry);
try {
  run(`git commit -m "chore: release v${newVersion}"`, dry);
} catch {
  console.log("  (Working tree already clean, proceeding)");
}

try {
  run("git fetch origin", dry);
  run("git rebase origin/main", dry);
} catch {
  // Continue if rebase fails or already synced
}

try {
  run(`git tag -a "v${newVersion}" -m "Release v${newVersion}"`, dry);
} catch {
  console.log(`  (Tag v${newVersion} exists, updating tag pointer)`);
  run(`git tag -d "v${newVersion}"`, dry);
  run(`git tag -a "v${newVersion}" -m "Release v${newVersion}"`, dry);
}

// ─── Step 4: Push ─────────────────────────────────────────────────────────────

console.log(`[4/5] 🚀  Pushing to GitHub (main + tags)...`);
run(`git push origin main --follow-tags`, dry);

// ─── Step 5: Verify GitHub Actions Workflow ───────────────────────────────────

console.log(`[5/5] ⚙️  Release pipeline triggered on GitHub Actions!`);
console.log(`  The '🚀 Release — Noor Al-Quran' workflow was automatically triggered by the v${newVersion} tag push.`);

// ─── Done ─────────────────────────────────────────────────────────────────────

let repoUrl = "";
try {
  const remote = run("git remote get-url origin", false);
  repoUrl = remote
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/\.git$/, "");
} catch {
  repoUrl = "https://github.com/<your-repo>";
}

console.log(`
✅  Release v${newVersion} triggered successfully!

🔗  GitHub Release  : ${repoUrl}/releases/tag/v${newVersion}
🔗  Actions Run     : ${repoUrl}/actions
🔗  Release Notes   : ${repoUrl}/releases

${dry ? "⚠️  DRY RUN — no changes were actually made." : ""}
`);
