// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  lintOnSave: false,
  publicPath: "",
  devServer: {
    host: "localhost",
  },
  outputDir: "dist/package/latteart/latteart-repository/snapshot-viewer",
  pages: {
    index: {
      entry: "src/entry/testManagementViewer/main.ts",
      template: "templates/testManagementViewer/index.html",
    },
  },
  productionSourceMap: false,
  configureWebpack: {
    devtool: "source-map",
    resolve: {
      alias: {
        "@": path.join(__dirname, "/src"),
      },
    },
  },
});
