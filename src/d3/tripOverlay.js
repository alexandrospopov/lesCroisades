// Create the Google Map…
var map = new google.maps.Map(d3.select("#googleMap").node(), {
  zoom: 4,
  center: new google.maps.LatLng(38.11666, 13.36666 ),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});


minimalRadius = 10
var sw = 0;
var ne = 0;
var startPeriod = 1000
var endPeriod =  1200;
var overlay = new google.maps.OverlayView();
function drawTripMap(  )
{
Promise.all([ d3.json( "src/json/trips.json" ),
              d3.json( "src/json/armees.json" ),
              d3.json( "src/json/villes.json" ), ]).then(function( files ) 
{
    tripList = files[ 0 ]
    armyList = files[ 1 ]
    cityList = files[ 2 ]

    bounds = setBounds( cityList )
    map.fitBounds( bounds );

    overlay.setMap(null);
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


        temporalizedTripList = tripList.filter( 
          trip => ( trip.yearBegin < endPeriod && trip.yearEnd > startPeriod ) )
        
        // layer.selectAll( ".link" )
        //      .data( temporalizedTripList ).exit().remove();

        
        var linkGroup = layer.selectAll(".link")
                             .data( temporalizedTripList )  

        var linkGroupEnter = linkGroup.enter()
                                      .append('g')
                                      .attr('class','link')
                                      .on("mouseover", d => visibleTripTooltip(d, tooltip, tripList))
                                      .on("click", d => { console.log(d); printTripInformations( d ) } )
                                      .on("mouseout", d => hideToolTip( tooltip ));
        
        linkGroupEnter.append("line")
                      .attr('class','link-line')

        linkGroupEnter.append("circle")
                      .attr('class','link-circle-start')

        linkGroupEnter.append("circle")
                      .attr('class','link-circle-end')

        linkGroup.select('.link-line')
                 .each( drawlink )
                 .style('stroke', d => { return d.color })
                 .style('stroke-width', d=>{ return d.nombre/100} ) 

        linkGroup.select('.link-circle-start')
                 .each( drawlinkCircleStart )
                 .attr( 'r', d=> { return d.nombre/(2* 100) } )
                 .style('fill', d=> {return d.color})

        linkGroup.select('.link-circle-end')
                 .each( drawlinkCircleEnd )
                 .attr( 'r', d=> { return d.nombre/(2* 100) } )
                 .style('fill', d=> {return d.color})

        linkGroup.exit().remove()

        layer.selectAll( '.marker' )
               .data(d3.entries( cityList ))
               .each( drawMarker )
             .enter().append( 'circle' )
               .attr( 'class', 'marker' )
               .attr( 'r' , minimalRadius )
               .each( drawMarker)
               .on("mouseover", d => visibleCityTooltip(d, tooltip, tripList))
               .on("mouseout", d => hideToolTip( tooltip ));

          function drawlinkCircleStart( d ){
            let p1 = new google.maps.LatLng( d.source[0], 
                                             d.source[1] )
            let p2 = new google.maps.LatLng( d.target[0], 
                                             d.target[1] )
            p1 = projection.fromLatLngToDivPixel( p1 );
            p2 = projection.fromLatLngToDivPixel( p2 );
            p1 = ajustForBounds( p1 )
            p2 = ajustForBounds( p2 )

            var coordinates  = ajustForTime( d, p1, p2 )
            q1 = coordinates[ 0 ]
            q2 = coordinates[ 1 ]


            return d3.select(this)
              .attr('cx', q1[0] )
              .attr('cy', q1[1] );  
          }

          function drawlinkCircleEnd( d ){
            let p1 = new google.maps.LatLng( d.source[0], 
                                             d.source[1] )
            let p2 = new google.maps.LatLng( d.target[0], 
                                             d.target[1] )
            p1 = projection.fromLatLngToDivPixel( p1 );
            p2 = projection.fromLatLngToDivPixel( p2 );
            p1 = ajustForBounds( p1 )
            p2 = ajustForBounds( p2 )

            var coordinates  = ajustForTime( d, p1, p2 )
            q1 = coordinates[ 0 ]
            q2 = coordinates[ 1 ]


            d3.select(this)
              .attr('cx', q2[0] )
              .attr('cy', q2[1] );  
          }


          function drawlink( d ) {
            let p1 = new google.maps.LatLng( d.source[0], 
                                         d.source[1] )
            let p2 = new google.maps.LatLng( d.target[0], 
                                         d.target[1] )
            p1 = projection.fromLatLngToDivPixel( p1 );
            p2 = projection.fromLatLngToDivPixel( p2 );
            p1 = ajustForBounds( p1 )
            p2 = ajustForBounds( p2 )

            var coordinates  = ajustForTime( d, p1, p2 )
            q1 = coordinates[ 0 ]
            q2 = coordinates[ 1 ]

            d3.select(this)
              .attr('x1', q1[0] + 'px')
              .attr('y1', q1[1] + 'px')
              .attr('x2', q2[0] + 'px') 
              .attr('y2', q2[1] + 'px');  
          }

        function drawMarker(d) {
          
          latLong = new google.maps.LatLng( d.value.Geographie.Latitude,
                                           d.value.Geographie.Longitude )
          d = projection.fromLatLngToDivPixel( latLong );
          return d3.select(this)
            .attr( 'cx' , d.x - sw.x )
            .attr( 'cy' , d.y - ne.y );
        }
      };
    };

  overlay.setMap(map);

})
}

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

function ajustForTime( d, p1, p2 ){

  let vectorDirect = [ p2.x - p1.x, 
                       p2.y - p1.y] 
  let vectorIndirect = [ p1.x - p2.x,
                         p1.y - p2.y ]


  let tripPeriodEnd = endPeriod;
  let tripPeriodBegin = startPeriod;

  if ( endPeriod > d.yearEnd ){ tripPeriodEnd = d.yearEnd }
  if ( startPeriod < d.yearBegin ){ tripPeriodBegin = d.yearBegin }

  const q2 = [ p1.x + vectorDirect[0] * ( tripPeriodEnd - d.yearBegin ) / d.tripDuration,
  p1.y + vectorDirect[1] * ( tripPeriodEnd - d.yearBegin ) / d.tripDuration ]

  const q1 = [ p2.x + vectorIndirect[0] * ( d.yearEnd - tripPeriodBegin ) / d.tripDuration,
  p2.y + vectorIndirect[1] * ( d.yearEnd - tripPeriodBegin ) / d.tripDuration ]

  return [ q1, q2 ]
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
                + "De : " + d.sourceCity + "<br>"
                + "Vers : " + d.targetCity + "." )
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
  console.log(range)
  drawTripMap( range[0], range[1])
  
  // d3.selectAll( ".link" )
  //      .filter( d => d.nombre < range[0] )
  //      .style("opacity", 0)
  //      .each( function(d,i) {console.log(d)})
}


function updateCities( range ){
  // console.log(range)
}


drawTripMap( 1000, 1200)