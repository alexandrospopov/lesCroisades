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



if __name__ == "__main__" : 
  
  dataDirectory = os.path.join( "..", "data" ) 
  jsonDirectory = os.path.join( "json" )

  if not os.path.isdir( jsonDirectory ):
    os.mkdir( jsonDirectory )

  translateExcel( dataDirectory, jsonDirectory, "armees" )
  translateExcel( dataDirectory, jsonDirectory, "villes" )