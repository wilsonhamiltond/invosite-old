const path = require('path');

module.exports = {
  entry: './server/index.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/, 
        loader: "ts-loader",
        options: {
          configFile: "tsconfig.server.json"
        }
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'invo-site-release.js',
    path: path.resolve(__dirname, 'dist')
  }
};