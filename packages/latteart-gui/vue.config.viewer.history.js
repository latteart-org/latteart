// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === "production" ? "../../../" : "",
  devServer: {
    host: "localhost",
  },
  outputDir: "dist/package/latteart/latteart-repository/history-viewer",
  pages: {
    index: {
      entry: "src/entry/historyViewer/main.ts",
      template: "templates/historyViewer/index.html",
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
