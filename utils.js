(function(context) {

    context.loadImages = loadImages;
    context.loadImagesOnCanvas = loadImagesOnCanvas;

    function loadImages(options, callback) {
        var frag = document.createDocumentFragment();
        _loadImages(options.images, callback, function(key, url, done) {
            var img = document.createElement('img');
            img.onload = function() {
                done(null, img);
            }
            img.src = url;
            frag.appendChild(img);
        });
    }

    function loadImagesOnCanvas(options, callback) {
        _loadImages(options.images, callback, function(key, url, done) {
            var w = options.width;
            var h = options.height;
            var canvas = document.createElement('canvas');
            canvg(canvas, url, {
                renderCallback : function() {
                    done(null, canvas);
                }
            });
        });
    }

    // ---------------------------------------

    function _loadImages(images, callback, f) {
        var result = {};
        var counter = 0;
        var keys = Object.keys(images);
        if (!keys.length){
            return callback(null, result);
        }
        for (var i = 0; i < keys.length; i++) {
            (function(key, url) { // We need it!
                f(key, url, function(err, image) {
                    counter++;
                    result[key] = {
                        url : url,
                        image : image
                    };
                    if (counter == keys.length) {
                        callback(null, result);
                    }
                });
            })(keys[i], images[keys[i]]);
        }
    }
})(this);
