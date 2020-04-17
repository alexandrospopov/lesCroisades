// var overlayTrip = new google.maps.OverlayView();


function plotTrip( trip, cityList )
{
  startTownName = trip.split(" - ")[ 0 ]
  startTown = cityList[ startTownName ]

  endTownName = trip.split(" - ")[ 1 ]
  endTown = cityList[ startTownName ]
  

}

function plotAllArmyTrips( army, cityList )
{
  for( let tripsNum in army.trajets.departArrivee )
  {
    trip = army.trajets.departArrivee[ tripsNum ]
    plotTrip( trip, cityList )
  }

} 

function showTrips()
{

  Promise.all([ d3.json( "json/armees.json" ),
                d3.json( "json/villes.json" ), ]).then(function( files ) {
  {
    armyList = files[ 0 ]
    cityList = files[ 1 ]

    for( let armyId in armyList )
    {
      army = armyList[ armyId ]
      plotAllArmyTrips( army, cityList )
    }
  }
})
}

showTrips()