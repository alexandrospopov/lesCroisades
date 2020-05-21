// Create the Google Map…
var map = new google.maps.Map(d3.select("#googleMap").node(), {
  zoom: 4,
  center: new google.maps.LatLng(38.11666, 13.36666 ),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});


minimalRadius = 10
sizeLogo = 40
var sw = 0;
var ne = 0;
var selectedTimePeriodStart = 1096 * 360 
var selectedTimePeriodEnd =  1098 * 360 ;
var incrementAngular = 0;

var iconStopVisibility = true;
var iconCityVisibility = true;


var overlay = new google.maps.OverlayView();

function drawTripMap( mapName )
{
Promise.all([ d3.json( "src/json/trips.json" ),
              d3.json( "src/json/armees.json" ),
              d3.json( "src/json/endroits.json" ),
              d3.json( "src/json/cartes.json" ), ]).then(function( files ) 
{

    tripList = files[ 0 ]
    armyList = files[ 1 ]
    cityList = files[ 2 ]
    mapDict = files[ 3 ]

    tripList = tripList.filter( 
      trip => mapDict[ mapName ].idArmees.includes(trip.armyId) ) 
    
    cityListToShow = d3.entries(cityList).filter( 
      city => mapDict[ mapName ].idEndroits.includes(city.key)
    )

      // d3.selectAll('.link').remove()
      // d3.selectAll('.tripStop').remove()
      d3.selectAll('.marker').remove()


    var divArmyChoice = d3.select('#armyChoice')

    var divArmyChoiceCheckBox = divArmyChoice.selectAll(' .checkBoxDiv')
                                              .data( d3.entries(armyList) ) 

    var divArmyChoiceCheckBoxEnter = divArmyChoiceCheckBox.enter()
                 .append('div')
                 .attr('class','checkBoxDiv')

    divArmyChoiceCheckBoxEnter.append('input')
                              .attr('class','checkBoxDiv_cb')
                              .attr('type','checkbox')
                              .attr('id', d => 'cb_'+ d.value.admin.id )
                              .attr('name', d=> d.value.admin.fullName )
                              .attr('value', d=> d.value.admin.fullName )
                              .attr('checked', "checked" )
                              .on('click', function( d ){
                                let currentVisibility = this.checked ? "visible" : "hidden";
                                d['value']['admin']['visibility'] = currentVisibility
                                d3.selectAll( '.link')
                                  .filter( e=> { return d.key == e.armyId } )
                                  .attr('visibility', currentVisibility)
                                d3.selectAll('.tripStop')
                                  .filter( e=> { return d.key == e.armyId } )
                                  .attr('army-visibility', currentVisibility)
                                  .each( setStopIconVisibility )
                                overlay.draw()
                              })

    divArmyChoiceCheckBoxEnter.append('label')
                              .attr( 'class','checkBoxDiv_label' )
                              .html( d=> d.value.admin.fullName )


    bounds = setBounds( d3.entries(cityList) )
    map.fitBounds( bounds );

    overlay.onAdd = function() {


      var layer = d3.select(this.getPanes().overlayMouseTarget )
          .append("svg")
          .attr('id','canvas');

      
      overlay.draw = function(){
        var projection = this.getProjection();

        sw = setSouthWest( projection, bounds, 60 * 2  )
        ne = setNorthEast( projection, bounds, 60 * 2  )

        d3.select('#canvas')
          .attr( 'width' , ( ne.x - sw.x ) + 'px')
          .attr( 'height' , ( sw.y - ne.y ) + 'px')
          .style( 'position', 'absolute' )
          .style( 'left', sw.x + 'px' )
          .style( 'top', ne.y +'px' );




        selectedTripList = tripList.filter( 
          trip => ( trip.timeTripStart < selectedTimePeriodEnd && 
                    trip.timeTripEnd > selectedTimePeriodStart ) )

        selectedTripStopList = selectedTripList.filter(
          trip => ( trip.cityNameTripStart == trip.cityNameTripEnd ) )

        selectedTripList = selectedTripList.filter(
          trip => ( trip.cityNameTripStart != trip.cityNameTripEnd ) )


        var linkGroup = layer.selectAll(".link")
                             .data( selectedTripList )   
                             .each( setStartEndCoordinates )

        var linkGroupEnter = linkGroup.enter()
                                      .append('g')
                                      .attr('class','link')
                                      .on("mouseover", trip => visibleTripTooltip(trip ))
                                      .on("click", trip => { printTripInformations( trip ) } )
                                      .on("mouseout", () => hideToolTip());
        
        linkGroupEnter.append("line")
                      .attr('class','link-line')

        linkGroupEnter.append("circle")
                      .attr('class','link-circle-start')

        linkGroupEnter.append("circle")
                      .attr('class','link-circle-end')

        linkGroup.select('.link-line')
                 .attr('x1', trip => trip.x1 + 'px')
                 .attr('y1', trip => trip.y1 + 'px')
                 .attr('x2', trip => trip.x2 + 'px') 
                 .attr('y2', trip => trip.y2 + 'px')
                 .attr('visibility', trip => armyList[ trip.armyId ].admin.visibility )
                 .style('stroke', trip =>  trip.armyColor )
                 .style('stroke-width', '6px' ) 

        linkGroup.select('.link-circle-start')
                 .attr( 'r', "3" )
                 .attr('cx', trip => trip.x1 )
                 .attr('cy', trip => trip.y1 )
                 .attr('visibility', trip => armyList[ trip.armyId ].admin.visibility )
                 .style('fill', trip => trip.armyColor )

        linkGroup.select('.link-circle-end')
                 .attr( 'r', "3" )
                 .attr('cx', trip => trip.x2 )
                 .attr('cy', trip => trip.y2 )
                 .attr('visibility', trip => armyList[ trip.armyId ].admin.visibility )
                 .style('fill', trip => trip.armyColor )

        linkGroup.exit().remove()

        var tripStops = layer.selectAll( ".tripStop" )
                             .data( selectedTripStopList )

        var tripStopsEnter = tripStops.enter().append('image')
                                              .attr( 'xlink:href', d => 'img/trips/' + d.armyId + '-' + d.stopCategory +'.svg')
                                              .attr('width', sizeLogo)
                                              .attr('height', sizeLogo)
                                              .attr( 'class', 'tripStop' )
                                              .attr('army-visibility' , "visible")
                                              .attr('global-visibility' , "visible")
                                              .attr('visibility', trip => armyList[ trip.armyId ].admin.visibility )
                                              .on("mouseover", trip => visibleTripTooltip(trip ))
                                              .on("click", trip => { printTripInformations( trip ) } )
                                              .on("mouseout", () => hideToolTip());


        tripStops.each( drawTripStopMarker )
                 .attr( 'xlink:href', d => 'img/trips/' + d.armyId + '-' + d.stopCategory +'.svg')

        tripStops.exit().remove()

        var places = layer.selectAll( '.marker' )
                          .data( cityListToShow )

        var placesEnter = places.enter().append('image')
                                .attr( 'xlink:href', d => 'img/cities/' + d.value.Geographie.Etat +'.svg')
                                .attr('width', sizeLogo)
                                .attr('height', sizeLogo)
                                .attr( 'class', 'marker' )
                                .on( "mouseover" , d => visibleCityTooltip( d , tooltip, tripList ) )
                                .on( "mouseout" , d => hideToolTip())
                                .each( drawMarker)
                               
        places.each( drawMarker )
              .attr( 'xlink:href', d => 'img/cities/' + d.value.Geographie.Etat +'.svg')



          function setStartEndCoordinates( trip ){

            let p1 = new google.maps.LatLng( trip.latLongTripStart[0], 
                                             trip.latLongTripStart[1] )
            let p2 = new google.maps.LatLng( trip.latLongTripEnd[0], 
                                             trip.latLongTripEnd[1] )
            p1 = projection.fromLatLngToDivPixel( p1 );
            p2 = projection.fromLatLngToDivPixel( p2 );
            p1 = ajustForBounds( p1 )
            p2 = ajustForBounds( p2 )


            var coordinates = adjustForDuplicates( trip, p1, p2 )
            p1 = coordinates[ 0 ]
            p2 = coordinates[ 1 ]
              
            coordinates  = adjustForSelectedPeriod( trip, p1, p2 )
            q1 = coordinates[ 0 ]
            q2 = coordinates[ 1 ]

            trip["x1"] = q1[0];
            trip["y1"] = q1[1];
            trip["x2"] = q2[0]; 
            trip["y2"] = q2[1];  
          }


          function drawTripStopMarker( trip ) {
            latLong = new google.maps.LatLng( trip.latLongTripStart[0],
                                              trip.latLongTripStart[1])
            d = projection.fromLatLngToDivPixel( latLong );
            let incrementAngular = trip.stopAngle * Math.PI / 8;
            let incrementX = sizeLogo * Math.cos( incrementAngular )
            let incrementY = sizeLogo * Math.sin( incrementAngular )

            return d3.select(this)
                     .attr("transform", "translate(" + ( d.x - sw.x + incrementX - (sizeLogo -10) ) + "," + ( d.y - ne.y + incrementY - (sizeLogo - 10)) + ")")
          }



        function drawMarker(d) {
          
          latLong = new google.maps.LatLng( d.value.Geographie.Latitude,
                                            d.value.Geographie.Longitude )
          d = projection.fromLatLngToDivPixel( latLong );
          return d3.select(this)
            .attr("transform", "translate(" + ( d.x - sw.x - sizeLogo/2 ) + "," + ( d.y - ne.y - sizeLogo/2 )  + ")")
        }
      };
    };
  
  overlay.setMap(map);

// updateTimePrint( [ 1096*360, 1098*360 ] )
// setSlider( 1096*360, 1098*360 )

})
}

