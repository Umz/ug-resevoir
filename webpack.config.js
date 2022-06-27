'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'none',
    //entry: './src/index.js',
    entry: {
        "bundle":'./src/index.js',
        "vendor":[
            path.resolve(__dirname, 'node_modules/phaser/dist/phaser.min.js')
        ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build')
    },
    resolve: {
        alias: { phaser: path.resolve(__dirname, 'node_modules/phaser/dist/phaser.min.js') },
        modules: [
            path.resolve(__dirname + '/src')
        ]
    },
    /*
    module: {
        rules: [
          {
            test: [ /\.vert$/, /\.frag$/ ],
            use: 'raw-loader'
          }
        ]
    },
    */

    plugins: [
        new webpack.DefinePlugin({
            'CANVAS_RENDERER': JSON.stringify(true),
            'WEBGL_RENDERER': JSON.stringify(true)
        }),
    ]

};
