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
