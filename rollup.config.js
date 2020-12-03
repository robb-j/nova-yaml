import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";

module.exports = [
  {
    input: "src/Scripts/main.ts",
    plugins: [typescript(), commonjs(), resolve()],
    output: {
      file: "yaml.novaextension/Scripts/main.dist.js",
      format: "cjs",
    },
  },
  // {
  //   input: "node_modules/yaml-language-server/out/server/src/server.js",
  //   // input: "node_modules/yaml-language-server/lib/esm/server.js",
  //   plugins: [commonjs(), resolve()],
  //   output: {
  //     file: "yaml.novaextension/Scripts/yaml-server.dist.js",
  //     format: "cjs",
  //   },
  // },
];
