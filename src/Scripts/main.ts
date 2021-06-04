//
// Extension entry point
//

import { reloadCommand } from "./commands/all";
import { createDebug } from "./utils";
import { YamlLanguageServer } from "./yaml-language-server";

const debug = createDebug("main");
let langServer: YamlLanguageServer | null = null;

export function activate() {
  debug("#activate");

  langServer = new YamlLanguageServer();
}
export function deactivate() {
  debug("#deactivate");

  if (langServer) {
    langServer.deactivate();
    langServer = null;
  }
}

nova.commands.register("robb-j.yaml.reload", (workspace: Workspace) =>
  reloadCommand(workspace, langServer)
);
