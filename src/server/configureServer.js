import express from 'express';
import compression from 'compression';
import config from '../../webpack.config.client';

const IS_DEV = process.env.NODE_ENV !== 'production';

export default function configureServer() {
  const app = express();

  if (IS_DEV) {
    const webpack = require('webpack');
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');

    const compiler = webpack(config);
    const middleware = webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
      noInfo: true,
      stats: {
        colors: true
      }
    });

    console.log(config.output.publicPath, "Test");

    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));
  } else {
    app.use(compression());
    app.use(config.output.publicPath, express.static(__dirname + config.output.publicPath));
  }

  return app;
}
