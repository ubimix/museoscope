var path = require('path');
module.exports = {
    entry : __dirname + '/index.js',
    output : {
        path : __dirname + '/app/js',
        filename : 'index.js',
        publicPath : "./js/",
        libraryTarget : 'umd'
    },
    module : {
        loaders : [ {
            test : /\.jsx?$/,
            include : [ //
            path.resolve(__dirname, 'index.js'),//
            path.resolve(__dirname, 'src'), //
            path.resolve(__dirname, '../theme/'), //
            path.resolve(__dirname, 'lib-core'), //
            /.*mosaic-.*/ //
            ],
            loader : 'babel-loader'
        }, {
            test : /\.json/,
            loader : 'json-loader'
        }, {
            test : /\.less|\.css/,
            loader : "style-loader!css-loader!less-loader"
        }, {
            test : /\.html$/,
            loader : "html-loader"
        }, {
            test : /\.(png|jpg|svg|woff2?|eot|ttf)$/,
            loader : 'url-loader?limit=150000'
        } ],
//        noParse : [ __dirname + '/node_modules/react' ]
    },
    externals : [],
    resolve : {
        alias : {
            'react' : __dirname + '/node_modules/react',
            'react-dom' : __dirname + '/node_modules/react-dom',
            'mosaic-app-core' : __dirname + '/node_modules/mosaic-app-core',
            'mosaic-app-ui' : __dirname + '/node_modules/mosaic-app-ui',
            'mosaic-intents' : __dirname + '/node_modules/mosaic-intents',
            'mosaic-adapters' : __dirname + '/node_modules/mosaic-adapters',
            'mosaic-dataset' : __dirname + '/node_modules/mosaic-dataset',
            'mosaic-dataset-geo' : __dirname + '/node_modules/mosaic-dataset-geo',
            'mosaic-dataset-index' : __dirname + '/node_modules/mosaic-dataset-index',
            'mosaic-ui' : __dirname + '/node_modules/mosaic-ui',

        // leaflet : __dirname +
        // '/node_modules/leaflet/dist/leaflet-src.js',
        // 'leaflet-css' : __dirname +
        // '/node_modules/leaflet/dist/leaflet.css',
        // leaflet : __dirname +
        // '/node_modules/leaflet/dist/leaflet-src.js',
        // 'bootstrap-css-only' : __dirname
        // + '/node_modules/bootstrap/dist/css',
        // 'handsontable' : __dirname + '/node_modules/handsontable/',
        // 'handsontable-css' : __dirname
        // + '/node_modules/handsontable/src/css/handsontable.css',

        // 'autoResize' : __dirname
        // + '/node_modules/handsontable/lib/autoResize/autoResize.js',
        // 'copyPaste' : __dirname
        // + '/node_modules/handsontable/lib/copyPaste/copyPaste.js',
        // 'es6collections' : __dirname
        // + '/node_modules/handsontable/lib/es6collections/es6collections.js',
        // 'jsonpatch' : __dirname
        // + '/node_modules/handsontable/lib/jsonpatch/jsonpatch.js',
        // 'numeral' : __dirname
        // + '/node_modules/handsontable/lib/numeral/numeral.js',
        // 'SheetClip' : __dirname
        // + '/node_modules/handsontable/lib/SheetClip/SheetClip.js',
        // 'moment' : __dirname
        // + '/node_modules/handsontable/dist/moment/moment.js'
        }
    }

};
