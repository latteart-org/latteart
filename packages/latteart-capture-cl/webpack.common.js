// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: {
    index: "./src/index.ts",
  },
  target: "node",
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [
    nodeExternals({
      additionalModuleDirs: [
        path.resolve(__dirname, "..", "..", "node_modules"),
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.join(__dirname, "/src"),
    },
  },
};
