const fs = require('fs');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const IS_DEV = process.env.NODE_ENV !== 'production';

const serverConfig = {
  debug: true,
  entry: [`${__dirname}/src/server/server.js`],
  output: {
    path: `${__dirname}/dist/`,
    filename: 'server.bundle.js'
  },
  target: 'node',
  plugins: [
    new CopyWebpackPlugin([{
      from: './src/views',
      to: './views'
    }])
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  externals: fs.readdirSync(`${__dirname}/node_modules/`)
    .concat(['react-dom/server'])
    .reduce((x, mod) => {
      const ext = x;
      ext[mod] = `commonjs ${mod}`;
      return ext;
    }, {}
  ),
  node: {
    __filename: false,
    __dirname: false
  }
};

if (IS_DEV) {
  /**
   * Maybe use this later?
   **/
} else {
  serverConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  );
}

module.exports = serverConfig;
