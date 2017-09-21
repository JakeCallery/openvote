'use strict';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const WebpackAutoInject = require('./forWebPack/webpack-auto-inject-version');
//const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        indexEntry:'./js/indexPage.js'
    },

    output: {
        filename: '[name].js',
        path: __dirname + '/../../dist',
        publicPath: '/'
    },

    resolve: {
        modules: [
            'node_modules',
            './js',
            './js/jacjslibes6'
        ]
    },

    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: true,
                            sourceMap: false
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: __dirname + '/../../',
            verbose: true,
            dry: false,
            exclude: []
        }),

        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'html/index.html',
            hash: false,
            chunks: [
                'indexEntry'
            ]
        }),
/*
        new ImageminPlugin({

        }),

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false
            },
            sourceMap: true
        }),
*/
/*
        new WebpackAutoInject({
            autoIncrease: true,
            injectByTag: true,
            injectAsComment: true
        }),
*/
        function() {
            this.plugin('watch-run', function(watching, callback) {
                console.log('Begin Compile At ' + new Date());
                callback();
            })
        }
    ],
    devtool: 'source-map'
};