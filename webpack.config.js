const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: {
    'generate_schedule': './src/js/generate_schedule.js',
    'generate_rate_table': './src/js/generate_rate_table.js',
    style: './src/scss/style.scss'
  },
  output: {
    path: path.resolve(__dirname, 'public/assets'),
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/style.css' })
  ],
  optimization: {
    usedExports: false,
    minimize: false
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
