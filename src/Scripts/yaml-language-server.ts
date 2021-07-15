import { copyToExtensionStorage, createDebug, execute } from "./utils";

type ServerOptions = ConstructorParameters<typeof LanguageClient>[2];
type ClientOptions = ConstructorParameters<typeof LanguageClient>[3];

const debug = createDebug("yaml");

// Start the server with --inspect-brk
const DEBUG_INSPECT = false;

// Log stdin and stdout of the server to local files
const DEBUG_LOGS = false;

// Use experimental logger to combine logs together in vscode style
// requires build at /Users/rob/dev/labs/lsp-debug/dist/cli.js
const EXPERIMENTAL_LOGGER = false;

// Assume the packages are already installed
// tip: npm link a local yaml-server to yaml.novaextension
const DEBUG_LOCAL_INSTALL = false;

export class YamlLanguageServer {
  languageClient: LanguageClient | null = null;

  constructor() {
    debug("#new");

    this.start();
  }

  deactivate() {
    debug("#deactivate");

    this.stop();
  }

  async start() {
    try {
      debug("#start");

      if (this.languageClient) {
        this.languageClient.stop();
        nova.subscriptions.remove(this.languageClient as any);
        this.languageClient = null;
      }

      copyToExtensionStorage("package.json");
      copyToExtensionStorage("package-lock.json");

      if (!DEBUG_LOCAL_INSTALL) {
        const { stdout } = await execute("/usr/bin/env", {
          args: ["npm", "install", "--no-audit", "--only=production"],
          cwd: nova.extension.globalStoragePath,
        });
        debug(stdout.trim());
      }

      const serverOptions = await this.getServerOptions(
        DEBUG_LOGS ? nova.workspace.path : null
      );
      const clientOptions: ClientOptions = {
        syntaxes: ["yaml"],
      };

      debug("serverOptions", serverOptions);
      debug("clientOptions", clientOptions);

      const client = new LanguageClient(
        "robb-j.yaml",
        nova.extension.name,
        serverOptions,
        clientOptions
      );

      this.startLanguageServer(client);

      nova.subscriptions.add(client as any);
      this.languageClient = client;

      client.onDidStop((err) => {
        debug("client.onDidStop", err?.message);
      });
    } catch (error) {
      debug("LanguageServer Failed", error.message);
    }
  }

  startLanguageServer(client: LanguageClient) {
    // client.onRequest("custom/schema/request", (file) => {
    //   debug("custom/schema/request", file);
    //   return [];
    // });

    client.start();

    // client.sendNotification("yaml/registerCustomSchemaRequest");

    // client.sendNotification("workspace/didChangeConfiguration", {
    //   settings: this.getConfig(),
    // });
  }

  stop() {
    debug("#stop");

    if (this.languageClient) {
      this.languageClient.stop();
      nova.subscriptions.remove(this.languageClient as any);
      this.languageClient = null;
    }
  }

  //
  //
  //

  async getServerOptions(debugPath: string | null) {
    const nodeArgs = ["--unhandled-rejections=warn", "--trace-warnings"];
    const serverPath = nova.path.join(
      this.installDirectory(),
      "node_modules/yaml-language-server/out/server/src/server.js"
    );

    if (DEBUG_INSPECT) {
      nodeArgs.push("--inspect-brk=9231", "--trace-warnings");
    }

    const nodePath = await this.findBinaryPath("node");
    debug("nodePath", nodePath);

    if (!nodePath) {
      throw new Error("Node.js not installed on your $PATH");
    }

    if (debugPath) {
      if (EXPERIMENTAL_LOGGER) {
        const lspDebug = "/Users/rob/dev/labs/lsp-debug/dist/cli.js";
        const logPath = nova.path.join(debugPath, "debug.log");

        return {
          type: "stdio",
          path: nodePath,
          args: [
            lspDebug,
            `--command="${nodePath}"`,
            `--arg=--unhandled-rejections=warn`,
            `--arg=--trace-warnings`,
            `--arg="${serverPath}"`,
            `--arg="--stdio"`,
            `--log="${logPath}"`,
          ],
        } as ServerOptions;
      }

      const stdinLog = nova.path.join(debugPath, "stdin.log");
      const stdoutLog = nova.path.join(debugPath, "stdout.log");

      const args = nodeArgs.join(" ");
      const command = `${nodePath} ${args} '${serverPath}' --stdio`;

      return {
        type: "stdio",
        path: "/bin/sh",
        args: ["-c", `tee "${stdinLog}" | ${command} | tee "${stdoutLog}"`],
      } as ServerOptions;
    }

    return {
      type: "stdio",
      path: nodePath,
      args: [...nodeArgs, serverPath, "--stdio"],
    } as ServerOptions;
  }

  getConfig() {
    const extension = nova.config;
    const workspace = nova.workspace.config;

    // Map out custom files to be Kubernetes schemas
    const customSchemas: Record<string, string[]> = {
      kubernetes: this.generateKubernetesPaths(),
    };

    // Note: this *could* merge global/project tags but nova's default is to
    // use the most specific and that's what it sends when editing preferences
    const customTags =
      workspace.get("yaml.customTags", "array") ??
      extension.get("yaml.customTags", "array") ??
      [];

    return {
      yaml: {
        "format.enable": extension.get("yaml.format.enable", "boolean"),
        validate: extension.get("yaml.validate", "boolean"),
        hover: extension.get("yaml.hover", "boolean"),
        completion: extension.get("yaml.completion", "boolean"),
        customTags: customTags,
        schemas: customSchemas,
      },
    };
  }

  /**
   * Find out the path of nodejs for the current setup.
   * Runs `which node` to get the path or returns null
   */
  async findBinaryPath(binary: string): Promise<string | null> {
    const { stdout, status } = await execute("/usr/bin/env", {
      args: ["which", binary],
    });
    return status === 0 ? stdout.trim() : null;
  }

  installDirectory() {
    return DEBUG_LOCAL_INSTALL
      ? nova.path.join(nova.workspace.path!, "yaml.novaextension")
      : nova.extension.globalStoragePath;
  }

  generateKubernetesPaths(): string[] {
    // prettier-ignore
    const keywords = [
      "deployment", "deploy", "configmap", "cm", "namespace", "ns",
      "persistentvolumeclaim", "pvc", "pod", "po", "secret", "service", "svc",
      "serviceaccount", "sa", "daemonset", "ds", "cronjob", "cj", "job",
      "ingress", "ing",
    ];

    const k8sFiles: string[] = [];

    for (const keyword of keywords) {
      k8sFiles.push(`**/*${keyword}.yml`);
      k8sFiles.push(`**/*${keyword}.yaml`);
    }

    return k8sFiles;
  }
}
