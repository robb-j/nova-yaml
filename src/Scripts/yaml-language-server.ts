import { createDebug, findBinaryPath, logError } from "./utils";

type ServerOptions = ConstructorParameters<typeof LanguageClient>[2];
type ClientOptions = ConstructorParameters<typeof LanguageClient>[3];

const debug = createDebug("language-server");

// Start the server with --inspect-brk
const DEBUG_INSPECT = nova.inDevMode() && false;

// Log stdin and stdout of the server to local files
const DEBUG_LOGS = nova.inDevMode() && false;

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

      const nodePath = await this.getNodeJsPath();
      if (!nodePath) return;

      if (this.languageClient) {
        this.languageClient.stop();
        nova.subscriptions.remove(this.languageClient as any);
        this.languageClient = null;
      }

      const packageDir = nova.inDevMode()
        ? nova.extension.path
        : nova.extension.globalStoragePath;

      const isInstalled = await this.installPackages(packageDir);
      if (!isInstalled) return;

      const serverOptions = await this.getServerOptions(
        nodePath,
        packageDir,
        DEBUG_LOGS ? nova.workspace.path : null
      );
      const clientOptions: ClientOptions = {
        syntaxes: ["yaml"],
      };

      debug("serverOptions", serverOptions);
      debug("clientOptions", clientOptions);

      const client = new LanguageClient(
        "robb-j.yaml",
        "Yaml Language Server",
        serverOptions,
        clientOptions
      );

      nova.subscriptions.add(client as any);
      this.languageClient = client;

      client.onDidStop((err) => {
        debug("client.onDidStop", err?.message);
      });

      this.startLanguageServer(client);
    } catch (error) {
      logError("LanguageServer Failed", error);
    }
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
  // Internal
  //

  async installPackages(installDir: string): Promise<boolean> {
    // Extension developers should manually install dependencies
    if (nova.inDevMode()) return true;

    debug("#installPackages", installDir);

    const proc = new Process("/usr/bin/env", {
      args: ["npm", "install", "--no-audit", "--only=production"],
      cwd: installDir,
    });
    proc.onStdout((line) => debug("npm install: " + line));
    proc.onStderr((line) => console.error("ERROR(npm install): " + line));
    proc.start();

    const success = await new Promise<boolean>((resolve) => {
      proc.onDidExit((status) => resolve(status === 0));
    });

    if (success) return true;

    const msg = new NotificationRequest("npm-install-failed");
    msg.title = nova.localize("npm-install-failed-title");
    msg.body = nova.localize("npm-install-failed-body");
    msg.actions = [nova.localize("ok"), nova.localize("submit-bug")];

    const response = await nova.notifications
      .add(msg)
      .catch((error) => logError("Notification failed", error));

    if (response?.actionIdx === 1) {
      nova.openURL("https://github.com/robb-j/nova-yaml/issues");
    }

    return false;
  }

  async getNodeJsPath(): Promise<string | null> {
    const nodePath = await findBinaryPath("node");
    debug("nodePath", nodePath);

    if (nodePath) return nodePath;

    const msg = new NotificationRequest("node-js-not-found");
    msg.title = nova.localize("node-not-found-title");
    msg.body = nova.localize("node-not-found-body");
    msg.actions = [nova.localize("ok"), nova.localize("open-readme")];

    const response = await nova.notifications
      .add(msg)
      .catch((error) => logError("Notification failed", error));

    if (response?.actionIdx === 1) {
      nova.openURL(
        "https://github.com/robb-j/nova-yaml/tree/main/yaml.novaextension#requirements"
      );
    }

    return null;
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

  async getServerOptions(
    nodePath: string,
    packageDir: string,
    debugPath: string | null
  ): Promise<ServerOptions> {
    const nodeArgs = ["--unhandled-rejections=warn", "--trace-warnings"];

    const serverPath = nova.path.join(
      packageDir,
      "node_modules/yaml-language-server/out/server/src/server.js"
    );

    if (DEBUG_INSPECT) {
      nodeArgs.push("--inspect-brk=9231", "--trace-warnings");
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
      };
    }

    return {
      type: "stdio",
      path: nodePath,
      args: [...nodeArgs, serverPath, "--stdio"],
    };
  }
}