function setBounds( nodes ){
  var bounds = new google.maps.LatLngBounds();

  nodes.forEach(function(d){

    bounds.extend(d.value.latLong = new google.maps.LatLng( 
                                                d.value.Geographie.Latitude, 
                                                d.value.Geographie.Longitude ));
  });
  return bounds
}

function ajustForBounds( d ){
  d.x -= sw.x
  d.y -= ne.y
  return d 
}

function adjustForDuplicates( trip, p1, p2 ){
  if (trip.offset > 0){
    let vectorDirect = [ p2.x - p1.x, 
                         p2.y - p1.y] 
    let vectorOrthogonal = [ vectorDirect[ 1 ], - vectorDirect[ 0 ] ];
    let normVectorOrthogonal = Math.sqrt( vectorOrthogonal[ 0 ] * vectorOrthogonal[ 0 ] + vectorOrthogonal[ 1 ] * vectorOrthogonal[ 1 ] );  
    vectorOrthogonal[ 0 ] = vectorOrthogonal[ 0 ] / normVectorOrthogonal
    vectorOrthogonal[ 1 ] = vectorOrthogonal[ 1 ] / normVectorOrthogonal
    p1.x = p1.x + vectorOrthogonal[ 0 ] * 6 
    p1.y = p1.y + vectorOrthogonal[ 1 ] * 6 

    p2.x = p2.x + vectorOrthogonal[ 0 ] * 6 
    p2.y = p2.y + vectorOrthogonal[ 1 ] * 6

    return [ p1, p2 ]

  }
  else{
    return [ p1, p2 ]
  }
}

