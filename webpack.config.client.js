const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const IS_DEV = process.env.NODE_ENV !== 'production';

const clientConfig = {
  entry: ['babel-polyfill', `${__dirname}/src/client/app.js`],
  output: {
    path: `${__dirname}/dist/static`,
    publicPath: '/static',
    filename: 'bundle.js'
  },
  plugins: [
    new ExtractTextPlugin('style.css'),
    new CopyWebpackPlugin([{
      from: './src/views',
      to: './views'
    }, {
      from: './src/img',
      to: './img'
    }, {
      from: './src/sounds',
      to: './sounds'
    }])
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel']
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(['css', 'sass'])
      }
    ]
  }
};

if (IS_DEV) {
  clientConfig.entry.unshift('webpack-hot-middleware/client?reload=true');
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  );
} else {
  clientConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin({
      compress: {
        warnings: false
      }
    })
  );
}

module.exports = clientConfig;
