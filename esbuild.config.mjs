import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const prod = process.argv[2] === "production";

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: [
      "obsidian",
      "electron",
      "@codemirror/autocomplete",
      "@codemirror/collab",
      "@codemirror/commands",
      "@codemirror/language",
      "@codemirror/lint",
      "@codemirror/search",
      "@codemirror/state",
      "@codemirror/view",
      "@lezer/common",
      "@lezer/highlight",
      "@lezer/lr",
      ...builtins,
    ],
    format: "cjs",
    watch: !prod,
    target: "es2018",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: "main.js",
    minify: true,
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ["src/styles.css"],
    bundle: true,
    watch: !prod,
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    outfile: "styles.css",
    minify: true,
  })
  .catch(() => process.exit(1));
