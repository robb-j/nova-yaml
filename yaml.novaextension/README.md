**Yaml Extension** provides deeper integration with **YAML** (YAML Ain't Markup Language), including linting yaml documents
and validating against known JSON schemas, including Kubernetes resources.

<img src="https://raw.githubusercontent.com/robb-j/nova-yaml/main/yaml.novaextension/Images/extension/preview.gif" width="800" alt="Yaml Extension adds deeper YAML integration to Nova based on JSON schemas">

## Requirements

Yaml Extension requires some additional tools to be installed on your Mac:

- [Node.js 16](https://nodejs.org) and NPM 6 or newer
  - Node.js is used to run [redhat-developer/yaml-language-server](http://github.com/redhat-developer/yaml-language-server)
  - NPM is used to install the server during extension installation
  - Older versions of Node.js and NPM should still work, but newer versions are advised.

To install the current stable version of Node, click the "Recommended for Most Users" button to begin the download. When that's done, double-click the **.pkg** installer to begin installation.

**Node version managers** — If you use something like [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm), make sure it is configured inside your profile file (`.zprofile` or `.bash_profile`) instead of your "rc" file (`.zshrc` or `.bashrc`). See [Environment Variables](https://help.panic.com/nova/environment-variables/) for more. You may also have to restart Nova for any changes to take effect.

## Usage

Yaml Extension runs any time you open a local project with YAML files in it,
it automatically lints all open files,
then reports errors and warnings in Nova's **Issues** sidebar and the editor gutter:

<img src="https://raw.githubusercontent.com/robb-j/nova-yaml/main/yaml.novaextension/Images/extension/validation.png" width="800" alt="Yaml Extension adds on-hover tooltips to Nova based on JSON schemas">

### JSON schemas

This extension works by associating YAML files with JSON schemas based on well-known names
and open-source schemas that are available online.
For example, `.circleci/config.yml` or `.github/workflows/**.yml` have known schemas which we can validate those files against.

To see all available schemas, visit [www.schemastore.org/json/](https://www.schemastore.org/json/).

#### Custom schema configuration

You can also configure custom schema mappings in `.nova/Configuration.json` manually, e.g.

```json
{
  "yaml.schemas": {
    "https://json.schemastore.org/lerna.json": "my-custom-lerna.yaml"
    "https://json.schemastore.org/github-action.json": ["*-action.yml"],
    "../some/relative/path.json": [
      "app-config.yml",
      "app-config.*.yml"
    ]
  }
}
```

[More information →](https://github.com/redhat-developer/yaml-language-server#using-yamlschemas-settings)

Where the key is a URL or path to the your JSON schema, and the value is a glob pattern or array of patterns of files to match against.

> Currently, Nova doesn't support this type of configuration so it cannot be done in the **Project → Project Settings...** UI.

#### Inline Schema Comments

You can add this special comment at the top of your schema file to tell the Yaml Extension which schema to use:

```yaml
# yaml-language-server: $schema=<urlToTheSchema>
```

or with a relative path:

```yaml
# yaml-language-server: $schema=../relative/path/to/schema
```

or with an absolute path:

```yaml
# yaml-language-server: $schema=/absolute/path/to/schema
```

[More Information →](https://github.com/redhat-developer/yaml-language-server#using-inlined-schema)

### Custom tags

[YAML tags](https://yaml.org/spec/1.2/spec.html#id2761292)
let you programatically control the parsing of values in YAML files.
For example, a tag could be used to unpack a secret:

```yaml
passwordKey: !secret database.password
```

Yaml Extension needs to know about these tags so it can help with suggestions and error messages.
You can define these globally or per-project inside of Nova.

> **Note:** global and per-project custom tags are not merged.
> If you have global tags you will need to duplicate them if you want to use per-project tags.

Each line of the configuration should be a separate tag you want to add.
It can optionally have a type, which Yaml Extension will check the value of.

The type can be either `scalar`, `mapping` or `sequence`,
for more information, [look here](https://github.com/redhat-developer/yaml-language-server#adding-custom-tags).

#### Global custom tags

To set global custom-tags, go to **Extensions** → **Extension Library...**.
Then navigate to **YAML** and then to the **Preferences** tab.

#### Per-project custom tags

To set per-project, navigate to your project settings by clicking your project name in the top left.
Then go to **YAML** in the side bar and configure **Custom tags** there.

#### Example custom tags

```
!secret scalar
!automobile mapping
!peopleList sequence
```

### Under the hood

Yaml Extension runs the [redhat-developer/yaml-language-server](http://github.com/redhat-developer/yaml-language-server)
Language Server which pulls down associations from `https://www.schemastore.org/api/json/catalog.json`
and filters out the ones that aren't YAML.
When you open a YAML file,
it sees if it is associated with a schema and if it is,
it downloads the schema to do hover/validation/completions.

### Kubernetes

You can opt-in to Kubernetes support on a per-project basis.
You need to manually configure your project's settings in `.nova/Configuration.json` to
tell the Yaml Language Server which files you want it to consider to be Kubernetes ones.

To help with this, there is the **Extensions → YAML → Setup Kubernetes Schemas** command to bootstrap the process.
It will open your local `.nova/Configuration.json` and attempt to add a placeholder
schema mapping towards the latest supported Kubernetes JSON schema.

> **Warning** This command covers lots of cases for your existing (or non-existing project configuration)
> but it will erase any previous `yaml.schemas` that you may have set.
> If you have custom schemas setup, I'd recommend running the command in a blank project
> and manually merging the JSON back together again.

The placeholder is setup to match suffixes based on the `kubectl api-resources` output,
but you can customise this as much as you'd like.
You can re-run the command to reset back to the placeholder.

> Under the hood there is one generic Kubernetes schema which decides the structure
> based on what `apiVersion` and `kind` are set to.
> So you don't need to worry about mapping different schemas to different files.
>
> This schema is from [yannh/kubernetes-json-schema](https://github.com/yannh/kubernetes-json-schema/)
> and the command picks the highest version that is known to work with the Language Server.

The placeholder will match files like:

- `deployment.yml`
- `my-special-service.yaml`
- `ingress.yml`
- `app-cm.yaml`
- [The test examples](https://github.com/robb-j/nova-yaml/tree/master/examples)

> Hopefully a future version of this extension will parse out the `apiVersion` and `kind` values
> and validate files dynamically based on them,
> but this currently isn't possible.
> This is being [tracked here](https://github.com/robb-j/nova-yaml/issues/21).

### Screenshots

<img src="https://raw.githubusercontent.com/robb-j/nova-yaml/main/yaml.novaextension/Images/extension/validation.png" width="800" alt="YAML files are validated against JSON schemas">

<img src="https://raw.githubusercontent.com/robb-j/nova-yaml/main/yaml.novaextension/Images/extension/on-hover.png" width="800" alt="Get tooltips when writting YAML files based on the associated JSON schema">

<img src="https://raw.githubusercontent.com/robb-j/nova-yaml/main/yaml.novaextension/Images/extension/completion.png" width="800" alt="See completion options as you write based on the JSON schema">

## Permissions

Yaml Extension requires these Nova permissions:

**network**:

- to associate YAML files with json schemas
- to download individual json schemas to validate against
- to download the language server when you first install or subsequently update the extension.

**process**:

- to determine where Node.js is installed
- to install the language server with NPM
- to run the language server which provides most of the features

**filesystem**:

- to read in YAML files so they can be validated
- to write back to files when applying completions
- to install the language server in extension storage (`~/Library/Application Support/Nova/Extensions/robb-j.yaml`)
- when using the **Setup Kubernetes Schemas** command

> This information is based on my experience setting up the language server (which I didn't write).
> If you find it is doing something not described above please [fill out an Issue](https://github.com/robb-j/nova-yaml/issues),
> I want this information to be as accurate and informative as possible.

## Install

1. Select the **Extensions → Extension Library...** menu item
2. Search for `"Yaml"`
3. Click the Install Button

## Troubleshooting

If believe something isn't working, you can try restarting the yaml server.
Select the **Extensions → YAML → Restart Server** menu item

If things seem really wrong, check the extension console to find out more information.
Select the **Extensions → Show Extension Console** menu item, then pick the `Yaml` source.

If you see any errors in that log that aren't like `Error: Invalid parameter: registrations`,
or the stack trace below that, please [fill out an Issue](https://github.com/robb-j/nova-yaml/issues).

## Known issues

- Indentation on completions can be incorrect

## Disclaimer

This repo does not provide the YAML syntax highlighting in Nova, those are provided by Panic.
