var overlay = new google.maps.OverlayView();

var map = new google.maps.Map(d3.select("#googleMap").node(), {
  center: new google.maps.LatLng( 38.11666, 13.36666 ),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});
map.setZoom(5); 

const mapDiv = d3.select( "#mainRow" );
const width = +mapDiv.attr("width");
const height = +mapDiv.attr("height");
console.log(map, width, height)


function plotAllArmyTrips( tripList )
{
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "stations");

    overlay.draw = function() {

              
      layer.select('svg').remove();
      var svg = layer.append("svg")

        
      var projection = this.getProjection(),
          padding = 10;

      var node = svg.selectAll(".stations")
          .data(d3.entries(tripList.nodes))
          .each(transform) // update existing markers
        .enter().append("g")
          .each(transform)
          .attr("class", "node");
    
          // Add a circle.
          node.append("circle")
              .attr("r", 8)
              .attr("cx", padding)
              .attr("cy", padding);
    
          // Add a label.
          node.append("text")
              .attr("x", padding + 7)
              .attr("y", padding)
              .attr("dy", ".31em")
              .text(function(d) { return d.value.cityName; });

          var link = svg.selectAll(".link")
          .data(tripList.links)
          .enter().append("line")
          .attr("class", "link")
          .each(drawlink);
    
          function transform(d) {
            d = new google.maps.LatLng( d.value.latLong[ 0 ],
                                        d.value.latLong[ 1 ]);
            d = projection.fromLatLngToDivPixel(d);
            return d3.select(this)
              .attr("transform","translate(" + d.x + "," + d.y + ")");
          }

          function drawlink(d) {
            console.log( tripList.nodes[ d.source ].cityName,
                         tripList.nodes[ d.target ].cityName )
            p1 = new google.maps.LatLng( tripList.nodes[ d.source ].latLong[ 0 ],
                                         tripList.nodes[ d.source ].latLong[ 1 ] )
            p2 = new google.maps.LatLng( tripList.nodes[ d.target ].latLong[ 0 ],
                                         tripList.nodes[ d.target ].latLong[ 1 ] )
            p1 = projection.fromLatLngToDivPixel(p1);
            p2 = projection.fromLatLngToDivPixel(p2);
            console.log(this)
            d3.select(this)
              .attr('x1', p1.x)
              .attr('y1', p1.y)
              .attr('x2', p2.x) 
              .attr('y2', p2.y)
              .style('fill', 'red')
              .style('stroke', 'steelblue');
          }
      } 
  }
  overlay.setMap(map);
}


function showTrips()
{

  Promise.all([ d3.json( "src/json/trips.json" ),
                d3.json( "src/json/armees.json" ),
                d3.json( "src/json/villes.json" ), ]).then(function( files ) {
  {
    tripList = files[ 0 ]
    armyList = files[ 1 ]
    cityList = files[ 2 ]


    plotAllArmyTrips( tripList )
  }
})
}

showTrips()