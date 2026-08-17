import * as esbuild from "esbuild";
import path from "node:path";

const root = process.cwd();

await esbuild.build({
  entryPoints: ["artifact/entry.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  jsx: "automatic",
  outfile: "artifact/bundle.js",
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".tsx": "tsx", ".ts": "ts" },
  alias: {
    "next/link": path.join(root, "artifact/shim/link.tsx"),
    "next/navigation": path.join(root, "artifact/shim/navigation.tsx"),
  },
  // esbuild lit les alias "@/*" directement dans tsconfig.json
  tsconfig: "tsconfig.json",
  resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
});

console.log("bundle OK");
