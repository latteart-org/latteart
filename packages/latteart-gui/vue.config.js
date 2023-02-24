// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  lintOnSave: false,
  outputDir: "dist/package/latteart/latteart/public",
  pages: {
    index: {
      entry: "src/entry/tool/main.ts",
      template: "templates/tool/index.html",
    },
  },
  configureWebpack: {
    devtool: "source-map",
    resolve: {
      alias: {
        "@": path.join(__dirname, "/src"),
      },
    },
  },
});
