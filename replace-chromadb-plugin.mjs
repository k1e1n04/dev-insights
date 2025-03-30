import fs from "fs";

export const replaceChromadbPlugin = {
  name: "replace-chromadb-plugin",
  setup(build) {
    build.onLoad({ filter: /chromadb\.mjs$/ }, async (args) => {
      let source = await fs.promises.readFile(args.path, "utf8");
      const original = source;

      // 置き換え対象のコード
      const originalCode = `const { pipeline } = await import("chromadb-default-embed");`;
      const replacementCode = `
        const path = require.resolve("chromadb-default-embed");
        const { pipeline } = await import(path);
      `;

      // コードを置き換え
      source = source.replace(originalCode, replacementCode);

      // 置き換えが行われたかどうかを確認
      if (original === source) {
        new Error("Replacement failed");
      } else {
        console.log("Replacement made");
      }

      return {
        contents: source,
        loader: "js",
      };
    });
  },
};
