/* global $:false */
/* global L:false */
/* global w3c_slidy:false */

w3c_slidy.mouse_click_enabled = false;

var landmarks, districts, result, display;
$.getJSON('data/historic_landmarks.geojson', function (data) {
  landmarks = data;
});

// $.getJSON('data/austin_districts.geojson', function (data) {
//   districts = data;
// });

var setupMap = function(el) {
  var map = L.map(el, {
    center: [31.96860, -99.90181],
    zoom: 6
  });

  var base = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  });

  map.addLayer(base);
  return map;
};

var runCode = function (event) {
  event.preventDefault();
  event.stopPropagation();
  var $this = $(this);
  var $parent = $this.parent();

  var $map = $('<div class="map"></div>');
  $parent.append($map);

  var map = setupMap($map[0]);
  var code = $parent.find('code').text();
  
  if (code) { eval(code); }
  if (!result) { return; }

  if (result.type === 'FeatureCollection') {
    var maxPointCount = result.features.reduce(function (currMax, f) {
      if (f.properties && f.properties.pointCount && f.properties.pointCount > currMax) {
        return f.properties.pointCount;
      }
      return currMax;
    }, 0);
  }

  var geojsonLayer = L.geoJson(result, {
    style: function (feature) {
      var color = '#2ECC71';
      var opacity = 0.8;
      var fillOpacity = 0.6;
      if (feature.properties.hasOwnProperty('pointCount')) {
        opacity = 0;
        fillOpacity = feature.properties.pointCount / maxPointCount;
      }
      return {
        'color': color,
        'fillColor': color,
        'opacity': opacity,
        'fillOpacity': fillOpacity
      }; 
    }
  }).addTo(map);

  map.fitBounds(geojsonLayer.getBounds(), {animate: false});

  if (display) {
    $parent.append('<p class="display">' + display + '</p>');
  }

  $this.hide();
  code = null;
  display = null;
};

$('body').keypress(function (event) {
  //find .slide without class .hidden
  //if is has button, click() it
  if (event.which === 13) {
    $('div.slide').not('.hidden').find('button').click();
  }
});

$('button').one('click', runCode);
