import * as esbuild from "esbuild";
import * as fs from "fs";

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
  .then(() => {
    // Fix ES module interop wrapper - Obsidian needs direct class export
    let code = fs.readFileSync("main.js", "utf8");
    
    // Remove ES module wrapper patterns that esbuild adds for "export default"
    // Pattern: module.exports=B(V); var N=require... (B wraps in __esModule object)
    code = code.replace(/;module\.exports=B\(V\);var N=require\("obsidian"\);/, ';var N=require("obsidian");');
    
    // Remove the helper variables and functions that are no longer used
    code = code.replace(/,B=l=>R\(\$\(\{\},"__esModule",\{value:!0\}\),l\);/, ';');
    code = code.replace(/var V=\{\};G\(V,\{default:\(\)=>C\}\);/, '');
    
    // Add direct export at the very end
    code = code.trim() + '\nmodule.exports=C;';
    
    fs.writeFileSync("main.js", code);
    console.log("Build complete!");
  })
  .catch(() => process.exit(1));
