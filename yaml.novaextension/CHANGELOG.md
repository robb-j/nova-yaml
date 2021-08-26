## Version 1.2.1

**Fixes**

- Stopped creating `stdin.log` and `stdout.log` files in your projects, sorry!
  Please remove these files.

## Version 1.2.0

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

## Version 1.1.1

**Tweaks**

- Fix extension preferences, they weren't initially synchronised between Nova and the YAML server.
- Upgraded yaml-language-server to `0.19.2`, it was `0.18.0`.
  [See the Changelog](https://github.com/redhat-developer/yaml-language-server/blob/master/CHANGELOG.md#0192)
- Downgrade the `npm-shrinkwrap.json` back to v1 for better compatibility.

## Version 1.1

**Features**

- New configuration options, you can configure how Yaml Extension works
  in the extension's "Preferences" tab.
  - Toggle formatting
  - Toggle validation
  - Toggle hover tooltips
  - Toggle completions
- [Custom tags support](https://yaml.org/spec/1.2/spec.html#id2761292)
  - For more see "Custom tags" in the readme

## Version 1.0.2

**Fixes**

- Upgraded [yaml-language-server](https://github.com/redhat-developer/yaml-language-server)
  to `0.15.0` (it was `0.13.0`),
  see their [CHANGELOG](https://github.com/redhat-developer/yaml-language-server/blob/master/CHANGELOG.md#0150)

## Version 1.0.1

**Fixes**

- Upgraded an internal package which means less unneeded networking on startup
  ([nova-extension-utils/CHANGELOG](https://github.com/apexskier/nova-extension-utils/blob/main/CHANGELOG.md#v140))

## Version 1.0

Initial release
