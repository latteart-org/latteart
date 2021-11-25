// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  publicPath: "",
  devServer: {
    host: "localhost",
  },
  outputDir: "snapshot-viewer",
  pages: {
    index: {
      entry: "src/gui/entry/testManagementViewer/main.ts",
      template: "templates/testManagementViewer/index.html",
    },
  },
  productionSourceMap: false,
  configureWebpack: {
    devtool: "source-map",
    resolve: {
      alias: {
        "@": path.join(__dirname, "/src/gui"),
      },
    },
  },
};
