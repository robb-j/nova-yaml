#!/usr/bin/env bash

# Ensure the build fails if TypeScript fails
set -e

# Lint TypeScript source code
npx tsc --noEmit --pretty

# Install extension dependencies
npm --prefix yaml.novaextension i --no-audit

# Bundle into JavaScript
# for no-node-js testing use: 
# ./node_modules/.bin/esbuild \
npx esbuild \
  --bundle \
  --format=cjs \
  --target=es6 \
  --platform=neutral \
  --outfile=yaml.novaextension/Scripts/main.dist.js \
  src/main.ts

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
