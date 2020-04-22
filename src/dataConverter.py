import os
import pandas as pd
import json

def simplifyDictionary( d ):

  for key in d:
  
    if len( d[ key ].keys() ) == 1:

      d[ key ] =  d[ key ][ 0 ]



def translateExcel( dataDirectory, jsonDirectory, dataName ):

  print( "Converting %s exceles : " % dataName)

  dataPreciseDirectory = os.path.join( dataDirectory, dataName )

  listDataFiles = os.listdir( dataPreciseDirectory )
  listDataFiles = [ f for f in listDataFiles if f.endswith( ".xlsx" ) ]

  fullDataJson = {}
  pathToFullDataJson = os.path.join( jsonDirectory, "%s.json" % dataName )

  for dataFile in listDataFiles :

    pathToDataFile = os.path.join( dataPreciseDirectory, dataFile)
    data = pd.read_excel( pathToDataFile, 
                          sheet_name = None )

    for spreadsheet in data:

      data[ spreadsheet ] = data[ spreadsheet ].to_dict()
      simplifyDictionary( data[ spreadsheet ] )

    fullDataJson[ dataFile.split( '.' )[ 0 ] ] = data

    print( "  Read %s excel." % dataFile )


  with open( pathToFullDataJson, 'w') as fp:
    json.dump( fullDataJson, fp)

  print( "Wrote %s ." % pathToFullDataJson )


def getLatLongForCity( cityData, cityName ):

  cityName = cityName.replace(" ","")
  
  return [ 
    cityData[ cityName ][ "Geographie" ][ "Latitude" ],
    cityData[ cityName ][ "Geographie" ][ "Longitude" ]
  ]

def addTrip( startCity, endCity, 
             startCityLatLong, endCityLatLong,
             tripYears,
             army, color,
             armyPopulation,
             tripDescription  ):

  trip = {
        "source": startCityLatLong,
        "target": endCityLatLong,
        "sourceCity" : startCity,
        "targetCity" : endCity,
        "yearBegin" : tripYears[ 0 ],
        "yearEnd" : tripYears[ 1 ],
        "tripDuration" : int( tripYears[ 1 ] ) - int( tripYears[ 0 ] ),
        "army" : army,
        "color" : color,
        "nombre" : armyPopulation,
        "description" : tripDescription
    }

  return trip

def getCityNum( listAllCities, cityToFind ):

  for numCity, city in enumerate( listAllCities ):

    if cityToFind == city[ "cityName" ]:

      return numCity

  else:

    raise ValueError("%s not part of listAllCities." % cityToFind )


def writeTripJson( jsonDirectory ):
  
  pathToArmyJson = os.path.join( jsonDirectory, "armees.json")
  pathToCitiesJson = os.path.join( jsonDirectory, "villes.json")
  pathToTripJson = os.path.join( jsonDirectory, "trips.json")

  with open( pathToArmyJson, 'r') as j:
    armyData = json.load( j )

  with open( pathToCitiesJson, 'r') as j:
    cityData = json.load( j )


  listAllTrips = []

  for army in armyData:

    color = armyData[ army ]["admin"]["color"]
    for tripNum in armyData[ army ][ "trajets" ][ "departArrivee" ]:
      
      startCity, endCity = armyData[ army ][ "trajets" ][ "departArrivee" ][ tripNum ].split( " - " )
      startCityLatLong = getLatLongForCity( cityData, startCity )
      endCityLatLong = getLatLongForCity( cityData, endCity )

      tripYears = armyData[ army ][ "trajets" ][ "annees" ][ tripNum ].split( " - " )

      armyPopulation = armyData[ army ][ "trajets" ][ "nombre" ][ tripNum ]
      tripDescription = armyData[ army ][ "trajets" ][ "description" ][ tripNum ]
      listAllTrips.append( addTrip( startCity, endCity, 
                               startCityLatLong, endCityLatLong,
                               tripYears,
                               army,
                               color,
                               armyPopulation,
                               tripDescription ) )

  print( listAllTrips )

  with open( pathToTripJson, "w") as j:
    json.dump( listAllTrips, j) 

  print( "Wrote json/trip.json")


if __name__ == "__main__" : 
  
  dataDirectory = os.path.join( "..", "data" ) 
  jsonDirectory = os.path.join( "json" )

  if not os.path.isdir( jsonDirectory ):
    os.mkdir( jsonDirectory )

  translateExcel( dataDirectory, jsonDirectory, "armees" )
  translateExcel( dataDirectory, jsonDirectory, "villes" )

  writeTripJson( jsonDirectory )