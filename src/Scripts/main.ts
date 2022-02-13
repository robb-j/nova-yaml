//
// Extension entry point
//

import { restartCommand } from "./commands/restart-command";
import { generateKubeSchemasCommand } from "./commands/generate-kube-schemas";
import { cleanupStorage, createDebug, logError } from "./utils";
import { YamlLanguageServer } from "./yaml-language-server";

const debug = createDebug("main");
let langServer: YamlLanguageServer | null = null;

export function activate() {
  debug("#activate");

  langServer = new YamlLanguageServer();

  cleanupStorage();
}
export function deactivate() {
  debug("#deactivate");

  if (langServer) {
    langServer.deactivate();
    langServer = null;
  }
}

function errorHandler(error: Error) {
  logError("A command failed", error);
}

nova.commands.register("robb-j.yaml.restart", (workspace: Workspace) =>
  restartCommand(workspace, langServer).catch(errorHandler)
);

nova.commands.register(
  "robb-j.yaml.generate-kube-schemas",
  (workspace: Workspace) =>
    generateKubeSchemasCommand(workspace).catch(errorHandler)
);
