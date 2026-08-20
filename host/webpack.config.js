const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = webpack.container;

require('dotenv').config();

const deps = require('./package.json').dependencies;

const REQUESTER_APP_URL = process.env.REQUESTER_APP_URL ?? 'http://localhost:3001';
const APPROVAL_APP_URL = process.env.APPROVAL_APP_URL ?? 'http://localhost:3002';

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: path.resolve(__dirname, 'src/index.tsx'),
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      clean: true,
      // '/' y no 'auto': con publicPath relativo, en /dev/mock-mail o /approve
      // el navegador pide /dev/mock-mail/main.js (404). Los remotes sí deben
      // seguir en 'auto' para cargar sus chunks desde su propio dominio.
      publicPath: '/',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: { configFile: path.resolve(__dirname, 'tsconfig.build.json') },
          },
          // @mp/shared es un paquete del workspace: su fuente .ts se compila
          // directamente (no se pre-compila a dist/), así que no se excluye.
          exclude: /node_modules[\\/](?!@mp[\\/]shared)/,
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
      }),
      new webpack.DefinePlugin({
        'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL ?? 'http://localhost:3000'),
      }),
      new ModuleFederationPlugin({
        name: 'host',
        remotes: {
          requesterApp: `requesterApp@${REQUESTER_APP_URL}/remoteEntry.js`,
          approvalApp: `approvalApp@${APPROVAL_APP_URL}/remoteEntry.js`,
        },
        shared: {
          react: { singleton: true, requiredVersion: deps.react },
          'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
          'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
        },
      }),
    ],
    devServer: {
      port: 4000,
      historyApiFallback: true,
      open: false,
      hot: true,
    },
  };
};
