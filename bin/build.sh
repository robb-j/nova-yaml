#!/usr/bin/env bash

npx esbuild \
  --bundle \
  --format=cjs \
  --target=es6 \
  --platform=neutral \
  --outfile=yaml.novaextension/Scripts/main.dist.js \
  src/Scripts/main.ts

# 
# Try to bundle the YAML into a binary, this fails:
# // node_modules/vscode-json-languageservice/lib/umd/services/jsonSchemaService.js
# code:
#   var Strings = require2("../utils/strings");
# 
# npx esbuild \
#   --bundle \
#   --format=cjs \
#   --target=node10 \
#   --platform=node \
#   --outfile=yaml.novaextension/Scripts/yaml.dist.js \
#   node_modules/yaml-language-server/out/server/src/server.js
