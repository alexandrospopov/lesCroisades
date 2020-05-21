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

function setStopIconVisibility(){
  let armyVisibility = d3.select(this).attr('army-visibility')
  let globalVisibility = d3.select(this).attr('global-visibility')
  // console.log( armyVisibility )
  // console.log( globalVisibility )

  if ( armyVisibility == "visible" && globalVisibility == "visible" ) 
  {
    d3.select(this).attr('visibility','visible')
  }
  else
  {
    d3.select(this).attr('visibility','hidden')
  }
}


function printHelpAndContactInfo(){

  let modal = document.getElementById("myModalContact");
  let span = document.getElementById("contact-close");
  let modalTitle = document.getElementById("modal-contact-Title");
  let modalParagraph = document.getElementById("modal-contact-Paragraph1")
  let modalParagraph2 = document.getElementById("modal-contact-Paragraph2")
  let author1 = document.getElementById("modal-contact-Author1")
  let author2 = document.getElementById("modal-contact-Author2")

  modalTitle.textContent = getContactTitle() ; 
  modalParagraph.textContent = getContactText() ;
  modalParagraph2.textContent = getAuthorText();

  author1.textContent='Herodot\'com'
  author1.href='https://www.youtube.com/channel/UCWWzB99AURYo2KLzCReWqmA'

  author2.textContent='Alexandros Popov'
  author2.href='https://github.com/alexandrospopov'

  modal.style.display = "block";

  span.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
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

d3.select( "#onglet-aideContact" )
  .on( "click", function(){
    printHelpAndContactInfo()
})
