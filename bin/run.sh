#!/usr/bin/env bash

# Install dependencies
npm --prefix yaml.novaextension i --no-audit

# Activate the extension
nova extension activate .

