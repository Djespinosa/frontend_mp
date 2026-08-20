const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = webpack.container;

require('dotenv').config();

const deps = require('./package.json').dependencies;

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
      publicPath: 'auto',
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
        name: 'requesterApp',
        filename: 'remoteEntry.js',
        exposes: {
          // Componente agnóstico de router (solo <Routes>/<Route> internos):
          // el host lo monta bajo /requests/*, el bootstrap standalone lo
          // monta bajo su propio <BrowserRouter> para desarrollo aislado.
          './RequesterApp': './src/App.tsx',
        },
        shared: {
          react: { singleton: true, requiredVersion: deps.react },
          'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
          'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
        },
      }),
    ],
    devServer: {
      port: 3001,
      historyApiFallback: true,
      open: false,
      hot: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
  };
};
