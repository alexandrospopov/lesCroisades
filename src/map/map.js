var map = new GMaps({
  el: '#googleMap',
  lat:  40.730610,
  lng: -73.935242
});

map.addMarker({
  lat: 40.700610,
  lng: -73.997242,
  title: 'New York'
});

map.setZoom(8);


// faire une map custom