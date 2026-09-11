const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: {
    site: './src/js/site.js',
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
        use: [MiniCssExtractPlugin.loader, 'css-loader', { loader: 'sass-loader', options: { sassOptions: { outputStyle: 'compressed' } } }]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/style.css' })
  ],
  optimization: {
    usedExports: false,
    minimize: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
