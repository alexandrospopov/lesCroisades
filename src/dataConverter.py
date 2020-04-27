import os
import pandas as pd
import json

"""
Naming convention 

nature + start / end 

"""

def simplifyDictionary( d ):
  """
  {
    key0 : { key1 : 0, value : ...}
  }
  =>1
  {
    key1 : ...
  }
  """

  for key in d:
  
    if len( d[ key ].keys() ) == 1:

      d[ key ] =  d[ key ][ 0 ]



def translateExcel( rootDataDirectory, jsonDirectory, dataName ):

  print( "Converting %s exceles : " % dataName)

  dataDirectory = os.path.join( rootDataDirectory, dataName )

  listDataFiles = os.listdir( dataPreciseDirectory )
  listDataFiles = [ f for f in listDataFiles if f.endswith( ".xlsx" ) ]

  dataJson = {}
  pathToJson = os.path.join( jsonDirectory, "%s.json" % dataName )

  for dataFile in listDataFiles :

    pathToDataFile = os.path.join( dataPreciseDirectory, dataFile)
    excel = pd.read_excel( pathToDataFile, sheet_name = None )

    for spreadsheet in excel:

      excel[ spreadsheet ] = excel[ spreadsheet ].to_dict()
      simplifyDictionary( excel[ spreadsheet ] )

    dataJson[ dataFile.split( '.' )[ 0 ] ] = excel

    print( "  Read %s excel." % dataFile )


  with open( pathToJson, 'w') as fp:
    json.dump( dataJson, fp)

  print( "Wrote %s ." % pathToJson )


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


def analyseTimeData( timeTrip ):

  timeTripMoment = timeTrip.split( ' - ' )

  for index, moment in enumerate( timeTripMoment ) :
    [ month, year ] = moment.split('/')
    timeTripMoment[ index ] = int( year ) * 12 + int( month )

  return timeTripMoment 


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

      [ timemTripStart, timeTripEnd ]  = analyseTimeData(
                          armyData[ army ][ "trajets" ][ "annees" ][ tripNum ] )

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
  
  rootDataDirectory = os.path.join( "..", "data" ) 
  jsonDirectory = os.path.join( "json" )

  if not os.path.isdir( jsonDirectory ):
    os.mkdir( jsonDirectory )

  translateExcel( rootDataDirectory, jsonDirectory, "armees" )
  translateExcel( rootDataDirectory, jsonDirectory, "villes" )

  writeTripJson( jsonDirectory )