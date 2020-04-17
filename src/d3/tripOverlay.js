// var overlayTrip = new google.maps.OverlayView();


function plotTrip( trip )
{
  console.log( trip )

}

function plotAllArmyTrips( army )
{
  console.log( army )
  for( let tripsNum in army.trajets.departArrivee )
  {
    trip = army.trajets.departArrivee[ tripsNum ]
    plotTrip( trip )
  }

} 

function showTrips()
{

  Promise.all([ d3.json( "json/armees.json" ) ]).then(function( armyList ) {
  {
    for( let armyId in armyList[0] )
    {
      army = armyList[ 0 ][ armyId ]
      plotAllArmyTrips( army )
    }
  }
})
}

showTrips()