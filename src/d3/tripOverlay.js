var data = {
  "nodes": [{
    "name": "A",
    "lat_long": [ 38.11666, 14.36666 ]
  }, {
    "name": "B",
    "lat_long": [ 38.11666, 15.36666 ]
  }, {
    "name": "C",
    "lat_long": [ 38.11666, 16.36666 ]
  }, {
    "name": "D",
    "lat_long": [ 38.11666, 17.36666 ]
  }],
  "links": [{
    "source": 0,
    "target": 1
  }, {
    "source": 0,
    "target": 2
  }, {
    "source": 0,
    "target": 3
  }, {
    "source": 2,
    "target": 3
  }]
}



// Create the Google Map…
var map = new google.maps.Map(d3.select("#googleMap").node(), {
  zoom: 4,
  center: new google.maps.LatLng(38.11666, 13.36666 ),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});

// Load the station data. When the data comes back, create an overlay.
  // fit the map to the boundaries of all available data points and
  // ONCE generate google LatLng objects to be re-used repeatedly
  var bounds = new google.maps.LatLngBounds();
  d3.entries(data.nodes).forEach(function(d){
    console.log(d)
    bounds.extend(d.value.lat_lng = new google.maps.LatLng( d.value.lat_long[0], 
                                                            d.value.lat_long[1]));
  });
  map.fitBounds(bounds);

  var overlay = new google.maps.OverlayView(),
      r = 4.5,
      padding = r*2;
  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayMouseTarget)
        .append("svg")
        .attr('id','canvas');
    overlay.draw = function(){
      var projection = this.getProjection(),
          sw = projection.fromLatLngToDivPixel(bounds.getSouthWest()),
          ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());
      // extend the boundaries so that markers on the edge aren't cut in half
      sw.x -= padding;
      sw.y += padding;
      ne.x += padding;
      ne.y -= padding;

      d3.select('#canvas')
        .attr('width',(ne.x - sw.x) + 'px')
        .attr('height',(sw.y - ne.y) + 'px')
        .style('position','absolute')
        .style('left',sw.x+'px')
        .style('top',ne.y+'px');

      var marker = layer.selectAll('.marker')
        .data(d3.entries(data.nodes))
        .each(transform)
      .enter().append('circle')
        .attr('class','marker')
        .attr('r',r)
        .attr('cx',function(d) {
          d = projection.fromLatLngToDivPixel( d.value.lat_lng );
          return d.x-sw.x;
        })
        .attr('cy',function(d) {
          d = projection.fromLatLngToDivPixel( d.value.lat_lng);
          return d.y-ne.y;
        })
        .append('title').text(function(d){
          return d.key;
        });

      function transform(d) {
        d = projection.fromLatLngToDivPixel(d.value.lat_lng);
        return d3.select(this)
          .attr('cx',d.x-sw.x)
          .attr('cy',d.y-ne.y);
      }
    };
  };

  // Bind our overlay to the map…
  overlay.setMap(map);
