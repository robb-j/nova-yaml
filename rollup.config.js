import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";

module.exports = [
  {
    input: "src/Scripts/main.ts",
    plugins: [typescript(), nodeResolve(), commonjs()],
    output: {
      file: "yaml.novaextension/Scripts/main.dist.js",
      format: "cjs",
    },
  },
  // {
  //   input: "node_modules/yaml-language-server/out/server/src/server.js",
  //   plugins: [
  //     nodeResolve(),
  //     commonjs({
  //       dynamicRequireTargets: ["node_modules/jsonc-parser/lib/umd/*.js"],
  //     }),
  //   ],
  //   output: {
  //     file: "yaml.novaextension/Scripts/yaml-server.dist.js",
  //     format: "cjs",
  //   },
  // },
];
