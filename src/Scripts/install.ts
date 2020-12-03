//
// Not used
//

// From:
// https://github.com/apexskier/nova-extension-utils/blob/main/src/dependencyManagement.ts
// I wanted to implement it myself to see if that was causing an error

// TODO:
// - pass in a CompositeDisposable and attempt to cancel in #dispose
// - multi-workspace: wait for first instance to install before starting the server

import { fileExists, readJson, execute, writeJson } from "./utils";

interface PartialPackageLock {
  dependencies: Record<string, { version: string }>;
}

interface LockFile {
  time: number;
}

function debug(...args: any[]) {
  if (!nova.inDevMode()) return;
  console.log("[install]", ...args);
}

function installFile(file: string) {
  debug("Installing", file);

  const from = extensionPath(file);
  const to = dependenciesPath(file);

  if (fileExists(to)) {
    debug("Removing previous", file);
    nova.fs.remove(to);
  }
  nova.fs.copy(from, to);
}

function isInstalled(file: string) {
  return fileExists(dependenciesPath(file));
}

export function dependenciesPath(...paths: string[]) {
  return nova.path.join(
    nova.extension.globalStoragePath,
    "node-dependencies",
    ...paths
  );
}

function extensionPath(...paths: string[]) {
  return nova.path.join(nova.extension.path, ...paths);
}

export async function findNpmPath() {
  const { stdout, status } = await execute("/usr/bin/env", {
    args: ["which", "npm"],
  });

  return status === 0 ? stdout.trim() : null;
}

export function nodeModulesPath() {
  return dependenciesPath("node_modules");
}

export function resetDependenciesLock() {
  const path = dependenciesPath("LOCK");
  if (fileExists(path)) {
    nova.fs.remove(path);
  }
}

export function isLocked(): boolean {
  const path = dependenciesPath("LOCK");
  const lock = readJson<LockFile>(path);

  return lock != null;

  // if (lock === null) return true;
  // TODO: Return true if lock is "too old" - 30 mins?
  // const padding = 30 * 60 * 1000;
  // return lock.time + padding < Date.now();
}

export async function installDependenciesIfNeeded() {
  debug("Running installer");

  nova.fs.mkdir(dependenciesPath());

  if (isLocked()) {
    debug("skipping, lock exists");
    return;
  }

  if (!isInstalled("package.json") || !isInstalled("package-lock.json")) {
    debug("Performing a fresh install");
    await executeNpmCi();
    return;
  }

  let oldLock = readJson<PartialPackageLock>(
    dependenciesPath("package-lock.json")
  )!;
  let newLock = readJson<PartialPackageLock>(
    extensionPath("package-lock.json")
  )!;

  const isMismatched = Object.entries(oldLock.dependencies).some(
    ([name, dependency]) => {
      dependency.version !== newLock.dependencies[name]?.version;
    }
  );

  if (!isMismatched) {
    debug("skipping, no changes in package-lock.json");
    return;
  }

  debug("Installing dependencies after lock file change");
  await executeNpmCi();
}

async function executeNpmCi() {
  debug("Running npm ci");

  const lockPath = dependenciesPath("LOCK");
  writeJson<LockFile>(lockPath, {
    time: Date.now(),
  });

  installFile("package.json");
  installFile("package-lock.json");

  const npmPath = await findNpmPath();

  if (!npmPath) {
    throw new Error("NPM not installed");
  }

  debug("Npm found at", npmPath);
  debug("Running npm ci");

  const { status, stdout, stderr } = await execute(npmPath, {
    args: ["ci"],
    cwd: dependenciesPath(),
  });

  if (status !== 0) {
    console.error("stdout:\n" + stdout);
    console.error("stderr:\n" + stderr);
    throw new Error("Failed to install dependencies");
  }

  nova.fs.remove(lockPath);
}
