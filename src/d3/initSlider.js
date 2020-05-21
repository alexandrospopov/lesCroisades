// https://bl.ocks.org/alexmacy/eb284831aff6f9d0119b

var marginTop = 150;
var marginSides = 20
var marginRight = 80
var width = 700 - marginSides * 2;
var height = 340 - marginTop;

var timeDomain = [ 1096*360, 1098*360 ]


function updateTimePrint( range ){

  let p = document.getElementById("timePrint");
  p.textContent =   deduceMonthAndYear( range[0] ) + ' - ' + deduceMonthAndYear( range[ 1 ] )

}


function initializeSlider( mapName ){


  Promise.all([ d3.json( "src/json/cartes.json" ), ]).then(function( files ) 
  {
    mapDict = files[ 0 ]
     

    timeDomain = d3.scaleLinear()
                   .domain( mapDict[mapName].admin.dates)
                   .range([0, width]);
  
    var svg = d3.select("#timeSlider").append("svg")
                .attr("width", width + marginSides + marginRight)
                .attr("height", height + marginTop)
                .append("g")
                .attr('id',"timeSliderSvg")
                .attr("transform", "translate(" + marginSides + "," + marginTop + ")")
                .call(d3.axisBottom()
                        .scale(timeDomain)
                        .tickFormat( d => deduceMonthAndYear( d ) )            
                        .ticks(4));
    
    svg.selectAll("text")  
       .style("text-anchor", "start")
       .attr("font-size", 15)
       .attr("dx", "0.6em")
       .attr("dy", ".15em")
       .attr("transform", "rotate(-65)" );
  
  
    var brush = d3.brushX()
       .extent([[0,0], [width,height]])
       .on("brush", brushed);

    var brushg = svg.append("g")
                    .attr("class", "brush")
                    .call( brush ) 

    updateTimePrint( mapDict[mapName].admin.dates  )
                    
    function brushed() {
      let range = d3.brushSelection(this)
                    .map( timeDomain.invert );
  
      selectedTimePeriodStart = range[0]
      selectedTimePeriodEnd = range[1]
      overlay.draw()
      updateTimePrint( range )
      }
  



    
    })

}


function updateSlider( mapName ){

  Promise.all([ d3.json( "src/json/cartes.json" ), ]).then(function( files ) 
  {
    mapDict = files[ 0 ]

    timeDomain = d3.scaleLinear()
      .domain( mapDict[mapName].admin.dates)
      .range([0, width]);
  
    d3.select("#timeSliderSvg")
      .call(d3.axisBottom()
              .scale( timeDomain )
              .tickFormat( d => deduceMonthAndYear( d ) )            
              .ticks(4));

  })


}

function deduceMonthAndYear( timeStamp ){
  let monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre"
  ]
  let year = Math.floor( timeStamp / 360 )
  let month = monthNames[ Math.floor(timeStamp / 30 ) % 12 ]
  let day = Math.floor( timeStamp % 30 )
  day = day ? day : "1"
  return day + " " + month + " " + year 
}


