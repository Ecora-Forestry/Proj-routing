// initialize our map
var map = L.map('map', {
    center:[-37.8284, 140.7712], //center map to aus
    zoom:13 //set the zoom level
});

//add openstreet baselayer to the map 
var OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//*Custom Application*//

//geoserver 
var geoserverURL = "http://localhost:8080/geoserver"
//selected point
var selectedPoint = null
//geojson pathlayer
var routeLayer = L.geoJSON(null);
//source and target variables for routing
var source = null;
var target = null;

//starting source marker
var sourceMarker = L.marker([-37.8284, 140.7712],{
  draggable:true
})
  .on("dragend",function(e) {
    selectedPoint = e.target.getLatLng();
    getVertex(selectedPoint);
    getRoute();  
  })
  .addTo(map);

var targetMarker = L.marker([-37.8280, 140.7705],{
  draggable:true
})
  .on("dragend",function(e) {
    selectedPoint = e.target.getLatLng();
    getVertex(selectedPoint);
    getRoute();
  })
  .addTo(map);

//function to call geoserver SQL
function getVertex(selectedPoint){
  var url = `${geoserverURL}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=routing:nearest_vertex&outputFormat=application/json&viewparams=x:${selectedPoint.lng};y:${selectedPoint.lat};`;
  $.ajax({
    url: url,
    async: false,
    success: function(data){
      console.log(data);
      loadVertex(
        data,
        selectedPoint.toString() === sourceMarker.getLatLng().toString()
      );
    }
  });
}

function loadVertex(response, isSource){
  var features = response.features;
  map.removeLayer(routeLayer);
  if(isSource){
    source = features[0].properties.id;
  }else{
    target = features[0].properties.id;
  }

}

function getRoute(){
  var url = `${geoserverURL}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=routing:shortest_path&outputFormat=application/json&viewparams=source:${source};target:${target};`;

  $.getJSON(url, function(data){
    if (map.hasLayer(routeLayer)){ // check if layer exists on map
      map.removeLayer(routeLayer); // remove existing layer
    }
    routeLayer = L.geoJSON(data, {
      style: function(){
        return{color: 'red', weight: 3};
      }
    });// assign new layer to routeLayer variable
    map.addLayer(routeLayer);
  })
}

getVertex(sourceMarker.getLatLng());
getVertex(targetMarker.getLatLng());
getRoute();
