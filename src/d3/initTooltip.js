function visibleTripTooltip( trip ){
  d3.select('.tooltip').style("left", (d3.event.pageX + 5) + "px")
                       .style("top", (d3.event.pageY - 28) + "px")
                       .html( trip.armyName + "<br>" 
                              + "De : " + trip.cityNameTripStart + "<br>"
                              + "Vers : " + trip.cityNameTripEnd + "." )
                       .transition()
                       .style("opacity", .9);
}

function visibleCityTooltip( d, tooltip, tripList ){
  tooltip.style("left", (d3.event.pageX + 5) + "px")
         .style("top", (d3.event.pageY - 28) + "px")
         .html( d.key + "<br>" + d.value.Geographie.Etat )
         .transition()
         .style("opacity", .9);
}

function hideToolTip(){ 
  d3.select('.tooltip').transition()
         .style("opacity", 0) 
         
}

var tooltip = d3.select( "body" )
                .append( "div" )
                .attr( "class", "tooltip" )
                .style( "opacity", 0);

