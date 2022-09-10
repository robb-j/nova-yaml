//
// Utility files to help out and make code more readable
//

export type ProcessParams = ConstructorParameters<typeof Process>;
export type ProcessOutput = { stdout: string; stderr: string; status: number };

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

/**
 * Clean up previous dependencies that were in dependencyManagement/
 */
export async function cleanupStorage() {
  const debug = createDebug("cleanupStorage");

  const path = nova.path.join(
    nova.extension.globalStoragePath,
    "dependencyManagement"
  );

  if (nova.fs.access(path, nova.fs.F_OK)) {
    debug(`rm -r ${path}`);

    await execute("/usr/bin/env", {
      args: ["rm", "-r", path],
    });
  }
}

/** Find the full path of a binary */
export async function findBinaryPath(binary: string): Promise<string | null> {
  const { stdout, status } = await execute("/usr/bin/env", {
    args: ["which", binary],
  });
  return status === 0 ? stdout.trim() : null;
}

/**
 * Ask the workspace user to choose an option
 * and return a Promise for their response.
 */
export function askChoice(
  workspace: Workspace,
  placeholder: string | undefined,
  choices: string[]
) {
  return new Promise<string | null>((resolve) => {
    workspace.showChoicePalette(choices, { placeholder }, (choice) =>
      resolve(choice)
    );
  });
}

/**
 * Output put a potentially unknown error
 */
export function logError(message: string, error: unknown) {
  console.error(message);

  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  } else {
    console.error("An non-error was thrown");
    console.error(error);
  }
}
