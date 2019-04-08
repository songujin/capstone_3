var path = require('path')
var config = require('../config')
var webpack = require('webpack')
var merge = require('webpack-merge')
var utils = require('./utils')
var fs = require('fs')
var baseWebpackConfig = require('./webpack.base.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var FriendlyErrors = require('friendly-errors-webpack-plugin')

var iconPath = './icons/'
var WebpackOnBuildPlugin = require('on-build-webpack')

var argv = require('minimist')(process.argv.slice(2))

var carModel = (argv.model) ? argv.model : config.model
// add hot-reload related code to entry chunks
// Object.keys(baseWebpackConfig.entry).forEach(function (name) {
//   baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
// })
baseWebpackConfig.entry = ['./build.config/dev-client'].concat(baseWebpackConfig.entry)

module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // eval-source-map is faster for development
  devtool: '#inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new CopyWebpackPlugin([
      { from: iconPath + '**/*.png' },
      { from: iconPath + '**/*.jpg'}
    ]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      title: 'gadget',
      inject: true,
      chunksSortMode: 'dependency'
    }),
    new FriendlyErrors(),
    new ExtractTextPlugin(utils.assetsPath('css/[name].[contenthash].css')),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../../node_modules')
          ) === 0
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    new WebpackOnBuildPlugin((stats) => { // build 완료 후 hook
      var htmlFile = '../build/gadgets/index.html'
      var script = '<link rel=\'stylesheet\' href=\'../../resources/index.css\'></link>'
      var indexHtml = fs.readFileSync(htmlFile).toString()
      var position = indexHtml.indexOf('<link')
      var newScript = [indexHtml.slice(0,position), script,indexHtml.slice(position)].join('')

      fs.open(htmlFile, 'w', (err, fd) => {
        if (err) throw err
        var buf = new Buffer(newScript)
        fs.writeSync(fd, buf, 0, buf.length, null, function(err, written, buffer) {
          if (err) throw err
          console.log(err, written, buffer)
          fs.close(fd, function() {
            console.log('Done')
          })
        })
      })
    })
  ]
})
