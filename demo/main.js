var options = {
  container: document.getElementById('map'),
  data: {
    forEach: function(callback) {
      window.DATA.features.forEach(callback);
    }
  },
  imageUrls: {
    "museum": "../icons/museum.svg"
  },
  images: {},
  colors: {
    "museums": {
      fill: '#704f97',
      line: '#c8cacd'
    }
  },
  defaultType: 'museum',
  getGeometry: function(r) {
    return r.geometry;
  },
  getProperties: function(r) {
    return r.properties;
  },
  isStar: function(r) {
    return r.properties.star;
  },
  getMarkerOpacity: function(zoom) {
    var opacity = 0.6;
    if (zoom >= 10)
      opacity = 0.7;
    else if (zoom >= 11)
      opacity = 0.8;
    else if (zoom >= 12)
      opacity = 0.9;
    else if (zoom >= 13)
      opacity = 1.0;
    else if (zoom >= 14)
      opacity = 1.0;
    else if (zoom >= 15)
      opacity = 1.0;
    return opacity;
  },
  getMarkerSize: function(zoom, isStar) {
    var baseZoom = 6;
    var baseWidth = 16;
    var baseHeight = 16;
    var maxWidth = 64;
    var maxHeight = 64;
    var minWidth = 6;
    var minHeight = 6;
    var k = Math.pow(2, zoom - baseZoom);
    var size = {
      x: Math.min(maxWidth, Math
        .max(minWidth, Math.round(baseWidth * k))),
      y: Math.min(maxHeight, Math.max(minHeight, Math.round(baseHeight * k)))
    };
    if (isStar) {
      size.x *= 2;
      size.y *= 2;
    }
    return size;
  },
};

loadImages({
  images: options.imageUrls,
  width: 32,
  height: 32,
}, function(err, images) {
  options.images = images;
  main(options);
});

function main(options) {
  var mapContainer = options.container;

  function getTagAttr(key) {
    var value = mapContainer.getAttribute('data-' + key);
    if (!value)
      return null;
    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }

  // Create a map
  var map = L.map(mapContainer);

  // Add a background layer for the map.
  // We load the address for the map layer tiles from the map container
  // element ('data-tiles-url' attribute).
  var tilesUrl = getTagAttr('tiles-url');
  var maxZoom = getTagAttr('max-zoom');
  var attribution = getTagAttr('attribution');
  var tilesLayer = L.tileLayer(tilesUrl, {
    attribution: attribution,
    maxZoom: maxZoom
  });
  map.addLayer(tilesLayer);

  // Load data and transform them into markers with basic interactivity
  // DATA object is defined in the './data.js' script.
  var dataLayer = newDataLayer(options);

  // Bind an event listener for this layer
  dataLayer.on('click', function(ev) {
    var counter = 0;

    function renderMuseum(open, data) {
      var props = options.getProperties(data);
      var script = '';
      var content = '<div>';
      if (props.name)
        content += '<h3>' + props.name + '</h3>';
      if (props.url) {
        var url = props.url;
        if (url.indexOf('http') != 0)
          url = 'http://' + url;
        content += '<div class="url"><em><a href="' + url + '" target="_blank">' + props.url + '</a></em></div>';
      }
      if (props.address && props.postcode && props.city)
        content += '<div class="address">' + props.address + '<br/>' + props.postcode + ' ' + props.city + '</div>';
      content += '</div>';
      return content;
    }

    var latlng;
    var geom = options.getGeometry(ev.data);
    if (geom.type === 'Point') {
      var coords = geom.coordinates;
      latlng = L.latLng(coords[1], coords[0]);
    } else {
      latlng = ev.latlng;
    }

    var open = ev.array.length > 1;
    var contentArray = ev.array.map(renderMuseum.bind(null, open));
    var content;
    if (contentArray.length > 1) {
      content = '<ol><li>' + contentArray.join('</li>\n<li>') + '</li></ol>';
    } else {
      content = contentArray.join('');
    }
    var zoom = map.getZoom();
    var isStar = options.isStar(ev.data);
    var markerSize = options.getMarkerSize(zoom, isStar);
    var offset = [0, -markerSize.y / 2 + 10]; // dataRenderer.getPopupOffset();
    var popup = L.popup({
      offset: offset,
      maxHeight: 250
    });
    popup.setLatLng(latlng);
    popup.setContent(content);
    popup.openOn(map);
    // map.addLayer(L.circle(latlng, {
    // color : "red",
    // width : 3
    // }));
  });
  map.addLayer(dataLayer);

  // Visualize the map.
  // We get the map center and zoom from the container element.
  // ('data-center' and 'map-zoom' element attributes)
  var mapCenter = getTagAttr('center');
  var mapZoom = getTagAttr('zoom');
  var latlng = L.latLng(mapCenter[1], mapCenter[0]);
  map.setView(latlng, mapZoom);
}

