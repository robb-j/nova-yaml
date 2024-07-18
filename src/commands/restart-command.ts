import { YamlLanguageServer } from "../yaml-language-server";
import { createDebug } from "../utils";

const debug = createDebug("restart");

export async function restartCommand(
  _workspace: Workspace,
  langServer: YamlLanguageServer | null,
) {
  debug("Restarting");

  if (!langServer) {
    debug("LanguageServer not running");
    return;
  }

  langServer.stop();
  langServer.start();
}
