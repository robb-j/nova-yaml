var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/Scripts/main.ts
var main_exports = {};
__export(main_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});

// src/Scripts/utils.ts
var console = globalThis.console;
function execute(path, options) {
  return new Promise((resolve) => {
    const process = new Process(path, options);
    const stdout = [];
    process.onStdout((line) => stdout.push(line));
    const stderr = [];
    process.onStderr((line) => stderr.push(line));
    process.onDidExit((status) => resolve({
      status,
      stderr: stderr.join("\n"),
      stdout: stdout.join("\n")
    }));
    process.start();
  });
}
function createDebug(namespace) {
  return (...args) => {
    if (!nova.inDevMode())
      return;
    const humanArgs = args.map((arg) => typeof arg === "object" ? JSON.stringify(arg) : arg);
    console.info(`${namespace}:`, ...humanArgs);
  };
}
function cleanupStorage() {
  return __async(this, null, function* () {
    const debug5 = createDebug("cleanupStorage");
    const path = nova.path.join(nova.extension.globalStoragePath, "dependencyManagement");
    if (nova.fs.access(path, nova.fs.F_OK)) {
      debug5(`rm -r ${path}`);
      yield execute("/usr/bin/env", {
        args: ["rm", "-r", path]
      });
    }
  });
}
function findBinaryPath(binary) {
  return __async(this, null, function* () {
    const { stdout, status } = yield execute("/usr/bin/env", {
      args: ["which", binary]
    });
    return status === 0 ? stdout.trim() : null;
  });
}
function askChoice(workspace, placeholder, choices) {
  return new Promise((resolve) => {
    workspace.showChoicePalette(choices, { placeholder }, (choice) => resolve(choice));
  });
}
function logError(message, error) {
  console.error(message);
  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  } else {
    console.error("An non-error was thrown");
    console.error(error);
  }
}

// src/Scripts/commands/restart-command.ts
var debug = createDebug("restart");
function restartCommand(workspace, langServer2) {
  return __async(this, null, function* () {
    debug("Restarting");
    if (!langServer2) {
      debug("LanguageServer not running");
      return;
    }
    langServer2.stop();
    langServer2.start();
  });
}

// src/Scripts/commands/generate-kube-schemas.ts
var debug2 = createDebug("generate-kube-schemas");
var K8S_SCHEMA_URL = "https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/v1.20.5-standalone-strict/all.json";
var keywords = [
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
  "ing"
];
function generateKubeSchemasCommand(workspace) {
  return __async(this, null, function* () {
    if (!workspace.path)
      return;
    debug2("Generating");
    const extension = yield askChoice(workspace, "Pick an extension", [
      "yaml",
      "yml"
    ]);
    if (!extension)
      return;
    const editor = yield workspace.openFile(nova.path.join(workspace.path, ".nova/Configuration.json"));
    if (!editor) {
      workspace.showErrorMessage("Could not open .nova/Configuration.json");
      return;
    }
    const contents = editor.document.getTextInRange(new Range(0, editor.document.length));
    const linesToInsert = getFormattedSchemaLines(extension);
    const editAction = getEditAction(contents, linesToInsert);
    if (editAction) {
      editor.edit(editAction);
    } else {
      workspace.showErrorMessage("Your configuration contains invalid JSON");
    }
  });
}
function getFormattedSchemaLines(extension) {
  const mappedKeywords = keywords.map((k) => `      "*${k}.${extension}"`).join(",\n");
  return [
    '  "yaml.schemas": {',
    `    "${K8S_SCHEMA_URL}": [`,
    mappedKeywords,
    "    ]",
    "  }"
  ];
}
function getEditAction(contents, formattedLines) {
  var _a;
  const jsonMatch = /\s*?}\s*?$/.exec(contents);
  const schemasMatch = /\s*?"yaml\.schemas":\s*?{[\s\S]*?}/.exec(contents);
  const jsonContents = (_a = parseJson(contents)) != null ? _a : {};
  if (!contents.trim()) {
    return (edit) => {
      const newLines = ["{", ...formattedLines, "}\n"];
      edit.insert(0, newLines.join("\n"));
    };
  }
  if (schemasMatch) {
    return (edit) => {
      const newLines = ["", ...formattedLines];
      const range = new Range(schemasMatch.index, schemasMatch.index + schemasMatch[0].length);
      edit.replace(range, newLines.join("\n"));
    };
  }
  if (jsonMatch) {
    return (edit) => {
      const newLines = [...formattedLines, "}\n"];
      const prefix = Object.keys(jsonContents).length > 0 ? "," : "";
      newLines.unshift(prefix);
      const range = new Range(jsonMatch.index, jsonMatch.index + jsonMatch[0].length);
      edit.replace(range, newLines.join("\n"));
    };
  }
  return null;
}
function parseJson(input) {
  try {
    return JSON.parse(input);
  } catch (error) {
    return null;
  }
}

