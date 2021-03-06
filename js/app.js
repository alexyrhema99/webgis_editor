window.onload = init;

var map;
var drawnItems;

function init(){
	map = L.map('map', {
		center: [0,0],
		zoom: 3,
		minZoom: 3,
		zoomControl: true,
		fullscreenControl: true,
		attributionControl: true
	});
	
	map_scale(); 
	map_geolocate();
	load_file();		
	save_draw(map, drawnItems);
	mouse_position(); 
	Measure();
	map_geocoder(); 
	map_draw();
	basemaps();
	//save_image();
	//map_print();
	style_editor();
}

function map_geocoder() {
  var searchControl = L.esri.Geocoding.geosearch({
  	position : 'topleft',
    expanded: true, 
    collapseAfterResult: false, 
    title: "Search for places...",
    placeholder: "Search for places..."
  }).addTo(map);

  var results = L.layerGroup().addTo(map);

  searchControl.on('results', function(data){
    results.clearLayers();
    for (var i = data.results.length - 1; i >= 0; i--) {
      results.addLayer(L.marker(data.results[i].latlng));
    }
  });
}

function map_scale() {
	L.control.scale().addTo(map);
}

function mouse_position() {
	L.control.mousePosition({separator: ', '}).addTo(map);
}

function basemaps() {
	var api_key = 'pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpdm9ic3M2ODAwdDYydXBjYW85aHVzeTMifQ.Y2J4i_b6yGPmNkJAoUHDMg';
	var basemaps = [
	    // Custom base layer map - OSM
	    L.tileLayer('https://{s}.tiles.mapbox.com/v4/digitalglobe.nal0mpda/{z}/{x}/{y}.png?access_token=' + api_key, {
	        minZoom: 1,
	        maxZoom: 19,
	        attribution: '(c) <a href="http://microsites.digitalglobe.com/interactive/basemap_vivid/">DigitalGlobe</a> , (c) OpenStreetMap, (c) Mapbox',
	        label: 'Digital Globe Imagery'
	    }),
	    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	        label: 'OpenStreetMap'
	    }),	    
	    L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
	        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey and the GIS User Community',
	        label: 'ESRI Terrain'
	    })    
  	];
  	map.addControl(L.control.basemaps({
      	basemaps: basemaps,
      	tileX: 0,  // tile X coordinate
     	tileY: 0,  // tile Y coordinate
      	tileZ: 1   // tile zoom level
  	}));
}

function Measure() {
	var measureControl = L.control.measure({
		primaryLengthUnit: 'meters', 
		secondaryLengthUnit: 'kilometers',
		primaryAreaUnit: 'hectares',
		secondaryAreaUnit: undefined
	});
	measureControl.addTo(map);
}

function map_draw() {
	// Initialize the FeatureGroup to store editable layers
	drawnItems = new L.FeatureGroup();
	map.addLayer(drawnItems);

	// Initialize the draw control and pass it the FeatureGroup of editable layers
	var drawControl = new L.Control.Draw({
        draw: {
             polygon: true,
             marker: true
        },		
	    edit: {
	        featureGroup: drawnItems
	    }
	});
	map.addControl(drawControl);

	/*
	var guideLayers = [drawnItems];
    map.drawControl.setDrawingOptions({
        polyline: { guideLayers: guideLayers },
        polygon: { guideLayers: guideLayers, snapDistance: 5 },
        marker: { guideLayers: guideLayers, snapVertices: false },
        rectangle: false,
        circle: false
    });
    */

	map.on('draw:created', function (e) {
	    var type = e.layerType,
	        layer = e.layer;

	    if (type === 'marker') {
	        // Do marker specific actions
	    }

	    // Do what//ever else you need to. (save to db, add to map etc)
	    drawnItems.addLayer(layer);
	});

	map.on('draw:edited', function () {
	    // Update db to save latest changes.
	});

	map.on('draw:deleted', function () {
	    // Update db to save latest changes.
	});

}

function map_geolocate(){
	var locate_control = L.control.locate({
		icon: 'fa fa-compass',
	    strings: {
	        title: "Show me where I am!"
	    },
		locateOptions: {
		    maxZoom: 20
		}	    
	}).addTo(map);	
}

function load_file(){

	L.Control.FileLayerLoad.LABEL = '<i class="fa fa-cloud-upload" aria-hidden="true" style="font-size: 16px;"></i>';

    var fileload = L.Control.fileLayerLoad({
        // Allows you to use a customized version of L.geoJson.
        // For example if you are using the Proj4Leaflet leaflet plugin,
        // you can pass L.Proj.geoJson and load the files into the
        // L.Proj.GeoJson instead of the L.geoJson.
        layer: L.geoJson,
        // See http://leafletjs.com/reference.html#geojson-options
        layerOptions: {style: {color:'red'}},
        // Add to map after loading (default: true) ?
        addToMap: true,
        // File size limit in kb (default: 1024) ?
        fileSizeLimit: 1024,
        // Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
        formats: [
            '.geojson',
            '.kml'
        ]
    }).addTo(map)


    fileload.loader.on('data:loaded', function (e) {
        // Add to map layer switcher
        layerswitcher.addOverlay(e.layer, e.filename);
    });    

}

function style_editor() {
    //Initialize the StyleEditor
    var styleEditor = L.control.styleEditor({
        position: "topleft",
        openOnLeafletDraw: true
    });
    map.addControl(styleEditor);

	map.on('styleeditor:changed', function(element){
	    console.log(element);
	});

}

function save_geojson(){
	var data = JSON.stringify(drawnItems.toGeoJSON());
	var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
	saveAs(blob, "map.geojson");
}

function save_draw() {
	L.easyButton({
	  states:[
	    {
			icon: 'fa-cloud-download',
			title:     'Export Drawing to GeoJSON',
			onClick: function(btn, map) {
				save_geojson();
			}		
	    }
	  ]
	}).addTo(map);
}

function map_print() {
	L.easyButton({
	  states:[
	    {
			id: 'print_map',
			stateName: 'print-map',
			icon: 'fa-print',
			title:     'Print Map',
			onClick: function(btn, map) {
				html2canvas(document.body, {
					onrendered: function(canvas) {
						var img = canvas.toDataURL("image/png");
						var doc = new jsPDF();
						doc.addImage(img, 'JPEG');
						doc.save('test.pdf');
					}
				});
			}		
	    }
	  ]
	}).addTo(map);
}

function save_image() {
	L.easyButton({
	  states:[
	    {
	    	id: 'save_screenshot',
	    	stateName: 'save-screenshot',
			icon: 'fa-camera',
			title: 'Save screenshot',
			onClick: function(btn, map) {
				html2canvas(document.body, {
					onrendered: function(canvas) {
						var img = canvas.toDataURL("image/png");
					}
				});
				img.toBlob(function(blob) {
				    saveAs(blob, "pretty image.png");
				});
			}		
	    }
	  ]
	}).addTo(map);
}