//
// Utility files to help out and make code more readable
//

export type ProcessParams = ConstructorParameters<typeof Process>;
export type ProcessOutput = { stdout: string; stderr: string; status: number };

/**
 * Check a file exists
 */
export function fileExists(path: string) {
  return nova.fs.access(path, nova.fs.F_OK);
}

/**
 * Run a non-interactive process and get the stdout, stderr & status in one go
 * @param {ProcessParams[0]} path The path to the binary to run
 * @param {ProcessParams[1]} options How to run the process
 * @returns A promise of a ProcessOutput
 */
export function execute(
  path: ProcessParams[0],
  options: ProcessParams[1]
): Promise<ProcessOutput> {
  return new Promise<ProcessOutput>((resolve) => {
    const process = new Process(path, options);

    // Copy all stdout into an array of lines
    const stdout: string[] = [];
    process.onStdout((line) => stdout.push(line));

    // Copy all stderr into an array of lines
    const stderr: string[] = [];
    process.onStderr((line) => stderr.push(line));

    // Resolve the promise once the process has exited,
    // with the stdout and stderr as single strings and the status code number
    process.onDidExit((status) =>
      resolve({
        status,
        stderr: stderr.join("\n"),
        stdout: stdout.join("\n"),
      })
    );

    // Start the process
    process.start();
  });
}

/**
 * Read in a file as an utf8 encoded string, similar to node.js's fs.readFileSync
 */
export function readFile(path: string): string | null {
  if (!fileExists(path)) return null;
  const file = nova.fs.open(path, "tr", "utf8") as FileTextMode;
  const contents = file.read();
  file.close();
  return contents;
}

/**
 * Read in a file as a utf8 encoded json string and decode the json too
 */
export function readJson<T = any>(path: string): T | null {
  const data = readFile(path);
  if (!data) return null;

  try {
    return JSON.parse(data) as T;
  } catch (error) {
    return null;
  }
}

/**
 * Write a file as a utf8 string, similar to node.js fs.writeFileSync
 */
export function writeFile(path: string, contents: string) {
  const writer = nova.fs.open(path, "tx", "utf8") as FileTextMode;
  writer.write(contents, "utf8");
  writer.close();
}

export function copyToExtensionStorage(filename: string) {
  const source = nova.path.join(nova.extension.path, filename);
  const destination = nova.path.join(
    nova.extension.globalStoragePath,
    filename
  );

  if (nova.fs.access(destination, nova.fs.constants.F_OK)) {
    nova.fs.remove(destination);
  }
  nova.fs.copy(source, destination);
}

/**
 * Write a json value to a utf8 encoded JSON string
 */
export function writeJson<T = any>(path: string, data: T) {
  return writeFile(path, JSON.stringify(data, null, 2));
}

/**
 * Generate a method for namespaced debug-only logging,
 * inspired by https://github.com/visionmedia/debug.
 *
 * - prints messages under a namespace
 * - only outputs logs when nova.inDevMode()
 * - converts object arguments to json
 */
export function createDebug(namespace: string) {
  return (...args: any[]) => {
    if (!nova.inDevMode()) return;

    const humanArgs = args.map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg) : arg
    );
    console.info(`${namespace}:`, ...humanArgs);
  };
}

export async function cleanupStorage() {
  const path = nova.path.join(
    nova.extension.globalStoragePath,
    "dependencyManagement"
  );

  console.log("rm -rf", path);

  // if (nova.fs.access(path, nova.fs.F_OK))

  // await execute('/usr/bin/env', {
  //   args: ['rm', '-r', path]
  // })
}
