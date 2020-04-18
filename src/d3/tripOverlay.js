var overlay = new google.maps.OverlayView();

var map = new google.maps.Map(d3.select("#googleMap").node(), {
  center: new google.maps.LatLng( 38.11666, 13.36666 ),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});
map.setZoom(5); 


function plotAllArmyTrips( tripList )
{
  console.log( tripList )
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "stations");

    overlay.draw = function() {
          var projection = this.getProjection(),
              padding = 10;
    
          var marker = layer.selectAll("svg")
              .data(d3.entries(tripList))
              .each(transform) // update existing markers
            .enter().append("svg")
              .each(transform)
              .attr("class", "marker");
    
          // Add a circle.
          marker.append("circle")
              .attr("r", 8)
              .attr("cx", padding)
              .attr("cy", padding);
    
          // Add a label.
          marker.append("text")
              .attr("x", padding + 7)
              .attr("y", padding)
              .attr("dy", ".31em")
              .text(function(d) { return d.key; });
    
          function transform(d) {
            console.log(d)
            d = new google.maps.LatLng( d.value.startCityCoordinates[ 0 ],
                                        d.value.startCityCoordinates[ 1 ]);
            d = projection.fromLatLngToDivPixel(d);
            return d3.select(this)
                .style("left", (d.x - padding) + "px")
                .style("top", (d.y - padding) + "px");
          }
      } 
  }
  overlay.setMap(map);
}


function showTrips()
{

  Promise.all([ d3.json( "json/trips.json" ),
                d3.json( "json/armees.json" ),
                d3.json( "json/villes.json" ), ]).then(function( files ) {
  {
    tripList = files[ 0 ]
    armyList = files[ 1 ]
    cityList = files[ 2 ]


    plotAllArmyTrips( tripList )
  }
})
}

showTrips()