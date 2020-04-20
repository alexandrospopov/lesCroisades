var overlay;


var data = {
  "nodes": [{
    "name": "A",
    "long": 38.11666,
    "lat": 13.36666
  }, {
    "name": "B",
    "long": 38.11666,
    "lat": 14.36666
  }, {
    "name": "C",
    "long": 38.11666,
    "lat": 15.36666
  }, {
    "name": "D",
    "long": 38.11666,
    "lat": 16.36666
  }],
  "links": [{
    "source": 0,
    "target": 1
  }, {
    "source": 0,
    "target": 2
  }, {
    "source": 0,
    "target": 3
  }, {
    "source": 2,
    "target": 3
  }]
}


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
  
  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  //svg.setAttribute('fill','#FFFFFF');
  svg.setAttribute('viewBox','0 0 400 400');
  
  var g = document.createElementNS('http://www.w3.org/2000/svg','g');
  
  var rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
  rect.setAttribute('id','myRect');
  rect.setAttribute('height','181');
  rect.setAttribute('width','311');
  rect.setAttribute('y','95.25');
  rect.setAttribute('x','47.75');
  rect.setAttribute('stroke-width','5');
  rect.setAttribute('fill','none');
  rect.setAttribute('stroke','#FF0000');
  g.appendChild(rect);
  svg.appendChild(g);
  //var img = this.image_;
  div.appendChild(svg);
  
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

myOverlay.prototype.onRemove = function(){
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};

initialize();

