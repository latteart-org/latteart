// eslint-disable-next-line @typescript-eslint/no-var-requires
const { merge } = require("webpack-merge");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const common = require("./webpack.common.js");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = merge(common, {
  mode: "production",
  optimization: { minimize: false },
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: path.resolve(__dirname, "tsconfig.prod.json"),
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
});
