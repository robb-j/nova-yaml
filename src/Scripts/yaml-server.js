// #!/usr/bin/env node

//
// This file is an entrypoint for packaging up the yaml-server into a single javascript file.
// The idea is to bundle the js cli into a single file to distribute without npm+network required
// - 2/12/2020 I couldn't get it bundled up using rollup or @vercel/ncc
//

import "yaml-language-server/out/server/src/server.js";
