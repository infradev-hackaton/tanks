'use strict';

const ENV = process.env.NODE_ENV || 'development';

module.exports = {
    entry: './index',
    output: {
        filename: 'bundle.js'
    },
    watch: ENV === 'development',
    watchOptions: {
        aggregateTimeout: 100
    },
    devtool: ENV === 'development' ? 'source-map' : null,
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel?presets[]=es2015﻿'
            }
        ]
    }
};
