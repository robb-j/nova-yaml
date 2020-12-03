<!--
👋 Hello! As Nova users browse the extensions library, a good README can help them understand what your extension does, how it works, and what setup or configuration it may require.

Not every extension will need every item described below. Use your best judgement when deciding which parts to keep to provide the best experience for your new users.

💡 Quick Tip! As you edit this README template, you can preview your changes by selecting **Extensions → Activate Project as Extension**, opening the Extension Library, and selecting "yaml" in the sidebar.

Let's get started!
-->

**Yaml Extension** provides deeper integration with **YAML** (YAML Ain't Markup Language), including linting yaml documents
and validating against known JSON schemas, including Kubernetes resources.

<img src="https://raw.githubusercontent.com/robb-j/nova-yaml-language-server/main/yaml.novaextension/Images/extension/preview.png" width="800" alt="Yaml Extension adds deeper YAML integration to Nova based on JSON schemas">

## Requirements

Yaml Extension requires some additional tools to be installed on your Mac:

- [Node.js 8.2.0](https://nodejs.org) and NPM 5.2.0 or newer
  - Node.js is used to run [redhat-developer/yaml-language-server](http://github.com/redhat-developer/yaml-language-server)
  - NPM is used to install the server during extension installation

> To install the current stable version of Node, click the "Recommended for Most Users" button to begin the download. When that completes, double-click the **.pkg** installer to begin installation.

## Permissions

Yaml Extension requires these Nova permissions:

- `network` Yaml Extension uses a network connection:
  - to associate YAML files with json schemas
  - to download individual json schemas to validate against
  - to download the language server when you first install or subsequently update the extension.
- `process` Yaml Extension runs these subprocess:
  - to determine if Node.js is installed
  - to install the language server with NPM
  - to run the language server which provides most of the features
- `filesystem` Yaml Extension needs to read and write files:
  - to read in YAML files so they can be validated
  - to write back to files when applying completions
  - to install the language server in extension storage (`~/Library/Application Support/Nova/Extensions/robb-j.yaml`)

> This information is based on my experience setting up the language server (which I didn't write).
> If you find it is doing something not described above please [fill out an Issue](https://github.com/robb-j/nova-yaml-language-server/issues),
> I want this information to be as correct and informative as possible.

## Usage

Yaml Extension runs any time you open a local project with YAML files in it, automatically lints all open files, then reports errors and warnings in Nova's **Issues** sidebar and the editor gutter:

<img src="https://raw.githubusercontent.com/robb-j/nova-yaml-language-server/main/yaml.novaextension/Images/extension/validation.png" width="800" alt="Yaml Extension adds on-hover tooltips to Nova based on JSON schemas">

### JSON schemas

This extension works by associating YAML files with JSON schemas based on well-known names
and open-source schemas that are available online.
For example, `.circleci/config.yml` or `.github/workflows/**.yml` have known schemas which we can validate those files against.

To see all available schemas, visit [www.schemastore.org/json/](https://www.schemastore.org/json/).

### Under the hood

Yaml Extension runs the [redhat-developer/yaml-language-server](http://github.com/redhat-developer/yaml-language-server) Language Server which
pulls down associations from `https://www.schemastore.org/api/json/catalog.json`
and filters out the ones that aren't `yaml` or `yml`.
When you open a YAML file, it sees if it is associated with a schema and if it is, it downloads the schema to do hover/validation/completions.

### Kubernetes

To support Kubernetes resources, your files must be named in a certain way.
Kubernetes files must be named or end with one of these suffixes:

```
deployment, deploy, configmap, cm, namespace, ns, persistentvolumeclaim, pvc,
pod, po, secret, service, svc, serviceaccount, sa, daemonset, ds,
cronjob, cj, job, ingress, ing
```

> These are based on the singular names from `kubectl api-resources`

For example:

- `deployment.yml`
- `my-special-service.yaml`
- `ingress.yml`
- `app-cm.yaml`
- [My test examples](https://github.com/robb-j/nova-yaml-language-server/tree/master/examples)

> Hopefully a future version of this extension will parse out the `apiVersion` and `kind` values and validate files dynamically based on them, but this currently isn't possible.

### Screenshots

<img src="https://raw.githubusercontent.com/robb-j/nova-yaml-language-server/main/yaml.novaextension/Images/extension/validation.png" width="800" alt="YAML files are validated against JSON schemas">

<img src="https://raw.githubusercontent.com/robb-j/nova-yaml-language-server/main/yaml.novaextension/Images/extension/on-hover.png" width="800" alt="Get tooltips when writting YAML files based on the associated JSON schema">

<img src="https://raw.githubusercontent.com/robb-j/nova-yaml-language-server/main/yaml.novaextension/Images/extension/validation.png" width="800" alt="See completion options as you write based on the JSON schema">

## Install

1. Select the **Extensions → Extension Library...** menu item
2. Search for `"Yaml"`
3. Click the Install Button

## Troubleshooting

If believe something isn't working, you can try reloading the yaml server.
Select the **Editor → YAML → Reload Yaml Server** menu item

If things seem really wrong, check the extension console to find out more information.
Select the **Extensions → Show Extension Console** menu item, then pick the `Yaml` source.

You should see a first log message of `Activating...` which is the first thing the extension does.
If you don't see `Activated!`, there might have been issues with the NPM install.
Try resetting the install lock by selecting the **Editor → YAML → Reset Yaml Install Lock**,
this is most likely with multiple Nova windows open, so try again with a single workspace.

If you see any other errors in that log that aren't like `Error: Invalid parameter: registrations`,
or the stack trace below that, please [fill out an Issue](https://github.com/robb-j/nova-yaml-language-server/issues).

## Known issues

- Indentation on completions can be incorrect
- `Error: Invalid parameter: registrations` in the extension console
  - This causes a node.js unhandled promise rejection which is forced to "warn" rather than crash the server

## Disclaimer

This repo does not provide the YAML syntax highlighting in Nova, those are provided by Panic.

---
