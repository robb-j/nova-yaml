//
// Extension entry point
//

import { dependencyManagement } from "nova-extension-utils";
import { execute } from "./utils";

// Toggle on in development to --inspect the language server
const DEBUG_INSPECT = false;

let client: LanguageClient | null = null;
let disposable: CompositeDisposable | null = null;

// Register the reload command
nova.commands.register("robb-j.yaml.reload", reload);

// Register the dependency unlock command (from nova-extension-utils)
dependencyManagement.registerDependencyUnlockCommand(
  "robb-j.yaml.forceClearLock"
);

/**
 * A method to log things only when in nova's dev mode,
 * slightly inspired by https://www.npmjs.com/package/debug
 */
function debug(...args: any[]) {
  if (nova.inDevMode() === false) return;
  console.log("[main]", ...args);
}

/**
 * Stop the server, then start it again
 */
async function reload() {
  debug("Reloading");

  deactivate();
  await activate();
}

type ServerOptions = ConstructorParameters<typeof LanguageClient>[2];
type ClientOptions = ConstructorParameters<typeof LanguageClient>[3];

/**
 * Find out the path of nodejs for the current setup.
 * Runs `which node` to get the path or returns null
 */
async function findNodeJsPath(): Promise<string | null> {
  const { stdout, status } = await execute("/usr/bin/env", {
    args: ["which", "node"],
  });
  return status === 0 ? stdout.trim() : null;
}

function generateKubernetesPaths(): string[] {
  const keywords = [
    "deployment",
    "deploy",
    "configmap",
    "cm",
    "namespace",
    "ns",
    "persistentvolumeclaim",
    "pvc",
    "pod",
    "po",
    "secret",
    "service",
    "svc",
    "serviceaccount",
    "sa",
    "daemonset",
    "ds",
    "cronjob",
    "cj",
    "job",
    "ingress",
    "ing",
  ];

  const k8sFiles: string[] = [];

  for (const keyword of keywords) {
    k8sFiles.push(`**/*${keyword}.yml`);
    k8sFiles.push(`**/*${keyword}.yaml`);
  }

  return k8sFiles;
}

/**
 * Extension activation hook
 */
export async function activate() {
  console.log("Activating...");
  disposable = new CompositeDisposable();

  try {
    const nodePath = await findNodeJsPath();

    debug(
      [
        "Information",
        `  path: ${nova.extension.path}`,
        `  storage: ${nova.extension.globalStoragePath}`,
        `  node: ${nodePath}`,
      ].join("\n")
    );

    if (!nodePath) {
      throw new Error("Node.js not installed on your $PATH");
    }

    await dependencyManagement.installWrappedDependencies(disposable, {
      console: {
        log: (...args: any[]) => debug(...args),
        info: (...args: any[]) => debug(...args),
        warn: (...args: any[]) => console.warn(...args),
        error: (...args: any[]) => console.error(...args),
      },
    });

    // Uncomment to try compilled code
    // const serverPath = nova.path.join(
    //   nova.extension.path,
    //   "Scripts/yaml-server.dist.js"
    // );

    const serverPath = nova.path.join(
      dependencyManagement.getDependencyDirectory(),
      "node_modules/yaml-language-server/out/server/src/server.js"
    );

    // Forces an unhandled promise rejection to "warn" as there is no way to prevent LSP issue right now
    // https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode

    const serverOptions: ServerOptions = {
      type: "stdio",
      path: nodePath,
      args: ["--unhandled-rejections=warn", serverPath, "--stdio"],
    };

    if (DEBUG_INSPECT) {
      serverOptions.args!.unshift("--inspect-brk=9231", "--trace-warnings");
    }

    const customSchemas: Record<string, string[]> = {
      kubernetes: generateKubernetesPaths(),
    };

    const clientOptions: ClientOptions = {
      syntaxes: ["yaml"],
    };

    // Create our LanguageClient and start it
    client = new LanguageClient(
      "robb-j.yaml",
      nova.extension.name,
      serverOptions,
      clientOptions
    );

    client.start();

    // Log an error if it stopped for some reason
    // Could fail if node.js exists on uncaught promise rejections
    client.onDidStop((err) => {
      console.error("LSP stopped", err);
    });

    // Send the initial server configuration & custom schemas
    // -> Needs to be called before the server will process schemas
    // -> I think these values should be sent to the server automatically
    //    but they don't seem to be during startup
    //    but they are differentially sent when editing preferences
    client?.sendNotification("workspace/didChangeConfiguration", {
      settings: {
        yaml: {
          format: {
            enable: nova.config.get("yaml.format.enable", "boolean"),
          },
          validate: nova.config.get("yaml.validate", "boolean"),
          hover: nova.config.get("yaml.hover", "boolean"),
          completion: nova.config.get("yaml.completion", "boolean"),
          customTags: nova.config.get("yaml.customTags", "array"),
          schemas: customSchemas,
        },
      },
    });

    //
    // The messages below don't work, it seems Nova is only exposing known/implemented requests
    //

    // const schemas = await fetchSchemaAssociations()
    // client.sendNotification('json/schemaAssociations', schemas)

    // Tell the server that we are ready to provide custom schema content
    // client.sendNotification("yaml/registerCustomSchemaRequest");

    // Tell the server that the client supports schema requests sent directly to it
    // client.sendNotification("yaml/registerContentRequest");

    // If the server asks for custom schemas, get it and send it back
    // client.onRequest("custom/schema/request", (resource: string) => {
    //   debug("custom/schema/request resource:", resource);
    //   throw new Error("Not implemented");
    // });

    // If the server asks for custom schema content, get it and send it back
    // client.onRequest("custom/schema/content", (uri: string) => {
    //   debug("custom/schema/content resource:", uri);
    //   throw new Error("Not implemented");
    // });

    // Handle http requests for the server
    // client.onRequest("vscode/content", async (uri: string) => {
    //   debug("vscode/content uri:", uri);
    //   throw new Error("Not implemented");
    // });

    console.log("Activated!");
  } catch (error) {
    console.error("Failed to activate");
    console.error(error);

    if (nova.inDevMode()) {
      nova.workspace.showErrorMessage(error);
    }
  }
}

/**
 * Nova extension deactivate hook
 */
export function deactivate() {
  console.log("Deactivating");

  client?.stop();
  disposable?.dispose();

  client = null;
  disposable = null;
}
