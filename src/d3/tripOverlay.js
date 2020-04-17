// var overlayTrip = new google.maps.OverlayView();

function showTrips()
{
  console.log("ici")
  Promise.all([ d3.json( "json/armees.json" ) ]).then(function( d ) {
  {
    console.log( d )
  }
})
}

showTrips()