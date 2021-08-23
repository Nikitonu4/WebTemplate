const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

//! TODO Сделать минификацию изображений и шрифтов
// CONSTANTS
const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

// FUNCTIONS
const optimization = () => {
    const config = {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all'
        }
    }

    if (isProd) {
        config.minimizer = [
            new CssMinimizerWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }
    return config
}

const filename = extention => isDev ? `[name].${extention}` : `[name].[hash].${extention}`

const cssLoaders = (extra) => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {}
        },
        'css-loader'
    ]
    if (extra) {
        loaders.push(extra)
    }
    return loaders
}

const jsLoaders = () => {
    const loaders = [{
        loader: "babel-loader",
        options: {
            presets: [
                ['@babel/preset-env', {
                    useBuiltIns: 'usage',
                    corejs: '3.8.3',
                    targets: {
                        ie: 8,
                        chrome: 59,
                        edge: 13,
                        firefox: 50,
                    },
                    debug: true,
                }]
            ],
            plugins: ['@babel/plugin-proposal-class-properties']
        }
    }]
    // if(isDev){
    //     loaders.push('eslint-loader')
    // }
    return loaders
}

const plugins = () => {
    const base = [
        new HtmlWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CopyWebpackPlugin(
            {
                patterns: [
                    {
                        from: path.resolve(__dirname, './src/assets/'),
                        to: path.resolve(__dirname, 'dist/assets')
                    },
                ]
            }
        ),
        new MiniCssExtractPlugin({
            filename: filename('css'),
        })
    ]
    // if (isProd) {
    //     base.push(new BundleAnalyzerPlugin())
    // }
    return base
}
// MAIN PART
module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: './js/main.js',
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    resolve: {
        extensions: ['.js', '.json', '.png','.html'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@js': path.resolve(__dirname, 'src/js'),
            '@scss': path.resolve(__dirname, 'src/scss'),
            '@assets': path.resolve(__dirname, 'src/assets'),
            '@img': path.resolve(__dirname, 'src/assets/img'),
        }
    },
    optimization: optimization(),
    target: 'web',
    devServer: {
        port: 4200,
        open: true,
        hot: isDev
    },
    devtool: isDev ? 'source-map' : false,
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.less$/,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                type: 'asset/resource',
            },
            {
                test: /\.(ttf|woff|woff2|otf|eot)$/,
                type: 'asset/resource',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders()
            }
        ]
    }
}