import { copyToExtensionStorage, createDebug, execute } from "./utils";

type ServerOptions = ConstructorParameters<typeof LanguageClient>[2];
type ClientOptions = ConstructorParameters<typeof LanguageClient>[3];

const debug = createDebug("yaml");

const DEBUG_INSPECT = false;
const DEBUG_LOGS = false;

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

      const { stdout } = await execute("/usr/bin/env", {
        args: ["npm", "install", "--no-audit", "--only=production"],
        cwd: nova.extension.globalStoragePath,
      });
      debug(stdout.trim());

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

      client.start();

      nova.subscriptions.add(client as any);
      this.languageClient = client;

      this.setupLanguageServer(client);
    } catch (error) {
      debug("LanguageServer Failed", error.message);
    }
  }

  setupLanguageServer(client: LanguageClient) {
    // Note: Either the LSP should request the required config
    // or Nova should send it itself, but for now I'm sending it
    //
    // I think this also means yaml LS doesn't have "editor" values
    // but I don't think I have access to get those values
    client.sendNotification("workspace/didChangeConfiguration", {
      settings: this.getConfig(),
    });

    // testing ....
    // client.sendNotification("yaml/registerCustomSchemaRequest");
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
    const nodeArgs = ["--unhandled-rejections=warn"];
    const serverPath = nova.path.join(
      nova.extension.globalStoragePath,
      "node_modules/yaml-language-server/out/server/src/server.js"
    );

    if (DEBUG_INSPECT) {
      nodeArgs.push("--inspect-brk=9231", "--trace-warnings");
    }

    const nodePath = await this.findNodeJsPath();
    debug("nodePath", nodePath);

    if (!nodePath) {
      throw new Error("Node.js not installed on your $PATH");
    }

    if (debugPath) {
      const stdinLog = nova.path.join(debugPath, "stdin.log");
      const stdoutLog = nova.path.join(debugPath, "stdout.log");

      const args = nodeArgs.join(" ");
      const command = `${nodePath} ${args} "${serverPath}" --stdio`;

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
  async findNodeJsPath(): Promise<string | null> {
    const { stdout, status } = await execute("/usr/bin/env", {
      args: ["which", "node"],
    });
    return status === 0 ? stdout.trim() : null;
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