// src/Scripts/yaml-language-server.ts
var debug3 = createDebug("yaml-language-server");
var DEBUG_INSPECT = nova.inDevMode() && false;
var DEBUG_LOGS = nova.inDevMode() && false;
var YamlLanguageServer = class {
  constructor() {
    this.languageClient = null;
    debug3("#new");
    this.start();
  }
  deactivate() {
    debug3("#deactivate");
    this.stop();
  }
  start() {
    return __async(this, null, function* () {
      try {
        debug3("#start");
        const nodePath = yield this.getNodeJsPath();
        if (!nodePath)
          return;
        if (this.languageClient) {
          this.languageClient.stop();
          nova.subscriptions.remove(this.languageClient);
          this.languageClient = null;
        }
        const packageDir = nova.inDevMode() ? nova.extension.path : nova.extension.globalStoragePath;
        if (!nova.inDevMode()) {
          const { stdout: installLogs } = yield execute("/usr/bin/env", {
            args: ["npm", "install", "--no-audit", "--only=production"],
            cwd: packageDir
          });
          debug3(installLogs.trim());
        }
        const serverOptions = yield this.getServerOptions(nodePath, packageDir, DEBUG_LOGS ? nova.workspace.path : null);
        const clientOptions = {
          syntaxes: ["yaml"]
        };
        debug3("serverOptions", serverOptions);
        debug3("clientOptions", clientOptions);
        const client = new LanguageClient("robb-j.yaml", "Yaml Language Server", serverOptions, clientOptions);
        nova.subscriptions.add(client);
        this.languageClient = client;
        client.onDidStop((err) => {
          debug3("client.onDidStop", err == null ? void 0 : err.message);
        });
        this.startLanguageServer(client);
      } catch (error) {
        logError("LanguageServer Failed", error);
      }
    });
  }
  stop() {
    debug3("#stop");
    if (this.languageClient) {
      this.languageClient.stop();
      nova.subscriptions.remove(this.languageClient);
      this.languageClient = null;
    }
  }
  getNodeJsPath() {
    return __async(this, null, function* () {
      const nodePath = yield findBinaryPath("node");
      debug3("nodePath", nodePath);
      if (!nodePath) {
        const msg = new NotificationRequest("node-js-not-found");
        msg.title = "Node.js not found";
        msg.body = "Yaml Extension requires Node.js and npm to be installed on your computer for it to work. See the extension readme for instructions and help.";
        msg.actions = [nova.localize("OK"), nova.localize("Open Readme")];
        nova.notifications.add(msg).then((response) => {
          if (response.actionIdx !== 1)
            return;
          nova.openURL("https://github.com/robb-j/nova-yaml/tree/main/yaml.novaextension#requirements");
        }).catch((error) => logError("Notification failed", error));
      }
      return nodePath;
    });
  }
  startLanguageServer(client) {
    client.start();
  }
  getServerOptions(nodePath, packageDir, debugPath) {
    return __async(this, null, function* () {
      const nodeArgs = ["--unhandled-rejections=warn", "--trace-warnings"];
      const serverPath = nova.path.join(packageDir, "node_modules/yaml-language-server/out/server/src/server.js");
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
          args: ["-c", `tee "${stdinLog}" | ${command} | tee "${stdoutLog}"`]
        };
      }
      return {
        type: "stdio",
        path: nodePath,
        args: [...nodeArgs, serverPath, "--stdio"]
      };
    });
  }
};

// src/Scripts/main.ts
var debug4 = createDebug("main");
var langServer = null;
function activate() {
  debug4("#activate");
  langServer = new YamlLanguageServer();
  cleanupStorage();
}
function deactivate() {
  debug4("#deactivate");
  if (langServer) {
    langServer.deactivate();
    langServer = null;
  }
}
function errorHandler(error) {
  logError("A command failed", error);
}
nova.commands.register("robb-j.yaml.restart", (workspace) => restartCommand(workspace, langServer).catch(errorHandler));
nova.commands.register("robb-j.yaml.generate-kube-schemas", (workspace) => generateKubeSchemasCommand(workspace).catch(errorHandler));
module.exports = __toCommonJS(main_exports);
