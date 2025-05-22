## 1.5.1

- Remove debug logs

## 1.5.0

- Upgrade yaml-language-server from `1.15.0` to `1.18.0`,
  see [yaml-language-server CHANGELOG](https://github.com/redhat-developer/yaml-language-server/blob/main/CHANGELOG.md#1100) for more.

## 1.4.6

- Remove debug logs slowing down the extension

## 1.4.5

- Upgrade yaml-language-server to `1.15.0` from `1.11.0`,
  see [yaml-language-server CHANGELOG](https://github.com/redhat-developer/yaml-language-server/blob/main/CHANGELOG.md#1100) for more.

## 1.4.4

**Fixes**

- Use `--omit` rather than `--only` during language server install [#33](https://github.com/robb-j/nova-yaml/pull/33)
- Upgrade yaml-language-server to `1.11.0` from `1.10.0`,
  see [yaml-language-server CHANGELOG](https://github.com/redhat-developer/yaml-language-server/blob/main/CHANGELOG.md#1100) for more.

Thanks to [Patrick Fricano](https://github.com/patrickfatrick)!

## 1.4.3

**Docs**

- Document advanced configuration

**Fixes**

- Re-add option to toggle document validation

## 1.4.2

**Fixes**

- Remove unused `validate` and `format` configuration that didn't actually do anything.
- Tidy up the README and explain things better.
- Update **Setup Kubernetes Schemas** command to use `kubernetes` keyword that automatically
  hooks in to the Language Server's Kubernetes support.
  [More info →](https://github.com/redhat-developer/yaml-language-server#single-root-schema-association)
- Upgrade yaml-language-server to `1.10.0` from `1.8.0`,
  see [yaml-language-server CHANGELOG](https://github.com/redhat-developer/yaml-language-server/blob/main/CHANGELOG.md#1100) for more.

## 1.4.1

**Fixes**

- Add an error message when installing the language server fails.
- Upgrade yaml-language-server to `1.8.0` from `1.7.0`,
  see [yaml-language-server CHANGELOG](https://github.com/redhat-developer/yaml-language-server/blob/main/CHANGELOG.md#180) for more.

## 1.4.0

**Features**

- Improve the experience when the extension cannot find Node.js / NPM.
  There's a new notification to tell you what happened and it links to a new readme section to help out.
- All compiled code is now Open Source, if you fancy diving in to see what Yaml Extension is up to, [you can](https://github.com/robb-j/nova-yaml/tree/main/yaml.novaextension/Scripts)
- Upgrade yaml-language-server to `1.7.0` from `1.4.0`,
  see [yaml-language-server CHANGELOG](https://github.com/redhat-developer/yaml-language-server/blob/main/CHANGELOG.md#170) for more.

## 1.3.0

**Features**

- Upgrade yaml-language-server to `1.4.0` from `0.22.0`,
  see [yaml-language-server CHANGELOG](https://github.com/redhat-developer/yaml-language-server/blob/main/CHANGELOG.md#140) for more.

## 1.2.1

**Fixes**

- Stopped creating `stdin.log` and `stdout.log` files in your projects, sorry!
  Please remove these files.

## 1.2.0

- Upgrade yaml-language-server to `0.22.0`, it was previously `0.19.2`,
  see [yaml-language-server CHANGELOG](https://github.com/redhat-developer/yaml-language-server/blob/main/CHANGELOG.md#0220) for more.
- **IMPORTANT** by-default support for Kubernetes schemas has been dropped.
  I hope to be able to add this again in the future but it is not possible
  with current versions of the yaml server and Nova.
  See the [README.md](/yaml.novaextension/README.md) to see how to configure this now.
- New command **Setup Kubernetes Schemas** to help configure Kubernetes schema
  in the new way, as per above.
- Lots of internals of the server have been refactored,
  but this shouldn't be a noticeable change.

## 1.1.1

**Tweaks**

- Fix extension preferences, they weren't initially synchronised between Nova and the YAML server.
- Upgraded yaml-language-server to `0.19.2`, it was `0.18.0`.
  [See the Changelog](https://github.com/redhat-developer/yaml-language-server/blob/master/CHANGELOG.md#0192)
- Downgrade the `npm-shrinkwrap.json` back to v1 for better compatibility.

## 1.1

**Features**

- New configuration options, you can configure how Yaml Extension works
  in the extension's "Preferences" tab.
  - Toggle formatting
  - Toggle validation
  - Toggle hover tooltips
  - Toggle completions
- [Custom tags support](https://yaml.org/spec/1.2/spec.html#id2761292)
  - For more see "Custom tags" in the readme

## 1.0.2

**Fixes**

- Upgraded [yaml-language-server](https://github.com/redhat-developer/yaml-language-server)
  to `0.15.0` (it was `0.13.0`),
  see their [CHANGELOG](https://github.com/redhat-developer/yaml-language-server/blob/master/CHANGELOG.md#0150)

## 1.0.1

**Fixes**

- Upgraded an internal package which means less unneeded networking on startup
  ([nova-extension-utils/CHANGELOG](https://github.com/apexskier/nova-extension-utils/blob/main/CHANGELOG.md#v140))

## 1.0

Initial release
