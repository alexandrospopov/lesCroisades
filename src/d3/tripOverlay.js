// Create the Google Map…
var map = new google.maps.Map(d3.select("#googleMap").node(), {
  zoom: 4,
  center: new google.maps.LatLng(38.11666, 13.36666 ),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});


minimalRadius = 10
var sw = 0;
var ne = 0;

Promise.all([ d3.json( "src/json/trips.json" ),
              d3.json( "src/json/armees.json" ),
              d3.json( "src/json/villes.json" ), ]).then(function( files ) 
{
    tripList = files[ 0 ]
    armyList = files[ 1 ]
    cityList = files[ 2 ]

    console.log(cityList)

    bounds = setBounds( cityList )
    map.fitBounds( bounds );

    var overlay = new google.maps.OverlayView();
    overlay.onAdd = function() {
      var tooltip = d3.select(this.getPanes().overlayMouseTarget )
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);
      var layer = d3.select(this.getPanes().overlayMouseTarget )
          .append("svg")
          .attr('id','canvas');

      
      overlay.draw = function(){
        var projection = this.getProjection();

        sw = setSouthWest( projection, bounds, minimalRadius * 2  )
        ne = setNorthEast( projection, bounds, minimalRadius * 2  )

        d3.select('#canvas')
          .attr( 'width' , ( ne.x - sw.x ) + 'px')
          .attr( 'height' , ( sw.y - ne.y ) + 'px')
          .style( 'position', 'absolute' )
          .style( 'left', sw.x + 'px' )
          .style( 'top', ne.y +'px' );


        var tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

        // layer.selectAll( ".link" )
        //        .data( tripList )
        //        .each( drawlink )
        //      .enter().append( "line" )
        //        .attr( "class", "link")
        //        .each( drawlink )
        //        .style('stroke', d =>  armyList[ d.army ].admin.color )
        //        .style('stroke-width', d=>{
        //          return d.nombre/100} ) 
        //        .on("mouseover", d => visibleTripTooltip(d, tooltip, tripList))
        //        .on("click", d => printTripInformations( d ) )
        //        .on("mouseout", d => hideToolTip( tooltip ));

        // layer.selectAll( '.marker' )
        //        .data(d3.entries( cityList ))
        //        .each( drawMarker )
        //      .enter().append( 'circle' )
        //        .attr( 'class', 'marker' )
        //        .attr( 'r' , minimalRadius )
        //        .each( drawMarker)
              //  .on("mouseover", d => visibleCityTooltip(d, tooltip, tripList))
              //  .on("mouseout", d => hideToolTip( tooltip ));

          // function drawlink( d ) {
          //   p1 = projection.fromLatLngToDivPixel( tripList.nodes[ d.source ].latLong );
          //   p2 = projection.fromLatLngToDivPixel( tripList.nodes[ d.target ].latLong );
          //   p1 = ajustForBounds( p1 )
          //   p2 = ajustForBounds( p2 )
          //   d3.select(this)
          //     .attr('x1', p1.x + 'px')
          //     .attr('y1', p1.y + 'px')
          //     .attr('x2', p2.x + 'px') 
          //     .attr('y2', p2.y + 'px');  
          // }

        // function drawMarker(d) {
          
        //   latLong =new google.maps.LatLng( d.value.Geographie.Latitude,
        //                                    d.value.Geographie.Longitude )
        //   d = projection.fromLatLngToDivPixel( latLong );
        //   return d3.select(this)
        //     .attr( 'cx' , d.x - sw.x )
        //     .attr( 'cy' , d.y - ne.y );
        // }
      };
    };

  overlay.setMap(map);

})


function setBounds( nodes ){
  var bounds = new google.maps.LatLngBounds();
  d3.entries( nodes ).forEach(function(d){
    bounds.extend(d.value.latLong = new google.maps.LatLng( d.value.Geographie.Latitude, 
      d.value.Geographie.Longitude ));
  });
  return bounds
}

function ajustForBounds( d ){
  d.x -= sw.x
  d.y -= ne.y
  return d 
}

function setSouthWest( projection, bounds, padding){
  var sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
  sw.x -= padding;
  sw.y += padding;
  return sw;
}

function setNorthEast( projection,  bounds, padding){
  var ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());
  ne.x += padding;
  ne.y -= padding;
  return ne;
}

function printTripInformations( d ){
   d3.select("#additionalInfo")
    .text( d.description );
}

function visibleTripTooltip( d, tooltip, tripList ){
  tooltip.style("left", (d3.event.pageX + 5) + "px")
         .style("top", (d3.event.pageY - 28) + "px")
         .html( d.army + "<br>" 
                + "De : " + tripList.nodes[ d.source ].cityName + "<br>"
                + "Vers : " + tripList.nodes[ d.target ].cityName + "." )
         .transition()
         .style("opacity", .9);
}

function visibleCityTooltip( d, tooltip, tripList ){
  tooltip.style("left", (d3.event.pageX + 5) + "px")
         .style("top", (d3.event.pageY - 28) + "px")
         .html( d.value.cityName)
         .transition()
         .style("opacity", .9);
}

function hideToolTip( tooltip ){ 
  tooltip.transition()
         .style("opacity", 0) 
         
}

function updateLinks( range ){
  
  d3.selectAll( ".link" )
       .filter( d => d.nombre < range[0] )
       .style("opacity", 0)
       .each( function(d,i) {console.log(d)})
}


function updateCities( range ){
  console.log(range)
}