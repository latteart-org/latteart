// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "../../../" : "",
  devServer: {
    host: "localhost",
  },
  outputDir: "history-viewer",
  pages: {
    index: {
      entry: "src/gui/entry/historyViewer/main.ts",
      template: "templates/historyViewer/index.html",
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