function adjustForSelectedPeriod( trip, p1, p2 ){

  let vectorDirect = [ p2.x - p1.x, 
                       p2.y - p1.y] 
  let vectorIndirect = [ p1.x - p2.x,
                         p1.y - p2.y ]

  let tripPeriodStart = selectedTimePeriodStart;
  let tripPeriodEnd = selectedTimePeriodEnd;

  if ( tripPeriodEnd >= trip.timeTripEnd ){ tripPeriodEnd = trip.timeTripEnd }
  if ( tripPeriodStart <= trip.timeTripStart ){ tripPeriodStart = trip.timeTripStart }

  const q2 = [ 
  p1.x + vectorDirect[0] * ( tripPeriodEnd - trip.timeTripStart ) / trip.tripDuration,
  p1.y + vectorDirect[1] * ( tripPeriodEnd - trip.timeTripStart ) / trip.tripDuration 
]

  const q1 = [ 
  p2.x + vectorIndirect[0] * ( trip.timeTripEnd - tripPeriodStart ) / trip.tripDuration,
  p2.y + vectorIndirect[1] * ( trip.timeTripEnd - tripPeriodStart ) / trip.tripDuration 
]
  return [ q1, q2 ]
}

function setSouthWest( projection, bounds, padding){
  var sw = projection.fromLatLngToDivPixel( bounds.getSouthWest() );
  sw.x -= padding;
  sw.y += padding;
  return sw;
}

