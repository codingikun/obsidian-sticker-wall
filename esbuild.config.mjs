import * as esbuild from "esbuild";

const isProduction = process.argv.includes("production");

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: ["obsidian"],
    format: "cjs",
    platform: "node",
    target: "node16",
    sourcemap: !isProduction,
    minify: isProduction,
    outfile: "main.js",
    loader: {
      ".svg": "text",
    },
  })
  .catch(() => process.exit(1));
