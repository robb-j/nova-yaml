import { createDebug, askChoice } from "../utils";

const debug = createDebug("generate-kube-schemas");

// prettier-ignore
const keywords = [
  "deployment", "deploy", "configmap", "cm", "namespace", "ns",
  "persistentvolumeclaim", "pvc", "pod", "po", "secret", "service", "svc",
  "serviceaccount", "sa", "daemonset", "ds", "cronjob", "cj", "job", "ingress",
  "ing",
];

export async function generateKubeSchemasCommand(workspace: Workspace) {
  if (!workspace.path) return;

  debug("Generating");

  // Ask the user which yaml extension to use
  const extension = await askChoice(workspace, "Pick an extension", [
    "yaml",
    "yml",
  ]);
  if (!extension) return;

  // Open the Configuration.json in a Nova editor, to be programatically edited
  const editor = await workspace.openFile(
    nova.path.join(workspace.path, ".nova/Configuration.json")
  );

  if (!editor) {
    workspace.showErrorMessage("Could not open .nova/Configuration.json");
    return;
  }

  // Read in the user's existing configuration
  const contents = editor.document.getTextInRange(
    new Range(0, editor.document.length)
  );

  const linesToInsert = getFormattedSchemaLines(extension);
  const editAction = getEditAction(contents, linesToInsert);

  if (editAction) {
    editor.edit(editAction);
  } else {
    workspace.showErrorMessage("Your configuration contains invalid JSON");
  }
}

function getFormattedSchemaLines(extension: string) {
  // Generate formatted JSON keywords using globs and the user's extension
  const mappedKeywords = keywords
    .map((k) => `      "*${k}.${extension}"`)
    .join(",\n");

  // Generate new lines of formatted JSON to be inserted
  return [
    '  "yaml.schemas": {',
    `    "kubernetes": [`,
    mappedKeywords,
    "    ]",
    "  }",
  ];
}

interface EditAction {
  (edit: TextEditorEdit): void;
}

function getEditAction(
  contents: string,
  formattedLines: string[]
): EditAction | null {
  // Work out if the file contains JSON and/or an existing yaml.schemas definition
  const jsonMatch = /\s*?}\s*?$/.exec(contents);
  const schemasMatch = /\s*?"yaml\.schemas":\s*?{[\s\S]*?}/.exec(contents);

  // Parse the JSON contents of the file
  const jsonContents = parseJson(contents) ?? {};

  //
  // 1. If the file is empty, add some JSON
  //
  if (!contents.trim()) {
    return (edit) => {
      const newLines = ["{", ...formattedLines, "}\n"];
      edit.insert(0, newLines.join("\n"));
    };
  }

  //
  // 2. If yaml.schemas is already defined, update it
  //
  if (schemasMatch) {
    return (edit) => {
      const newLines = ["", ...formattedLines];
      const range = new Range(
        schemasMatch.index,
        schemasMatch.index + schemasMatch[0].length
      );
      edit.replace(range, newLines.join("\n"));
    };
  }

  //
  // 3. If there is configuration but doesn't have yaml.schemas
  //
  if (jsonMatch) {
    return (edit) => {
      const newLines = [...formattedLines, "}\n"];

      // If there are existing fields, add a preceding comma
      // otherwise add a extra newline
      const prefix = Object.keys(jsonContents).length > 0 ? "," : "";
      newLines.unshift(prefix);

      const range = new Range(
        jsonMatch.index,
        jsonMatch.index + jsonMatch[0].length
      );
      edit.replace(range, newLines.join("\n"));
    };
  }

  //
  // If we can't do anything
  //
  return null;
}

/** Parse some json and return null if there was an error */
function parseJson(input: string) {
  try {
    return JSON.parse(input);
  } catch (error) {
    return null;
  }
}
