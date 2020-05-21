function updateNavLinkColor( idNavLink){

  d3.select("#onglet-croisadesPopulaires").style('color','white')
  d3.select("#onglet-deuxiemeCroisade").style('color','white')
  d3.select("#onglet-sacConstantinople").style('color','white')

  d3.select("#onglet-" + idNavLink ).style('color','blue')
}

function updateMapChoice( mapName ){
  drawTripMap( mapName )
  updateSlider( mapName )
  updateNavLinkColor( mapName )
  overlay.draw()
}

function setStopIconVisibility( d ){
  let armyVisibility = d3.select(this).attr('army-visibility')
  let globalVisibility = d3.select(this).attr('global-visibility')

  if ( armyVisibility == "visible" && globalVisibility == "visible" ) 
  {
    d3.select(this).attr('visibility','visible')
  }
  else
  {
    d3.select(this).attr('visibility','hidden')
  }
}




d3.select("#cb_stop")
  .on("click", function() {
      let currentVisibility = this.checked ? "visible" : "hidden";
      d3.selectAll('.tripStop')
        .attr('global-visibility',currentVisibility )
        .each( setStopIconVisibility )

});

d3.select("#cb_cities")
  .on("click", function() {
      let currentVisibility = this.checked ? "visible" : "hidden";
      d3.selectAll('.marker').attr('visibility', currentVisibility)
});

d3.select( "#onglet-croisadesPopulaires" )
  .on( 'click' , function(){
      updateMapChoice( "croisadesPopulaires" )
})

d3.select( "#onglet-deuxiemeCroisade" )
  .on( "click", function(){
      updateMapChoice( "deuxiemeCroisade" )
})


d3.select( "#onglet-sacConstantinople" )
  .on( "click", function(){
      updateMapChoice( "sacConstantinople" )
})
