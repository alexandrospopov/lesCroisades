
// Create the Google Map…
var map = new google.maps.Map(d3.select("#googleMap").node(), {
  zoom: 4,
  center: new google.maps.LatLng(38.11666, 13.36666 ),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});


  Promise.all([ d3.json( "src/json/trips.json" ),
                d3.json( "src/json/armees.json" ),
                d3.json( "src/json/villes.json" ), ]).then(function( files ) 
  {
    tripList = files[ 0 ]
    armyList = files[ 1 ]
    cityList = files[ 2 ]

    bounds = setBounds( tripList.nodes )
    map.fitBounds( bounds );

    var overlay = new google.maps.OverlayView(),
        r = 4.5,
        padding = r*2;
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
          .attr( 'width' , ( ne.x - sw.x ) + 'px')
          .attr( 'height' , ( sw.y - ne.y ) + 'px')
          .style( 'position', 'absolute' )
          .style( 'left', sw.x + 'px' )
          .style( 'top', ne.y +'px' );

        var marker = layer.selectAll('.marker')
          .data(d3.entries( tripList.nodes ))
          .each(transform)
        .enter().append('circle')
          .attr('class','marker')
          .attr('r',r)
          .attr('cx', function( d ) {
            d = projection.fromLatLngToDivPixel( d.value.latLong );
            d = ajustForBounds( d );
            return d.x ;
          })
          .attr('cy',function( d ) {
            d = projection.fromLatLngToDivPixel( d.value.latLong );
            d = ajustForBounds( d )
            return d.y ;
          })
          .append('title').text(function(d){
            return d.value.cityName;
          });

          var link = layer.selectAll(".link")
                        .data( tripList.links )
                        .each( drawlink )
                        .enter().append("line")
                        .attr("class", "link")
                        .each( drawlink );

          function drawlink(d) {
            console.log()
            console.log(d)
            p1 = projection.fromLatLngToDivPixel( tripList.nodes[ d.source ].latLong );
            p2 = projection.fromLatLngToDivPixel( tripList.nodes[ d.target ].latLong );
            p1 = ajustForBounds( p1 )
            p2 = ajustForBounds( p2 )
            d3.select(this)
              .attr('x1', p1.x + 'px')
              .attr('y1', p1.y + 'px')
              .attr('x2', p2.x + 'px') 
              .attr('y2', p2.y + 'px')
              .style('stroke', d =>  armyList[ d.army ].admin.color );  
          }

        function transform(d) {
          d = projection.fromLatLngToDivPixel(d.value.latLong);
          return d3.select(this)
            .attr('cx',d.x-sw.x)
            .attr('cy',d.y-ne.y);
        }

        function ajustForBounds( d ){
          d.x -= sw.x
          d.y -= ne.y
          return d 
        }
      };
    };

  // Bind our overlay to the map…
  overlay.setMap(map);

})


function setBounds( nodes ){
  var bounds = new google.maps.LatLngBounds();
  d3.entries( nodes ).forEach(function(d){
    bounds.extend(d.value.latLong = new google.maps.LatLng( d.value.latLong[0], 
                                                            d.value.latLong[1]));
  });
  return bounds
}
