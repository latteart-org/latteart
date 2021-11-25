// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  outputDir: "dist/public",
  pages: {
    index: {
      entry: "src/gui/entry/tool/main.ts",
      template: "templates/tool/index.html",
    },
  },
  configureWebpack: {
    devtool: "source-map",
    resolve: {
      alias: {
        "@": path.join(__dirname, "/src/gui"),
      },
    },
  },
};
