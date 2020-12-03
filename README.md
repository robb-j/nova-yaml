# yaml.novaextension

A YAML language server/client for [Nova IDE](https://nova.app).

This readme contains development notes.
For extension information go to [./yaml.novaextension](/yaml.novaextension)

## helpful links

- https://library.panic.com/nova/incorporating-tasks/
- https://dev.panic.com/ashur/nova-npm-executable
- https://rollupjs.org/guide/en/
- https://docs.nova.app/api-reference/language-client/
- https://microsoft.github.io/language-server-protocol/overviews/lsp/overview/
- https://github.com/redhat-developer/yaml-language-server
- https://github.com/redhat-developer/vscode-yaml
- https://docs.nova.app/api-reference/language-client/#supported-language-server-transport-types

## design goals

- be open about what the extension does / how it uses its entitlements
- try to bundle yaml-server as a "binary" to avoid node_modules management in production
- try to make internet connection tasks user-visible

<details>
<summary>bundling yaml-server</summary>

**with rollup**

Uncomment yaml-server entrypoint in [rollup.config.js](/rollup.config.js)

```
Error: Cannot find module 'vscode-json-languageservice/lib/umd/services/jsonDefinition'
```

**with @vercel/ncc**

```bash
npx @vercel/ncc build src/server.ts -o yaml-server
```

```
Error: Cannot find module '../utils/objects'
```

</details>

## ideas / notes

- better Kubernetes support similar to how [Azure/vscode-kubernetes-tools](https://github.com/Azure/vscode-kubernetes-tools) uses custom schemas
  - Nova's LSP doesn't seem to support custom notifications/requests yet which is how that works
  - in-client create a custom association like `kubernetes://schema/apps/v1@deployment` by parsing the yaml `apiVersion` and `kind`
  - client provides the association and maps to a schema from
    [these json files](https://github.com/Azure/vscode-kubernetes-tools/tree/master/schema)
- network & caching
  - learn more about how yaml-language-server does network requests.
    Does it cache based on http headers?
  - it seems requests can be done via an LSP request but nova doesn't seem to support custom notifications/requests yet
  - cache associations / schemas as files for offline support
  - explore making it a user choice to (re)download associations / schemas, rather than automatic?
- hook up document outline for yaml
- add an api similar to
  [redhat-developer/vscode-yaml schema-extension-api](https://github.com/redhat-developer/vscode-yaml/blob/master/src/schema-extension-api.ts)
  that allows other extensions to register custom schemas
- user-configurable schema associations in the extension settings
- look more into bundling up `yaml-language-server` into a single javascript file,
  rather that require-ing `npm install` on installation
- review `registerCapability` bug for `workspace/didChangeWorkspaceFolders` if/when nova supports dynamic registration
- explore creating custom nova UI elements to view Kubernetes resources/logs
- document release process and its nuances
  - use of npm shrinkwrap
  - which version numbers to increment (package.json, extension.json, root package.json ?)
- handle promise rejections from the server to work around LSP dynamic capability limitations
- move large screenshots out of extension folder

## bugs

- indentation on inserted completions is off
- improve startup time
  - `npm ci` or `npm install --no-audit` needed in `nova-extension-utils` npm package

## sticking points

- Nova's LSP integration
  - missing custom notification/request-responses, they seem to be swallowed up by the client
  - dynamic capability registration isn't supported
