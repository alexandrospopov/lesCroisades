def getDay( moment ):


  if 'Debut' in moment:

    return 5, moment.replace('Debut','')

  elif 'Mi' in moment:

    return 15, moment.replace('Mi','')

  elif 'Fin' in moment:

    return 25, moment.replace('Fin','')

  elif len( moment.split('/') ) == 3 :

    return ( moment.split('/')[ 0 ],
             '/'.join( moment.split('/')[ 1: ] ) )

  else:

    return 15, moment


def analyseMomentTimeDate( moment ):
  """
  The date format must be one of the following : 
  #case 1 : '01/01/2001'
  #case 2 : '01/2000'
  #case 3 : 'word 01/2000'  
  """

  monthNameList = [  "","Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ]


  moment = moment.rstrip()

  #case 1 : 01/01/2001
  if len( moment.split('/') ) == 3 :

    momentSplit = moment.split('/')

    return "%s %s %s" % ( int( momentSplit[ 0 ] ),
                           monthNameList[ int( momentSplit[1] ) ],
                           int( momentSplit[ 2 ] ) )

  #case 2 : 01/2000
  elif len( moment ) == 7:
    momentSplit = moment.split('/')

    return "%s %s" % ( monthNameList[ int( momentSplit[ 0 ] ) ],
                       int( momentSplit[ 1 ] ) )
  
  #case 3 : Debut 01/2000  
  elif len( moment.split(' ') ) == 2:
    [ dayWord, momentWoDay ] = moment.split(' ')
    return "%s %s" % ( dayWord,
                       analyseMomentTimeDate( momentWoDay ) ) #call to case 2
    
  else:

    raise ValueError("Cannot parse '%s'." % moment )


def analyseTextTimeData( timeTrip ):

  approximativeDates = False
  
  if "Entre " in timeTrip:
    approximativeDates = True
    timeTrip = timeTrip.replace('Entre ','')

  timeTripMoment = timeTrip.split( ' - ' )
  timeTripText = []

  for moment in timeTripMoment:
    timeTripText.append( analyseMomentTimeDate( moment ) )


  returnString = ' - '.join( timeTripText )

  if approximativeDates:
    return "Entre " + returnString
  else:
    return returnString


def analyseSliderTimeData( timeTrip ):

  timeTripMoment = timeTrip.split( ' - ' )

  for index, moment in enumerate( timeTripMoment ) :
    day, momentWoDay = getDay( moment )
    [ month, year ] = momentWoDay.split('/')
    timeTripMoment[ index ] =  ( int( year ) * 12 * 30 + 
                                 int( month ) * 30 + 
                                 int( day ) )

  return timeTripMoment 
