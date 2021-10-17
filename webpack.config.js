const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');
const fs = require('fs');

const pages = [];

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  }
  if (isProd) {
    config.minimizer = [
      new TerserWebpackPlugin()
    ]
  }
  return config;
}

const cssLoaders = extraLoader => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {}
    },
    'css-loader'
  ];
  if (isProd) {
    loaders.push('postcss-loader')
  }
  if (extraLoader) {
    loaders.push(extraLoader);
  }
  return loaders;
}

const jsLoaders = () => {
  const loaders = [{
    loader: 'babel-loader',
  }];

  if (isDev) {
    loaders.push('eslint-loader')
  }

  return loaders;
}

fs
  .readdirSync(path.resolve(__dirname, 'src', 'pages'))
  .filter((file) => {
    return file.indexOf('base') !== 0;
  })
  .forEach((file) => {
    pages.push(file.split('/', 2));
  });

const htmlPlugins = pages.map(fileName => new HtmlWebpackPlugin({
  getData: () => {
    try {
      return JSON.parse(fs.readFileSync(`./src/pages/${fileName}/data.json`, 'utf8'));
    } catch (e) {
      console.warn(`data.json was not provided for page ${fileName}`);
      return {};
    }
  },
  filename: `${fileName}.html`,
  template: `./pages/${fileName}/${fileName}.pug`,
  hash: true
}));


module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: isDev ? 'development' : 'production',
  entry: {
    app: '/index.js'
  },
  output: {
    filename: isDev ? '[name].js' : '[name].[hash:8].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  },
  optimization: optimization(),
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    port: 8081,
    hot: isDev
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
      {
        from: path.resolve(__dirname, 'src/assets/favicons'),
        to: path.resolve(__dirname, 'dist/assets/favicons')
      }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: isDev ? '[name].css' : '[name].[hash:8].css'
    }),
    ...htmlPlugins
  ],
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: 'pug-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      },
      {
        test: /\.css$/,
        use: cssLoaders()
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders('sass-loader')
      },
      {
        test: /\.(png|jp(e)?g|svg|gif|webp|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: isDev ? 'assets/images/[name][ext]' : 'assets/images/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(ttf|otf|woff|woff2|eot)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]'
        }
      }
    ]
  }
}