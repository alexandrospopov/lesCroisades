// var overlayTrip = new google.maps.OverlayView();



function plotAllArmyTrips( tripList )
{
  console.log( tripList )
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