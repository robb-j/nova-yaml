# yaml.novaextension

These are my development notes on this extension.
For extension information go to [./yaml.novaextension](/yaml.novaextension)

## setup

To work on the extension, you will need to have [Node.js](https://nodejs.org/en/) (version 16+)
and [Nova](https://nova.app) installed on your development machine. Then run:

```sh
# cd to/this/folder

# install NPM dependencies
npm install
```

## regular use

For development, use the `Development` task to build and run the extension locally.
**Build** will compile the TypeScript into JavaScript into the extension folder.
**Run** will do the build, install bundled dependencies and activate the extension in Nova.
Nova will run the extension locally and restart when any file inside the `.novaextension` changes,
i.e. by running the **Build** task.

> Make sure to disable the extension if a published version is already installed.

When in development mode, the extension outputs extra information to the Debug Pane,
which can be shown with **View** → **Show Debug Pane**.

Use the files in the [examples](/examples) folder to test out different features of the language server.

## code formatting

This repository uses [Prettier](https://prettier.io/),
[yorkie](https://www.npmjs.com/package/yorkie)
and [lint-staged](https://www.npmjs.com/package/lint-staged) to
automatically format code when staging code git commits.

You can manually run the formatter with `npm run format` if you want.

Prettier ignores files using [.prettierignore](/.prettierignore)
or specific lines after a `// prettier-ignore` comment.

## helpful links

- https://library.panic.com/nova/incorporating-tasks/
- https://dev.panic.com/ashur/nova-npm-executable
- https://docs.nova.app/api-reference/language-client/
- https://microsoft.github.io/language-server-protocol/overviews/lsp/overview/
- https://github.com/redhat-developer/yaml-language-server
- https://github.com/redhat-developer/vscode-yaml
- https://docs.nova.app/api-reference/language-client/#supported-language-server-transport-types
- https://github.com/redhat-developer/yaml-language-server/issues/129

## release process

- Ensure git is clean
- Ensure the `CHANGELOG.md` is up-to-date
- Generate new screenshots if needed
- Make sure `DEBUG_LOGS` is `false`
- Run the build
- Bump the version in extension.json
- Commit as `X.Y.Z`
- Tag the commit as `vX.Y.Z`
- Remove `yaml.novaextension/node_modules`
- **Extensions → Submit to the Extension Library...**

## design goals

- be open about what the extension does / how it uses its entitlements
- try to bundle yaml-server as a "binary" to avoid node_modules management in production
- try to make internet connection tasks user-visible

<details>
<summary>bundling yaml-server</summary>

**with esbuild**

Uncomment the build in [bin/build.sh](/bin/build.sh)
and run the build

```
mapped file:
  // node_modules/vscode-json-languageservice/lib/umd/services/jsonSchemaService.js

failing line:
  var Strings = require2("../utils/strings");

error:
  Error: Cannot find module '../utils/strings'
```

> Last attempted: 05/06/21

</details>

## notes

### ideas

- make Kubernetes opt-in/out based on a configuration flag
- add more configuration options and add per-project config too
- explore creating custom nova UI elements to view Kubernetes resources/logs
- user-configurable schema associations in the extension settings
- add an api similar to
  [redhat-developer/vscode-yaml schema-extension-api](https://github.com/redhat-developer/vscode-yaml/blob/master/src/schema-extension-api.ts)
  that allows other extensions to register custom schemas
- I'm not sure how VSCode's inter-extension communication works
  or if nova supports something similar
- better Kubernetes support similar to how [Azure/vscode-kubernetes-tools](https://github.com/Azure/vscode-kubernetes-tools) uses custom schemas
  - Nova's LSP doesn't seem to support custom notifications/requests yet which is how that works
  - in-client create a custom association like `kubernetes://schema/apps/v1@deployment` by parsing the yaml `apiVersion` and `kind`
  - client provides the association and maps to a schema from
    [these json files](https://github.com/Azure/vscode-kubernetes-tools/tree/master/schema)
- network & caching
  - learn more about how yaml-language-server does network requests.
    does it cache based on http headers?
  - cache associations / schemas as files for offline support
  - explore making it a user choice to (re)download associations / schemas, rather than automatic?

### docs

- document release process and its nuances
- use of npm shrinkwrap
- which version numbers to increment (package.json, extension.json, root package.json ?)

### bugs

- indentation on inserted completions is off
  - The LanguageServer is sending a `configMap:\n $1`
  - Is nova meant to handle the intendation
- YAML server doesn't request config and I can only send it `yaml` config,
  so it isn't getting `editor` and other standard values
- move large screenshots out of extension folder

### sticking points

- Nova's LSP integration
  - missing custom notification/request-responses, they seem to be swallowed up by the client
  - dynamic capability registration isn't supported
- hook up document outline for yaml, this seems to be is a Nova thing
- review `registerCapability` bug for `workspace/didChangeWorkspaceFolders` if/when nova supports dynamic registration

## More LSP messages

> From the old `main.ts`

```js
const schemas = await fetchSchemaAssociations();
client.sendNotification("json/schemaAssociations", schemas);

// Tell the server that we are ready to provide custom schema content
// - This is sent to YAML and it starts sending "custom/schema/request" requests
client.sendNotification("yaml/registerCustomSchemaRequest");

// Tell the server that the client supports schema requests sent directly to it
client.sendNotification("yaml/registerContentRequest");

// If the server asks for custom schemas, get it and send it back
// This isn't triggered when a request is fired
client.onRequest("custom/schema/request", (resource: string) => {
  debug("custom/schema/request resource:", resource);
  throw new Error("Not implemented");
});

// If the server asks for custom schema content, get it and send it back
client.onRequest("custom/schema/content", (uri: string) => {
  debug("custom/schema/content resource:", uri);
  throw new Error("Not implemented");
});

// Handle http requests for the server
client.onRequest("vscode/content", async (uri: string) => {
  debug("vscode/content uri:", uri);
  throw new Error("Not implemented");
});
```

---

## Completion Issue

**Text**

```yaml
      volumes:
        - name: html
          persistentVolumeClaim:
            claimName: sample-pvc
          configMap:
  (•••)
```

**The request**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "textDocument/completion",
  "params": {
    "context": { "triggerCharacter": "c", "triggerKind": 2 },
    "textDocument": {
      "uri": "file:///Volumes/Macintosh%20HD/Users/rob/dev/nova/yaml/examples/some-deployment.yml"
    },
    "position": { "line": 30, "character": 11 }
  }
}
```

**The response**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "items": [
      "...",
      {
        "kind": 10,
        "label": "configMap",
        "insertText": "configMap:\n  $1",
        "insertTextFormat": 2,
        "documentation": "ConfigMap represents a configMap that should populate this volume",
        "textEdit": {
          "range": {
            "start": { "line": 30, "character": 10 },
            "end": { "line": 30, "character": 11 }
          },
          "newText": "configMap:\n  $1"
        }
      },
      "..."
    ],
    "isIncomplete": false
  }
}
```

## Custom requests issue

The idea is that you tell the LanguageServer you can handle http
requests and it will forward them to the client via a LSP request:

```ts
client.sendNotification("yaml/registerCustomSchemaRequest");

client.onRequest("custom/schema/request", async (file) => {
  debug("custom/schema/request", file);
  return fetch("the_url...");
});
```

From inspecting the server I can see it is receiving the notification
and sending a request for the file:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "custom/schema/request",
  "params": [
    "file:///Volumes/Macintosh%20HD/Users/rob/dev/nova/yaml/examples/kustomization.yml"
  ]
}
```

But Nova isn't calling my callback.
