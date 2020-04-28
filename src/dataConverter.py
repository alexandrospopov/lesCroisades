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

  listDataFiles = os.listdir( dataDirectory )
  listDataFiles = [ f for f in listDataFiles if f.endswith( ".xlsx" ) ]

  dataJson = {}
  pathToJson = os.path.join( jsonDirectory, "%s.json" % dataName )

  for dataFile in listDataFiles :

    pathToDataFile = os.path.join( dataDirectory, dataFile)
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

def addTrip( cityNameTripStart, cityNameTripEnd, 
             latLongTripStart, latLongTripEnd,
             timeTrip,
             armyName,
             armyColor,
             armyPopulation,
             tripDescription,
             stopCategory,
             stopAngle  ):

  trip = {
        "latLongTripStart": latLongTripStart,
        "latLongTripEnd": latLongTripEnd,
        "cityNameTripStart" : cityNameTripStart,
        "cityNameTripEnd" : cityNameTripEnd,
        "timeTripStart" : timeTrip[ 0 ],
        "timeTripEnd" : timeTrip[ 1 ],
        "tripDuration" : timeTrip[ 1 ] - timeTrip[ 0 ],
        "armyName" : armyName,
        "armyColor" : armyColor,
        "armyPopulation" : armyPopulation,
        "tripDescription" : tripDescription,
        "stopCategory" : stopCategory,
        "stopAngle" : stopAngle
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

  stopAngle = -1

  for armyName in armyData:

    armyColor = armyData[ armyName ][ "admin" ][ "color" ]
    for tripNum in armyData[ armyName ][ "trajets" ][ "departArrivee" ]:
      
      cityNameTripStart, cityNameTripEnd = \
        armyData[ armyName ][ "trajets" ][ "departArrivee" ][ tripNum ].split( " - " )

      latLongTripStart = getLatLongForCity( cityData, cityNameTripStart )
      latLongTripEnd = getLatLongForCity( cityData, cityNameTripEnd )

      timeTrip  = analyseTimeData(
                      armyData[ armyName ][ "trajets" ][ "annees" ][ tripNum ] )

      armyPopulation = armyData[ armyName ][ "trajets" ][ "nombre" ][ tripNum ]
      tripDescription = armyData[ armyName ][ "trajets" ][ "description" ][ tripNum ]

      stopCategory = armyData[ armyName ][ "trajets" ][ "etat" ][ tripNum ]

      stopAngle += 1 

      listAllTrips.append( addTrip( cityNameTripStart, cityNameTripEnd, 
                               latLongTripStart, latLongTripEnd,
                               timeTrip,
                               armyName,
                               armyColor,
                               armyPopulation,
                               tripDescription,
                               stopCategory, 
                               stopAngle ) )


  with open( pathToTripJson, "w") as j:
    json.dump( listAllTrips, j) 

  print( "Wrote json/trip.json")


def makeArmyIcons(  jsonDirectory ):

  print( "Making icons")

  imgDirectory = os.path.join( "..", "img","trips", "root" )
  imgNameList = os.listdir( imgDirectory )

  pathToArmyJson = os.path.join( jsonDirectory, "armees.json")

  with open( pathToArmyJson, 'r') as j:
    armyData = json.load( j )

  for armyName in armyData:

    for imgName in imgNameList:

      with open( os.path.join( imgDirectory, imgName ),'r') as imgFile:
        imgText = imgFile.readlines()

      for indexLine, line in enumerate( imgText ) :

        if '<svg' in line:

          imgText[ indexLine ] = line.replace( 
                  '<svg',
                '<svg fill="%s" ' % armyData[ armyName ][ "admin" ][ "color" ])
          break
      
      else:   

        raise IOError( "%s does not have '<svg' " )

      outputPath = os.path.join( "..", "img","trips",
                                                "%s-%s" % ( armyName, imgName ) )

      with open( outputPath, "w" ) as outputImgFile:
        outputImgFile.write( " ".join( imgText) )
      
      print( "  Wrote %s-%s" % ( armyName, imgName ))


if __name__ == "__main__" : 
  
  rootDataDirectory = os.path.join( "..", "data" ) 
  jsonDirectory = os.path.join( "json" )

  if not os.path.isdir( jsonDirectory ):
    os.mkdir( jsonDirectory )

  translateExcel( rootDataDirectory, jsonDirectory, "armees" )
  translateExcel( rootDataDirectory, jsonDirectory, "villes" )

  makeArmyIcons( jsonDirectory )

  writeTripJson( jsonDirectory )