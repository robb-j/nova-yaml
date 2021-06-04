#!/usr/bin/env bash

npx esbuild \
  --bundle \
  --format=cjs \
  --target=es6 \
  --platform=neutral \
  --outfile=yaml.novaextension/Scripts/main.dist.js \
  src/Scripts/main.ts
