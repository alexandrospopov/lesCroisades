// https://bl.ocks.org/alexmacy/eb284831aff6f9d0119b

var marginTop = 150;
var marginSides = 20
var marginRight = 80
var width = 700 - marginSides * 2;
var height = 340 - marginTop;

function setSlider( timeStampStart, timeStampEnd ){

  var x = d3.scaleLinear()
    .domain([ timeStampStart, timeStampEnd ])
    .range([0, width]);

  var brush = d3.brushX()
    .extent([[0,0], [width,height]])
    .on("brush", brushed);

  var svg = d3.select("#timeSlider").append("svg")
    .attr("width", width + marginSides + marginRight)
    .attr("height", height + marginTop)
  .append("g")
    .attr("transform", "translate(" + marginSides + "," + marginTop + ")")
    .call(d3.axisBottom()
            .scale(x)
            .tickFormat( d => deduceMonthAndYear( d ) )            
            .ticks(4));
  
  svg.selectAll("text")  
            .style("text-anchor", "start")
            .attr("font-size", 15)
            .attr("dx", "0.6em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );


          
  var brushg = svg.append("g")
    .attr("class", "brush")
    .call( brush ) 

  function brushed() {
      var range = d3.brushSelection(this)
                    .map(x.invert);

    selectedTimePeriodStart = range[0]
    selectedTimePeriodEnd = range[1]
    overlay.draw()
    updateTimePrint( range )
    }

  brush.move(brushg, [ timeStampStart, timeStampEnd ].map(x));
}

let dateStart = 1096 * 360 
let dateEnd = 1098 * 360 

updateTimePrint( [ dateStart, dateEnd ] )
setSlider( dateStart, dateEnd )

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
  // console.log( year, month)
  return day + " " + month + " " + year 
}

function updateTimePrint( range ){

  let p = document.getElementById("timePrint");
  p.textContent =   deduceMonthAndYear( range[0] ) + ' - ' + deduceMonthAndYear( range[ 1 ] )

}