function newDataLayer(options) {
  function drawMarker(image, color, zoom, isStar) {
    var canvas = document.createElement('canvas');
    var imageSize = options.getMarkerSize(zoom, isStar);
    var imageOpacity = options.getMarkerOpacity(zoom);
    var diameter = Math.min(imageSize.x, imageSize.y);
    canvas.width = diameter;
    canvas.height = diameter;
    var lineWidth = diameter / 20;
    var context = canvas.getContext('2d');
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = diameter / 2 - lineWidth;

    context.globalAlpha = imageOpacity;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color.fill;
    context.fill();

    context.lineWidth = lineWidth;
    context.strokeStyle = color.line;
    context.stroke();

    if (diameter > 24) {
      // var iconWidth = image.width;
      // var iconHeight = image.height;
      var iconWidth = canvas.width - lineWidth * 4;
      var iconHeight = canvas.height - lineWidth * 4;
      // context.globalAlpha = 1;
      context.drawImage(image, 0, 0, image.width, image.height, //
        (canvas.width - iconWidth) / 2, (canvas.height - iconHeight) / 2,
        iconWidth, iconHeight);
    }
    return canvas;
  }

  var cache = {};

  function getColoredMarker(category, type, zoom, isStar) {
    var key = [zoom, category, type, isStar].join(':');
    var result = cache[key];
    if (!result) {
      var images = options.images;
      var image = images[type] || images[options.defaultType];
      var colors = options.colors;
      var color = colors[category] || colors[options.defaultEcosystem];
      result = drawMarker(image.image, color, zoom, isStar);
      cache[key] = result;
    }
    return result;
  }

  var dataLayer;
  var style = new L.DataLayer.GeometryRendererStyle({
    line: function() {
      return {
        lineOpacity: 0.9,
        lineColor: 'red',
        lineWidth: 2
      };
    },
    polygon: {
      fillOpacity: 0.5,
      fillColor: 'blue',
      lineOpacity: 0.9,
      lineColor: 'red',
      lineWidth: 3
    },
    marker: function(resource, params) {
      var type = 'museum';
      var category = 'museums';
      if (!type || !category)
        return;
      var zoom = params.tilePoint.z;
      var properties = options.getProperties(resource);
      var isStar = options.isStar(resource);
      var image = getColoredMarker(category, type, zoom, isStar);
      var isStar = options.isStar(resource);
      var imageSize = options.getMarkerSize(zoom, isStar);
      return {
        image: image,
        anchor: [imageSize.x / 2, imageSize.y / 2]
      };
    }
  });
  var provider = new L.DataLayer.DataProvider(options);
  var imageIndex = {};
  dataLayer = new L.DataLayer({
    style: style,
    provider: provider,
    imageIndex: function(image, params) {
      var geom = options.getGeometry(params.data);
      if (!geom || geom.type !== 'Point')
        return;
      return imageIndex;
    },
    sortData: function(array) {
      var orgs = [];
      var stars = [];
      var polygons = [];
      array.forEach(function(r) {
        var geom = options.getGeometry(r);
        if (geom.type === 'Point') {
          if (options.isStar(r)) {
            stars.push(r);
          } else {
            orgs.push(r);
          }
        } else {
          polygons.push(r);
        }
      })
      return orgs.concat(stars).concat(polygons);
    },
    tilePad: function(params) {
      var markerSize = options.getMarkerSize(params.tilePoint.z, true);
      var tileSize = 256;
      var deltaX = markerSize.x ? (markerSize.x / tileSize) * 2 : 0.5;
      var deltaY = markerSize.y ? (markerSize.y / tileSize) * 2 : 0.5;
      return [deltaX, deltaY, deltaX, deltaY];
    }
  });
  dataLayer.on('mousemove', function(ev) {
    // console.log('mousemove', ev.data);
  })
  return dataLayer;
}
