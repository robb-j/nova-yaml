import { YamlLanguageServer } from "../yaml-language-server";
import { createDebug } from "../utils";

const debug = createDebug("reload");

export function reloadCommand(
  workspace: Workspace,
  langServer: YamlLanguageServer | null
) {
  debug("Reloading");

  if (!langServer) {
    debug("LanguageServer not running");
    return;
  }

  langServer.deactivate();
  langServer.start();
}
