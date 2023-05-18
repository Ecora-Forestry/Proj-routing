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

//Google Streets Layer
var googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
maxZoom: 20,
subdomains:['mt0','mt1','mt2','mt3']
});

//Google Satellite Layer
var googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
maxZoom: 20,
subdomains:['mt0','mt1','mt2','mt3']
});

//Layer Controller
var baseMaps = {
  "Google Streets": googleStreets,
  "Google Satellite": googleSat,
  "OpenStreetMap": OpenStreetMap
};

L.control.layers(baseMaps).addTo(map);

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
    var totalDistance = 0;
    data.features.forEach(function(feature){
      totalDistance += feature.properties.distance;
    });
    totalDistance = totalDistance.toFixed(2);
    console.log("Total Distance: ", totalDistance);

    routeLayer = L.geoJSON(data, {
      style: function(){
        return{color: 'red', weight: 3};
      },
      onEachFeature: function(feature, layer){
        if(feature.properties && feature.properties.distance){
          layer.bindPopup('Segment Distance: ' + feature.properties.distance);
        }
      }
    }).bindPopup("Total Distance: " + totalDistance +"km");// assign new layer to routeLayer variable
    map.addLayer(routeLayer);
  })
}


getVertex(sourceMarker.getLatLng());
getVertex(targetMarker.getLatLng());
getRoute();

//Facilities Markers
var myIcon = L.icon({
  iconUrl: '../Facilities.png',
  iconSize: [20,20],
  iconAnchor: [15,15],
  popupAnchor: [0,-15]
});

var markers = [
  {coords: [-37.8166, 140.7469], content: "Borgs Lakeside"},
  {coords: [-37.8249, 140.7610], content: "Borgs White Ave"},
  {coords: [-37.8441, 140.8058], content: "WTS"},
  {coords: [-37.7533, 140.6608], content: "SE Pine Sales"},
  {coords: [-38.32203, 141.58102], content: "PFP PNR Log Dump"},
  {coords: [-38.35257, 141.61324], content: "ABP"},
  {coords: [-37.8134, 140.6451], content: "New Gen"},
  {coords: [-37.909525, 141.273250], content: "Alliance Timber"},
  {coords: [-37.8166, 140.7469], content: "PFP PNR Weighbridge"},
  {coords: [-38.31646, 141.57864], content: "PFP Darts Rd Weighbridge"},
  {coords: [-38.31558, 141.57942], content: "Darts Rd Gate"},
  {coords: [-38.35181, 141.61682], content: "Wharf Weighbridge"},
  {coords: [-38.31621, 141.57904], content: "PFP Darts Rd Log Dump"},
  {coords: [-38.323993, 141.581702], content: "PFP PNR Scaling"},
  {coords: [-38.35554, 141.61149], content: "Canal Court"},
  {coords: [-38.31796, 141.57913], content: "PFP Darts Rd Scaling"},
  {coords: [-38.40465, 141.62573], content: "PoPL Quarry"},
  {coords: [-37.53948, 140.70442], content: "PTT"},
  {coords: [-37.61121, 140.79756], content: "Timberlink"},
  {coords: [-38.33868, 143.61050], content: "AKD Colac"},
  {coords: [-38.32313, 141.58229], content: "PFP Gate"},
  {coords: [-37.8166, 140.7469], content: "A2C"},
  {coords: [-38.34998, 141.61492], content: "Portland Wharf"},
  {coords: [-38.110586, 141.620118], content: "Portland Pine Products"},
  {coords: [-37.8414, 140.8048], content: "OFO Jubilee"},
  {coords: [-37.8052, 140.7738], content: "NF McDonnell"},
  {coords: [-38.31200, 143.65005], content: "AKD Irrawarra"},
  {coords: [-38.35653, 141.60905], content: "C3"},
  {coords: [-37.88693, 140.83735], content: "Roundwood Solutions"},
];

// iterate through marker array and add markers to map
for (var i=0; i < markers.length; i++){
  var marker = L.marker(markers[i].coords, {icon: myIcon}).addTo(map).bindPopup(markers[i].content);
} 

// add geojson haulage route layer to map
$.getJSON('../THR_2021.geojson', function(data){
  L.geoJSON(data,{
    style: function(feature) {
      return{
        color: 'black',
        fillColor: 'black'
      };
    }
  }).addTo(map);
})

// polyline measure functionality
var measure = L.control.polylineMeasure({
  position: 'bottomleft',
  unit: 'kilometres',
  useSubunits: true,
  clearMeasurementsOnStop: true,
  showBearings: true,
  bearingTextIn: 'In',
  bearingTextOut: 'Out',
  tooltipTextFinish: 'Click to <b>Finish Line</b><br>',
  tooltipTextDelete: 'Press SHIFT-key and click to <b>Delete Point</b>',
  tooltipTextMove: 'Click and drag to <b>Move Point</b><br>',
  tooltipTextResume: '<br>Press CTRL-key and click to <b>Resume Line</b>',
  tooltipTextAdd: 'Press CTRL-key and click to <b>add point</b>',
  showClearControl: true,
  showUnitControl: true,
  unitControlUnits: ["kilometres", "landmiles"],
}).addTo(map);
