// https://bl.ocks.org/alexmacy/eb284831aff6f9d0119b

var margin = 20;
var width = 400 - margin * 2;
var height = 80;

function setSlider( startYear, endYear ){

  var x = d3.scaleLinear()
    .domain([ startYear, endYear ])
    .range([0, width]);

  var brush = d3.brushX()
    .extent([[0,0], [width,height]])
    .on("brush", brushed);

  var svg = d3.select("#timeSlider").append("svg")
    .attr("width", width + margin * 2)
    .attr("height", height + margin)
  .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")")
    .call(d3.axisBottom()
        .scale(x)
        .ticks(5));

  var brushg = svg.append("g")
    .attr("class", "brush")
    .call( brush ) 

  function brushed() {
      var range = d3.brushSelection(this)
                    .map(x.invert);

    startPeriod = range[0]
    endPeriod = range[1]
    overlay.draw()
    }

  brush.move(brushg, [ startYear, endYear ].map(x));

}
setSlider( 12000, 12015 )
