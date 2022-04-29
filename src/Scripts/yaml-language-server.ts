import { createDebug, execute, findBinaryPath, logError } from "./utils";

type ServerOptions = ConstructorParameters<typeof LanguageClient>[2];
type ClientOptions = ConstructorParameters<typeof LanguageClient>[3];

const debug = createDebug("yaml-language-server");

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
      this.stop();

      debug("#start");

      const packageDir = nova.inDevMode()
        ? nova.extension.path
        : nova.extension.globalStoragePath;

      if (!nova.inDevMode()) {
        const { stdout: installLogs } = await execute("/usr/bin/env", {
          args: ["npm", "install", "--no-audit", "--only=production"],
          cwd: packageDir,
        });
        debug(installLogs.trim());
      }

      const serverOptions = await this.getServerOptions(
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
        "YAML LanguageServer",
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
    if (this.languageClient) {
      debug("#stop");
      this.languageClient.stop();
      nova.subscriptions.remove(this.languageClient as any);
      this.languageClient = null;
    } else {
      debug("#stop (not running)");
    }
  }

  //
  // Internal
  //

  startLanguageServer(client: LanguageClient) {
    client.onRequest("custom/schema/request", ([uri]: [string]) => {
      debug("custom/schema/request", uri);
      const editor = nova.workspace.textEditors.find(
        (e) => e.document.uri === uri
      );
      if (!editor) return [];

      const text = editor.document.getTextInRange(
        new Range(0, editor.document.length)
      );

      const apiVersion = /^apiVersion: +(\S+)$/m.exec(text);
      const kind = /^kind: +(\S+)$/m.exec(text);

      if (!apiVersion || !kind) return [];

      debug("custom/schema/request", [apiVersion[1], kind[1]]);
      return [{ uri: "kubernetes", name: kind[1], description: apiVersion[1] }];
    });

    client.start();

    client.sendNotification("yaml/registerCustomSchemaRequest");
  }

  async getServerOptions(
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

    const nodePath = await findBinaryPath("node");
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
      };
    }

    return {
      type: "stdio",
      path: nodePath,
      args: [...nodeArgs, serverPath, "--stdio"],
    };
  }
}