function setNorthEast( projection,  bounds, padding){
  var ne = projection.fromLatLngToDivPixel( bounds.getNorthEast() );
  ne.x += padding;
  ne.y -= padding;
  return ne;
}



function printTripInformations( trip ){

  var modal = document.getElementById("myModal");
  var span = document.getElementsByClassName("close")[0];
  var modalParagraph = document.getElementById("modalParagraph")

  modalTitle.textContent = trip.armyName + " : De " + trip.cityNameTripStart + " vers " + trip.cityNameTripEnd; 
  modalDates.textContent = trip.timeTripText;
  modalParagraph.textContent = trip.tripDescription ;
  modal.style.display = "block";

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

function visibleTripTooltip( trip ){
  d3.select('.tooltip').style("left", (d3.event.pageX + 5) + "px")
                       .style("top", (d3.event.pageY - 28) + "px")
                       .html( trip.armyName + "<br>" 
                              + "De : " + trip.cityNameTripStart + "<br>"
                              + "Vers : " + trip.cityNameTripEnd + "." )
                       .transition()
                       .style("opacity", .9);
}

function visibleCityTooltip( d, tooltip, tripList ){
  tooltip.style("left", (d3.event.pageX + 5) + "px")
         .style("top", (d3.event.pageY - 28) + "px")
         .html( d.key + "<br>" + d.value.Geographie.Etat )
         .transition()
         .style("opacity", .9);
}

function hideToolTip(){ 
  d3.select('.tooltip').transition()
         .style("opacity", 0) 
         
}

function updateLinks( range ){
  drawTripMap( range[0], range[1])
  
}


function updateCities( range ){
  // console.log(range)
}

function setStopIconVisibility( d ){
  let armyVisibility = d3.select(this).attr('army-visibility')
  let globalVisibility = d3.select(this).attr('global-visibility')

  if ( armyVisibility == "visible" && globalVisibility == "visible" ) 
  {
    d3.select(this).attr('visibility','visible')
  }
  else
  {
    d3.select(this).attr('visibility','hidden')
  }
}

function updateNavLinkColor( idNavLink){

  d3.select("#onglet-croisadesPopulaires").style('color','white')
  d3.select("#onglet-deuxiemeCroisade").style('color','white')
  d3.select("#onglet-sacConstantinople").style('color','white')

  d3.select("#onglet-" + idNavLink ).style('color','blue')
}

function updateMapChoice( mapName ){
  drawTripMap( mapName )
  updateSlider( mapName )
  updateNavLinkColor( mapName )
  overlay.draw()
}

var tooltip = d3.select( "body" )
                .append( "div" )
                .attr( "class", "tooltip" )
                .style( "opacity", 0);


d3.select("#cb_stop").on("click", function() {
  let currentVisibility = this.checked ? "visible" : "hidden";
  d3.selectAll('.tripStop')
    .attr('global-visibility',currentVisibility )
    .each( setStopIconVisibility )

 });
 d3.select("#cb_cities").on("click", function() {
  let currentVisibility = this.checked ? "visible" : "hidden";
  d3.selectAll('.marker').attr('visibility',currentVisibility)
  // overlay.draw()
 });
 
 d3.select( "#onglet-croisadesPopulaires" ).on( 'click' , function(){
  updateMapChoice( "croisadesPopulaires" )
 })

 d3.select( "#onglet-deuxiemeCroisade" ).on( "click", function(){
  updateMapChoice( "deuxiemeCroisade" )
 })
 

 d3.select( "#onglet-sacConstantinople" ).on( "click", function(){
  updateMapChoice( "sacConstantinople" )
})


drawTripMap( "croisadesPopulaires" )
updateNavLinkColor( "croisadesPopulaires" )
initializeSlider( "croisadesPopulaires" )