var overlay;

myOverlay.prototype = new google.maps.OverlayView();

function initialize(){
    var myLatLng = new google.maps.LatLng( 38.11666, 13.36666 );
    var myOptions = {
        zoom:5.3,
        center:myLatLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("googleMap"),myOptions);
    var marker = new google.maps.Marker({position:myLatLng,map:map});
    marker.setMap(map);
    var swBound = new google.maps.LatLng( 28.51031, -12.03265 );
    var neBound = new google.maps.LatLng( 49.07932, 43.12375 );
    var bounds = new google.maps.LatLngBounds(swBound,neBound);
    var imageCode = '<svg width="1800" height="1200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" class="svg-editor"><g><rect id="svg_5" height="181" width="311" y="95.25" x="47.75" stroke-width="5" fill="#FF0000"/></g></svg>';
    overlay = new myOverlay(bounds, imageCode, map);
}

function myOverlay(bounds, image, map){
    this.bounds_ = bounds;
    this.image_ = image;
    this.map_ = map;
    
    this.div_=null;
    
    this.setMap(map);
}

myOverlay.prototype.onAdd = function(){
    var div = document.createElement('div');
    div.setAttribute('id','myDiv');
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '2px;';
    div.style.background = 'none';
    div.style.position = 'absolute';
    div.style.color="blue"


  Promise.all([ d3.json( "src/json/trips.json" ),
                d3.json( "src/json/armees.json" ),
                d3.json( "src/json/villes.json" ), ]).then(function( files ) {
  {
    tripList = files[ 0 ]
    armyList = files[ 1 ]
    cityList = files[ 2 ]

    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('id','theOneSVG')
    svg.setAttribute('viewBox','0 0 1800 1200');
    
    var g = document.createElementNS('http://www.w3.org/2000/svg','g');
    
    // var rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    // g.appendChild(rect);
    plotAllArmyTrips( tripList )

    
    svg.appendChild(g);
    div.appendChild(svg);
    

  }
})
    
    this.div_ = div;
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);    
    
};

myOverlay.prototype.draw = function(){
    var overlayProjection = this.getProjection();
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
    
    var div = this.div_;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
};

myOverlay.prototype.onRemove = function(){
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};

initialize();

function plotAllArmyTrips( tripList )
{
    svg = d3.select("#theOneSVG")
    var node = svg.selectAll(".stations")
        .data(d3.entries(tripList.nodes))
        .each(transform) // update existing markers
      .enter().append("g")
        .each(transform)
        .attr("class", "node");
  
        // Add a circle.
        node.append("circle")
            .attr("r", 8);
  
        // Add a label.
        node.append("text")
            .attr("x", 10 + 7)
            .attr("y", 10)
            .attr("dy", ".31em")
            .text(function(d) { return d.value.cityName; });

        var link = svg.selectAll(".link")
        .data(tripList.links)
        .enter().append("line")
        .attr("class", "link")
        .each(drawlink);
        console.log(tripList)
  
        function transform(d) {
          d = new google.maps.LatLng( d.value.latLong[ 0 ],
                                      d.value.latLong[ 1 ]);
          d = projection.fromLatLngToDivPixel(d);
          return d3.select(this)
            .attr("transform","translate(" + d.x + "," + d.y + ")");
        }

        function drawlink(d) {
          console.log( tripList.nodes[ d.source ].cityName,
                        tripList.nodes[ d.target ].cityName )
          p1 = new google.maps.LatLng( tripList.nodes[ d.source ].latLong[ 0 ],
                                        tripList.nodes[ d.source ].latLong[ 1 ] )
          p2 = new google.maps.LatLng( tripList.nodes[ d.target ].latLong[ 0 ],
                                        tripList.nodes[ d.target ].latLong[ 1 ] )
          p1 = projection.fromLatLngToDivPixel(p1);
          p2 = projection.fromLatLngToDivPixel(p2);
          console.log(this)
          d3.select(this)
            .attr('x1', p1.x)
            .attr('y1', p1.y)
            .attr('x2', p2.x) 
            .attr('y2', p2.y)
            .style('fill', 'red')
            .style('stroke', 'steelblue');
  }
} 


// function showTrips()
// {

//   Promise.all([ d3.json( "src/json/trips.json" ),
//                 d3.json( "src/json/armees.json" ),
//                 d3.json( "src/json/villes.json" ), ]).then(function( files ) {
//   {
//     tripList = files[ 0 ]
//     armyList = files[ 1 ]
//     cityList = files[ 2 ]


//     plotAllArmyTrips( tripList )
//   }
// })
// }

// showTrips()