window.tmpl = {};
tmpl.Map = {};
tmpl.Control = {};
tmpl.Overlay = {};
tmpl.Route = {};
tmpl.Geocode = {};
tmpl.Search = {};
tmpl.Zoom = {};
tmpl.Feature = {};
tmpl.Layer = {};
tmpl.Extent = {};
tmpl.Draw = {};
tmpl.Measure = {};
tmpl.Tooltip = {};
tmpl.Create = {};
tmpl.Pan = {};
tmpl.Info = {};
tmpl.POI = {};
tmpl.Track = {};
tmpl.Trip = {};
tmpl.Info.getPlaceFlag =  false;
tmpl.Google = {};
tmpl.LayerSwitcher = {};
tmpl.ContextMenu = {};
tmpl.HeatMap = {};
tmpl.Style = {};
tmpl.Fence = {};

tmpl.mapOnClickExtraForPOIDelete;
tmpl.mapOnClickExtraForCenterMap;
var gmap_googleMap;
var gblTrackSameLatLong = true;
(function() {
	
//---------------------------------- Beginning of Creating Google Map------------------------------------//

// **** Creating Google Map inside the specified targetDiv using the map properties specified in the appconfig.js file **** //

//var base_map_streetLayer_trinity,base_map_trinity;
var streetLayer_trinity,tmpl_setMap_layer_global = [];
tmpl.Map.createMap = function(param){
	var targetDiv = param.target;
	var mainMap = param.mainMap;
	var defaultZoom = param.defaultZoom;
	if(defaultZoom != undefined)
	appConfigInfo.googlezoom = defaultZoom;
	//console.log("from api creating map",appConfigInfo.googlezoom);
	if(appConfigInfo.mapData === "google")
	{	
		var googleLayer = new olgm.layer.Google({
			visible : true, 
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		var viewg;
		if(appConfigInfo.setResolution ==  true || appConfigInfo.setResolution ==  "true"){
			viewg = new ol.View({
				center : ol.proj.transform([parseFloat(appConfigInfo.lon),parseFloat(appConfigInfo.lat)], 'EPSG:4326','EPSG:3857'), // **** lon,lat and googlezoom are in app config file **** //
				zoom: appConfigInfo.googlezoom,
				maxZoom : appConfigInfo.googleMaxZoom,
				extent : ol.proj.transformExtent([parseFloat(appConfigInfo.extent1),parseFloat(appConfigInfo.extent2),parseFloat(appConfigInfo.extent3),parseFloat(appConfigInfo.extent4)],"EPSG:4326","EPSG:3857"),
				minZoom : appConfigInfo.gooleMinZoom
	        })
		}else{
			viewg = new ol.View({
				center : ol.proj.transform([parseFloat(appConfigInfo.lon),parseFloat(appConfigInfo.lat)], 'EPSG:4326','EPSG:3857'), // **** lon,lat and googlezoom are in app config file **** //
				zoom: appConfigInfo.googlezoom,
				//maxZoom : 21,
				//extent : ol.proj.transformExtent([parseFloat(appConfigInfo.extent1),parseFloat(appConfigInfo.extent2),parseFloat(appConfigInfo.extent3),parseFloat(appConfigInfo.extent4)],"EPSG:4326","EPSG:3857");,
				minZoom : appConfigInfo.gooleMinZoom
	        })
		}
		
		var  map = new ol.Map({
			 interactions: ol.interaction.defaults({
        altShiftDragRotate: false,
        dragPan: false,
        rotate: false
      }).extend([new ol.interaction.DragPan({kinetic: null})]),
			layers: [googleLayer],
	        target: targetDiv,
	        view: viewg,
			loadTilesWhileAnimating: true,
	    });
	    var layers = map.getLayers();
	    layers.setAt(0, googleLayer); 
		
	    var olGM = new olgm.OLGoogleMaps({
			map : map,
			mapIconOptions: {
			    useCanvas: true
			}
	    });
		olGM.activate();
		
		gmap_googleMap = olGM.getGoogleMapsMap();
		map.set('olgmObj',olGM);
		
		// **** Setting toggle for Street and Satellite view **** //
		
		if(appConfigInfo.googleSatelliteView){

			var streetButton = document.createElement('button');
			var streetText = document.createTextNode("Map");
			streetButton.appendChild(streetText);
			streetButton.title ='Show Street View';
			streetButton.className = 'ol-map-btn .ol-unselectable ';

			var satelliteButton = document.createElement('button');
			var satelliteText = document.createTextNode("Earth");
			satelliteButton.appendChild(satelliteText);
			satelliteButton.title ='Show Satellite Imagery';
			satelliteButton.className = 'ol-sat-btn';

	        var streetControl = new ol.control.Control({
				element: streetButton
	        });
	        map.addControl(streetControl);
			
	        streetButton.addEventListener('click', function(){
				toggleGoogleMap('street',streetControl.getMap());
			});

	        var satelliteControl = new ol.control.Control({
				element: satelliteButton
	        });
	        map.addControl(satelliteControl);
	        satelliteButton.addEventListener('click', function(){
				toggleGoogleMap('satellite',satelliteControl.getMap());
			});
	    }	
	    activate(map);
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
					if(tmpl_setMap_layer_global[i].visibility == true && tmpl_setMap_layer_global[i].map == map){
						tmpl_setMap_layer_global[i].layer.setMap(map);
					}
			}
		global_fleet_layer_id = [];
		globale_layer_names = [];
		global_fleet_layer_features = [];
		global_fleet_layer_objects = [];
		//tmpl_setMap_layer_global = [];
	    //mapLocation(map,appConfigInfo.extent2,appConfigInfo.extent1,appConfigInfo.extent4,appConfigInfo.extent3);
 map.on('pointermove', function (e) {
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        map.getViewport().style.cursor = hit ? 'pointer' : '';
  });   
 return map; 
	}
    else
    {
		//console.log("FromAPI");
    	var map;
	    var view;
    	var baseLayer;
	    var p = new ol.proj.Projection
	    ({
	      code: appConfigInfo.projection,
	      extent: [parseFloat(appConfigInfo.extent1),parseFloat(appConfigInfo.extent2),parseFloat(appConfigInfo.extent3),parseFloat(appConfigInfo.extent4)],
	      units: 'm',
	      axisOrientation: 'neu'
	    });

		if(appConfigInfo.gwc)
		{
            baseLayer = new ol.layer.Tile({visible : true, source:new ol.source.TileWMS({url:appConfigInfo.gwcurl,
	            params: {'LAYERS':appConfigInfo.layer, 'TILED': true, 'VERSION': appConfigInfo.wmsVersion},
	            serverType: 'geoserver'})
	        });
            //base_map_trinity = baseLayer;
            //console.log(base_map_trinity,baseLayer);
            streetLayer_trinity = new ol.layer.Tile({
        		source: new ol.source.TileWMS({
        			url: appConfigInfo.gwcurl,  
        			params: {'LAYERS': appConfigInfo.streetLayer,'TILED': true, 'VERSION': '1.1.1'}
        		})
        	});
        	if(mainMap == true){
				base_map_trinity = baseLayer;
				base_map_streetLayer_trinity = streetLayer_trinity;
			}
			 if(appConfigInfo.setResolution ==  true){
			  view = new ol.View({
    	        zoom : appConfigInfo.trinityzoom,
          		projection : 'EPSG:4326',
				maxZoom : appConfigInfo.trinityMaxZoom,
          		center:[parseFloat(appConfigInfo.lon),parseFloat(appConfigInfo.lat)],
				extent : [parseFloat(appConfigInfo.extent1),parseFloat(appConfigInfo.extent2),parseFloat(appConfigInfo.extent3),parseFloat(appConfigInfo.extent4)],
          		rotation : 0,
				minZoom : appConfigInfo.trinityMinZoom
        	})
		}else{
			view = new ol.View({
                zoom : appConfigInfo.trinityzoom,
                projection : 'EPSG:4326',
                center:[parseFloat(appConfigInfo.lon),parseFloat(appConfigInfo.lat)],
                extent: [parseFloat(appConfigInfo.extent1),parseFloat(appConfigInfo.extent2),parseFloat(appConfigInfo.extent3),parseFloat(appConfigInfo.extent4)],
                rotation : 0,
				minZoom : appConfigInfo.trinityMinZoom
		    })
		}
            
	    }
		else
		{
    		baseLayer = new ol.layer.Tile({visible : true, source:new ol.source.TileWMS({url:appConfigInfo.gwcurl,
            	params: {'LAYERS':appConfigInfo.layer, 'TILED': false, 'VERSION': appConfigInfo.wmsVersion},
            	serverType: 'geoserver'})
      		});
    		//base_map_trinity = baseLayer;
			
            streetLayer_trinity = new ol.layer.Tile({
        		source: new ol.source.TileWMS({
        			url: appConfigInfo.gwcurl,  
        			params: {'LAYERS': appConfigInfo.streetLayer, 'VERSION': '1.1.1'}
        		})
        	});
			if(mainMap == true){
				base_map_trinity = baseLayer;
				base_map_streetLayer_trinity = streetLayer_trinity;
			}
          if(appConfigInfo.setResolution ==  true){
			  view = new ol.View({
    	        zoom : appConfigInfo.trinityzoom,
          		projection : p,
				maxZoom : appConfigInfo.trinityMaxZoom,
          		center:[parseFloat(appConfigInfo.lon),parseFloat(appConfigInfo.lat)],
				extent : [parseFloat(appConfigInfo.extent1),parseFloat(appConfigInfo.extent2),parseFloat(appConfigInfo.extent3),parseFloat(appConfigInfo.extent4)],
          		rotation : 0,
				minZoom : appConfigInfo.trinityMinZoom
        	})
		}else{
			view = new ol.View({
    	        zoom : appConfigInfo.trinityzoom,
          		projection : p,
          		center:[parseFloat(appConfigInfo.lon),parseFloat(appConfigInfo.lat)],
          		rotation : 0,
				minZoom : appConfigInfo.trinityMinZoom
        	})
		}
	        
		}
		if(appConfigInfo.trinitySatelliteView)
		{
	    	if(appConfigInfo.trinitySatellitegwc)
	    	{
	       		var satelliteLayer = new ol.layer.Tile({visible : false, source:new ol.source.TileWMS({url:appConfigInfo.trinitySatelliteurl,
	            	params: {'LAYERS':appConfigInfo.trinitySatelliteLayer, 'TILED': true, 'VERSION': appConfigInfo.wmsVersion},
	            	serverType: 'geoserver'})
	            });
	    	}
			else{
	   			var satelliteLayer = new ol.layer.Tile({visible : false, source:new ol.source.TileWMS({url:appConfigInfo.trinitySatelliteurl,
	            	params: {'LAYERS':appConfigInfo.trinitySatelliteLayer, 'TILED': false, 'VERSION': appConfigInfo.wmsVersion},
	            	serverType: 'geoserver'})
	             });
			}
	    	  streetLayer_trinity = new ol.layer.Tile({
	        		source: new ol.source.TileWMS({
	        			url: appConfigInfo.gwcurl,  
	        			params: {'LAYERS': appConfigInfo.streetLayer, 'VERSION': '1.1.1'}
	        		})
	        	});
				if(mainMap == true){
					base_map_streetLayer_trinity = streetLayer_trinity;
				}
			if(mainMap == true){
				
				map = new ol.Map({
	        	interactions : ol.interaction.defaults({doubleClickZoom :true}),
	        	layers: [baseLayer,base_map_streetLayer_trinity,satelliteLayer],
	       		target: targetDiv,
	        	view: view
				});
				//base_map_streetLayer_trinity.setVisible(false);
			}else{
				map = new ol.Map({
	        	interactions : ol.interaction.defaults({doubleClickZoom :true}),
	        	layers: [baseLayer,satelliteLayer],
	       		target: targetDiv,
	        	view: view
				});
			}
	   		// map = new ol.Map({
	        	// interactions : ol.interaction.defaults({doubleClickZoom :true}),
	        	// layers: [baseLayer, streetLayer_trinity, satelliteLayer],
	        	// target: targetDiv,
	        	// pixelRatio: 1,
	        	// view: view
	      	// });
		    var b1 = document.createElement('button');
		    var txt1 = document.createTextNode("Map");
		    b1.appendChild(txt1);
		    b1.title ='Show street view';
		    b1.className = 'ol-map-btn ';
		    b1.addEventListener('click', function(){setBaseMap('street',baseLayer, satelliteLayer);});

 		    var b2 = document.createElement('button');
		    var txt1 = document.createTextNode("Earth");
		    b2.appendChild(txt1);
		    b2.title ='Show satellite imagery';
		    b2.className = 'ol-sat-btn';
		    b2.addEventListener('click', function(){setBaseMap('satellite', baseLayer, satelliteLayer);});

     	    var mapbtn = new ol.control.Control({
			                    element: b1
			});
			map.addControl(mapbtn);

			var satellitebtn = new ol.control.Control({
			                    element: b2
			});
			map.addControl(satellitebtn);
		}
	    else{
			//console.log("xxxxxxxx");
			if(mainMap == true){
				map = new ol.Map({
	        	interactions : ol.interaction.defaults({doubleClickZoom :true}),
	        	layers: [baseLayer,streetLayer_trinity],
	       		target: targetDiv,
	        	view: view
				});
				base_map_streetLayer_trinity.setVisible(false);
			}else{
				map = new ol.Map({
	        	interactions : ol.interaction.defaults({doubleClickZoom :true}),
	        	layers: [baseLayer],
	       		target: targetDiv,
	        	view: view
				});
			}
			
		}
	    activate(map);
	    if(mainMap == true){
			getTrinityLayersList(map);
		}
	    return map;	
    }
	
}


function setBaseMap(val, bLayer, sLayer) {
   if(val==='satellite')
  {
    bLayer.setVisible(false);
    sLayer.setVisible(true);

  }
  else
  {
  bLayer.setVisible(true);
  sLayer.setVisible(false);

  }
}

// **** Toggle handler for Street and Satellite view of Google map**** //
function toggleGoogleMap(val,mapobj){
	var layers = mapobj.getLayers();
	mapobj.removeLayer(layers.item(0));
	var googleLayer;
	if(val==='satellite'){
		googleLayer = new olgm.layer.Google({
			mapTypeId: google.maps.MapTypeId.HYBRID
		});
   }
	else{
		googleLayer = new olgm.layer.Google({
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
	}
	layers.insertAt(0, googleLayer);
}

var baseMapLayerObjects = [];
tmpl.Map.getBaseMaps = function(){
	var osmLayer =  new ol.layer.Tile({
        source: new ol.source.OSM()
    });
	var esriLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
        attributions: [new ol.Attribution({
        html: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
            'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
      })],
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
        'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
        })
    })
	var stamen1 = new ol.layer.Tile({
            source: new ol.source.Stamen({
              layer: 'watercolor'
            })
          });
    var stamen2 = new ol.layer.Tile({
            source: new ol.source.Stamen({
              layer: 'terrain-labels'
            })
          });

	baseMapLayerObjects[0] = osmLayer;
	baseMapLayerObjects[1] = esriLayer;
	baseMapLayerObjects[2] = stamen1;
	baseMapLayerObjects[3] = stamen2;

	var basemaps = [
	
	{
		name : 'Google Road Map',
		id: 2
	},
	{
		name : 'Google Satellite Map',
		id: 3
	},{
		name : 'Open Street Map',
		id: 1
	}
	];
	return basemaps;
}
tmpl.Map.switchBaseMaps = function(param){
	var mapobj = param.map;
	var id = param.id;
	var layers = mapobj.getLayers();
	mapobj.removeLayer(layers.item(0));
	if(id == 1){
		layers.insertAt(0, baseMapLayerObjects[0]);
	}else if(id == 2){
		var googleLayer;
		googleLayer = new olgm.layer.Google({
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		layers.insertAt(0, googleLayer);
	}else if(id == 3){
		var googleLayer = new olgm.layer.Google({
			mapTypeId: google.maps.MapTypeId.HYBRID
		});
		layers.insertAt(0, googleLayer);
	}/*else if(id == 5){
		layers.insertAt(0, baseMapLayerObjects[2]);
	}*/
}

// **** Restricting Map Extent functionality**** //

// var polygon_ex;  remove this variable after checking it is not used in any other functions.

function mapLocation(mapObj,lat_X1,lon_Y1,lat_X2,lon_Y2){
	var polygon_ex;
    var olGM2 = new olgm.OLGoogleMaps({
		map : mapObj
    });
    var gmap = olGM2.getGoogleMapsMap();
	var map_cen;
	function setExtend(lat1,lng1,lat2,lng2){
        var last_perfect_cen,last_zoom;
        var start = new google.maps.LatLng(lat1,lng1);
        var end = new google.maps.LatLng(lat2,lng2);
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(start);
        bounds.extend(end);
		
        var convertBounds,x1,y1,x2,y2,extent;
		convertBounds = bounds.toString();
		convertBounds=convertBounds.slice(2,-2);
		convertBounds=convertBounds.split("), (");
		x1=parseFloat(convertBounds[0].split(",")[0]);
		y1=parseFloat(convertBounds[0].split(",")[1]);
		x2=parseFloat(convertBounds[1].split(",")[0]);
		y2=parseFloat(convertBounds[1].split(",")[1]);
	
		extent =[y1,x1,y2,x2];
        mapObj.on("moveend", function (e) {
			var centerz = mapObj.getView().getCenter();
			var rp_centerz = ol.proj.transform([centerz[0],centerz[1]], 'EPSG:3857', 'EPSG:4326');
			rp_centerz = rp_centerz.toString().split(",");
            polygon_ex = turf.polygon([[[x1,y1],[x1,y2],[x2,y2],[x2,y1],[x1,y1]]]);
            var point = turf.point([parseFloat(rp_centerz[1]),parseFloat(rp_centerz[0])]);
            var intersects = turf.intersect(point,polygon_ex);
            if(intersects){
				var lastcenterz = mapObj.getView().getCenter();
                last_perfect_cen = ol.proj.transform([lastcenterz[0],lastcenterz[1]], 'EPSG:3857', 'EPSG:4326');
                last_zoom = mapObj.getView().getZoom();
            }
            else{
				alert("You are beyond the Project Area,redirecting to previous zoomed center");
                mapObj.getView().setCenter(ol.proj.transform([last_perfect_cen[0],last_perfect_cen[1]], 'EPSG:4326', 'EPSG:3857'));
                mapObj.getView().setZoom(last_zoom);
            }
        });
        mapObj.getView().on('propertychange', function(e){
			var zoomlevel=mapObj.getView().getZoom();
			if(zoomlevel<9){
				mapObj.getView().setCenter(lat,lon);
				mapObj.getView().setZoom(21);
			}
		}); 
	}setExtend(lat_X1,lon_Y1,lat_X2,lon_Y2);
}

// **** Please write this function description here **** //

function activate(mapObj){
	var popupboolian_title=false;
	mapObj.on('pointermove', function(e) {
		if (e.dragging) return;
		var pixel = mapObj.getEventPixel(e.originalEvent);
		var hit = mapObj.hasFeatureAtPixel(pixel);
		mapObj.getTargetElement().style.cursor = hit ? 'pointer' : '';
	});
	mapObj.on('click', function(evt) {
		
		var pixel = mapObj.getEventPixel(evt.originalEvent);
		if(mapObj.hasFeatureAtPixel(pixel)){
			var layerName;
			var coordinate = evt.coordinate;
			var layerObj;
			var feature = mapObj.forEachFeatureAtPixel(evt.pixel,function (feature, layer){
				layerObj = layer;
				console.log("feature,layer ????",feature,layer);
				if(layer == null){
					console.log("feature.get('layer_name') ???",feature.get('layer_name'));
						if(feature.get('layer_name')){
							layerName = feature.get('layer_name');
							popupboolian_title=false;
							return feature;
						}
						else{
							popupboolian_title=true;
							return null;
						}
				}else if(layer){
					if(layer){
						//console.log(layer.get('title'));
						if(layer.get('title')){
							layerName = layer.get('title');
							popupboolian_title=false;
							return feature;
						}
						else{
							popupboolian_title=true;
							return null;
						}
					}
				}
                else{
                    popupboolian_title=true;
                }
            });
			console.log("popupboolian_title ????",popupboolian_title);
			if(popupboolian_title==false){
				var geometry = feature.getGeometry();
                var coord;
				if(appConfigInfo.mapData==='google'){
					//console.log(geometry);
					coord = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
				}
				else{
					coord =  evt.coordinate;
				}
                var id;
				//test1 = feature;
                if(feature.get('id')===undefined){
					id = null;
                }
                else{
					
					id = feature.get('id');
					
                }
				var properties = feature.getProperties();
				
				if(id == 'c_'+feature_poi_edit_id  &&  layerName == feature_poi_edit_layer+'_API_CircleLayer'){
					feature_poi_edit_layer_callback(id,coord,layerName,properties);
				}
				else if(feature_spatial_edit_id == id && feature_spatial_edit_layer == layerName){
					feature_spatial_edit_layer_callback(id,coord,layerName,properties);
				}else{
					//alert()
					//test12 = layerObj;
					
				if(layerObj != null){
					
					if(layerObj.get('cluster') == true){
						//alert();
						var ids =[],properties1 = [];
						for(var k=0;k<feature.get('features').length;k++){
							ids[k] = feature.get('features')[k].get('id');
							properties1[k] = feature.get('features')[k].getProperties();
						}
						
						getOverlayFeatureDetails(ids,coord,layerName,properties1,mapObj);
					}else if(layerName == "Draw_Route_Layer"){
						
						tmpl.Geocode.getGeocode({
							point : coord,
							callbackFunc  : handleGeocode	
						});
						function handleGeocode(a){
							//console.log(a.address);
							properties.address = a.address;
							//console.log(id,coord,layerName,properties);
							getOverlayFeatureDetails(id,coord,layerName,properties,mapObj);
						}
						
					}else{
						
						getOverlayFeatureDetails(id,coord,layerName,properties,mapObj);
					}
				}else{
				console.log("else3");
				console.log(id,coord,layerName,properties,mapObj);
					getOverlayFeatureDetails(id,coord,layerName,properties,mapObj);
				}
				}
                
			}
		}else{
			if(tmpl.Info.getPlaceFlag ==  true){
				if(appConfigInfo.mapData==='google'){
							var coordinate = evt.coordinate;
				coordinate = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
				var x = parseFloat(coordinate[0]);
				var y = parseFloat(coordinate[1]);
				var coordinates = {lat: y, lng: x};
				var result = {};
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({
					'latLng': coordinates
				},function(results, status) {
					
					if (status == google.maps.GeocoderStatus.OK) {
						if (results[0]) {
							//console.log(results[0]);
							var place = results[0].formatted_address;
							var placeName = place;
							result = {
								place : [placeName],
								latitude : y,
								longitude : x,
								type : (results[0].types).join()
								};
							resultStatus = true;
						}
					}
					
					tmpl.Info.getPlace.CallbackFunc(result);
				});
				}
				else{
						var coordinate = evt.coordinate;
		//coordinate = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
		var x = parseFloat(coordinate[0]);
		var y = parseFloat(coordinate[1]);
		var coordinates = {lat: y, lng: x};
		var result = {};
		//console.log(x,y);
			function handleLandMarks(data){
				//alert();
				//console.log(data);
				result = {
						place : [data[0].name],
						latitude : y,
						longitude : x,
						type : data[0].type
						};
						//console.log("result >>",result);
				tmpl.Info.getPlace.CallbackFunc(result);
			}
			// tmpl.Search.getNearestPlace({
				// map : map,
				// point : [x,y],
				// callbackFunc : handleLandMarks
			// });
			tmpl.Search.getLandMarks({
			map : map,
			point : [x,y],
			radius : 20000,
			POI_type : "all",
			Max_num_POIs : 1,
			callbackFunc : handleLandMarks
		});	
					
				}
			}
		}
	});  
}

// **** Map Resize **** //

tmpl.Map.resize = function(param){
	var mapObj = param.map;
	if(mapObj){
		if(appConfigInfo.mapData==='google'){
			mapObj.updateSize();
			var layers = mapObj.getLayers();
			var googleLayer = layers.item(0);        
			mapObj.removeLayer(googleLayer);        
			layers.insertAt(0, googleLayer);
		}
		else{
			mapObj.updateSize();
		}
	}
}

tmpl.Map.remove = function(param){
	var mapObj = param.map;
	//tmpl_setMap_layer_global = [];
	if(mapObj){
		var allLayers = mapObj.getLayers();
		var layerLength = allLayers.getLength();
		for(var j=0;j<layerLength;j++){
			var lyr1=allLayers.item(j);
			if(lyr1){
				mapObj.removeLayer(lyr1);
			}
		}
		for(var j=0;j<tmpl_setMap_layer_global;j++){
			var lyr1=tmpl_setMap_layer_global[j].layer;
			if(lyr1){
				lyr1.setMap(null);
			}
		}
		tmpl_setMap_layer_global = [];
		mapObj.setTarget(null);
		mapObj = null;
		delete mapObj;
	}
}

tmpl.Layer.remove = function(param){
	var mapObj = param.map;
	var layer = param.layer;
	var existing;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layer){
				existing = existingLayer;
				mapObj.removeLayer(existingLayer);				
			}
		}
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == layerName){
				mapObj.removeLayer(tmpl_setMap_layer_global[i]);
			}			
		}
	}
}



/*
tmpl.Map.getJuridiction = function(param){
	var mapObj = param.map;
	//var visibility = param.visibility;
	var urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/ps/PoliceJuriction";
	$.ajax({
		url:urlL,
        success: function (data) {
        	var format = new ol.format.WKT();
    		var policeJuriData =  data; 	
      		var policeJurifeatureDataArray=[];
      		for (var i = 0,length = policeJuriData.length; i < length; i++) {
		        var policeJurifeature = format.readFeature(policeJuriData[i].the_geom_text);
		        policeJurifeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		        policeJurifeature.setProperties(policeJuriData[i]);
				policeJurifeature.set('id',policeJuriData[i].gid);
				policeJurifeature.set('layer_name','police_Juridiction');
		        policeJurifeatureDataArray.push(policeJurifeature);
      		}
	      	var policeJurifeatureDataArray1=[];
	      	for (var i = 0,length = policeJuriData.length; i < length; i++) {
		        var policeJurifeature1 = format.readFeature(policeJuriData[i].the_geom_text);
		        policeJurifeature1.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		        policeJurifeature1.setProperties(policeJuriData[i]);
		        var policeJuriStyle1 = new ol.style.Style({
		            stroke: new ol.style.Stroke({
		                color: '#000000',
		                width: 1
		            })
		        }); 
		        policeJurifeature1.setStyle(policeJuriStyle1);
				policeJurifeature1.set('id',policeJuriData[i].gid);
				policeJurifeature1.set('layer_name','police_Juridiction');
		        policeJurifeatureDataArray1.push(policeJurifeature1);
	      	}
	      	var policeJurifeatureDataArray2=[];
	      	for (var i = 0,length = policeJuriData.length; i < length; i++) {
		        var policeJurifeature2 = format.readFeature(policeJuriData[i].the_geom_text);
		        policeJurifeature2.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		        policeJurifeature2.setProperties(policeJuriData[i]);
		        var policeJuriStyle2 = new ol.style.Style({
		            stroke: new ol.style.Stroke({
		                color: '#000000',
		                width: 1
		            })
		        }); 
		        policeJurifeature2.setStyle(policeJuriStyle2);
				policeJurifeature2.set('id',policeJuriData[i].gid);
				policeJurifeature2.set('layer_name','police_Juridiction');
		        policeJurifeatureDataArray2.push(policeJurifeature2);
	      	}
	      	
      		var police_juridiction = new ol.layer.Vector({
		        source: new ol.source.Vector({
		            features: policeJurifeatureDataArray
		          })
     	 	});
      		var police_juridictionlastlevel = new ol.layer.Vector({
		        source: new ol.source.Vector({
		            features: policeJurifeatureDataArray1
		        })
		    });  
      		
      		var police_juridictionBlacklevel = new ol.layer.Vector({
		        source: new ol.source.Vector({
		            features: policeJurifeatureDataArray2
		        })
		    });  
      		
      		police_juridiction.setProperties({lname:'police_JuridictionBoundary'});
      		police_juridiction.setProperties({title:'police_JuridictionBoundary'});
      		
      		police_juridictionlastlevel.setProperties({lname:'police_Juridiction'});
      		police_juridictionlastlevel.setProperties({title:'police_Juridiction'});
      		
      		police_juridictionBlacklevel.setProperties({lname:'police_Juridiction'});
      		police_juridictionBlacklevel.setProperties({title:'police_Juridiction'});
      		
      		tmpl_setMap_layer_global.push({
    			layer : police_juridictionBlacklevel,
    			title :  'police_Juridiction',
				visibility : false,
				map : mapObj
    		});
      		
      		tmpl_setMap_layer_global.push({
    			layer : police_juridictionlastlevel,
    			title :  'police_Juridiction',
				visibility : false,
				map : mapObj
    		});
			
      		tmpl_setMap_layer_global.push({
    			layer : police_juridiction,
    			title :  'police_JuridictionBoundary',
				visibility : false,
				map : mapObj
    		});
      		
			var Layers = mapObj.getLayers();
			var length = Layers.getLength();
			
			police_juridictionBlacklevel.setMap(mapObj);
			police_juridictionlastlevel.setMap(mapObj);
            police_juridiction.setMap(mapObj);
			
            for(i=1;i<length;i++){
				var existingLayer=Layers.item(i);
					mapObj.removeLayer(existingLayer);
			}
			
            for(var i=1;i<length;i++){
				var existingLayer=Layers.item(i);
					mapObj.addLayer(existingLayer);
			}
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				if(tmpl_setMap_layer_global[i].title != 'police_Juridiction'){
					if(tmpl_setMap_layer_global[i].visibility == true && tmpl_setMap_layer_global[i].map == mapObj){
						tmpl_setMap_layer_global[i].layer.setMap(null);
						tmpl_setMap_layer_global[i].layer.setMap(mapObj);
					}
				}
			}
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				if(tmpl_setMap_layer_global[i].title != 'police_JuridictionBoundary'){
					if(tmpl_setMap_layer_global[i].visibility == true && tmpl_setMap_layer_global[i].map == mapObj){
						tmpl_setMap_layer_global[i].layer.setMap(null);
						tmpl_setMap_layer_global[i].layer.setMap(mapObj);
					}
				}
			}
			
			
      		var fillcolorArray = ['rgba(207, 83, 0, 0.5)','rgba(255, 102, 51, 0.5)','rgba(51, 0, 0, 0.5)','rgba(153, 51, 255, 0.5)','rgba(0, 0, 204, 0.5)','rgba(0, 255, 255, 0.5)','rgba(173, 255, 47, 0.5)','rgba(255, 102, 255, 0.5)','rgba(204, 204, 102, 0.5)','rgba(133, 92, 51, 0.5)','rgba(220, 20, 60, 0.5)','rgba(0, 153, 102, 0.5)','rgba(255, 215, 0, 0.5)','rgba(102, 0, 204, 0.5)','rgba(246, 227, 206, 0.5)','rgba(172, 250, 88, 0.5)','rgba(88, 130, 250, 0.5)','rgba(247, 211, 88, 0.5)','rgba(88, 172, 250, 0.5)','rgba(46, 46, 254, 0.5)','rgba(254, 46, 247, 0.5)','rgba(255, 255, 0, 0.5)','rgba(4, 180, 49, 0.5)','rgba(254, 46, 154, 0.5)','rgba(254, 46, 46, 0.5)','rgba(0, 255, 0,0.5)','rgba(154, 46, 254, 0.5)','rgba(223, 1, 165, 0.5)','rgba(0, 102, 51, 0.5)','rgba(8, 106, 135, 0.5)','rgba(8, 138, 104, 0.5)','rgba(180, 95, 4, 0.5)','rgba(206, 246, 206, 0.5)','rgba(246, 206, 216, 0.5)','rgba(224, 224, 248, 0.5)','rgba(250, 88, 88, 0.5)','rgba(188, 245, 169, 0.5)','rgba(246, 227, 206, 0.5)','rgba(180, 4, 174, 0.5)','rgba(207, 83, 0, 0.5)','rgba(255, 102, 51, 0.5)','rgba(51, 0, 0, 0.5)','rgba(153, 51, 255, 0.5)','rgba(198, 141, 141, 0.5)','rgba(0, 255, 255, 0.5)','rgba(173, 255, 47, 0.5)','rgba(255, 102, 255, 0.5)','rgba(204, 204, 102, 0.5)','rgba(204, 204, 102, 0.5)','rgba(133, 92, 51, 0.5)','rgba(220, 20, 60, 0.5)','rgba(0, 153, 102, 0.5)','rgba(255, 215, 0, 0.5)','rgba(102, 0, 204, 0.5)','rgba(172, 250, 88, 0.5)','rgba(88, 130, 250, 0.5)','rgba(247, 211, 88, 0.5)','rgba(88, 172, 250, 0.5)','rgba(46, 46, 254, 0.5)','rgba(254, 46, 247, 0.5)','rgba(255, 255, 0, 0.5)','rgba(4, 180, 49, 0.5)','rgba(254, 46, 154, 0.5)','rgba(254, 46, 46, 0.5)','rgba(0, 255, 0, 0.5)','rgba(154, 46, 254, 0.5)','rgba(223, 1, 165, 0.5)','rgba(189, 189, 189, 0.5)','rgba(8, 106, 135, 0.5)','rgba(8, 138, 104, 0.5)','rgba(180, 95, 4, 0.5)','rgba(206, 246, 206, 0.5)','rgba(246, 206, 216, 0.5)','rgba(224, 224, 248, 0.5)','rgba(250, 88, 88, 0.5)','rgba(188, 245, 169, 0.5)','rgba(246, 227, 206, 0.5)','rgba(180, 4, 174, 0.5)','rgba(246, 227, 206, 0.5)','rgba(207, 83, 0, 0.5)','rgba(255, 102, 51, 0.5)','rgba(51, 0, 0, 0.5)','rgba(153, 51, 255, 0.5)','rgba(198, 141, 141, 0.5)','rgba(0, 255, 255, 0.5)','rgba(173, 255, 47, 0.5)','rgba(255, 102, 255, 0.5)','rgba(204, 204, 102, 0.5)','rgba(133, 92, 51, 0.5)','rgba(220, 20, 60, 0.5)','rgba(0, 153, 102, 0.5)','rgba(255, 215, 0, 0.5)','rgba(102, 0, 204, 0.5)','rgba(172, 250, 88, 0.5)','rgba(88, 130, 250, 0.5)','rgba(247, 211, 88, 0.5)','rgba(88, 172, 250, 0.5)','rgba(46, 46, 254, 0.5)','rgba(254, 46, 247, 0.5)','rgba(255, 255, 0, 0.5)','rgba(4, 180, 49, 0.5)','rgba(254, 46, 154, 0.5)','rgba(133, 92, 51, 0.5)'];
			var strokecolorArray = ['rgb(207, 83, 0)','rgb(255, 102, 51)','rgb(51, 0, 0)','rgb(153, 51, 255)','rgb(0, 0, 204)','rgb(0, 255, 255)','rgb(173, 255, 47)','rgb(255, 102, 255)','rgb(204, 204, 102)','rgb(133, 92, 51)','rgb(220, 20, 60)','rgb(0, 153, 102)','rgb(255, 215, 0)','rgb(102, 0, 204)','rgb(246, 227, 206)','rgb(172, 250, 88)','rgb(88, 130, 250)','rgb(247, 211, 88)','rgb(88, 172, 250)','rgb(46, 46, 254)','rgb(254, 46, 247)','rgb(255, 255, 0)','rgb(4, 180, 49)','rgb(254, 46, 154)','rgb(254, 46, 46)','rgb(0, 255, 0,0.5)','rgb(154, 46, 254)','rgb(223, 1, 165)','rgb(0, 102, 51)','rgb(8, 106, 135)','rgb(8, 138, 104)','rgb(180, 95, 4)','rgb(206, 246, 206)','rgb(246, 206, 216)','rgb(224, 224, 248)','rgb(250, 88, 88)','rgb(188, 245, 169)','rgb(246, 227, 206)','rgb(180, 4, 174)','rgb(207, 83, 0)','rgb(255, 102, 51)','rgb(51, 0, 0)','rgb(153, 51, 255)','rgb(198, 141, 141)','rgb(0, 255, 255)','rgb(173, 255, 47)','rgb(255, 102, 255)','rgb(204, 204, 102)','rgb(204, 204, 102)','rgb(133, 92, 51)','rgb(220, 20, 60)','rgb(0, 153, 102)','rgb(255, 215, 0)','rgb(102, 0, 204)','rgb(172, 250, 88)','rgb(88, 130, 250)','rgb(247, 211, 88)','rgb(88, 172, 250)','rgb(46, 46, 254)','rgb(254, 46, 247)','rgb(255, 255, 0)','rgb(4, 180, 49)','rgb(254, 46, 154)','rgb(254, 46, 46)','rgb(0, 255, 0)','rgb(154, 46, 254)','rgb(223, 1, 165)','rgb(189, 189, 189)','rgb(8, 106, 135)','rgb(8, 138, 104)','rgb(180, 95, 4)','rgb(206, 246, 206)','rgb(246, 206, 216)','rgb(224, 224, 248)','rgb(250, 88, 88)','rgb(188, 245, 169)','rgb(246, 227, 206)','rgb(180, 4, 174)','rgb(246, 227, 206)','rgb(207, 83, 0)','rgb(255, 102, 51)','rgb(51, 0, 0)','rgb(153, 51, 255)','rgb(198, 141, 141)','rgb(0, 255, 255)','rgb(173, 255, 47)','rgb(255, 102, 255)','rgb(204, 204, 102)','rgb(133, 92, 51)','rgb(220, 20, 60)','rgb(0, 153, 102)','rgb(255, 215, 0)','rgb(102, 0, 204)','rgb(172, 250, 88)','rgb(88, 130, 250)','rgb(247, 211, 88)','rgb(88, 172, 250)','rgb(46, 46, 254)','rgb(254, 46, 247)','rgb(255, 255, 0)','rgb(4, 180, 49)','rgb(254, 46, 154)','rgb(133, 92, 51)'];
     		var zoom = mapObj.getView().getZoom();
     		
     		//police_juridiction.setVisible(false);
     		//police_juridictionBlacklevel.setVisible(false);
     		//police_juridictionlastlevel.setVisible(false);
     		
     		police_juridiction.setVisible(true);
     		police_juridictionBlacklevel.setVisible(true);
     		police_juridictionlastlevel.setVisible(true);
            for (k=0; k<policeJurifeatureDataArray.length; k++){
                var style = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                      color: strokecolorArray[k],
                      width: 2,
                      lineDash:
 [12,30],
                      offsetX: 0,
                      offsetY: 0,
                    })
                })
                policeJurifeatureDataArray[k].setStyle(style);
            }	
	            
	        tmpl.Map.juridictionBoundary = function(param){ 		       
            	var visibility = param.visibility;
			
				
				for(var i=0;i<tmpl_setMap_layer_global.length;i++){
						if(tmpl_setMap_layer_global[i].title == 'police_JuridictionBoundary'){
							tmpl_setMap_layer_global[i].visibility = visibility;
						}
					}
					
            	police_juridiction.setVisible(visibility);
         		police_juridictionBlacklevel.setVisible(visibility);
         		police_juridictionlastlevel.setVisible(visibility);
	            for (k=0; k<policeJurifeatureDataArray.length; k++){
	                var style = new ol.style.Style({
	                    stroke: new ol.style.Stroke({
	                      color: strokecolorArray[k],
	                      width: 2,
	                      lineDash: [12,30],
	                      offsetX: 0,
	                      offsetY: 0,
	                    })
	                })
	                policeJurifeatureDataArray[k].setStyle(style);
	            }	
				// for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				// if(tmpl_setMap_layer_global[i].title != 'police_Juridiction'){
					// if(tmpl_setMap_layer_global[i].visibility == true && tmpl_setMap_layer_global[i].map == mapObj){
						// console.log("Inside",tmpl_setMap_layer_global[i].title);
						// tmpl_setMap_layer_global[i].layer.setMap(null);
						// tmpl_setMap_layer_global[i].layer.setMap(mapObj);
					// }
				// }
				// }
		    }
			tmpl.Map.juridictionBoundary({visibility:false});
	        tmpl.Map.juridictionBoundaryFill = function(param){    
            	var visibility = param.visibility;
            	//var mapObj = param.map;
				// if(visibility)
					// police_juridictionlastlevel.setMap(mapObj); 
				// else
					// police_juridictionlastlevel.setMap(null); 
	            police_juridictionlastlevel.setVisible(visibility);
				//if(visibility){
					for(var i=0;i<tmpl_setMap_layer_global.length;i++){
						if(tmpl_setMap_layer_global[i].title == 'police_Juridiction'){
							tmpl_setMap_layer_global[i].visibility = visibility;
						}
					}
				//}
	            for (k=0; k<policeJurifeatureDataArray.length; k++){
	                var textname = policeJurifeatureDataArray[k].U.name;
	                var style = new ol.style.Style({
	                    fill: new ol.style.Fill({
	                     color: fillcolorArray[k]
	                    }),
	                    stroke: new ol.style.Stroke({
			                color: fillcolorArray[k],
			                width: 2
			            }),
	                    text: new ol.style.Text({
		                      text: textname,
		                      font: 'bold 10px Arial',
		                      fill: new ol.style.Fill({color:'rgba(255, 0, 0, 0.7)'}),//red color 
		                      stroke: new ol.style.Stroke({color: 'rgba(255, 255, 255, 0.7)', width: 3}) // white
		                    })
	                })
	                policeJurifeatureDataArray1[k].setStyle(style);		               
	            }   
				// for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				// if(tmpl_setMap_layer_global[i].title != 'police_Juridiction'){
					// if(tmpl_setMap_layer_global[i].visibility == true && tmpl_setMap_layer_global[i].map == mapObj){
						// tmpl_setMap_layer_global[i].layer.setMap(null);
						// tmpl_setMap_layer_global[i].layer.setMap(mapObj);
					// }
				// }
				// }
		    }
			
        },
        error: function () {
        	console.log("there was an error!");
        },
    });

}*/


tmpl.Map.getJuridiction = function(param){
	var mapObj = param.map;
	var urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/ps/PoliceJuriction";
	$.ajax({
		url:urlL,
        success: function (data) {
        	var format = new ol.format.WKT();
    		var policeJuriData =  data; 	
      		var policeJurifeatureDataArray=[];
      		for (var i = 0,length = policeJuriData.length; i < length; i++) {
		        var policeJurifeature = format.readFeature(policeJuriData[i].the_geom_text);
		        policeJurifeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		        policeJurifeature.setProperties(policeJuriData[i]);
				policeJurifeature.set('id',policeJuriData[i].gid);
				policeJurifeature.set('layer_name','police_Juridiction');
		        policeJurifeatureDataArray.push(policeJurifeature);
      		}
	      	var policeJurifeatureDataArray1=[];
	      	for (var i = 0,length = policeJuriData.length; i < length; i++) {
		        var policeJurifeature1 = format.readFeature(policeJuriData[i].the_geom_text);
		        policeJurifeature1.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		        policeJurifeature1.setProperties(policeJuriData[i]);
		        var policeJuriStyle1 = new ol.style.Style({
		            stroke: new ol.style.Stroke({
		                color: '#000000',
		                width: 1
		            })
		        }); 
		        policeJurifeature1.setStyle(policeJuriStyle1);
				policeJurifeature1.set('id',policeJuriData[i].gid);
				policeJurifeature1.set('layer_name','police_Juridiction');
		        policeJurifeatureDataArray1.push(policeJurifeature1);
	      	}
	      	var policeJurifeatureDataArray2=[];
	      	for (var i = 0,length = policeJuriData.length; i < length; i++) {
		        var policeJurifeature2 = format.readFeature(policeJuriData[i].the_geom_text);
		        policeJurifeature2.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		        policeJurifeature2.setProperties(policeJuriData[i]);
		        var policeJuriStyle2 = new ol.style.Style({
		            stroke: new ol.style.Stroke({
		                color: '#000000',
		                width: 1
		            })
		        }); 
		        policeJurifeature2.setStyle(policeJuriStyle2);
				policeJurifeature2.set('id',policeJuriData[i].gid);
				policeJurifeature2.set('layer_name','police_Juridiction');
		        policeJurifeatureDataArray2.push(policeJurifeature2);
	      	}
	      	var policeJurifeatureDataArrayFill=[];
      		for (var i = 0,length = policeJuriData.length; i < length; i++) {
		        var policeJurifeatureFill = format.readFeature(policeJuriData[i].the_geom_text);
		        policeJurifeatureFill.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		        policeJurifeatureFill.setProperties(policeJuriData[i]);
		        policeJurifeatureFill.set('id',policeJuriData[i].gid);
		        policeJurifeatureFill.set('layer_name','police_Juridiction');
				policeJurifeatureDataArrayFill.push(policeJurifeatureFill);
      		}
      		var police_juridiction = new ol.layer.Vector({
		        source: new ol.source.Vector({
		            features: policeJurifeatureDataArray
		          })
     	 	});
      		var police_juridictionlastlevel = new ol.layer.Vector({
		        source: new ol.source.Vector({
		            features: policeJurifeatureDataArray1
		        })
		    });  
      		
      		var police_juridictionBlacklevel = new ol.layer.Vector({
		        source: new ol.source.Vector({
		            features: policeJurifeatureDataArray2
		        })
		    });  
      		
      		var police_juridictionFilllevel = new ol.layer.Vector({
		        source: new ol.source.Vector({
		            features: policeJurifeatureDataArrayFill
		        })
		    }); 
      		
      		police_juridictionFilllevel.setProperties({lname:'police_JuridictionFill'});
      		police_juridictionFilllevel.setProperties({title:'police_JuridictionFill'});
      		
      		police_juridiction.setProperties({lname:'police_JuridictionBoundary'});
      		police_juridiction.setProperties({title:'police_JuridictionBoundary'});
      		
      		police_juridictionlastlevel.setProperties({lname:'police_Juridiction'});
      		police_juridictionlastlevel.setProperties({title:'police_Juridiction'});
      		
      		police_juridictionBlacklevel.setProperties({lname:'police_Juridiction'});
      		police_juridictionBlacklevel.setProperties({title:'police_Juridiction'});
      		
      		tmpl_setMap_layer_global.push({
    			layer : police_juridictionFilllevel,
    			title :  'police_JuridictionFill',
				visibility : false,
				map : mapObj
    		});
      		
      		tmpl_setMap_layer_global.push({
    			layer : police_juridictionBlacklevel,
    			title :  'police_Juridiction',
				visibility : false,
				map : mapObj
    		});
      		
      		tmpl_setMap_layer_global.push({
    			layer : police_juridictionlastlevel,
    			title :  'police_Juridiction',
				visibility : false,
				map : mapObj
    		});
			
      		tmpl_setMap_layer_global.push({
    			layer : police_juridiction,
    			title :  'police_JuridictionBoundary',
				visibility : false,
				map : mapObj
    		});
      		
			var Layers = mapObj.getLayers();
			var length = Layers.getLength();
			
			police_juridictionFilllevel.setMap(mapObj);
			police_juridictionBlacklevel.setMap(mapObj);
			police_juridictionlastlevel.setMap(mapObj);
            police_juridiction.setMap(mapObj);
			
            for(i=1;i<length;i++){
				var existingLayer=Layers.item(i);
					mapObj.removeLayer(existingLayer);
			}
			
            for(var i=1;i<length;i++){
				var existingLayer=Layers.item(i);
					mapObj.addLayer(existingLayer);
			}
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				if(tmpl_setMap_layer_global[i].title != 'police_Juridiction'){
					if(tmpl_setMap_layer_global[i].visibility == true && tmpl_setMap_layer_global[i].map == mapObj){
						tmpl_setMap_layer_global[i].layer.setMap(null);
						tmpl_setMap_layer_global[i].layer.setMap(mapObj);
					}
				}
			}
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				if(tmpl_setMap_layer_global[i].title != 'police_JuridictionBoundary'){
					if(tmpl_setMap_layer_global[i].visibility == true && tmpl_setMap_layer_global[i].map == mapObj){
						tmpl_setMap_layer_global[i].layer.setMap(null);
						tmpl_setMap_layer_global[i].layer.setMap(mapObj);
					}
				}
			}
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				if(tmpl_setMap_layer_global[i].title != 'police_JuridictionFill'){
					if(tmpl_setMap_layer_global[i].visibility == true && tmpl_setMap_layer_global[i].map == mapObj){
						tmpl_setMap_layer_global[i].layer.setMap(null);
						tmpl_setMap_layer_global[i].layer.setMap(mapObj);
					}
				}
			}
      		var fillcolorArray = ['rgba(207, 83, 0, 0.2)','rgba(255, 102, 51, 0.2)','rgba(51, 0, 0, 0.2)','rgba(153, 51, 255, 0.2)','rgba(0, 0, 204, 0.2)','rgba(0, 255, 255, 0.2)','rgba(173, 255, 47, 0.2)','rgba(255, 102, 255, 0.2)','rgba(204, 204, 102, 0.2)','rgba(133, 92, 51, 0.2)','rgba(220, 20, 60, 0.2)','rgba(0, 153, 102, 0.2)','rgba(255, 215, 0, 0.2)','rgba(102, 0, 204, 0.2)','rgba(246, 227, 206, 0.2)','rgba(172, 250, 88, 0.2)','rgba(88, 130, 250, 0.2)','rgba(247, 211, 88, 0.2)','rgba(88, 172, 250, 0.2)','rgba(46, 46, 254, 0.2)','rgba(254, 46, 247, 0.2)','rgba(255, 255, 0, 0.2)','rgba(4, 180, 49, 0.2)','rgba(254, 46, 154, 0.2)','rgba(254, 46, 46, 0.2)','rgba(0, 255, 0,0.2)','rgba(154, 46, 254, 0.2)','rgba(223, 1, 165, 0.2)','rgba(0, 102, 51, 0.2)','rgba(8, 106, 135, 0.2)','rgba(8, 138, 104, 0.2)','rgba(180, 95, 4, 0.2)','rgba(206, 246, 206, 0.2)','rgba(246, 206, 216, 0.2)','rgba(224, 224, 248, 0.2)','rgba(250, 88, 88, 0.2)','rgba(188, 245, 169, 0.2)','rgba(246, 227, 206, 0.2)','rgba(180, 4, 174, 0.2)','rgba(207, 83, 0, 0.2)','rgba(255, 102, 51, 0.2)','rgba(51, 0, 0, 0.2)','rgba(153, 51, 255, 0.2)','rgba(198, 141, 141, 0.2)','rgba(0, 255, 255, 0.2)','rgba(173, 255, 47, 0.2)','rgba(255, 102, 255, 0.2)','rgba(204, 204, 102, 0.2)','rgba(204, 204, 102, 0.2)','rgba(133, 92, 51, 0.2)','rgba(220, 20, 60, 0.2)','rgba(0, 153, 102, 0.2)','rgba(255, 215, 0, 0.2)','rgba(102, 0, 204, 0.2)','rgba(172, 250, 88, 0.2)','rgba(88, 130, 250, 0.2)','rgba(247, 211, 88, 0.2)','rgba(88, 172, 250, 0.2)','rgba(46, 46, 254, 0.2)','rgba(254, 46, 247, 0.2)','rgba(255, 255, 0, 0.2)','rgba(4, 180, 49, 0.2)','rgba(254, 46, 154, 0.2)','rgba(254, 46, 46, 0.2)','rgba(0, 255, 0, 0.2)','rgba(154, 46, 254, 0.2)','rgba(223, 1, 165, 0.2)','rgba(189, 189, 189, 0.2)','rgba(8, 106, 135, 0.2)','rgba(8, 138, 104, 0.2)','rgba(180, 95, 4, 0.2)','rgba(206, 246, 206, 0.2)','rgba(246, 206, 216, 0.2)','rgba(224, 224, 248, 0.2)','rgba(250, 88, 88, 0.2)','rgba(188, 245, 169, 0.2)','rgba(246, 227, 206, 0.2)','rgba(180, 4, 174, 0.2)','rgba(246, 227, 206, 0.2)','rgba(207, 83, 0, 0.2)','rgba(255, 102, 51, 0.2)','rgba(51, 0, 0, 0.2)','rgba(153, 51, 255, 0.2)','rgba(198, 141, 141, 0.2)','rgba(0, 255, 255, 0.2)','rgba(173, 255, 47, 0.2)','rgba(255, 102, 255, 0.2)','rgba(204, 204, 102, 0.2)','rgba(133, 92, 51, 0.2)','rgba(220, 20, 60, 0.2)','rgba(0, 153, 102, 0.2)','rgba(255, 215, 0, 0.2)','rgba(102, 0, 204, 0.2)','rgba(172, 250, 88, 0.2)','rgba(88, 130, 250, 0.2)','rgba(247, 211, 88, 0.2)','rgba(88, 172, 250, 0.2)','rgba(46, 46, 254, 0.2)','rgba(254, 46, 247, 0.2)','rgba(255, 255, 0, 0.2)','rgba(4, 180, 49, 0.2)','rgba(254, 46, 154, 0.2)','rgba(133, 92, 51, 0.2)'];
			var strokecolorArray = ['rgb(207, 83, 0)','rgb(255, 102, 51)','rgb(51, 0, 0)','rgb(153, 51, 255)','rgb(0, 0, 204)','rgb(0, 255, 255)','rgb(173, 255, 47)','rgb(255, 102, 255)','rgb(204, 204, 102)','rgb(133, 92, 51)','rgb(220, 20, 60)','rgb(0, 153, 102)','rgb(255, 215, 0)','rgb(102, 0, 204)','rgb(246, 227, 206)','rgb(172, 250, 88)','rgb(88, 130, 250)','rgb(247, 211, 88)','rgb(88, 172, 250)','rgb(46, 46, 254)','rgb(254, 46, 247)','rgb(255, 255, 0)','rgb(4, 180, 49)','rgb(254, 46, 154)','rgb(254, 46, 46)','rgb(0, 255, 0,0.5)','rgb(154, 46, 254)','rgb(223, 1, 165)','rgb(0, 102, 51)','rgb(8, 106, 135)','rgb(8, 138, 104)','rgb(180, 95, 4)','rgb(206, 246, 206)','rgb(246, 206, 216)','rgb(224, 224, 248)','rgb(250, 88, 88)','rgb(188, 245, 169)','rgb(246, 227, 206)','rgb(180, 4, 174)','rgb(207, 83, 0)','rgb(255, 102, 51)','rgb(51, 0, 0)','rgb(153, 51, 255)','rgb(198, 141, 141)','rgb(0, 255, 255)','rgb(173, 255, 47)','rgb(255, 102, 255)','rgb(204, 204, 102)','rgb(204, 204, 102)','rgb(133, 92, 51)','rgb(220, 20, 60)','rgb(0, 153, 102)','rgb(255, 215, 0)','rgb(102, 0, 204)','rgb(172, 250, 88)','rgb(88, 130, 250)','rgb(247, 211, 88)','rgb(88, 172, 250)','rgb(46, 46, 254)','rgb(254, 46, 247)','rgb(255, 255, 0)','rgb(4, 180, 49)','rgb(254, 46, 154)','rgb(254, 46, 46)','rgb(0, 255, 0)','rgb(154, 46, 254)','rgb(223, 1, 165)','rgb(189, 189, 189)','rgb(8, 106, 135)','rgb(8, 138, 104)','rgb(180, 95, 4)','rgb(206, 246, 206)','rgb(246, 206, 216)','rgb(224, 224, 248)','rgb(250, 88, 88)','rgb(188, 245, 169)','rgb(246, 227, 206)','rgb(180, 4, 174)','rgb(246, 227, 206)','rgb(207, 83, 0)','rgb(255, 102, 51)','rgb(51, 0, 0)','rgb(153, 51, 255)','rgb(198, 141, 141)','rgb(0, 255, 255)','rgb(173, 255, 47)','rgb(255, 102, 255)','rgb(204, 204, 102)','rgb(133, 92, 51)','rgb(220, 20, 60)','rgb(0, 153, 102)','rgb(255, 215, 0)','rgb(102, 0, 204)','rgb(172, 250, 88)','rgb(88, 130, 250)','rgb(247, 211, 88)','rgb(88, 172, 250)','rgb(46, 46, 254)','rgb(254, 46, 247)','rgb(255, 255, 0)','rgb(4, 180, 49)','rgb(254, 46, 154)','rgb(133, 92, 51)'];
     		var zoom = mapObj.getView().getZoom();
     		
     		police_juridictionFilllevel.setVisible(false);
     		police_juridiction.setVisible(true);
     		police_juridictionBlacklevel.setVisible(true);
     		police_juridictionlastlevel.setVisible(true);
            for (k=0; k<policeJurifeatureDataArray.length; k++){
                var style = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                      color: strokecolorArray[k],
                      width: 2,
                      lineDash: [12,30],
                      offsetX: 0,
                      offsetY: 0,
                    })
                })
                policeJurifeatureDataArray[k].setStyle(style);
            }	
	            
	        tmpl.Map.juridictionBoundary = function(param){ 		       
            	var visibility = param.visibility;
			
				
				for(var i=0;i<tmpl_setMap_layer_global.length;i++){
						if(tmpl_setMap_layer_global[i].title == 'police_JuridictionBoundary'){
							tmpl_setMap_layer_global[i].visibility = visibility;
						}
					}
					
				//police_juridictionFilllevel.setVisible(visibility);
            	police_juridiction.setVisible(visibility);
         		police_juridictionBlacklevel.setVisible(visibility);
         		police_juridictionlastlevel.setVisible(visibility);
	            for (k=0; k<policeJurifeatureDataArray.length; k++){
	                var style = new ol.style.Style({
	                    stroke: new ol.style.Stroke({
	                      color: strokecolorArray[k],
	                      width: 2,
	                      lineDash: [12,30],
	                      offsetX: 0,
	                      offsetY: 0,
	                    })
	                })
	                policeJurifeatureDataArray[k].setStyle(style);
	            }	
				
		    }
			tmpl.Map.juridictionBoundary({visibility:false});
			
	        tmpl.Map.juridictionBoundaryFill = function(param){    
            	var visibility = param.visibility;
            
            	police_juridictionFilllevel.setVisible(visibility);
	         
					for(var i=0;i<tmpl_setMap_layer_global.length;i++){
						if(tmpl_setMap_layer_global[i].title == 'police_JuridictionFill'){
							tmpl_setMap_layer_global[i].visibility = visibility;
						}
					}
				 for (k=0; k<policeJurifeatureDataArray.length; k++){
	                var textname = policeJurifeatureDataArray[k].U.name;
	                var style = new ol.style.Style({
	                    fill: new ol.style.Fill({
	                     color: fillcolorArray[k]
	                    }),
	                    stroke: new ol.style.Stroke({
			                color: fillcolorArray[k],
			                width: 2
			            }),
	                    text: new ol.style.Text({
		                      text: textname,
		                      font: 'bold 10px Arial',
		                      fill: new ol.style.Fill({color:'rgba(255, 0, 0, 0.7)'}),//red color 
		                      stroke: new ol.style.Stroke({color: 'rgba(255, 255, 255, 0.7)', width: 3}) // white
		                    })
	                })
	                policeJurifeatureDataArrayFill[k].setStyle(style);		               
	            }   
				
		    }
			
        },
        error: function () {
        	console.log("there was an error!");
        },
    });

}



tmpl.HeatMap.create = function(param){
	var mapObj = param.map;
	var getdata = param.data;
	var layer = param.layer;
	var blur = param.blur;
	if(blur == undefined)
	blur = 10;
	var radius = param.radius;
	if(radius == undefined)
	radius = 20;
	var weight;	
	var featureDataAry = [];
	var geometry;
	for (var i = 0, length = getdata.length; i < length; i++){
		if(appConfigInfo.mapData==='google'){
			geometry = new ol.geom.Point(ol.proj.transform([parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)], 'EPSG:4326', 'EPSG:3857'));
		}
		else{
			var coordinate = [parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)];
			geometry = new ol.geom.Point(coordinate);
		}
		var featureval = new ol.Feature({
            geometry     : geometry
			
        });
		if(getdata[i].weight){
			weight = getdata[i].weight;
			featureval.set('weight', weight);
		}
		featureval.setProperties(getdata[i].properties);
		featureDataAry.push(featureval);      
	}
	var vector_heat = new ol.layer.Heatmap({		
		source: new ol.source.Vector({
			   features: featureDataAry
		}),
		title :layer,
		blur: blur,
		radius: radius,
		opacity: .5	   
	});
    //mapObj.addLayer(vector_heat);	  

tmpl_setMap_layer_global.push({
    			layer : vector_heat,
    			title :  layer,
				visibility : true,
				map : mapObj
    		});
		
	vector_heat.setMap(mapObj);
	var Layers = mapObj.getLayers();
			var length = Layers.getLength();
	
	/*for(i=1;i<length;i++){
				var existingLayer=Layers.item(i);
					mapObj.removeLayer(existingLayer);
			}
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				if(tmpl_setMap_layer_global[i].title != layer)
						tmpl_setMap_layer_global[i].layer.setMap(null);
			}
			
            for(var i=1;i<length;i++){
				var existingLayer=Layers.item(i);
					mapObj.addLayer(existingLayer);
			}
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				if(tmpl_setMap_layer_global[i].title != layer)
					tmpl_setMap_layer_global[i].layer.setMap(mapObj);
			}*/
			
}

tmpl.HeatMap.changeRadius = function(param){
	var mapObj = param.map;
	var radius = param.radius;
	var layer = param.layer;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(var i=0;i<tmpl_setMap_layer_global.length;i++){
		if(tmpl_setMap_layer_global[i].title == layer){
			var heatLayer = tmpl_setMap_layer_global[i].layer;
			heatLayer.setRadius(parseInt(radius, 10));
			break;
		}
	}
}

tmpl.HeatMap.changeBlur = function(param){
	var mapObj = param.map;
	var blur = param.blur;
	var layer = param.layer;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(var i=0;i<tmpl_setMap_layer_global.length;i++){
		if(tmpl_setMap_layer_global[i].title == layer){
			var heatLayer = tmpl_setMap_layer_global[i].layer;
			heatLayer.setBlur(parseInt(blur, 10));
			break;
		}
	}
}
tmpl.HeatMap.changeOpacity = function(param){
	var mapObj = param.map;
	var op = param.opacity;
	var layer = param.layer;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(var i=0;i<tmpl_setMap_layer_global.length;i++){
		if(tmpl_setMap_layer_global[i].title == layer){
			var heatLayer = tmpl_setMap_layer_global[i].layer;
			heatLayer.setOpacity(parseFloat(op));
			break;
		}
	}
}

tmpl.Map.getZoneBoundary = function(param){
	var mapObj = param.map;
	//var visibility = param.visibility;
	var color = param.color;
	var width = param.width;
	var textColor = param.textColor;
	
	var colorVal,widthVal,textColorVal;
	
	if(color)
		colorVal = color;
	else
		colorVal = 'rgb(255, 0, 0)';
	
	if(width)
		widthVal = width;
	else
		widthVal = 1;
	
	if(textColor)
		textColorVal = textColor;
	else
		textColorVal = 'rgba(255, 0, 0, 0.8)';
	
	var urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/ps/Zones";
	$.ajax({
		url:urlL,
        success: function (data) {
        	var format = new ol.format.WKT();        	
        	var zonalData =  data; 	
      		var zonalfeatureDataArray=[];
      		
      		for (var i = 0, length = zonalData.length; i < length; i++) {
      	        var zonalfeature = format.readFeature(zonalData[i].the_geom_text);
      	        zonalfeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      	        zonalfeature.setProperties(zonalData[i]);
      	        var zonalStyle = new ol.style.Style({
      	            
      	            stroke: new ol.style.Stroke({
      	                color: colorVal,
      	                width: widthVal
      	            }),
      	            text: new ol.style.Text({
      	              text: zonalData[i].name,
      	              font: 'bold 10px Arial',
      	              fill: new ol.style.Fill({color:textColorVal}),
      	              stroke: new ol.style.Stroke({color: 'rgba(255, 255, 255, 0.7)', width: widthVal})
      	            })
      	        });
      	        zonalfeature.setStyle(zonalStyle);
      	        zonalfeatureDataArray.push(zonalfeature);
      	    }
      		var zonal = new ol.layer.Vector({
      	        source: new ol.source.Vector({
      	            features: zonalfeatureDataArray
      	        })
      	    });
      		
        	tmpl_setMap_layer_global.push({
    			layer : zonal,
    			title :  'zoneBorder',
				visibility : true,
				map : mapObj
    		});
        	zonal.setMap(mapObj);  
        	zonal.setVisible(true);
        	
        	var Layers = mapObj.getLayers();
			var length = Layers.getLength();
        	for(i=1;i<length;i++){
				var existingLayer=Layers.item(i);
					mapObj.removeLayer(existingLayer);
			}
			
			for(var i=1;i<length;i++){
				var existingLayer=Layers.item(i);
					mapObj.addLayer(existingLayer);
			}
			
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				if(tmpl_setMap_layer_global[i].title != 'zoneBorder'){
					if(tmpl_setMap_layer_global[i].visibility == true && tmpl_setMap_layer_global[i].map == mapObj){
						tmpl_setMap_layer_global[i].layer.setMap(null);
						tmpl_setMap_layer_global[i].layer.setMap(mapObj);
					}
				}
			}
        	
        	tmpl.Map.getZoneVisibility = function(param){
        		var visibility = param.visibility;
        		//var mapObj = param.map;
        		zonal.setVisible(visibility);
				// if(visibility)
					// zonal.setMap(mapObj); 
				// else
					// zonal.setMap(null); 
				for(var i=0;i<tmpl_setMap_layer_global.length;i++){
						if(tmpl_setMap_layer_global[i].title == 'zoneBorder'){
							tmpl_setMap_layer_global[i].visibility = visibility;
						}
					}
        		for(i=1;i<length;i++){
    				var existingLayer=Layers.item(i);
    					mapObj.removeLayer(existingLayer);
    			}
    			
    			for(var i=1;i<length;i++){
    				var existingLayer=Layers.item(i);
    					mapObj.addLayer(existingLayer);
    			}
				for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				if(tmpl_setMap_layer_global[i].title != 'zoneBorder'){
					if(tmpl_setMap_layer_global[i].visibility == true && tmpl_setMap_layer_global[i].map == mapObj){
						tmpl_setMap_layer_global[i].layer.setMap(null);
						tmpl_setMap_layer_global[i].layer.setMap(mapObj);
					}
				}
				}

        	}
        	
        	
        	tmpl.Map.resize({map : mapObj})
        	
        },
        error: function () {
        	console.log("there was an error!");
        },
    });
}



tmpl.Map.getCityBoundary = function(param){
	var mapObj = param.map;
	var color = param.color;
	var width = param.width;
	var urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/ps/Border";
	// $.ajax({
		// url:urlL,
        // success: function (data) {
			var data = [];
			data[0] = {}
			data[0].the_geom_text = 'LINESTRING(77.3970692938604 12.9714054339315,77.398972 12.974115,77.399315 12.98181,77.393135 12.999205,77.3905545167409 13.0014054339315,77.3881710978793 13.0034378267857,77.387642 13.003889,77.384895 13.007234,77.382492 13.015262,77.381462 13.023624,77.3863567245453 13.0314054339315,77.387985 13.033994,77.3881710978793 13.0345741938833,77.391418 13.044697,77.391418 13.055734,77.3925831540404 13.0614054339315,77.392792 13.062422,77.393135 13.070783,77.392105 13.079813,77.389702 13.087504,77.3881710978793 13.0881750376268,77.382835 13.090514,77.3808517150368 13.0914054339315,77.378372 13.09252,77.379402 13.09787,77.379402 13.106564,77.380775 13.112583,77.386269 13.113586,77.3881710978793 13.1131228034294,77.393135 13.111914,77.398285 13.111246,77.403091 13.102552,77.405495 13.09787,77.413391 13.094192,77.4155367558692 13.0914054339315,77.4181710978792 13.0879843699774,77.418541 13.087504,77.425064 13.08416,77.433304 13.083157,77.43605 13.076803,77.44532 13.071118,77.4481710978792 13.0698558777723,77.449097 13.069446,77.451157 13.075131,77.4481710978792 13.0825827116814,77.445663 13.088842,77.4450910519274 13.0914054339315,77.443947 13.096533,77.4428980678097 13.0981899457784,77.4424395434558 13.1005710872359,77.4422240673459 13.1051508538767,77.442574 13.109908,77.447037 13.113921,77.4476957734532 13.1214054339315,77.448067 13.125623,77.447723 13.135654,77.438454 13.135988,77.432274 13.137994,77.4383593355269 13.1514054339315,77.438797 13.15237,77.4410256957765 13.1514054339315,77.448067 13.148358,77.4481710978792 13.1484686039967,77.450935173112 13.1514054339315,77.451843 13.15237,77.4574563321455 13.1514054339315,77.45768 13.151367,77.4577523558037 13.1514054339315,77.465233 13.155379,77.467979 13.152704,77.471413 13.154042,77.474159 13.158388,77.4787408839463 13.162715389662,77.4829856035949 13.161574652932,77.485146 13.162734,77.487206 13.17176,77.490982 13.173766,77.495789 13.173766,77.496819 13.168417,77.495445 13.161397,77.5031295357853 13.1610819627237,77.5060972922465 13.1550164083002,77.5087212239826 13.1527810069931,77.5081710978792 13.1492371964645,77.510551 13.148358,77.515358 13.149027,77.5190212328216 13.1514054339315,77.519478 13.151702,77.523598 13.151702,77.5238471542011 13.1514054339315,77.526688 13.148024,77.530464 13.148024,77.5332420760673 13.1514054339315,77.535957 13.15471,77.5381710978792 13.1563874120179,77.539047 13.157051,77.544884 13.156716,77.552094 13.155713,77.557587 13.156048,77.56411 13.158722,77.5681710978792 13.1597427119071,77.574753 13.161397,77.584023 13.163402,77.592606 13.165408,77.5981710978792 13.1663111367666,77.5986293662722 13.1673984653126,77.5994095609281 13.1834893889757,77.599635234888 13.1854604548021,77.6009951065326 13.1929624258667,77.6031815205929 13.203012889787,77.6063009377485 13.2019852104871,77.6090556039459 13.2018752537089,77.6099287458954 13.2013381868323,77.6103145544133 13.2010466247845,77.6103944089797 13.2002780423564,77.6182583545456 13.2038777620035,77.6203861581525 13.2035325031241,77.6206698653 13.2044992267562,77.6223011813986 13.206432662539,77.6244999117924 13.2065707645091,77.6277625439896 13.206432662539,77.6282235681044 13.2099542381388,77.6343764668676 13.2124400232075,77.6416819259179 13.2109899863031,77.6475511175335 13.2163758046788,77.6525917245912 13.2220056292968,77.6659104591198 13.2305012373755,77.6704198796113 13.2300173713331,77.6735406582348 13.2293269270683,77.6865911870243 13.2391310522686,77.6923717201565 13.2428592780027,77.6932228415993 13.2462767681068,77.6905276236971 13.2524902635366,77.6929391344517 13.2598081768528,77.6967691809443 13.2640883636953,77.7076919061267 13.2751336588746,77.7084011739957 13.2785852106172,77.7108126847503 13.2802419380252,77.7127986347834 13.2787232716663,77.7214353517324 13.2779350707633,77.7406667112873 13.2658883044883,77.7414690991238 13.2521307303817,77.7379067173457 13.240788048531,77.7509335425466 13.2301185865968,77.7445727395427 13.1959840084233,77.7469042120713 13.1768959939457,77.7421221184997 13.1683429752455,77.7388389711731 13.1612064870776,77.7319601736745 13.1553571680198,77.7285495081683 13.152273414353,77.728218 13.148693,77.730621 13.145684,77.740234 13.142006,77.747787 13.137994,77.747101 13.128967,77.746583125821 13.1214054339315,77.746414 13.118936,77.746071 13.105896,77.7481710978792 13.1046461359224,77.752251 13.102218,77.753281 13.094527,77.7550061893429 13.0914054339315,77.755684 13.090179,77.764267 13.076469,77.768044 13.072455,77.776627 13.077137,77.7781710978792 13.0778246221498,77.788643 13.082488,77.794479 13.08115,77.798943 13.076803,77.798943 13.068777,77.792763 13.067105,77.786583 13.063426,77.7781710978792 13.063426,77.776283 13.063426,77.7732870576864 13.0614054339315,77.77182 13.060416,77.76667 13.05172,77.760834 13.048376,77.7647330300696 13.0354179512922,77.7679452736084 13.0300471647614,77.7733317494887 13.0265909282158,77.7717204870776 13.014386348161,77.7719515357853 13.0047535129225,77.773332041501 13.0003185616302,77.7720711069926 12.9986542878082,77.7705640974155 12.9952591647614,77.7731997191849 12.9927254756461,77.7781710978792 12.987968941925,77.780746 12.986493,77.78933 12.98114,77.797913 12.980471,77.804092 12.979468,77.8081710978792 12.9779390808218,77.813019 12.976122,77.817482 12.977126,77.819885 12.975453,77.8185378821228 12.9714054339315,77.815765 12.963074,77.815422 12.958725,77.824348 12.956383,77.831215 12.951698,77.836708 12.944003,77.8378738482 12.9414054339315,77.8381710978792 12.940743147297,77.839111 12.938649,77.841171 12.935303,77.844261 12.931288,77.849068 12.928945,77.854218 12.924261,77.861771 12.914222,77.8627617156324 12.9114054339315,77.865891 12.902509,77.8681710978792 12.8943570411207,77.86898 12.891465,77.87104 12.885106,77.8750736826704 12.8814054339315,77.882713 12.874397,77.8836132337633 12.8694962812691,77.8822154168316 12.8677966224448,77.8812674562606 12.8648076856687,77.8787897071272 12.8619430861012,77.8768182718905 12.8611701141557,77.8739299152277 12.8605380583514,77.8713881425267 12.8590540264284,77.8691605414347 12.8569108348263,77.8645763959926 12.8555089676532,77.8602135141555 12.8548408660367,77.8549115423235 12.8500725234246,77.8503224949416 12.849840072204,77.8465184849647 12.8511483443902,77.8440255084673 12.8522530672793,77.8406727472682 12.8522416447475,77.8371295931153 12.8532157259201,77.8341519995509 12.8526359521384,77.8322288071704 12.8506064412075,77.8303886930015 12.8493428518858,77.8273174048582 12.8496264707843,77.8263744516169 12.8517897209837,77.8257723262764 12.8544067066925,77.8230065710977 12.8556702067805,77.8206227504066 12.8554326205546,77.8159801024995 12.8549189455704,77.8132863543116 12.8558160915808,77.8113459116401 12.8564593131106,77.8089787716252 12.8547264189024,77.808188330996 12.8529434392342,77.8049642868013 12.8548085075027,77.796883 12.855988,77.782806 12.855318,77.7781710978792 12.8572299101063,77.77388 12.859,77.766327 12.863351,77.762894 12.874062,77.76049 12.878078,77.753967 12.877409,77.748817 12.879417,77.7481710978792 12.8795623026505,77.739977975462 12.8814054339315,77.739891 12.881425,77.7398809651386 12.8814054339315,77.735428 12.872723,77.734741 12.859335,77.7331149082967 12.8514054339315,77.733025 12.850967,77.730278 12.843268,77.725815 12.8349,77.721008 12.832222,77.721352 12.823183,77.7204065740107 12.8214054339315,77.7181710978792 12.8172023481657,77.716545 12.814145,77.710365 12.807114,77.716888 12.803432,77.715858 12.797406,77.710022 12.793723,77.698006 12.795397,77.690453 12.801088,77.6881710978792 12.7994565507556,77.685303 12.797406,77.67878 12.803097,77.671227 12.807784,77.66333 12.805106,77.65818 12.804771,77.6581710978792 12.8047917004726,77.653717 12.815149,77.6550674297733 12.8214054339315,77.65509 12.82151,77.6581710978792 12.8216973451104,77.660583 12.821844,77.6618578556484 12.8214054339315,77.66642 12.819836,77.6683518995512 12.8214054339315,77.67054 12.823183,77.66951 12.831218,77.663673 12.8349,77.6581710978792 12.8363899964721,77.651314 12.838247,77.640327 12.84059,77.631401 12.840256,77.6281710978792 12.8362672276722,77.626251 12.833896,77.623505 12.824188,77.6254071404447 12.8214054339315,77.626938 12.819166,77.6281710978792 12.8161595942092,77.629684 12.812471,77.6281710978792 12.8042504577649,77.627281 12.799414,77.6239962440486 12.7914054339315,77.623848 12.791044,77.619728 12.791379,77.6196699220362 12.7914054339315,77.614578 12.793723,77.608398 12.795732,77.600502 12.79774,77.5981710978792 12.7923828527917,77.5977458215884 12.7914054339315,77.595695 12.786692,77.592262 12.780665,77.589859 12.769616,77.5866652504592 12.7614054339315,77.586082 12.759906,77.582649 12.75053,77.57029 12.742158,77.5681710978792 12.7406272246491,77.56102 12.735461,77.555527 12.734456,77.546944 12.739814,77.5381710978792 12.7480948019078,77.536301 12.74986,77.5381710978792 12.7541394778491,77.5413462630604 12.7614054339315,77.545227 12.770286,77.540421 12.776647,77.542824 12.787696,77.5399710154201 12.7914054339315,77.5381710978792 12.7937456762331,77.537674 12.794392,77.519821 12.796066,77.5081710978792 12.7963651504837,77.506775 12.796401,77.5064739142222 12.7914054339315,77.506432 12.79071,77.501968 12.783009,77.496819 12.772964,77.486519 12.768946,77.479652 12.768946,77.4781710978792 12.7704867191207,77.469353 12.779661,77.459396 12.788031,77.45253 12.781335,77.4481710978792 12.7816621862448,77.448067 12.78167,77.437767 12.791044,77.4366023624213 12.7914054339315,77.430214 12.793388,77.428534701407 12.7914054339315,77.423691 12.785687,77.418884 12.782674,77.4181710978792 12.7827591346585,77.402061 12.784683,77.4013159320481 12.7914054339315,77.400688 12.797071,77.396568 12.805775,77.394165 12.812471,77.3992372345086 12.8214054339315,77.404808 12.831218,77.415108 12.845277,77.4181710978792 12.8507718756899,77.4185242725488 12.8514054339315,77.423691 12.860674,77.428497 12.873058,77.431931 12.879752,77.4357477332759 12.8814054339315,77.44429 12.885106,77.43605 12.888788,77.433647 12.895147,77.429527 12.902509,77.424721 12.90619,77.4181710978792 12.9064678545284,77.416824 12.906525,77.409615 12.907194,77.394165 12.908198,77.3923931692558 12.9114054339315,77.391762 12.912548,77.395882 12.928611,77.400002 12.937645,77.3989497731732 12.9414054339315,77.397942 12.945007,77.401375 12.953706,77.404465 12.959059,77.404465 12.96207,77.396225 12.959059,77.391418 12.961736,77.394508 12.967758,77.3970692938604 12.9714054339315)';
        	var format = new ol.format.WKT();        	
        	var geometryVal = data[0].the_geom_text;        	
        	var feature = format.readFeature(geometryVal, {
    			dataProjection: 'EPSG:4326',
    			featureProjection: 'EPSG:3857'
    		}); 
        	if(color){
        		feature.setStyle(new ol.style.Style({
	                stroke: new ol.style.Stroke({
	        			color: color,
	                    width: width,
	        			lineDash : [5]
	                })
	            }));
        	}
        	else{
	        	feature.setStyle(new ol.style.Style({
	                stroke: new ol.style.Stroke({
	        			color: 'rgb(111, 110, 101)',
	                    width: 1,
	        			lineDash : [5]
	                })
	            }));
        	}
        	var source=  new ol.source.Vector({
        		features: [feature]
        	});       	
        	var newLayer = new ol.layer.Vector({
    			title: 'cityBorder',
    			visible: true,
    			source: source
    		});
        	tmpl_setMap_layer_global.push({
    			layer : newLayer,
    			title :  'cityBorder',
				visibility : true,
				map : mapObj
    		});
        	newLayer.setMap(mapObj);  
        // },
        // error: function () {
        	// console.log("there was an error!");
        // },
    // });
}

//mapObj.on('click',tmpl.mapOnClickExtraForCenterMap);

//------------------------------------ End of Creating Google Map ---------------------------------------//

//---------------------------------- Beginning of Map Control Tools -------------------------------------//

// **** Map Zoom In **** //

tmpl.Control.zoomIn = function(param){
	var mapObj = param.map;
	var currentZoom = mapObj.getView().getZoom();
	currentZoom = currentZoom + 1;
	mapObj.getView().setZoom(currentZoom);
}

// **** Map Zoom Out **** //

tmpl.Control.zoomOut = function(param){
	var mapObj = param.map;
	var currentZoom = mapObj.getView().getZoom();
	currentZoom = currentZoom - 1;
	mapObj.getView().setZoom(currentZoom);
}

// **** Adding Scale Control to the specified map **** //

tmpl.Control.addScale = function(param){
	var mapObj = param.map;
	var scaleCtrl = new ol.control.ScaleLine();
	mapObj.addControl(scaleCtrl);
}

// **** Adding Zoom to Extent Control to the specified map **** //

tmpl.Control.addZoomToExtent = function(param){
	var mapObj = param.map;
	if(appConfigInfo.mapData==='google'){
		var zoomToExtentButton = document.createElement('button');
		var zoomToExtentText = document.createTextNode("E");
		zoomToExtentButton.appendChild(zoomToExtentText);
		zoomToExtentButton.title ='Fit to Extent';
		zoomToExtentButton.className = 'ol-zoom-Extent-Custom .ol-unselectable ';
		zoomToExtentButton.addEventListener('click', function(){
			zoomToExtentControlForGoogle(mapObj);
		});
		var zoomToExtentControl = new ol.control.Control({
			element: zoomToExtentButton
		});
		mapObj.addControl(zoomToExtentControl);
    }
    else
    {
		var zoomToExtentControl = new ol.control.ZoomToExtent({
			extent: [77.378372, 12.734456, 77.882713, 13.2803290722673]
		});
		mapObj.addControl(zoomToExtentControl);
    }
}

// **** Zoom to Extent event handler for Google map **** //

function zoomToExtentControlForGoogle(mapObj){

	var start = new google.maps.LatLng(appConfigInfo.extent2,appConfigInfo.extent1);
    var end = new google.maps.LatLng(appConfigInfo.extent4,appConfigInfo.extent3);
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(start);
    bounds.extend(end);
	
    var convertBounds,x1,y1,x2,y2,extent;
    convertBounds = bounds.toString();
    convertBounds=convertBounds.slice(2,-2);
    convertBounds=convertBounds.split("), (");
    x1=parseFloat(convertBounds[0].split(",")[0]);
    y1=parseFloat(convertBounds[0].split(",")[1]);
	x2=parseFloat(convertBounds[1].split(",")[0]);
    y2=parseFloat(convertBounds[1].split(",")[1]);
	
    extent =[y1,x1,y2,x2];
    mapObj.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857'), mapObj.getSize());
}

// **** End of Adding Zoom to Extent Control to the specified map **** //

// **** Adding Mouse Position Control to the specified map **** //

tmpl.Control.addMousePostion = function(param){
	var mapObj = param.map;
	var ctrlMouse = new ol.control.MousePosition({
		undefinedHTML: 'outside',
        projection: 'EPSG:4326',
        coordinateFormat: function(coordinate) {
            return ol.coordinate.format(coordinate, '{x}, {y}', 4);
		}
	});
	mapObj.addControl(ctrlMouse);
}

// **** Adding Full Screen Control to the specified map **** //

tmpl.Control.addFullScreen = function(param){
	var mapObj = param.map;
	var ctrlFullScreen =  new ol.control.FullScreen();
	mapObj.addControl(ctrlFullScreen);
}
//----------------------------------- End of Map Control Tools ------------------------------------------//
						
						
					
//---------------------------------- Beginning of Drawing Tools -----------------------------------------//
var draw;
var select = null,selectE;
//var features= new ol.Collection();
var drawVector;
var modify1;
var drawm; //draw marker

// **** This function is used to create a point on the map. On calling this function a tool is created on the map, which can be used for creating points on the map. This function returns the coordinates of the point geometry, feature   object,   its WKT representation and its geometry type in the callback function getDrawFeatureDetails(coordinates, feature, wktGeom, type). **** //

tmpl.Draw.point = function(param){
	var callbackFunc=param.callbackFunc;
	var mapObj = param.map;
    var drawButton = document.createElement('button');
    drawButton.title ='Draw Points';
    drawButton.className = 'ol-map-pointbtn';
    drawButton.addEventListener('click', function(){tmpl.Draw.draw({type:'Point',map:mapObj,callbackFunc:callbackFunc})});
	mapObj.addControl(new ol.control.Control({
        element: drawButton
    }));
}

tmpl.Draw.CustomPoint = function(param){
	var callbackFunc=param.callbackFunc;
	var mapObj = param.map;
	var img_url = param.img_url;
    var drawButton = document.createElement('button');
    drawButton.title ='Draw Points';
    drawButton.className = 'ol-map-pointbtn';
    drawButton.addEventListener('click', function(){tmpl.Draw.draw({type:'Point',map:mapObj,img_url:img_url,callbackFunc:callbackFunc})});
	mapObj.addControl(new ol.control.Control({
        element: drawButton
    }));
}

// **** For lines **** //

tmpl.Draw.line = function(param){
	var callbackFunc=param.callbackFunc;
	var mapObj = param.map;
    var drawButton = document.createElement('button');
    drawButton.title ='Draw Lines';
    drawButton.className = 'ol-map-linebtn';
    drawButton.addEventListener('click', function(){tmpl.Draw.draw({type:'LineString',map:mapObj,callbackFunc:callbackFunc})});
    mapObj.addControl(new ol.control.Control({
        element: drawButton
    }));
}

// **** For polygond **** //

tmpl.Draw.polygon = function(param){
	var callbackFunc=param.callbackFunc;
	var mapObj = param.map;
    var drawButton = document.createElement('button');
    drawButton.title ='Draw Polygons';
    drawButton.className = 'ol-map-polygonbtn';
    drawButton.addEventListener('click', function(){tmpl.Draw.draw({type:'Polygon',map:mapObj,callbackFunc:callbackFunc})});
    mapObj.addControl(new ol.control.Control({
        element: drawButton
    }));
}

// **** for Circle **** //

tmpl.Draw.circle = function(param){
	var callbackFunc=param.callbackFunc;
	var mapObj = param.map;
	var drawButton = document.createElement('button');
    drawButton.title ='Draw Circle';
    drawButton.className = 'ol-map-Circlebtn';
    drawButton.addEventListener('click', function(){tmpl.Draw.draw({type:'Circle',map:mapObj,callbackFunc:callbackFunc})});
    var drawControl = new ol.control.Control({
        element: drawButton
    });
    mapObj.addControl(drawControl);
}

// **** Common draw tool used to draw features without setting buttons on the map ****//

tmpl.Draw.draw = function(param){
	var features= new ol.Collection();
	var callbackFunc = param.callbackFunc;
	var mapObj = param.map;
	var btnType = param.type;
	var img_url = param.img_url;
	var drawRestriction = param.drawRestriction;
	var img_path;
	if(img_url == undefined){
		img_path = 'api_img/icon.png';
	}else{
		img_path = img_url;
	}
    mapObj.removeInteraction(modify1);
    mapObj.removeInteraction(draw);
    mapObj.removeInteraction(select);
    mapObj.removeInteraction(drawm);

    mapObj.removeInteraction(selectE);

    var source = new ol.source.Vector({features : features});

    var noLayer=false;
    var existingLayer;
    var Layers = mapObj.getLayers();
    var length = Layers.getLength();
    for(i=0;i<length;i++){
		var tempLayer=Layers.item(i);
		if(tempLayer.get('lname') == 'drawvector'){
			noLayer = true;
            existingLayer = tempLayer;
           // existingLayer.getSource().clear();
        }
    }
    
    if (!noLayer) {
		drawVector =new ol.layer.Vector({
			source: source/*new ol.source.Vector({
				features : features
			})*//*,
			style: new ol.style.Style({
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#1b465a'
            })
          })
        })*/
		});
		drawVector.setProperties({lname:"drawvector"});
		drawVector.setProperties({myId:"myUnique"});
		mapObj.addLayer(drawVector);
		existingLayer=drawVector;
    }
    addInteraction(btnType,mapObj,existingLayer,callbackFunc,drawRestriction);
	//}
}

function addInteraction(btnType,mapObj,drawLayer,callbackFunc,drawRestriction) {
	var callbackFunc=callbackFunc;
	drawLayer.getSource().clear();
    var value = btnType;
    if (value !== 'None') {
        var geometryFunction, maxPoints;
			if (value === 'Square') {
				value = 'Circle';
				geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
			} 
			else if (value === 'Box') {
				value = 'LineString';
				maxPoints = 2;
				geometryFunction = function(coordinates, geometry) {
					if (!geometry) {
						geometry = new ol.geom.Polygon(null);
					}
					var start = coordinates[0];
					var end = coordinates[1];
					geometry.setCoordinates([
						[start, [start[0], end[1]], end, [end[0], start[1]], start]
					]);
					return geometry;
				};
			}
			else if(value === 'Circle'){
				value = 'Circle';
            	geometryFunction = ol.interaction.Draw.createRegularPolygon(100);
			}
			draw = new ol.interaction.Draw({
            source: drawLayer.getSource(),
            type: /** @type {ol.geom.GeometryType} */ (value),
            geometryFunction: geometryFunction,
            maxPoints: maxPoints
        });
        mapObj.addInteraction(draw);
        draw.on('drawend', function(event){
            var feature = event.feature;
            var geometryVal =feature.getGeometry();
            var lonlat;
            var coord,wktGeom;
            var format = new ol.format.WKT();
            if(value==='Point'){
				lonlat =feature.getGeometry().getCoordinates();
            }
            else if(value==='LineString'){
				lonlat =feature.getGeometry().getFirstCoordinate();
            }
            else if(value==='Polygon' || value==='Circle')
            {
				lonlat =feature.getGeometry().getInteriorPoint().getCoordinates();
	        }
           /* else if(value==='Circle')
               {
                 lonlat =feature.getGeometry().getCenter();

                 alert("Circle "+feature.getGeometry().getType()+lonlat);
               }*/
            if(appConfigInfo.mapData==='google'){
                coord = ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326');
                wktGeom= format.writeGeometry(feature.getGeometry().clone().transform('EPSG:3857','EPSG:4326'));
			}
            else{
				coord = lonlat;//feature.getGeometry().getCoordinates();
				wktGeom= format.writeGeometry(feature.getGeometry());
            }
            
            event.stopPropagation();
            mapObj.removeInteraction(draw);
			callbackFunc(coord, feature, wktGeom, value);
			
			/*if(value == 'Point'){
				console.log(drawRestriction);
				if(drawRestriction != undefined){
					if(drawRestriction == true){
		var url = appConfigInfo.drawRestrictionURL+''+coord[0]+'/'+coord[1]+'/';
		$.ajax({
		url:url,
        success: function (res) {
			//console.log(res);
        	if(res[0].count == 1){
				callbackFunc(coord, feature, wktGeom, value);
			}else{
				alert("Mark Within City Bundary");
				tmpl.Draw.clear({map : mapObj});
			}
        },
        error: function () {
        	console.log("there was an error!");
        },
    });
	}else{
		callbackFunc(coord, feature, wktGeom, value);
	}
				}else{
					callbackFunc(coord, feature, wktGeom, value);
				}
			}else{
				callbackFunc(coord, feature, wktGeom, value);
			}*/
            
           // getDrawFeatureDetails(coord, feature, wktGeom, value);
        });
    }
}
tmpl.Map.pointWithinBoundary = function(param){
	var coord = param.point;
	var callbackFunc = param.callbackFunc;
	var url = appConfigInfo.connection.url+'/bangalore/landmark_search/withInBoundary/'+coord[0]+'/'+coord[1]+'/';
	$.ajax({
		url:url,
		success: function (res) {
			//console.log(res);
			if(res[0].count == 1){
				callbackFunc(true);
			}else{
				callbackFunc(false);
			}
		},
		error: function () {
			console.log("there was an error!");
		},
	});
}


tmpl.Draw.clear = function(param){
	var mapObj = param.map;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(var i=0;i<length;i++){
		var existingLayer = Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('lname') == 'drawvector'){
				existingLayer.getSource().clear();
				mapObj.removeLayer(existingLayer);
			}
		}	
	}
}


tmpl.Draw.remove = function(param){
	var mapObj = param.map;
	mapObj.removeInteraction(modify1);
    mapObj.removeInteraction(draw);
    mapObj.removeInteraction(select);
    mapObj.removeInteraction(drawm);
    mapObj.removeInteraction(selectE);
}


tmpl.Draw.addSelect = function(param){
	var mapObj = param.map;
    var selectButton = document.createElement('button');
    selectButton.title ='Select Features';
    selectButton.className = 'ol-map-selectbtn';
    selectButton.addEventListener('click', function(){tmpl.Draw.select({map:mapObj});});
    var selectControl = new ol.control.Control({
        element: selectButton
    });
    mapObj.addControl(selectControl);
}

tmpl.Draw.select = function(param){
	var mapObj = param.map;
	mapObj.removeInteraction(select);
	mapObj.removeInteraction(draw);
	mapObj.removeInteraction(modify1);
	mapObj.removeInteraction(drawm);
	mapObj.removeInteraction(selectE);
	select = null;
	var selectClick = new ol.interaction.Select({
        condition: ol.events.condition.click
    });
    var style_modify = new ol.style.Style({
		fill: new ol.style.Fill({
	                color: 'blue'
	    }),
	    stroke: new ol.style.Stroke({
	        width: 5,
	        color: 'blue'
	    }),
        image: new ol.style.Circle({
			radius: 5,
            fill: new ol.style.Fill({
				color: 'blue'
			})
        })
	});
	selectClick.on('select', function(evt){
	    var selected = evt.selected;
	    var deselected = evt.deselected;
	    if (selected.length) {
	        selected.forEach(function(feature){
	            feature.setStyle(style_modify);
	        });
	    } else {
	        deselected.forEach(function(feature){
	            feature.setStyle(null);
	        });
	    }
	});
	var changeInteraction = function() {
        if (select !== null) {
            mapObj.removeInteraction(select);
        }
        select = selectClick;
        if (select !== null) {
            mapObj.addInteraction(select);     
        }
	};
	changeInteraction();
}

tmpl.Draw.addDelete = function(param){
	var mapObj = param.map;
	var deleteButton = document.createElement('button');
	deleteButton.title ='Delete';
	deleteButton.className = 'ol-map-deletebtn';
	deleteButton.addEventListener('click', function(){tmpl.Draw.delete({map:mapObj});});
	var deleteControl = new ol.control.Control({
		element: deleteButton
    });
	mapObj.addControl(deleteControl);
}

tmpl.Draw.delete = function doDelete(param){
	var mapObj = param.map;
	mapObj.removeInteraction(modify1);
	mapObj.removeInteraction(draw);
	mapObj.removeInteraction(select);
	mapObj.removeInteraction(drawm);
	var selected_features = select.getFeatures();
	selected_features.forEach(function(selfeature) {
        selected_features.remove(selfeature);
		var lyr =  selfeature.getLayerDetailsTrinity(mapObj);
		var src = lyr.getSource();
		src.removeFeature(selfeature);
    });
	mapObj.removeInteraction(select);
}

/*
tmpl.Draw.addEdit = function setEdit(param){
	var mapObj = param.map;
	var editButton = document.createElement('button');
	editButton.title ='Edit';
	editButton.className = 'ol-map-editbtn';
	editButton.addEventListener('click', function(){tmpl.Draw.edit({map:mapObj});});
	var editControl = new ol.control.Control({
        element: editButton
	});
	mapObj.addControl(editControl);
}
tmpl.Draw.edit = function(param){
	var mapObj = param.map;
	mapObj.removeInteraction(draw);
	mapObj.removeInteraction(drawm);
	modify1 = new ol.interaction.Modify({
        features: select.getFeatures()
    });
	mapObj.addInteraction(modify1);
	//mapObj.removeInteraction(select);
}
*/
tmpl.Draw.addSelectEdit = function setEdit(param){
	var mapObj = param.map;
	var editButton = document.createElement('button');
	editButton.title ='Edit';
	editButton.className = 'ol-map-editbtn';
	editButton.addEventListener('click', function(){tmpl.Draw.selectEdit({map:mapObj});});
	var editControl = new ol.control.Control({
        element: editButton
	});
	mapObj.addControl(editControl);
}

tmpl.Draw.selectEdit = function(param){
	var mapObj = param.map;
	mapObj.removeInteraction(draw);
	mapObj.removeInteraction(drawm);
	mapObj.removeInteraction(selectE);
	selectE = new ol.interaction.Select({
        wrapX: false,
        condition: ol.events.condition.click
    });
	var style_modify = new ol.style.Style({
		fill: new ol.style.Fill({
            color: 'blue'
        }),
	    stroke: new ol.style.Stroke({
	        width: 5,
	        color: 'blue'
	    }),
        image: new ol.style.Circle({
			radius: 5,
            fill: new ol.style.Fill({
				color: 'blue'
			})
        })
	});
	selectE.on('select', function(evt){
	    var selected = evt.selected;
	    var deselected = evt.deselected;
	    if (selected.length) {
	        selected.forEach(function(feature){
	            feature.setStyle(style_modify);
	        });
	    } else {
	        deselected.forEach(function(feature){
	            feature.setStyle(null);
	        });
	    }
	});
 	mapObj.addInteraction(selectE);
	modify1 = new ol.interaction.Modify({
        features: selectE.getFeatures()
    });
	mapObj.addInteraction(modify1);
}
tmpl.Draw.selectMultiple = function(param){
	var mapObj = param.map;
	mapObj.removeInteraction(draw);
	mapObj.removeInteraction(drawm);
	mapObj.removeInteraction(selectE);
	selectE = new ol.interaction.Select({
        wrapX: false,
        condition: ol.events.condition.doubleClick
    });
	
	var style_modify = new ol.style.Style({
		fill: new ol.style.Fill({
            color: 'blue'
        }),
	    stroke: new ol.style.Stroke({
	        width: 5,
	        color: 'blue'
	    }),
        image: new ol.style.Circle({
			radius: 5,
            fill: new ol.style.Fill({
				color: 'blue'
			})
        })
	});
	selectE.on('select', function(evt){
	    var selected = evt.selected;
	    var deselected = evt.deselected;
	    
	    if (selected.length) {
			console.log("length >>>",selected.length);
	        selected.forEach(function(feature){
				console.log("feature >>",feature);
				console.log("featureProp >>",feature.getProperties().features);
	            feature.setStyle(style_modify);
	        });
	    } else {
	        deselected.forEach(function(feature){
	            feature.setStyle(null);
	        });
	    }
	});
 	mapObj.addInteraction(selectE);
	
}

tmpl.Feature.byId = function(param){
	var map = param.map;
	var layrName = param.layer;
	var id = param.id;
	var callbackFunc = param.callbackFunc;
	var existing;
	var Layers = map.getLayers();
	var length = Layers.getLength();
	var fea;
	console.log("layrName,id >>>",layrName,id);
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			console.log("existingLayer.get('title') >>>",existingLayer.get('title'));
			if(existingLayer.get('title') === layrName){
				existing = existingLayer;
				test1 = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					var len = feature.getProperties().features.length;
					for(var j=0;j<len;j++){
						console.log("lfeature.getProperties().features[j].getId() >>>",feature.getProperties().features[j].getId());
					
						if(feature.getProperties().features[j].getId() == id){
							fea = feature.getProperties().features[j];
							console.log("fea  ????",fea);
							callbackFunc(ol.proj.transform(fea.getGeometry().getCoordinates(),'EPSG:3857','EPSG:4326'),fea.getProperties());
							break;
						}
					}

				});
				
			}
		}
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			
			//console.log("second11 >>",tmpl_setMap_layer_global[i].title,tmpl_setMap_layer_global[i].visibility);
			if(tmpl_setMap_layer_global[i].title == layrName){
				var layer = tmpl_setMap_layer_global[i].layer;
				//console.log(layer.getSource().getFeatures()[0].getId());
				var fea = layer.getSource().getFeatureById(id);
				callbackFunc(ol.proj.transform(fea.getGeometry().getCoordinates(),'EPSG:3857','EPSG:4326'),fea.getProperties());
			}
			//console.log("second >>",tmpl_setMap_layer_global[i].title,tmpl_setMap_layer_global[i].visibility);
		}
	}
}

tmpl.Feature.updatebyId = function(param){
	var map = param.map;
	var layrName = param.layer;
	var id = param.id;
	var properties = param.properties;
	var callbackFunc = param.callbackFunc;
	var existing;
	var Layers = map.getLayers();
	var length = Layers.getLength();
	var fea;
	console.log("layrName,id >>>",layrName,id);
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layrName){
				existing = existingLayer;
				test1 = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					var len = feature.getProperties().features.length;
					for(var j=0;j<len;j++){
						if(feature.getProperties().features[j].getId() == id){
							fea = feature.getProperties().features[j];
							console.log("before",fea);
							fea.setProperties(properties);
							console.log("after",fea);
							break;
						}
					}

				});
				
			}
		}
	}
}

tmpl.Feature.clusterUpdatePropertiesLatLon = function(param){
	var map = param.map;
	var layrName = param.layer;
	var id = param.id;
	var properties = param.properties;
	var existing;
	var Layers = map.getLayers();
	var length = Layers.getLength();
	var point = param.point;
	var fea;
	console.log("layrName,id >>>",layrName,id);
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layrName){
				existing = existingLayer;
				test1 = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					var len = feature.getProperties().features.length;
					for(var j=0;j<len;j++){
						if(feature.getProperties().features[j].getId() == id){
							fea = feature.getProperties().features[j];
							fea.setProperties(properties);
							fea.getGeometry().setCoordinates(ol.proj.transform([parseFloat(point[0]),parseFloat(point[1])],'EPSG:4326','EPSG:3857'));
							break;
						}
					}

				});
				
			}
		}
	}
}

tmpl.Feature.changeTypeVisibility = function(param){
	var map = param.map;
	var layrName = param.layer;
	var type = param.type;
	var visible = param.visible;
	var existing;
	var Layers = map.getLayers();
	var length = Layers.getLength();
	var fea;
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layrName){
				existing = existingLayer;
				//test1 = existingLayer;
				if(visible == true){
					for(var k=0;k<allClusterTypeData[type].length;k++){
						var f = allClusterTypeData[type][k];
						if(allClusterType[f.getId()] == 0){
							existingLayer.getSource().getSource().addFeature(f);
							allClusterType[f.getId()] = 1;
						}
					}	
				}else{
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					if(feature.getProperties().features != undefined)
					var len = feature.getProperties().features.length;
					for(var j=0;j<len;j++){
						if(feature.getProperties().features[j].get('category_id') == type){
							fea = feature.getProperties().features[j];
							//console.log(allClusterType[fea.getId()]);
							if(visible == false){
								if(allClusterType[fea.getId()] == 1){
									existingLayer.getSource().getSource().removeFeature(fea);
									allClusterType[fea.getId()] = 0;
								}
							}
							// if(fea.get('img_url') != '')
								// fea.set('ff',fea.get('img_url'));
							// if(visible == false){
								// fea.set('img_url','');
							// }else{
								// fea.set('img_url',fea.get('ff'));
							// }
							
							//console.log("beforebeforebefore",allClusterTypeData,type);
							
							//console.log("afterafterafter",allClusterTypeData,type);
						}
					}
				});

			}
			
				break;
			}
		}
	}
}

tmpl.Feature.getLabel = function(param){
	var mapObj = param.map;
	var layerName = param.layer;
	var id = param.id;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var labelName;
	var existing;
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layerName){
				existing = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					if(feature.get('id') == id){
						labelName = feature.getProperties()['label'];
					}
				});
			}
		}
	}
	
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == layerName){
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (feature) {
					if(feature.get('id') == id){
						labelName = feature.getProperties()['label'];
					}
				});
			}
			
		}
		
	}
	
	return labelName;
}






var resultGetEditDetails = {};

tmpl.Feature.saveSpatialEdit = function(param){
	var mapObj = param.map;
	mapObj.removeInteraction(modify1);
	tmpl.Feature.spatialEditClose();
	return resultGetEditDetails.geometry;
}
tmpl.Feature.cancelSpatialEdit = function(param){
	var mapObj = param.map;
	var feature = resultGetEditDetails.feature;
	if(feature != undefined)
		feature.getGeometry().setCoordinates(resultGetEditDetails.coordinates);
	//console.log(feature.getGeometry().getCoordinates());
	mapObj.removeInteraction(modify1);
	tmpl.Feature.spatialEditClose();
}

var feature_spatial_edit_id;
var feature_spatial_edit_layer;
var feature_spatial_edit_layer_callback;
tmpl.Feature.spatialEditClose = function(){
	feature_spatial_edit_id = '';
	feature_spatial_edit_layer = '';
}
tmpl.Feature.spatialEdit = function(param){
	var mapObj = param.map;
	var callbackFunc = param.callbackFunc;
	feature_spatial_edit_layer_callback = param.getDetailsCallbackFunc;
	var zoom = param.zoom;

	var propertyId = param.id;
	var lyrName = param.layerName;
	feature_spatial_edit_id = propertyId;
	feature_spatial_edit_layer = lyrName;
	var ft,latlon,wktGeom,coord,value;
	var previousFeature;
	var restrict_layer;
	var zoomExtent,zoomCoord;

	var format = new ol.format.WKT();
	mapObj.removeInteraction(draw);
	mapObj.removeInteraction(drawm);
	mapObj.removeInteraction(selectE);
	var selectfeatureIdEdit = new ol.interaction.Select({wrapX: false,condition: ol.events.condition.click});
 	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var existing;
	for(i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') == lyrName){
				existing = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (fea) {
					if(fea.getProperties()['id']==propertyId){
						value = fea.getGeometry().getType();
						previousFeature = fea;
						ft=fea;
						if(value == 'Polygon'){
							previousFeature.setStyle(new ol.style.Style({
	                      		fill: new ol.style.Fill({
		                            color: 'green'
		                        }),
					            stroke: new ol.style.Stroke({
						            color: 'green',
						            width: 2
						          })
						        })
					          );
						}
						restrict_layer = existingLayer;
					//	existingLayer.getSource().clear();
						existingLayer.getSource().removeFeature(previousFeature);
						existingLayer.getSource().addFeature(previousFeature);

						
					}
				});
			}
		}
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == lyrName){
				var layerExits = tmpl_setMap_layer_global[i].layer;
				layerExits.getSource().getFeatures().forEach(function (fea) {
					if(fea.getProperties()['id']==propertyId){
						value = fea.getGeometry().getType();
						previousFeature = fea;
						ft=fea;
						if(value == 'Polygon'){
							previousFeature.setStyle(new ol.style.Style({
	                      		fill: new ol.style.Fill({
		                            color: 'green'
		                        }),
					            stroke: new ol.style.Stroke({
						            color: 'green',
						            width: 2
						          })
						        })
					          );
						}
						restrict_layer = layerExits;
						layerExits.getSource().removeFeature(previousFeature);
						layerExits.getSource().addFeature(previousFeature);
					}
				});
			}
		}
		
	}
	if(zoom == true)
	{
		
		if(value == 'Point'){
			zoomExtent =ft.getGeometry().getCoordinates();
			if(appConfigInfo.mapData == "google"){
				zoomCoord = ol.proj.transformExtent(zoomExtent, 'EPSG:3857', 'EPSG:4326');
			}else{
				zoomCoord = zoomExtent;
			}
			//console.log(zoomCoord);
			tmpl.Zoom.toXY({
		      map : mapObj,
		      latitude : zoomCoord[1],
		      longitude : zoomCoord[0]
		    });
		}else{
			zoomExtent =ft.getGeometry().getExtent();
			if(appConfigInfo.mapData == "google"){
				zoomCoord = ol.proj.transformExtent(zoomExtent, 'EPSG:3857', 'EPSG:4326');
			}else{
				zoomCoord = zoomExtent;
			}
			tmpl.Zoom.toExtent({
				map : mapObj,
				extent : zoomCoord
			});
		}
	}
	
    selectfeatureIdEdit.getFeatures().a = [];
	selectfeatureIdEdit.getFeatures().a.push(ft);
	mapObj.removeInteraction(modify1);
	modify1 = new ol.interaction.Modify({
        features: selectfeatureIdEdit.getFeatures()
    });

    //latlon = ft.getGeometry().getCoordinates();
    resultGetEditDetails.coordinates = ft.getGeometry().getCoordinates();
    modify1.on('modifyend',function(){
    	if(value==='Point' ){
			lonlat =ft.getGeometry().getCoordinates();
	    }
	    else if(value==='LineString'){
			lonlat =ft.getGeometry().getFirstCoordinate();
	    }
	    else if(value==='Polygon' || value==='Circle')
	    {
			lonlat =ft.getGeometry().getInteriorPoint().getCoordinates();
	    }
    	if(appConfigInfo.mapData == "google"){
    		wktGeom= format.writeGeometry(ft.getGeometry().clone().transform('EPSG:3857','EPSG:4326'));
    		coord = ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326');
    		//console.log(wktGeom);
    		//console.log(ol.proj.transform([latlon[0],latlon[1]], 'EPSG:3857', 'EPSG:4326'));
    	}else{
    		wktGeom= format.writeGeometry(ft.getGeometry());
    		coord =lonlat;//ft.getGeometry().getCoordinates();
    		//console.log(wktGeom);
    		//console.log([latlon[0],latlon[1]]);
    	}

		resultGetEditDetails.geometry = {geometry : wktGeom, coordinates : coord, value : value};
		resultGetEditDetails.feature = ft;
		
    	callbackFunc(resultGetEditDetails.geometry);
    })
	mapObj.addInteraction(modify1);
}
	
tmpl.Feature.cancelDragDropDetails = function(){};
/*
tmpl.Feature.dragDropDetails = function(param){
	var mapObj = param.map;
	var callbackFunc = param.callbackFunc;
	var img_url = param.img_url;
	var slyrName = param.sourceLayer;
	var dlyrName = param.destinationLayer;
	var ft,latlon,wktGeom,coord,value;
	var previousFeature;
	var restrict_layer;
	var zoomExtent,zoomCoord;
	var format = new ol.format.WKT();
	
	var layerS,featureTemp;
	for(var i=0;i<tmpl_setMap_layer_global.length;i++){
						if(tmpl_setMap_layer_global[i].title == slyrName){
							layerS = tmpl_setMap_layer_global[i].layer;

						}
					}
	mapObj.removeInteraction(draw);
	mapObj.removeInteraction(drawm);
	mapObj.removeInteraction(selectE);
	var selectfeatureIdEdit = new ol.interaction.Select({wrapX: false,condition: ol.events.condition.click});
 	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var existing;
				var dragedFeature;
			 window.app = {};
  var app = window.app;
var format = new ol.format.WKT();
  app.Drag = function() {
    ol.interaction.Pointer.call(this, {
      handleDownEvent: app.Drag.prototype.handleDownEvent,
      handleDragEvent: app.Drag.prototype.handleDragEvent,
      handleMoveEvent: app.Drag.prototype.handleMoveEvent,
      handleUpEvent: app.Drag.prototype.handleUpEvent
    });
    this.coordinate_ = null;
    this.cursor_ = 'pointer';
    this.feature_ = null;
    this.previousCursor_ = undefined;
  };
  ol.inherits(app.Drag, ol.interaction.Pointer);

  app.Drag.prototype.handleDownEvent = function(evt) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {
			  //console.log(layer,feature.get('layer_name'));
			if(layer == null){
				if(feature.get('layer_name') == slyrName){
					feature.set('coord',feature.getGeometry().getCoordinates());
								var coordS = feature.getGeometry().getCoordinates();
								var pointdata_s = new ol.geom.Point(coordS);
								featureTemp = new ol.Feature({
									geometry: pointdata_s
								});
								featureTemp.setStyle(new ol.style.Style({
                          image: new ol.style.Icon(({
                           anchor: [0.5, 1],
                            src: feature.getStyle().getImage().getSrc()
                          })),
						  text:new ol.style.Text({
				font: 'Bold' + ' ' + '12px' + ' ' + 'Verdana',
                textAlign:'center',
                text : feature.getStyle().getText().getText(),
                fill: new ol.style.Fill({
					color: feature.getStyle().getText().getFill().getColor(),
					width:20
                }),
                stroke : new ol.style.Stroke({
                    color : feature.getStyle().getText().getStroke().getColor(),
                    width:6
                })
            })
							}));
							layerS.getSource().addFeature(featureTemp);
					return feature;
				}
			}else if(layer.get('title') == slyrName){
				//layer.getSource().addFeature(feature);
				return feature;
			}

          });
		  
      if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
      }
      return !!feature;
  };

  app.Drag.prototype.handleDragEvent = function(evt) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {    
            return feature;
          });
      var deltaX = evt.coordinate[0] - this.coordinate_[0];
      var deltaY = evt.coordinate[1] - this.coordinate_[1];
      var geometry = 
          (this.feature_.getGeometry());
      geometry.translate(deltaX, deltaY);
      this.coordinate_[0] = evt.coordinate[0];
      this.coordinate_[1] = evt.coordinate[1];
  };

  app.Drag.prototype.handleMoveEvent = function(evt) {
      if (this.cursor_) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
              return feature;
            });
        var element = evt.map.getTargetElement();
        if (feature) {
			editFeature = feature;
			point = feature.getGeometry().getCoordinates();
			var point;
			if(appConfigInfo.mapData==='google')		{
				point = ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
				}
			else
				{
			// do notng
				}
			//point = ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
          if (element.style.cursor != this.cursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.cursor_;
          }
        } else if (this.previousCursor_ !== undefined) {
          element.style.cursor = this.previousCursor_;
          this.previousCursor_ = undefined;
        }
      }
  };

  app.Drag.prototype.handleUpEvent = function(evt) {
	   var map = evt.map;
      var value=this.feature_.getGeometry().getType();
      if(value==='Point')
      {
        lonlat =this.feature_.getGeometry();
      }
      else if(value==='LineString')
      {
        lonlat =this.feature_.getGeometry();
      }
      else if(value==='Polygon')
      {
        lonlat =this.feature_.getGeometry();
      }
	
      if(appConfigInfo.mapData==='google')
      {         
		coordinate = ol.proj.transform(lonlat.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
        wktGeom= format.writeGeometry(lonlat.clone().transform('EPSG:3857', 'EPSG:4326'));
      }
      else
      {
    	  coordinate = lonlat.getCoordinates();
          wktGeom= format.writeGeometry(lonlat);
      //  wktGeom= format.writeGeometry(this.feature_.getGeometry());
      }

		var result = {
			new_coordinates : coordinate
		};
		var dragFeature = this.feature_;
		
		if(dragFeature.getGeometry().getType() == 'Point' ){
			layerS.getSource().removeFeature(featureTemp);
			lonlat = dragFeature.getGeometry().getCoordinates();
			dragFeature.getGeometry().setCoordinates(dragFeature.get('coord'));
			
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				var lyr = tmpl_setMap_layer_global[i].title;
				if(dlyrName.indexOf(lyr) != -1){
					restrict_layer = tmpl_setMap_layer_global[i].layer;
					//lonlat =tempFea.getGeometry().getCoordinates();
					var closestFeature = restrict_layer.getSource().getClosestFeatureToCoordinate(lonlat);
					
					var resultLocation = lonlat;
					
					var c1 = ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326');
					
					
					
					var c2 = ol.proj.transform(closestFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
					var line = new ol.geom.LineString([c1, c2]);
					var len = line.getLength()*100;
					console.log(len);
					var setZoomWiseLength = 0;
					if(map.getView().getZoom() <= 12){
						setZoomWiseLength = 0.8;
					}else if(map.getView().getZoom() == 13){
						setZoomWiseLength = 0.4;
					}else if(map.getView().getZoom() == 14){
						setZoomWiseLength = 0.1;
					}else if(map.getView().getZoom() == 15){
						setZoomWiseLength = 0.09;
					}else if(map.getView().getZoom() == 16){
						setZoomWiseLength = 0.05;
					}else if(map.getView().getZoom() == 17){
						setZoomWiseLength = 0.03;
					}else if(map.getView().getZoom() == 18){
						setZoomWiseLength = 0.02;
					}else if(map.getView().getZoom() == 19){
						setZoomWiseLength = 0.01;
					}else if(map.getView().getZoom() == 20){
						setZoomWiseLength = 0.01;
					}else if(map.getView().getZoom() == 21){
						setZoomWiseLength = 0.01;
					}
					if(appConfigInfo.mapData==='google')
					{
						if(len < setZoomWiseLength){
						//alert("already Exist");
						var res = {
							source : dragFeature.getProperties(),
							destination : closestFeature.getProperties(),
							location: c1
						};
						callbackFunc(res);
						}else{
						
						var res = {
							source : dragFeature.getProperties(),
							destination : '',
							location: c1
						};
						callbackFunc(res);
						}
					}else{
						if(len < setZoomWiseLength){
						//alert("already Exist");
						var res = {
							source : dragFeature.getProperties(),
							destination : closestFeature.getProperties(),
							location: resultLocation
						};
						callbackFunc(res);
						}else{
						
						var res = {
							source : dragFeature.getProperties(),
							destination : '',
							location: resultLocation
						};
						callbackFunc(res);
						}
					}
					
				}
			}
		
	    }
		
      //mycallback(result);
      this.coordinate_ = null;
      this.feature_ = null;
      return false;
  };
  intr=new app.Drag();
  mapObj.addInteraction(intr);
	tmpl.Feature.cancelDragDropDetails = function(param){
		var map = param.map;
		 map.removeInteraction(intr);
	}
}*/



tmpl.Feature.dragDropDetails = function(param){
	var mapObj = param.map;
	var callbackFunc = param.callbackFunc;
	var img_url = param.img_url;
	var slyrName = param.sourceLayer;
	var dlyrName = param.destinationLayer;
	var ft,latlon,wktGeom,coord,value;
	var previousFeature;
	var restrict_layer;
	var zoomExtent,zoomCoord;
	var gbl_cFeature;
	var format = new ol.format.WKT();
	console.log("tmpl_setMap_layer_global >>",tmpl_setMap_layer_global);
	var layerS,featureTemp;
	var isCluster = false;
	for(var i=0;i<tmpl_setMap_layer_global.length;i++){
						if(tmpl_setMap_layer_global[i].title == slyrName){
							layerS = tmpl_setMap_layer_global[i].layer;

						}
					}
	console.log("layerS >>>",layerS);
	mapObj.removeInteraction(draw);
	mapObj.removeInteraction(drawm);
	mapObj.removeInteraction(selectE);
	var selectfeatureIdEdit = new ol.interaction.Select({wrapX: false,condition: ol.events.condition.click});
 	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var existing;
				var dragedFeature;
			 window.app = {};
  var app = window.app;
var format = new ol.format.WKT();
if(layerS == undefined){
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === slyrName){
				layerS = existingLayer;
			}
		}
	}
}
console.log("layerS pppppppppppp >>>",layerS);
  app.Drag = function() {
    ol.interaction.Pointer.call(this, {
      handleDownEvent: app.Drag.prototype.handleDownEvent,
      handleDragEvent: app.Drag.prototype.handleDragEvent,
      handleMoveEvent: app.Drag.prototype.handleMoveEvent,
      handleUpEvent: app.Drag.prototype.handleUpEvent
    });
    this.coordinate_ = null;
    this.cursor_ = 'pointer';
    this.feature_ = null;
    this.previousCursor_ = undefined;
  };
  ol.inherits(app.Drag, ol.interaction.Pointer);

  app.Drag.prototype.handleDownEvent = function(evt) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {
			  console.log("test");
			  console.log(layer);
			  console.log(layer.get('title'));
			  console.log(feature.getProperties().features[0].get('layer_name'));
			  if(feature.getProperties().features == undefined){
				if(layer == null){
					if(feature.get('layer_name') == slyrName){
						feature.set('coord',feature.getGeometry().getCoordinates());
									var coordS = feature.getGeometry().getCoordinates();
									var pointdata_s = new ol.geom.Point(coordS);
									featureTemp = new ol.Feature({
										geometry: pointdata_s
									});
									featureTemp.setStyle(new ol.style.Style({
							  image: new ol.style.Icon(({
							   anchor: [0.5, 1],
								src: feature.getStyle().getImage().getSrc()
							  })),
							  text:new ol.style.Text({
					font: 'Bold' + ' ' + '12px' + ' ' + 'Verdana',
					textAlign:'center',
					text : feature.getStyle().getText().getText(),
					fill: new ol.style.Fill({
						color: feature.getStyle().getText().getFill().getColor(),
						width:20
					}),
					stroke : new ol.style.Stroke({
						color : feature.getStyle().getText().getStroke().getColor(),
						width:6
					})
				})
								}));
								layerS.getSource().addFeature(featureTemp);
						return feature;
					}
				}else if(layer.get('title') == slyrName){
					//layer.getSource().addFeature(feature);
					return feature;
				}
			  }else {
				  isCluster = true;
				  //console.log("inside else layer >>>",layer.get('title'),slyrName);
				  var cFeature = feature.getProperties().features[0];
				  gbl_cFeature = cFeature;
				  //if(layer == null){
					if(cFeature.get('layer_name') == slyrName){
						cFeature.set('coord',cFeature.getGeometry().getCoordinates());
									/*var coordS = cFeature.getGeometry().getCoordinates();
									var pointdata_s = new ol.geom.Point(coordS);
									featureTemp = new ol.Feature({
										geometry: pointdata_s
									});
									featureTemp.setStyle(new ol.style.Style({
							  image: new ol.style.Icon(({
							   anchor: [0.5, 1],
								src: cFeature.get('img_url')
							  }))
								}));
								console.log("featureTemp pppppp>>>",featureTemp);
								layerS.getSource().getSource().addFeature(featureTemp);*/
						return cFeature;
					}
				/*}else if(layer.get('title') == slyrName){
					//layer.getSource().addFeature(feature);
					return cFeature;
				}*/
			  }

          });
		  
      if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
      }
      return !!feature;
  };

  app.Drag.prototype.handleDragEvent = function(evt) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) { 
			if(feature.getProperties().features == undefined){
				return feature;
			}
			else{
				var cFeature = feature.getProperties().features[0];
				return cFeature;
			}
          });
      var deltaX = evt.coordinate[0] - this.coordinate_[0];
      var deltaY = evt.coordinate[1] - this.coordinate_[1];
      var geometry = 
          (this.feature_.getGeometry());
      geometry.translate(deltaX, deltaY);
      this.coordinate_[0] = evt.coordinate[0];
      this.coordinate_[1] = evt.coordinate[1];
  };

  app.Drag.prototype.handleMoveEvent = function(evt) {
      if (this.cursor_) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
				if(feature.getProperties().features == undefined){
					 return feature;
				}else{
					var cFeature = feature.getProperties().features[0];
				return cFeature;
				}
              
            });
        var element = evt.map.getTargetElement();
        if (feature) {
			editFeature = feature;
			point = feature.getGeometry().getCoordinates();
			var point;
			if(appConfigInfo.mapData==='google')		{
				point = ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
				}
			else
				{
			// do notng
				}
			//point = ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
          if (element.style.cursor != this.cursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.cursor_;
          }
        } else if (this.previousCursor_ !== undefined) {
          element.style.cursor = this.previousCursor_;
          this.previousCursor_ = undefined;
        }
      }
  };

  app.Drag.prototype.handleUpEvent = function(evt) {
	   var map = evt.map;
      var value=this.feature_.getGeometry().getType();
	  //console.log("this >>>",this.feature_.getProperties())
	  /*if(this.feature_.getProperties().features == undefined){
		  
	  }*/
      if(value==='Point')
      {
        lonlat =this.feature_.getGeometry();
      }
      else if(value==='LineString')
      {
        lonlat =this.feature_.getGeometry();
      }
      else if(value==='Polygon')
      {
        lonlat =this.feature_.getGeometry();
      }
	
      if(appConfigInfo.mapData==='google')
      {         
		coordinate = ol.proj.transform(lonlat.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
        wktGeom= format.writeGeometry(lonlat.clone().transform('EPSG:3857', 'EPSG:4326'));
      }
      else
      {
    	  coordinate = lonlat.getCoordinates();
          wktGeom= format.writeGeometry(lonlat);
      //  wktGeom= format.writeGeometry(this.feature_.getGeometry());
      }

		var result = {
			new_coordinates : coordinate
		};
		var dragFeature = this.feature_;
		if(isCluster == true){
		  	if(dragFeature.getGeometry().getType() == 'Point' ){
			//layerS.getSource().removeFeature(featureTemp);
				lonlat = dragFeature.getGeometry().getCoordinates();
			//dragFeature.getGeometry().setCoordinates(dragFeature.get('coord'));
			var resArray = [];
				for(var i=0;i<Layers.getLength();i++){
					var existingLayer=Layers.item(i);
				
					var lyr = existingLayer.get('title');
					if(dlyrName.indexOf(lyr) != -1){
						restrict_layer = existingLayer;
					//lonlat =tempFea.getGeometry().getCoordinates();
						var closestFeature = restrict_layer.getSource().getClosestFeatureToCoordinate(lonlat);
					
						var resultLocation = lonlat;
					
						var c1 = ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326');
					
						if(appConfigInfo.mapData==='google')
						{
					
							var res = {
								source : dragFeature.getProperties(),
								destination : closestFeature.getProperties(),
								location: c1
							};
							//callbackFunc(res);
							resArray.push(res);
						
						}else{
							
							var res = {
								source : dragFeature.getProperties(),
								destination : closestFeature.getProperties(),
								location: resultLocation
							};
							//callbackFunc(res);
							resArray.push(res);
						
						}
						
					}
					
				}
				callbackFunc(resArray);
			}
		}else {
			if(dragFeature.getGeometry().getType() == 'Point' ){
			//layerS.getSource().removeFeature(featureTemp);
			lonlat = dragFeature.getGeometry().getCoordinates();
			//dragFeature.getGeometry().setCoordinates(dragFeature.get('coord'));
			
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				var lyr = tmpl_setMap_layer_global[i].title;
				if(dlyrName.indexOf(lyr) != -1){
					restrict_layer = tmpl_setMap_layer_global[i].layer;
					//lonlat =tempFea.getGeometry().getCoordinates();
					var closestFeature = restrict_layer.getSource().getClosestFeatureToCoordinate(lonlat);
					
					var resultLocation = lonlat;
					
					var c1 = ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326');
					
					
					
					var c2 = ol.proj.transform(closestFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
					var line = new ol.geom.LineString([c1, c2]);
					var len = line.getLength()*100;
					console.log(len);
					var setZoomWiseLength = 0;
					if(map.getView().getZoom() <= 12){
						setZoomWiseLength = 0.8;
					}else if(map.getView().getZoom() == 13){
						setZoomWiseLength = 0.4;
					}else if(map.getView().getZoom() == 14){
						setZoomWiseLength = 0.1;
					}else if(map.getView().getZoom() == 15){
						setZoomWiseLength = 0.09;
					}else if(map.getView().getZoom() == 16){
						setZoomWiseLength = 0.05;
					}else if(map.getView().getZoom() == 17){
						setZoomWiseLength = 0.03;
					}else if(map.getView().getZoom() == 18){
						setZoomWiseLength = 0.02;
					}else if(map.getView().getZoom() == 19){
						setZoomWiseLength = 0.01;
					}else if(map.getView().getZoom() == 20){
						setZoomWiseLength = 0.01;
					}else if(map.getView().getZoom() == 21){
						setZoomWiseLength = 0.01;
					}
					if(appConfigInfo.mapData==='google')
					{
						if(len < setZoomWiseLength){
						//alert("already Exist");
						var res = {
							source : dragFeature.getProperties(),
							destination : closestFeature.getProperties(),
							location: c1
						};
						callbackFunc(res);
						}else{
						
						var res = {
							source : dragFeature.getProperties(),
							destination : '',
							location: c1
						};
						callbackFunc(res);
						}
					}else{
						if(len < setZoomWiseLength){
						//alert("already Exist");
						var res = {
							source : dragFeature.getProperties(),
							destination : closestFeature.getProperties(),
							location: resultLocation
						};
						callbackFunc(res);
						}else{
						
						var res = {
							source : dragFeature.getProperties(),
							destination : '',
							location: resultLocation
						};
						callbackFunc(res);
						}
					}
					
				}
			}
		
	    }
  }
      //mycallback(result);
      this.coordinate_ = null;
      this.feature_ = null;
      return false;
  };
  intr=new app.Drag();
  mapObj.addInteraction(intr);
	tmpl.Feature.cancelDragDropDetails = function(param){
		var map = param.map;
		 map.removeInteraction(intr);
		 if(gbl_cFeature != undefined)
			gbl_cFeature.getGeometry().setCoordinates(gbl_cFeature.get('coord'));
		 
	}
}
	
//------------------------------------ End of Drawing Tools ---------------------------------------------//



//---------------------------------- Beginning of Custom Overlays ---------------------------------------//

// **** creating a custom Overlay **** //

/*tmpl.Overlay.create = function(param){
	var mapObj = param.map;
	var jsonobj = param.features;
	var layerName = param.layer;
	var getdata = jsonobj;
	if(getdata.length==0){
		return false;
	}
	var featureDataAry = [];
    for (var i = 0, length = getdata.length; i < length; i++) {
		var geometry;
		if(appConfigInfo.mapData==='google'){
			geometry = new ol.geom.Point(ol.proj.transform([parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)], 'EPSG:4326', 'EPSG:3857'));
		}
		else{
			var coordinate = [parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)];
			geometry = new ol.geom.Point(coordinate);
		}
		var featureval = new ol.Feature({
            "id"          : getdata[i].id,
            "label"       : getdata[i].label,
            "labelcolor"  : getdata[i].label_color,
            "icon"        : getdata[i].img_url,
            "lat"         : getdata[i].lat,
            "lon"         : getdata[i].lon,
            geometry: geometry
        });
		featureval.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: "yellow" 
            }),
            image: new ol.style.Icon(({
                anchor: [0.5, 1],
				src: getdata[i].img_url
            })),
            text:new ol.style.Text({
                font: 'Bold' + ' ' + '12px' + ' ' + 'Verdana',
                textAlign:'center',
                text : getdata[i].label,
                fill: new ol.style.Fill({
                    color: getdata[i].label_color,
                    width:20
                }),
				stroke : new ol.style.Stroke({
					color : getdata[i].label_bgcolor,     //,"label_bgcolor":"blue"
					width:8
                })
			})
		}));
		featureDataAry.push(featureval);
	}
	var source=  new ol.source.Vector({
        features: featureDataAry
    });
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var isLayerPresent = false;
	for(var i=0;i<length;i++){
		var layerTemp = Layers.item(i);
		if(layerTemp.get('title') === layerName){
			isLayerPresent = true;
			layerTemp.getSource().addFeatures(featureDataAry);
		}
	}
	if (!isLayerPresent) {
		var overlay = new ol.layer.Vector({
            title: layerName,
            visible: true,
            source: source
        });
		mapObj.addLayer(overlay);
		mapObj.addControl(new ol.control.LayerSwitcher());
	}
	return true;
}*/

// **** creating a custom Overlay and adding that layer to the layer switcher **** //
function getFeatureLabel(){
    var feature_mouseOver = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
    if(layer){
		if(layer.get('trip') == "TripAnimationLayer"){
							 return feature;
		}
	}
	});
    ta_tooltip.style.display = feature_mouseOver ? '' : 'none';
    if (feature_mouseOver) {
        overlay_mouseOver_trip.setPosition(evt.coordinate);
		ta_tooltip.innerHTML = feature_mouseOver.getProperties().location +"," + "Speed:" + feature_mouseOver.getProperties().speed +"," + feature_mouseOver.getProperties().date + "," + feature_mouseOver.getProperties().time;
    }
};


tmpl.Overlay.create = function(param){
	var mapObj = param.map;
	var jsonobj = param.features;
	var layerName = param.layer;
	//console.log(layerName,"From API");
	var getHoverLabel = param.getHoverLabel;
	var layerSwitcher = param.layerSwitcher;
	var trackLayer = param.trackLayer;
	//console.log(trackLayer);
	var image_scale = param.icon_scale;
	var getdata = jsonobj;
	if(image_scale == undefined)
			image_scale = 1;
	if(getdata.length==0){
		return false;
	}
	if(trackLayer == false || trackLayer == undefined){
		var featureDataAry = [];
	
    for (var i = 0, length = getdata.length; i < length; i++){
		var geometry;
		var anagle; 
		if(getdata[i].ot_track_angle != undefined)
			anagle = getdata[i].ot_track_angle;
		else
			anagle = 0;
		
		
		var iconStyle = new ol.style.Icon( ({
                src: getdata[i].img_url,
				anchor: [0.5, 1],
				scale : image_scale,
				rotation: anagle
            }));
		// var iconStyle = new ol.style.Icon( ({
                // src: getdata[i].img_url,
				// anchor: [0.5, 1],
				// scale : image_scale
            // }));
		if(appConfigInfo.mapData==='google'){
			geometry = new ol.geom.Point(ol.proj.transform([parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)], 'EPSG:4326', 'EPSG:3857'));
		}
		else{
			var coordinate = [parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)];
			geometry = new ol.geom.Point(coordinate);
		}
		var featureval = new ol.Feature({
            geometry     : geometry
        });
		featureval.setId(getdata[i].id);
		featureval.setProperties(getdata[i]);
		if(getHoverLabel == true){
			
		featureval.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            image: iconStyle
		}));
	
		}else{
		featureval.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            image: iconStyle,
            text:new ol.style.Text({
				font: 'Bold' + ' ' + '12px' + ' ' + 'Verdana',
                textAlign:'center',
                text : getdata[i].label,
                fill: new ol.style.Fill({
					color: getdata[i].label_color,
					width:20
                }),
                stroke : new ol.style.Stroke({
                    color : getdata[i].label_bgcolor,
                    width:6
                })
            })
		}));
		}
		featureval.set('layer_name',layerName);
		featureDataAry.push(featureval);
	}
	if(getHoverLabel == true){
		
			var ta_tooltip = document.createElement('tooltip');
    ta_tooltip.id = 'trip-tooltip';
    ta_tooltip.className = 'ol-trip-tooltip';
    var overlay_mouseOver_label = new ol.Overlay({
        element: ta_tooltip,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
    mapObj.addOverlay(overlay_mouseOver_label);
		mapObj.on('pointermove', function(evt){
			
			var feature_mouseOver = mapObj.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
			//if(layer){
				if(feature.get('layer_name') == layerName){
					return feature;
				}
			//}
			});
			ta_tooltip.style.display = feature_mouseOver ? '' : 'none';
			if(feature_mouseOver) {
				overlay_mouseOver_label.setPosition(evt.coordinate);
				ta_tooltip.innerHTML = feature_mouseOver.getProperties().label;
			}
		});
	}
	var source=  new ol.source.Vector({
        features: featureDataAry
    });
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var OverlayisLayerPresent = false;
	for(var i=0;i<length;i++){
		var layerTemp = Layers.item(i);
		if(layerTemp.get('title') === layerName){
			OverlayisLayerPresent = true;
			layerTemp.getSource().addFeatures(featureDataAry);
		}
	}
	
	for(var j=0;j<tmpl_setMap_layer_global.length;j++){
		if(tmpl_setMap_layer_global[j].title == layerName){
			OverlayisLayerPresent = true;
			tmpl_setMap_layer_global[j].layer.getSource().addFeatures(featureDataAry);
		}
	}
	if (OverlayisLayerPresent == false) {
		
		var overlay = new ol.layer.Vector({
            title: layerName,
            visible: true,
            source: source
        });
		tmpl_setMap_layer_global.push({
			layer : overlay,
			title :  layerName,
			visibility : true,
			map : mapObj
		});
		overlay.setMap(mapObj);
		//mapObj.addLayer(overlay);
		//if(layerSwitcher)
			//mapObj.addControl(new ol.control.LayerSwitcher());
		OverlayisLayerPresent = true;
	}
	}else if(trackLayer == true){
		//console.log("Track Layer");
		var featureDataAry = [];
	
    for (var i = 0, length = getdata.length; i < length; i++){
		var geometry;
		//console.log(global_fleet_layer_id.indexOf('fleet_'+layerName+'_'+getdata[i].id));
		if(global_fleet_layer_id.indexOf('fleet_'+layerName+'_'+getdata[i].id) == -1){
		//console.log("coming insideeeeeeeeeee");
		
		var anagle; 
		if(getdata[i].ot_track_angle != undefined)
			anagle = getdata[i].ot_track_angle;
		else
			anagle = 0;
		
		
		var iconStyle = new ol.style.Icon( ({
                src: getdata[i].img_url,
				anchor: [0, 0],
				scale : image_scale,
				rotation: anagle
            }));
		if(appConfigInfo.mapData==='google'){
			geometry = new ol.geom.Point(ol.proj.transform([parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)], 'EPSG:4326', 'EPSG:3857'));
		}
		else{
			var coordinate = [parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)];
			geometry = new ol.geom.Point(coordinate);
		}
		var featureval = new ol.Feature({
            geometry     : geometry
        });
		featureval.set('layer_name',layerName);
		featureval.setProperties(getdata[i]);
		if(getHoverLabel == true){
			
		featureval.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            image: iconStyle
		}));
	
		}else{
		featureval.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            image: iconStyle,
            text:new ol.style.Text({
				font: 'Bold' + ' ' + '12px' + ' ' + 'Verdana',
                textAlign:'center',
                text : getdata[i].label,
                fill: new ol.style.Fill({
					color: getdata[i].label_color,
					width:20
                }),
                stroke : new ol.style.Stroke({
                    color : getdata[i].label_bgcolor,
                    width:6
                })
            })
		}));
		}
		featureDataAry.push(featureval);
		
		
	// global_fleet_layer_id[i] = 'fleet_'+layerName+'_'+getdata[i].id;
	// global_fleet_layer_features[i] = featureval;
	// var v1 = new tmpl.Track.smoothMovement({map : mapObj,id:getdata[i].id,layername:layerName,feature:featureval,featureId:'fleet_'+layerName+'_'+getdata[i].id});
	// global_fleet_layer_objects[i] = v1;
	// var point = [parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)];
	// v1.sendTrackData(point);
	//console.log(getdata[i].id);
	global_fleet_layer_id.push('fleet_'+layerName+'_'+getdata[i].id);
	global_fleet_layer_features.push(featureval);
	var v1 = new tmpl.Track.smoothMovement({map : mapObj,id:getdata[i].id,layername:layerName,feature:featureval,featureId:'fleet_'+layerName+'_'+getdata[i].id});
	global_fleet_layer_objects.push(v1);
	var point = [parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)];
	v1.sendTrackData(point);
	
		}
	}
	
	//alert("Out side Number of features inserting : "+featureDataAry.length);
	if(featureDataAry.length > 0){
		//console.log("Number of features inserting : ",featureDataAry.length);
	if(getHoverLabel == true){
		
			var ta_tooltip = document.createElement('tooltip');
    ta_tooltip.id = 'trip-tooltip';
    ta_tooltip.className = 'ol-trip-tooltip';
    var overlay_mouseOver_label = new ol.Overlay({
        element: ta_tooltip,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
    mapObj.addOverlay(overlay_mouseOver_label);
		mapObj.on('pointermove', function(evt){
			
			var feature_mouseOver = mapObj.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
				if(layer == null){
					if(feature.get('layer_name') == layerName){
						return feature;
					}
				}else{
					if(layer){
						if(layer.get('title') == layerName){
							return feature;
						}
					}
				}
			
			});
			ta_tooltip.style.display = feature_mouseOver ? '' : 'none';
			if(feature_mouseOver) {
				overlay_mouseOver_label.setPosition(evt.coordinate);
				ta_tooltip.innerHTML = feature_mouseOver.getProperties().label;
			}
		});
	}
	var source=  new ol.source.Vector({
        features: featureDataAry
    });
	
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var OverlayisLayerPresent = false;
	for(var i=0;i<length;i++){
		var layerTemp = Layers.item(i);
		if(layerTemp.get('title') === layerName){
			OverlayisLayerPresent = true;
			layerTemp.getSource().addFeatures(featureDataAry);
		}
	}
	
	for(var j=0;j<tmpl_setMap_layer_global.length;j++){
		if(tmpl_setMap_layer_global[j].title == layerName){
			OverlayisLayerPresent = true;
		
			tmpl_setMap_layer_global[j].layer.getSource().addFeatures(featureDataAry);
		}
	}
	if (OverlayisLayerPresent == false) {
		var overlay = new ol.layer.Vector({
            title: layerName,
            visible: true,
            source: source
        });
		tmpl_setMap_layer_global.push({
			layer : overlay,
			title :  layerName,
			visibility : true,
			map : mapObj
		});
		globale_layer_names.push(layerName);
		 overlay.setMap(mapObj);
		//if(layerSwitcher)
			//mapObj.addControl(new ol.control.LayerSwitcher());
		OverlayisLayerPresent = true;
	}
	}
	
	}
	
	return true;
}
								

//new fleet 
var global_fleet_layer_id = [];
var global_fleet_layer_features = [];
var global_fleet_layer_objects = [];
var globale_layer_names = [];

tmpl.Track.withoutLine = function(param){
	//console.log(global_fleet_layer_objects);
	var data = param.data;
	var properties = param.properties;
	for(var i=0;i<data.length;i++){
		var fleet_overlayId = 'fleet_'+data[i].layerName+'_'+data[i].id;
		var index = global_fleet_layer_id.indexOf(fleet_overlayId);
		var fleet_overlay = global_fleet_layer_features[index];
		var fleet_overlay_object = global_fleet_layer_objects[index];
		var pos = [data[i].lon,data[i].lat];
		var properties = data[i].properties;
		if(fleet_overlay_object != undefined)
		fleet_overlay_object.sendTrackData(pos,properties);

	}
}

tmpl.Track.smoothMovement = function(param) {
	this.map = param.map;
	this.layername = param.layername;
	this.track_end_marker;
	this.track_ivlDraw;
	this.fleet_points = [];
	this.first_fleet_flag = true;
	this.vehicleId = param.id;
	this.feature = param.feature;
	this.fleet_featureId = param.featureId;	
}
	tmpl.Track.smoothMovement.prototype = {
			sendTrackData : function (pos,properties){

if(properties != undefined){
		for (var key in properties) {
  if (properties.hasOwnProperty(key)) {
	this.feature.set(key,properties[key]);
  }
}
}
			if(this.fleet_points.length > 1){
				if(this.fleet_points[this.fleet_points.length-1][0] == pos[0] && this.fleet_points[this.fleet_points.length-1][1] == pos[1]){
				}else{
					this.fleet_points.push(pos);
				}
			}else{
				this.fleet_points.push(pos);
			}
			if(this.fleet_points.length > 1){
			if(this.first_fleet_flag == true){
				this.startFleet();
				this.first_fleet_flag = false;
			}
			}
		},
		startFleet : function (){
			//if(this.fleet_points.length > 1){
				//if(this.vehicleId == 'KA02G1117')
				//console.log(this.fleet_points);
				var point = this.fleet_points[1];
				var p_point = this.fleet_points[0];
				point[0] = parseFloat(point[0]);
				point[1] = parseFloat(point[1]);
				p_point[0] = parseFloat(p_point[0]);
				p_point[1] = parseFloat(p_point[1]);
				if(appConfigInfo.mapData == "google"){
					point = ol.proj.transform(point, 'EPSG:4326', 'EPSG:3857');
					p_point = ol.proj.transform(p_point, 'EPSG:4326', 'EPSG:3857');
				}
				else{
					
				}
				
				this.drawAnimatedLine(p_point,point,50,10000);
			//}
		},
		drawAnimatedLine : function (startPt, endPt, steps, time){
	    var directionX = (endPt[0] - startPt[0]) / steps;
	    var directionY = (endPt[1] - startPt[1]) / steps;
	    var i = 0;
		var newEndPt;
		var itsparent = this;
		var angle = rotate({
			x1: startPt[0],
			y1: startPt[1],
			x2: endPt[0],
			y2: endPt[1]
		});
	    itsparent.track_ivlDraw = setInterval(function () {
			var map = itsparent.map;
	        if (i > steps) {
	            clearInterval(itsparent.track_ivlDraw);
				itsparent.fleet_points.splice(0, 1);
				if(itsparent.fleet_points.length > 1){
					itsparent.startFleet();
				}else{
					itsparent.first_fleet_flag = true;
				}
	        }
	        newEndPt = [startPt[0] + i * directionX, startPt[1] + i * directionY];
			//itsparent.panMap(newEndPt);
			//console.log(angle);
			if(isNaN(angle) == false)
			itsparent.feature.getStyle().getImage().setRotation(angle);
			itsparent.feature.getGeometry().setCoordinates(newEndPt);
	        i++;
	    }, time/50);
		
		},
		clearTrack : function(){
			 clearInterval(this.track_ivlDraw);
		}
	}

// **** This function displays the given geometry as layer with default styles **** //


tmpl.Overlay.addGeometry = function(param){
	var mapObj = param.map;
	var lyrName = param.layer;
	var property = param.properties;
	var getHoverLabel = param.getHoverLabel;
	var geometryVal = param.geometry;
	var format = new ol.format.WKT();
	var feature;
	if(appConfigInfo.mapData == 'google'){
		feature = format.readFeature(geometryVal, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857'
		});
	}
	else{
		var feature = format.readFeature(geometryVal, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:4326'
        });
	} 
	if(getHoverLabel == true){
	feature.setStyle(new ol.style.Style({
        fill: new ol.style.Fill({
			color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
			color: '#1b465a',
            width: 2
        }),
        image: new ol.style.Circle({
			radius: 7,
            fill: new ol.style.Fill({
				color: '#1b465a'
            })
        })
    }));
	}else{
	feature.setStyle(new ol.style.Style({
        fill: new ol.style.Fill({
			color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
			color: '#1b465a',
            width: 2
        }),
        image: new ol.style.Circle({
			radius: 7,
            fill: new ol.style.Fill({
				color: '#1b465a'
            })
        }),
        text:new ol.style.Text({
				font: 'Bold' + ' ' + '12px' + ' ' + 'Verdana',
                textAlign:'center',
                /*textBaseline: 'bottom',
                offsetX : parseInt(0, 10),
                offsetY : parseInt(0, 10),*/
                text : property.label,
                fill: new ol.style.Fill({
					color: property.label_color,
					width:20
                }),
                stroke : new ol.style.Stroke({
                    color : property.label_bgcolor,
                    width:6
                })
            })
    }));
	}
	feature.setProperties(property);
	feature.set('layer_name',lyrName);
	var source=  new ol.source.Vector({
		features: [feature]
	});
	
	

	if(getHoverLabel == true){
		
			var ta_tooltip = document.createElement('tooltip');
    ta_tooltip.id = 'trip-tooltip';
    ta_tooltip.className = 'ol-trip-tooltip';
    var overlay_mouseOver_label = new ol.Overlay({
        element: ta_tooltip,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
    mapObj.addOverlay(overlay_mouseOver_label);
		mapObj.on('pointermove', function(evt){
			
			var feature_mouseOver = mapObj.forEachFeatureAtPixel(evt.pixel, function(feature/*, layer*/) {
			//if(layer){
				//console.log("FT >>",feature.get('layer_name'));
				if(feature.get('layer_name') == lyrName){
					return feature;
				}
			//}
			});
			ta_tooltip.style.display = feature_mouseOver ? '' : 'none';
			if(feature_mouseOver) {
				overlay_mouseOver_label.setPosition(evt.coordinate);
				ta_tooltip.innerHTML = feature_mouseOver.getProperties().label;
			}
		});
	}
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var isLayerPresent11 = false;
	var existing;
	for(i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === lyrName){
				existing = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (fea) {
					if(fea.getProperties()['id']==property.id){
						existingLayer.getSource().removeFeature(fea);
					}
				});
				isLayerPresent11 = true;
				//existingLayer.getSource().clear();
				existingLayer.getSource().addFeature(feature);
			}
		}
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == lyrName){
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (fea) {
					if(fea.getProperties()['id']==property.id){
						tmpl_setMap_layer_global[i].layer.getSource().removeFeature(fea);
					}
				});
				isLayerPresent11 = true;
				tmpl_setMap_layer_global[i].layer.getSource().addFeature(feature);
			}
		}
		
	}
	if (isLayerPresent11 == false) {
		var newLayer = new ol.layer.Vector({
			title: lyrName,
			visible: true,
			source: source
		});
		tmpl_setMap_layer_global.push({
			layer : newLayer,
			title :  lyrName,
			visibility : true,
			map : mapObj
		});
		isLayerPresent11 == true;
		//mapObj.addLayer(newLayer);
		newLayer.setMap(mapObj);
//		mapObj.addControl(new ol.control.LayerSwitcher());
	}
	
}

// **** This function displays the given geometry as layer in user specified colors **** //
var addGoemetryFlag = false;
tmpl.Overlay.addGeometryWithColor = function(param){
	var mapObj = param.map;
	var geometryVal = param.geometry;
	//console.log(param.properties)
	var property = param.properties;
	var colorval = param.color;
	var lyrName = param.layer;
	var borderColor = param.borderColor;
	var label = param.label;
	var borderAnimate = param.borderAnimate;
	var getHoverLabel  = param.getHoverLabel;
	var format = new ol.format.WKT();
	var color;
  	if(appConfigInfo.mapData==='google'){
    	var feature = format.readFeature(geometryVal, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
		var strokeColor
		if(borderColor == undefined)
			strokeColor = colorval;
		else
			strokeColor = borderColor;
		feature.set('label',label);
		feature.set('color',strokeColor);
    	feature.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: colorval
            }),
            stroke: new ol.style.Stroke({
                color: strokeColor,
                width: 1
            }),
            image: new ol.style.Circle({
                radius: 1,
                fill: new ol.style.Fill({
                    color:colorval
                })
            })
        }));
	}
	else
	{
	    var feature = format.readFeature(geometryVal, {
	      dataProjection: 'EPSG:4326',
	      featureProjection: 'EPSG:4326'
	    });
		feature.set('label',label);
		feature.set('color',strokeColor);
	    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
	    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
	    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
	    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
	    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
	    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
	    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
	    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
	    "honeydew":"#f0fff0","hotpink":"#ff69b4",
	    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
	    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
	    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
	    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
	    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
	    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
	    "navajowhite":"#ffdead","navy":"#000080",
	    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
	    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
	    "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
	    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
	    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
	    "violet":"#ee82ee",
	    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
	    "yellow":"#ffff00","yellowgreen":"#9acd32"};

	    if (typeof colours[colorval.toLowerCase()] != 'undefined')
	        var colorfinal= colours[colorval.toLowerCase()];
	    var hexColor = colorfinal;
	    if(hexColor)
	    {
	      color = ol.color.asArray(hexColor);
	      color = color.slice();
	      color[3] = 0.5;
	    }
	    else
	    {
	      color = colorval;
	    }
		
		var strokeColor
		if(borderColor == undefined)
			strokeColor = colorval;
		else
			strokeColor = borderColor;
	    feature.setStyle(new ol.style.Style({
              fill: new ol.style.Fill({
                  color: colorval
              }),
              stroke: new ol.style.Stroke({
                  color: strokeColor,
                  width: 1
              }),
              image: new ol.style.Circle({
                  radius: 1,
                  fill: new ol.style.Fill({
                      color:colorval
                  })
              })
        }));
	}
    if(property){
        feature.setProperties(property);
  	}
	feature.set('layer_name',lyrName);
	//console.log(feature);
    var source =  new ol.source.Vector({
        features: [feature]
    });
	var lyrs = mapObj.getLayers();
	var length = lyrs.getLength();
	var isLayerPresent = false;
	var existing;
	for(i=0;i<length;i++){
	    var l1=lyrs.item(i);
	    if(l1)
	    {
	      lyrtest  =   l1;
	      if(l1.get('title') === lyrName)
	      {
			  existing = l1;
	         isLayerPresent = true;
	         //l1.getSource().clear();
	         l1.getSource().addFeature(feature);
	      }
	    }
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == lyrName){
				 isLayerPresent = true;
				 //tmpl_setMap_layer_global[i].layer.getSource().clear();
	         tmpl_setMap_layer_global[i].layer.getSource().addFeature(feature);
			}
		}
		
	}
	var gblanimationfeature = '',gblanimationfeaturecolor = '';
	
	if (!isLayerPresent)
	{
	   var layerVal = new ol.layer.Vector({
	                      title: lyrName,
	                      visible: true,
	                      source: source
	                });
		tmpl_setMap_layer_global.push({
			layer : layerVal,
			title :  lyrName,
			visibility : true,
			map : mapObj
		});
//console.log(label);
		if(label != undefined){
				
	
	var animateBorder = setInterval(function(){}, 1000);
		 var ta_tooltip = document.createElement('tooltip');
    ta_tooltip.id = 'trip-tooltip';
    ta_tooltip.className = 'ol-trip-tooltip';
   var  overlay_mouseOver_label = new ol.Overlay({
        element: ta_tooltip,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
	mapObj.addOverlay(overlay_mouseOver_label);
var gblanimationfeature = '',gblanimationfeaturecolor = '';
mapObj.on('pointermove', function(evt){
			var layera
			var feature_mouseOver = mapObj.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
			//if(layer){
				
				if(feature.get('layer_name') == lyrName){
				
					return feature;
				}
			//}
			});
			
			ta_tooltip.style.display = feature_mouseOver ? '' : 'none';
			
			
			if(feature_mouseOver) {
			if(gblanimationfeature != ''){
				try{
				gblanimationfeature.getStyle().getStroke().setColor(gblanimationfeature.get('color'));
				gblanimationfeature.getStyle().getStroke().setWidth(1);
				layerVal.getSource().removeFeature(gblanimationfeature);
				layerVal.getSource().addFeature(gblanimationfeature);
				}catch(e){
				}	
			}
				gblanimationfeature = feature_mouseOver;
				gblanimationfeaturecolor = strokeColor;
				overlay_mouseOver_label.setPosition(evt.coordinate);
				ta_tooltip.innerHTML = feature_mouseOver.get('label');
				if(borderAnimate){
	
							feature_mouseOver.getStyle().getStroke().setColor("#f00");
							feature_mouseOver.getStyle().getStroke().setWidth(3);
							layerVal.getSource().removeFeature(feature_mouseOver);
							layerVal.getSource().addFeature(feature_mouseOver);
				
				}
			}
		});
	//}
	}
	
	   // mapObj.addLayer(layerVal);
	    layerVal.setMap(mapObj);
	//    mapObj.addControl(new ol.control.LayerSwitcher());
	}
}



tmpl.Overlay.addMarker = function(param){
	var mapObj = param.map;
	var img_url = param.img_url;
	var height = param.height;
	var width = param.width;
	var id = param.id;
	var offset = param.offset;
	var point = param.point;
	var x = parseFloat(point[0]);
	var y = parseFloat(point[1]);
	var mr_olyrID = mapObj.getOverlayById('marker_OverlayID');
	if(mr_olyrID){
		mapObj.removeOverlay(mr_olyrID);
	}
	var container=document.createElement('div');
	container.className = 'containerAPI ';
	var elem = document.createElement("img");
	elem.setAttribute("src",img_url);
	elem.setAttribute("height", height);
	elem.setAttribute("width", width);
	container.appendChild(elem);
	var marker_pos = new ol.Overlay({
        id: id,
		element: container,
        offset: offset,
        positioning: 'center'
	});
    mapObj.addOverlay(marker_pos);
    if(appConfigInfo.mapData == 'google'){
    	marker_pos.setPosition(ol.proj.transform([x,y], 'EPSG:4326','EPSG:3857'));
    }
    else{
    	marker_pos.setPosition([x,y]);	
    }
    marker_pos.setProperties({olname:"markerOverlay"});
}
tmpl.Overlay.markerWithName = function(param){
	var mapObj = param.map;
	var point = param.point;
	var lon = point[0];
	var lat = point[1];
	var plName = param.name;
	var img_url = param.img_url;
	var height = param.height;
	var width = param.width;
	var offset = param.offset;
	var id = param.id;
	var overlayID = mapObj.getOverlayById(id);
	var overlayIDL = mapObj.getOverlayById(id+'label');
	if(overlayID){
		mapObj.removeOverlay(overlayID);
		mapObj.removeOverlay(overlayIDL);
	}
	var container=document.createElement('div');
	container.className = 'containerAPI '	
	var container1=document.createElement('div');
	container1.className = 'containerAPI ';
	var elem = document.createElement("img");
	elem.setAttribute("src", img_url);
	elem.setAttribute("height", height);
	elem.setAttribute("width", width);
	var labelDiv = document.createElement('div');
	labelDiv.className = 'bottom_Marker';
	labelDiv.innerHTML = plName;
	container1.appendChild(elem);
	container.appendChild(labelDiv);
	var marker_pos = new ol.Overlay({
        id: id,
        element: container1,
        offset: offset,
        positioning: 'center-center'
    });
	var marker_pos1 = new ol.Overlay({
        id: id+'label',
        element: container,
        offset: offset,
        positioning: 'center-center'
    });
    mapObj.addOverlay(marker_pos);
    mapObj.addOverlay(marker_pos1);
    if(appConfigInfo.mapData == 'google'){
		marker_pos.setPosition(ol.proj.transform([parseFloat(lon),parseFloat(lat)], 'EPSG:4326','EPSG:3857'));
		marker_pos1.setPosition(ol.proj.transform([parseFloat(lon),parseFloat(lat)], 'EPSG:4326','EPSG:3857'));
    }
    else{ 
		marker_pos.setPosition([lon,lat]);
		marker_pos1.setPosition([lon,lat]);
    }
    marker_pos.setProperties({olname:"searchOverlay"});
    marker_pos1.setProperties({olname:"searchOverlay"});
}
tmpl.Overlay.removeMarker = function(param){
	var mapObj = param.map;
	var id = param.id;
	var mr_olyrID = mapObj.getOverlayById(id);
	var mr_olyrID1 = mapObj.getOverlayById(id+'label');
	if(mr_olyrID){
		mapObj.removeOverlay(mr_olyrID);
		if(mr_olyrID1 != undefined)
		mapObj.removeOverlay(mr_olyrID1);
	}
}

//------------------------------------- End of Custom Overlay ------------------------------------------//

//--------------------------------- Beginning of Google Map services -----------------------------------//

// **** This will return the route between specified source and destination points **** //


//// joel updating route on 01-12-2016   route v 2p5p008


var totalDistance = 0;
var routeLayer;
var routeVector_line;
var routeLayer_waypoint;
tmpl.Route.clearRoute = function(param) {
  var mapObj = param.map;
  if (routeLayer != undefined)
    routeLayer.getSource().clear();
  if (routeVector_line != undefined)
    routeVector_line.getSource().clear();
  if (routeLayer_waypoint != undefined)
    routeLayer_waypoint.getSource().clear();
  totalDistance = 0;
}
tmpl.Route.getRoute = function(param) {
	var mapObj = param.map;
	tmpl.Route.clearRoute(mapObj);
  if (appConfigInfo.mapData == "google") {
    getGoogleRoute(param);
  } else {
    getTrinityRoute(param);
  }
}

function CreateLayer(param, cordStart, cordEnd, coordinateArray, ETA_legs) {
  // Latest Update Detail
  //MrJ updated on 31-01-2016   route v 2p5p36
  var linestyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 6
    })
  });
  var feature = [];
  var mapObj = param.map;
  var sourcePoint = param.source;
  var destinationPoint = param.destination;
  var sourceIcon = param.sourceIcon;
  var destinationIcon = param.destinationIcon;
  if (param.callbackFunc != undefined)
    var callbackFunc = param.callbackFunc;
  var getGeomCallback = param.getGeometry;
  var wayPointFormat = param.wayPointFormat;
  var route_width = param.route_width;
  var waypoint_limit = 8;
  var wayptsExist = false;
  var format = new ol.format.WKT();
  if (param.waypoints) {
    var fature_waypoint;
    var waypointFeatures = [];
    var stops1 = param.waypoints;
	var temp = stops1;
	var stops = [];
	if(wayPointFormat == undefined){
		stops = stops1;
	}else if(wayPointFormat ==  true){
		for(var x=0;x<stops1.length;x++){
		stops[x] = {};
		/*var t = temp[x].split("POINT(")[1];
		t = t.split(')')[0];
		t = t.split(' ');
		stops[x].lat = parseFloat(t[1]);
		stops[x].lon = parseFloat(t[0]);*/
		var p1 = temp[x].split('(');
		var p2 = p1[1].split(')');
		var p3 = p2[0].split(' ');
		stops[x].lat = parseFloat(p3[1]);
		stops[x].lon = parseFloat(p3[0]);
	}
	}
	
	//console.log(stops)
    var stopsIcon = param.waypointsIcon;
    var wayptsExist = stops.length > 0;
    var waypoint_value;
    var tempwaypointStyle, waypointStyle, wkt_fature_waypoint = [];
    var globalwaypointStyle = new ol.style.Style({
      image: new ol.style.Icon({
        src: stopsIcon,
      })
    });
    var waypoint_length = (stops.length) > waypoint_limit ? waypoint_limit : stops.length;
    if ((stops.length) >= waypoint_limit) {
      console.log("exceeded way point input length : " + stops.length + " Max Limit=" + waypoint_limit);
    }
    for (var t = 0; t < waypoint_length; t++) {
      try {
        if (appConfigInfo.mapData == "google") {
          waypoint_value = ol.proj.transform([parseFloat(stops[t].lon), parseFloat(stops[t].lat)], 'EPSG:4326', 'EPSG:3857');
        } else {
          waypoint_value = [parseFloat(stops[t].lon), parseFloat(stops[t].lat)];
        }
        if (stops[t].Icon != undefined) {
          tempwaypointStyle = new ol.style.Style({
            image: new ol.style.Icon({
              src: stops[t].Icon,
            })
          });
          waypointStyle = tempwaypointStyle;
        } else {
          waypointStyle = globalwaypointStyle;
        }
        fature_waypoint = new ol.Feature({
          geometry: new ol.geom.Point(waypoint_value)
        });
		var wayPointIdTemp = "route_waypoint" + (t+1);
        fature_waypoint.set('id',wayPointIdTemp);
        fature_waypoint.setStyle(waypointStyle);
        if (param.waypoints && param.getGeometry) {
          wkt_fature_waypoint.push(format.writeGeometry(fature_waypoint.getGeometry().clone().transform('EPSG:3857','EPSG:4326')));
		  
        }
        waypointFeatures.push(fature_waypoint);
      } catch (er) {
        console.error("please check your waypoint input: " + er);
      }
    }
  }
  var noLayer = false;
  var noLayer_line = false;
  var noLayer_waypoint = false;
  var Layers = mapObj.getLayers();
  var length = Layers.getLength();
  for (var i = 0; i < length; i++) {
    var existingLayer = Layers.item(i);
    if (existingLayer.get('lname') === 'routeVector_waypoint') {
      noLayer_waypoint = true;
      routeLayer_waypoint = existingLayer;
      //routeLayer_waypoint.getSource().clear();
    }
    if (existingLayer.get('lname') === 'routeVector') {
      noLayer = true;
      routeLayer = existingLayer;
      //routeLayer.getSource().clear();
    }
    if (existingLayer.get('lname') === 'routeVector_line') {
      noLayer_line = true;
      routeVector_line = existingLayer;
      //routeVector_line.getSource().clear();
    }
  }
  var r_w;
  if(route_width != undefined)
  r_w = route_width;
else
	 r_w = 5;
  if (!noLayer) {
    routeLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
	  title: 'Draw_Route_Layer',
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'red',
          width: r_w
        })
      })
    });
    routeLayer.setProperties({
      lname: "routeVector"
    });
    mapObj.addLayer(routeLayer);
  }
  if (!noLayer_line) {
    routeVector_line = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'red',
          width: r_w
        })
      })
    });
    routeVector_line.setProperties({
      lname: "routeVector_line"
    });
    mapObj.addLayer(routeVector_line);
  }
  if (wayptsExist) {
    if (!noLayer_waypoint) {
      routeLayer_waypoint = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: waypointFeatures
        }),
		title: 'Draw_Route_Layer',
      });
      routeLayer_waypoint.setProperties({
        lname: "routeVector_waypoint"
      });
      mapObj.addLayer(routeLayer_waypoint);
    } else {
      try {
        routeLayer_waypoint.getSource().clear();
        routeLayer_waypoint.getSource().addFeatures(waypointFeatures);
      } catch (er) {
        console.error("Adding Waypoints Marker Isssue: " + er);
      }
    }
  }

  var sourceMarker = new ol.Feature({
    geometry: new ol.geom.Point(cordStart),
	fname : 'source',
	id : 'route_source'
  });
  var sourceStyle = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: sourceIcon
    })
  });
  sourceMarker.setStyle(sourceStyle);
  var destinationMarker = new ol.Feature({
    geometry: new ol.geom.Point(cordEnd),
	fname : 'destination',
	id : 'route_destination'
  });
  var destinationStyle = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: destinationIcon
    })
  });
  destinationMarker.setStyle(destinationStyle);
  var featuresCollection_t = [];
  if (appConfigInfo.mapData == "google") {
    var lineString = new ol.geom.LineString(coordinateArray);
    var featuresCollection_g = new ol.Feature({
      geometry: lineString,
      name: 'Line'
    });
  } else {
    var length_geometryVal = coordinateArray.length;
    var featureTemp;
    for (var d = 0; d < length_geometryVal - 1; d++) {
		//console.log(coordinateArray[d].geometry,"   of ...",d);
		if(coordinateArray[d].geometry == "GEOMETRYCOLLECTION EMPTY"){
			//console.log("GEOMETRYCOLLECTION EMPTY Please check in Postgres");
		}else{
			 featureTemp = format.readFeature(coordinateArray[d].geometry, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:4326'
			});
		}
	  try{
		  totalDistance = totalDistance + featureTemp.getGeometry().getLength();
	  }
	  catch(e){
		  //console.log("test catch catch catch catch",d,featureTemp.getGeometry());
	  }
      featuresCollection_t.push(featureTemp);
    }
  }
  //routeLayer.getSource().clear();
  if (appConfigInfo.mapData == "google") {
    //route_distance = feature.getGeometry().getLength();
    routeVector_line.getSource().addFeature(featuresCollection_g);
  } else {
    routeVector_line.getSource().addFeatures(featuresCollection_t);
  }
  routeLayer.getSource().addFeature(sourceMarker);
  routeLayer.getSource().addFeature(destinationMarker);
  mapObj.getView().fit(routeVector_line.getSource().getExtent(), mapObj.getSize()); //mapObj.getView().fit(routeLayer.getSource().getExtent(), mapObj.getSize());
  if (param.callbackFunc != undefined) {
    if (appConfigInfo.mapData == "google") {
      //console.log(totalDistance);
      totalDistance = totalDistance + featuresCollection_g.getGeometry().getLength();
      //if (totalDistance < 1000) {
		  var resETA = {};
			resETA.distance = {};
			resETA.distance.value = 0;
			resETA.distance.units = 'M';
			resETA.duration = {};
			resETA.duration.value = 0;
			resETA.duration.units = 'S';
			//console.log(ETA_legs);
		for(var x=0;x<ETA_legs.length;x++){
			resETA.distance.value = resETA.distance.value + ETA_legs[x].distance.value;
			resETA.duration.value = resETA.duration.value + ETA_legs[x].duration.value;
		}
        callbackFunc(resETA);
     /* } else {
        var temp = totalDistance / 1000;
        callbackFunc({
          distance: dis,
          duration: time
        });
      } */
    } else {
      totalDistance = totalDistance * 100000;
      if (totalDistance < 1000) {
		   var resETA = {};
			resETA.distance = {};
			resETA.distance.value = totalDistance;
			resETA.distance.units = 'M';
			resETA.duration = {};
			resETA.duration.value = 'NA';
			resETA.duration.units = 'NA';
        callbackFunc(resETA);
      } else {
        var temp = totalDistance / 1000;
		 var resETA = {};
			resETA.distance = {};
			resETA.distance.value = temp;
			resETA.distance.units = 'KM';
			resETA.duration = {};
			resETA.duration.value = 'NA';
			resETA.duration.units = 'NA';
        callbackFunc(resETA);
      }
	  
    }
  }
  var featurebuffer;
  if (param.getGeometry != undefined) {
    if (appConfigInfo.mapData === 'google') {
		//sourceMarker,featuresCollection_g
      var wktGeom = format.writeGeometry(featuresCollection_g.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326'));
      var wktSource = format.writeGeometry(sourceMarker.getGeometry().clone().transform('EPSG:3857','EPSG:4326'));
      var wktdestin = format.writeGeometry(destinationMarker.getGeometry().clone().transform('EPSG:3857','EPSG:4326'));
      
      var urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/buffer/wkt/";
		//alert(urlL);
		
		$.ajax({
			type:'POST',
      url:urlL,
      data:{
      	data:wktGeom,
      	radius:(param.radius)/100000//0.0002

		},
		success: function (data) {
			//console.log(data);
			var featurebuffer;
		    //console.log("data >>",data);
		    if(appConfigInfo.mapData == 'google'){
				 featurebuffer = format.readFeature(data[0].geometry, {
					dataProjection: 'EPSG:4326',
					featureProjection: 'EPSG:3857'
				});
			}
			else{
				featurebuffer = format.readFeature(data[0].geometry, {
					dataProjection: 'EPSG:4326',
					featureProjection: 'EPSG:4326'
		        });
			} 
		    
		    featurebuffer.setStyle(new ol.style.Style({
				fill: new ol.style.Fill({
		            color: 'blue'
		        }),
			    stroke: new ol.style.Stroke({
			        width: 1,
			        color: 'blue'
			    }),
		        image: new ol.style.Circle({
					radius: 1,
		            fill: new ol.style.Fill({
						color: 'blue'
					})
		        })
			}));
				
				routeLayer.getSource().addFeature(featurebuffer);	
				
				 var wktBuffer = format.writeGeometry(featurebuffer.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326'));	
				
				if (param.waypoints) {
			        getGeomCallback({
			          line: wktGeom,
			          source: wktSource,
			          destination: wktdestin,
			          waypoints: wkt_fature_waypoint,
			          buffer : wktBuffer
			        });
			      } else {
			        getGeomCallback({
			          line: wktGeom,
			          source: wktSource,
			          destination: wktdestin,
			          buffer : wktBuffer
			        });
			      }
      },
      error: function () {
      	console.log("there was an error!");
      }
  });
    
    } else {
      var wktGeom = format.writeGeometry(featuresCollection_t.getGeometry());
      var wktSource = format.writeGeometry(sourceMarker.getGeometry());
      var wktdestin = format.writeGeometry(destinationMarker.getGeometry());
      if (param.waypoints) {
        getGeomCallback({
          line: wktGeom,
          source: wktSource,
          destination: wktdestin,
          waypoints: wkt_fature_waypoint
        });
      } else {
        getGeomCallback({
          line: wktGeom,
          source: wktSource,
          destination: wktdestin
        });
      }
    }
  }
}
function getGoogleRoute(param) {
  var waypoint_limit = 8;
  var wayptsExist = false;
  var wayPointFormat = param.wayPointFormat;
  if (param.waypoints) {
    var stops1 = param.waypoints;
	var temp = stops1;
	var stops = [];
	if(wayPointFormat == undefined){
		stops = stops1;
	}else if(wayPointFormat ==  true){
		for(var x=0;x<stops1.length;x++){
		stops[x] = {};
		/*var t = temp[x].split("POINT(")[1];
		t = t.split(')')[0];
		t = t.split(' ');
		stops[x].lat = parseFloat(t[1]);
		stops[x].lon = parseFloat(t[0]);*/
		var p1 = temp[x].split('(');
		var p2 = p1[1].split(')');
		var p3 = p2[0].split(' ');
		stops[x].lat = parseFloat(p3[1]);
		stops[x].lon = parseFloat(p3[0]);
		}
	}
	
	//console.log(stops)
    var wayptsExist = stops.length > 0;
    var waypoint_length = (stops.length) > waypoint_limit ? waypoint_limit : stops.length;
  }
  var waypts = [];
  var itemsCounter = 0;
  var batches = [];
  var mapObj = param.map;
  var sourcePoint = param.source;
  var destinationPoint = param.destination;
  var wayPointFormat = param.wayPointFormat;
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer({
    preserveViewport: true
  });
  var olGM2 = new olgm.OLGoogleMaps({
    map: mapObj
  });
 // var gmap = olGM2.getGoogleMapsMap();
 // directionsDisplay.setMap(gmap);
  calculateRoute();

  function calculateRoute() {
    var start = new google.maps.LatLng(sourcePoint[1], sourcePoint[0]);
    var end = new google.maps.LatLng(destinationPoint[1], destinationPoint[0]);
    var tempval;
    if (wayptsExist) {
      for (var i = 0; i < waypoint_length; i++) {
        if (stops[i]) {
          tempval = new google.maps.LatLng(stops[i].lat, stops[i].lon);
          waypts.push({
            location: tempval,
            stopover: true
          });
        }
      }
    }
	var bounds = new google.maps.LatLngBounds();
    bounds.extend(start);
    bounds.extend(end);
    var cordStart = ol.proj.transform([parseFloat(sourcePoint[0]), parseFloat(sourcePoint[1])], 'EPSG:4326', 'EPSG:3857');
    var cordEnd = ol.proj.transform([parseFloat(destinationPoint[0]), parseFloat(destinationPoint[1])], 'EPSG:4326', 'EPSG:3857');
    var x1, y1, x2, y2, extent, temp;
    temp = bounds.toString();
    temp = temp.slice(2, -2);
    temp = temp.split("), (");
    x1 = parseFloat((temp[0].split(","))[0]);
    y1 = parseFloat((temp[0].split(","))[1]);
    x2 = parseFloat((temp[1].split(","))[0]);
    y2 = parseFloat((temp[1].split(","))[1]);
    extent = [y1, x1, y2, x2];
    var request = {
      origin: start,
      destination: end,
      waypoints: waypts,
      optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
	if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
		var polyline = new google.maps.Polyline({
          path: [],
          strokeColor: '#0000FF',
          strokeWeight: 3
        });
        var legs = response.routes[0].legs;
        for (i = 0; i < legs.length; i++) {
          var steps = legs[i].steps;
          for (j = 0; j < steps.length; j++) {
            var nextSegment = steps[j].path;
            for (k = 0; k < nextSegment.length; k++) {
              polyline.getPath().push(nextSegment[k]);
              bounds.extend(nextSegment[k]);
            }
          }
        }
		var ETA_legs = legs;
        var pathObj = polyline.getPath().getArray();
        var coordinateArray = [];
		for (var i = 0, length = pathObj.length; i < length; i++) {
          var po = pathObj[i].toString().slice(1, -1);
          var latVal = po.split(",")[0];
          var lonVal = po.split(",")[1];
          var coordinate = ol.proj.transform([parseFloat(lonVal), parseFloat(latVal)], 'EPSG:4326', 'EPSG:3857');
          coordinateArray.push(coordinate);
		 }
        CreateLayer(param, cordStart, cordEnd, coordinateArray,ETA_legs);
      } else {
        console.log("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
      }
    })
  }
}

function getTrinityRoute(param) {
  // Latest Update Detail
  // route v 2.5.008  dated 01 Dec 2016 Mr J   // wayp tr rou 
  var mapoo = param.map;
  var source = param.source;
   
  var destination = param.destination;
  var sourceIcon = param.sourceIcon;
  var destinationIcon = param.destinationIcon;
  var onClickCallback = param.onClickCallback;
  var stops;
  var waypoint_limit = 8;
  var wayptsExist = false;
  if (param.waypoints) {
    stops = param.waypoints;
    var wayptsExist = stops.length > 0;
    var waypoint_length = (stops.length) > waypoint_limit ? waypoint_limit : stops.length;
  }
  var waypts = [];
  var itemsCounter = 0;
  var batches = [];

  function routeresult(data) {
    //console.log("data:  " + data);
    var prop1 = {};
    var layerName = 'Rout_lyr';
    var datalength = data.length;
    var Detail_flag_ip = false;
    if (Detail_flag_ip) {}
    CreateLayer(param, source, destination, data,'');
  }
  if (wayptsExist) {
    shortestroute_ten(mapoo, source, destination, false, sourceIcon, destinationIcon, stops);
  } else {
    shortestroute_nine(mapoo, source, destination, false, sourceIcon, destinationIcon);
  }

  function shortestroute_nine(mapo, a, b, fastvalue, sourceIcon, destinationIcon) {
    var lon1 = a[0];
    var lat1 = a[1];
    var lon2 = b[0];
    var lat2 = b[1];
    var url2 = "http:" + appConfigInfo.connection.url + "/" + appConfigInfo.connection.project + "/xmling/short_route/" + lon1 + "/" + lat1 + "/" + lon2 + "/" + lat2 + " ";
    //console.log("URL :" + url2);

    function failedfun() {
      console.log("FAIL: FROM SERVER  :" + url2);
    }
    routeresult.mapo = mapo;
    $.ajax({
      type: "GET",
      dataType: "json",
      //headers:{ 'Access-Control-Allow-Origin':'*'},
      //    async: false,
      //   crossDomain: true,
      url: url2,
      success: routeresult,
    });
  }

  function shortestroute_ten(mapo, a, b, fastvalue, sourceIcon, destinationIcon, stops) {
    var lon1 = a[0];
    var lat1 = a[1];
    var lon2 = b[0];
    var lat2 = b[1];
    var stops_toserver = stops;
    //delete stops_toserver.test.key1;
	var temp_stop = []
    for (var k = 0; k < stops_toserver.length; k++) {
		temp_stop[k]={};
		temp_stop[k].Latitude = stops_toserver[k].lat;
		temp_stop[k].Longitude = stops_toserver[k].lon;
      delete stops_toserver[k].Icon;
    }
	
    var jsonString = JSON.stringify(temp_stop);
    //console.log("Icon deleted:" + jsonString);
    var url2 = "http:" + appConfigInfo.connection.url + "/" + appConfigInfo.connection.project + "/route/shortest_waypoint_route/true/" + lon1 + "/" + lat1 + "/" + lon2 + "/" + lat2 + "/" + jsonString + " ";
    //console.log("URL :" + url2);

    function failedfun() {
      console.log("FAIL: FROM SERVER  :" + url2);
    }
    routeresult.mapo = mapo;
    $.ajax({
      type: "GET",
      dataType: "json",
      //headers:{'Access-Control-Allow-Origin':'*' },
      //       async: false,
      //   crossDomain: true,
      url: url2,
      success: routeresult,
    });
  }
}
tmpl.Route.RouteResult = function(getdata) {
  // Latest Update Detail
  // route v 2.5.003  dated 23 nov 2016 Mr J
  var lato, lono, plato = 0,
    plono = 0;
  var path = [];
  for (var m = 0; m < getdata.length - 1; m++) {
    lato = getdata[m].lat;
    lono = getdata[m].lon;
    if (lato == plato && lono == plono) {} else {
      path.push([lato, lono]);
      plato = lato;
      plono = lono;
    }
  }
  //console.log("rs added :", path.length);
  return path;
}
tmpl.Route.directionsService = function(request, myCallBack) {
  // Latest Update Detail
  // route v 2.5.2  dated 22 nov 2016 Mr J
  // tmpl.Route.ResultSet=null;
  // tmpl.Route.GeometryResultSet=null;
  var a = request.source;
  var b = request.destination;
  var lon1 = a[0];
  var lat1 = a[1];
  var lon2 = b[0];
  var lat2 = b[1];
  var url2 = "http:" + appConfigInfo.connection.url + "/" + appConfigInfo.connection.project + "/route/shortest_polyline_route/false/" + lon1 + "/" + lat1 + "/" + lon2 + "/" + lat2 + " ";

  function resultingfunction(data) {
    myCallBack(data);
  }

  function erroringfunction() {
    myCallBack('NOTOK');
    console.error("No result :" + url2);
  }
  $.ajax({
    type: "GET",
    url: url2,
    success: resultingfunction,
    error: erroringfunction
  });
}
 

// **** This function takes the longitude,latitude and returns the geocoded object **** //

tmpl.Geocode.getGeocode = function(params){
	
	var resultStatus;
	var point = params.point;
	var callbackFunc = params.callbackFunc;
	if(appConfigInfo.mapData == 'google'){
		var x = parseFloat(point[0]);
		var y = parseFloat(point[1]);
		var coordinates = {lat: y, lng: x};
		var result = {};
			
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({
			'latLng': coordinates
		},function(results, status) {
			
			if (status == google.maps.GeocoderStatus.OK) {
				console.log("ccccgeo",results);
				if (results[0]) {
					var address = results[0].formatted_address;
					result = {address : address};
					resultStatus = true;
				}
			}
			callbackFunc(result,results[0]);
		});
	}
	else{
		var rsltAry = [],result;
		var urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/nearest_place/"+point[0]+"/"+point[1]+"/1/3000";
		$.ajax({
	        url:urlL,
	        success: function (data) {
	            for (var i = 0; i < data.length ; i++){
			      	var record = {name : data[i].place };
					result = {address : data[i].place};
					rsltAry.push(record);
			    }
			    callbackFunc(result);   
	        },
	        error: function () {
	        	console.log("there was an error!");
	        },
	    });
	}
}

// **** This function takes the address as input and returns the latitude and longitude of the specified address **** //

tmpl.Geocode.getReverseGeocode = function(params){
	var resultStatus;
	var address = params.address;
	var callbackFunc = params.callbackFunc;
	var result;

	if(appConfigInfo.mapData == 'google'){
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var cord = results[0].geometry.location;
				result={coordinates : cord};
				resultStatus = true;
			}
			else{
				result = {};
				resultStatus=false;
			}
			callbackFunc(result);
		});
	}
	else{
		alert("trinity");
	}
}

// **** This function will add the Google Search Box on the map and also shows the searched location with animated marker and map will be zoomed to that location. **** //

tmpl.Search.addSearchBox = function(param){
	var zoomButton,placeLocation = [];
	var mapObj = param.map;
	var img_url = param.img_url;
	var callbackFunc = param.callbackFunc;
	var closeCallbackFunc = param.closeCallbackFunc;
	var clearCallbackFunc = param.clearCallbackFunc;
	var height = param.height;
	var width = param.width;
	var restriction = param.restriction;
	var zoom_button = param.zoom_button;
	var withInFlag = true;
	if(appConfigInfo.mapData == 'google'){
		var resultExtent;
		var lon=0,lat=0;
		var searchDiv = document.createElement('div');
		searchDiv.className = 'search-wrapper';
		var input = document.createElement('input');
		input.type = 'text';
		input.placeholder="Search";
		input.className = 'controls1';
		searchDiv.appendChild(input);

		var resetButton = document.createElement('button');
		resetButton.className = 'close-icon';
		if(zoom_button== true){
			zoomButton = document.createElement('button');
			zoomButton.className = 'zoom_btn';
			searchDiv.appendChild(zoomButton);
		}
		
		input.onkeyup = function() {
			searchDiv.appendChild(resetButton);
			if(this.value.length == 0){
			if(clearCallbackFunc != undefined){
				clearCallbackFunc();
			}
			}
			resetButton.style.visibility = (this.value.length) ? "visible" : "hidden";
		};
		resetButton.onclick = function() {
			placeLocation[0],placeLocation[1] = "";
			this.style.visibility = "hidden";
			input.value = "";
			removeAddSearchMarker(mapObj);
			input.focus();
			if(closeCallbackFunc != undefined){
				closeCallbackFunc();
			}
		};
		var searchControl = new ol.control.Control({
            element: searchDiv
        });
		mapObj.addControl(searchControl);
		var searchBox = new google.maps.places.SearchBox(input);
		var start1 = new google.maps.LatLng(parseFloat(appConfigInfo.extent2),parseFloat(appConfigInfo.extent1));
		var end1 = new google.maps.LatLng(parseFloat(appConfigInfo.extent4),parseFloat(appConfigInfo.extent3));
		var defaultBounds = new google.maps.LatLngBounds();
		defaultBounds.extend(start1);
		defaultBounds.extend(end1);
		searchBox.setBounds(defaultBounds);
		searchBox.addListener('places_changed', function(){
			var places = searchBox.getPlaces();
			if (places.length == 0){
				return;
			}
			var bounds = new google.maps.LatLngBounds();
			places.forEach(function(place){
				var x1,y1,x2,y2;
				var arry = [];
				placeLocation = place.geometry.location;
				placeLocation = placeLocation.toString();
				placeLocation = placeLocation.slice(1,-2);
				placeLocation = placeLocation.split(", ");
				var placeName = place.name;
				if (place.geometry.viewport){
					bounds.union(place.geometry.viewport);
					bounds=bounds.toString();
					bounds=bounds.slice(2,-2);
					bounds=bounds.split("), (");
					x1=parseFloat((bounds[0].split(","))[0]);
					y1=parseFloat((bounds[0].split(","))[1]);
					x2=parseFloat((bounds[1].split(","))[0]);
					y2=parseFloat((bounds[1].split(","))[1]);
					var extent =[y1,x1,y2,x2];
					if(place.types[0] == 'sublocality_level_1' || place.types[0] == 'sublocality_level_2' || place.types[0] == 'sublocality_level_3' ||place.types[0] == 'sublocality_level_4' || place.types[0] == 'sublocality'  || place.types[0] == 'subpremise' || place.types[0] == 'neighborhood' || place.types[0] == 'administrative_area_level_1' || place.types[0] == 'administrative_area_level_2' || place.types[0] == 'administrative_area_level_3' || place.types[0] == 'administrative_area_level_4' || place.types[0] == 'administrative_area_level_5' || place.types[0] == 'colloquial_area' || place.types[0] == 'locality' || place.types[0] == 'political' || place.types[0] == 'country' ){
						resultExtent = extent;
					}
					else{
						resultExtent = null;
					}
					//searchBox.setBounds(defaultBounds);
					var rec = {lat: parseFloat(placeLocation[0]), lon:parseFloat(placeLocation[1]), extend:resultExtent};
					arry.push(rec);
					var lat =  parseFloat(placeLocation[0]);
					var lon =  parseFloat(placeLocation[1]);
					var jsonString = JSON.stringify(arry);
					if(restriction == true){
					if(lat>appConfigInfo.extent2 && lat<appConfigInfo.extent4 && lon>appConfigInfo.extent1 && lon<appConfigInfo.extent3){
					withInFlag = true;
					zoomToSearch(mapObj,placeLocation[1],placeLocation[0],resultExtent,placeName,img_url,height,width);
					if(zoom_button== true){
						zoomButton.onclick = function() {
							if(withInFlag == true){
								if(placeLocation[1] != ""){
									zoomToSearch(mapObj,placeLocation[1],placeLocation[0],resultExtent,placeName,img_url,height,width);
								}
							}
						};
					}	
						if(callbackFunc){
							var rec = {lat:parseFloat(placeLocation[0]) , lon:parseFloat(placeLocation[1])}
							callbackFunc(rec);
						}
					}
					else{
						withInFlag = false;
						//alert("Out of City Boundary");
						if(callbackFunc){
							var rec = {lat:'' , lon:''}
							callbackFunc(rec);
						}
					}
				}else{
					zoomToSearch(mapObj,placeLocation[1],placeLocation[0],resultExtent,placeName,img_url,height,width);
					if(zoom_button== true){
						zoomButton.onclick = function() {
							if(withInFlag == true){
								if(placeLocation[1] != ""){
									zoomToSearch(mapObj,placeLocation[1],placeLocation[0],resultExtent,placeName,img_url,height,width);
								}
							}
						};
					}	
						if(callbackFunc){
							var rec = {lat:parseFloat(placeLocation[0]) , lon:parseFloat(placeLocation[1])}
							callbackFunc(rec);
						}
				}
					
				}
				else{
					bounds.extend(place.geometry.location);
					var ext=null;
					var lat =  parseFloat(placeLocation[0]);
					var lon =  parseFloat(placeLocation[1]);
					//searchBox.setBounds(bounds);
					var rec = {lat: parseFloat(placeLocation[0]), lon:parseFloat(placeLocation[1]), extend:ext};
					arry.push(rec);
					var jsonString = JSON.stringify(arry);
					if(restriction == true){
					if(lat>appConfigInfo.extent2 && lat<appConfigInfo.extent4 && lon>appConfigInfo.extent1 && lon<appConfigInfo.extent3){
						withInFlag = true;
					zoomToSearch(mapObj,placeLocation[1],placeLocation[0],ext,placeName,img_url,height,width);
					if(zoom_button== true){
						zoomButton.onclick = function() {
							if(withInFlag == true){
								zoomToSearch(mapObj,placeLocation[1],placeLocation[0],ext,placeName,img_url,height,width);
							}
						};
					}
					if(callbackFunc){
							var rec = {lat:parseFloat(placeLocation[0]) , lon:parseFloat(placeLocation[1])}
							callbackFunc(rec);
						}
					}
					else{
						withInFlag = false;
						//alert("Out of City Boundary");
						if(callbackFunc){
							var rec = {lat:'' , lon:''}
							callbackFunc(rec);
						}
					}
				}else{
					zoomToSearch(mapObj,placeLocation[1],placeLocation[0],ext,placeName,img_url,height,width);
					if(zoom_button== true){
						zoomButton.onclick = function() {
							if(withInFlag == true){
								zoomToSearch(mapObj,placeLocation[1],placeLocation[0],ext,placeName,img_url,height,width);
							}
						};
					}
					if(callbackFunc){
							var rec = {lat:parseFloat(placeLocation[0]) , lon:parseFloat(placeLocation[1])}
							callbackFunc(rec);
						}
				}
					// if(callbackFunc){
						// var rec = {lat:parseFloat(placeLocation[0]) , lon:parseFloat(placeLocation[1])}
						// callbackFunc(rec);
					// }
				}
			});	
		});
	}
	else{
		var sdiv = document.createElement('div');
	    sdiv.className = 'search-wrapper';
	    var input = document.createElement('input');
	    input.type = 'text';
	    input.id='trinitySearch';
	    input.placeholder="Search";
	    input.className = 'controls1';
	    sdiv.appendChild(input);

	    var rst = document.createElement('button');
	    rst.className = 'close-icon';

	    if(zoom_button== true){
			zoomButton = document.createElement('button');
			zoomButton.className = 'zoom_btn';
			sdiv.appendChild(zoomButton);
		}  
		input.onkeyup = function() {
			sdiv.appendChild(rst);
			if(this.value.length == 0){
			if(clearCallbackFunc != undefined){
				clearCallbackFunc();
			}
			}
			rst.style.visibility = (this.value.length) ? "visible" : "hidden";
		}
	    try
	    {
	      input.onkeypress = function() {
	        sdiv.appendChild(rst);
	        rst.style.visibility = (this.value.length) ? "visible" : "hidden";
	      };
	    }
	    catch(errr)
	    {
	      console.log("errr: "+errr);
	    }
	    rst.onclick = function() {
            try
            {
              this.style.visibility = "hidden";
              input.value = "";
              removeAddSearchMarker(mapObj);
              input.focus();
			  if(closeCallbackFunc != undefined){
				closeCallbackFunc();
				}
            }
            catch(errr)
            {
              console.log("errr: "+errr);
            }
        };
	    var srchb = new ol.control.Control({
                element: sdiv
        });
	    mapObj.addControl(srchb);
	    var options = {
		      url: function(phrase) {    
		          var p  = phrase;
		          return "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/place_search/text/"+phrase+"/10"; //http://192.168.1.165:8989/springrestservice/place_search/text/ban/10
		      },
		      getValue: "place",
		      ajaxSettings: {
		          dataType: "json",
		          method: "GET",
		          data: {
		            dataType: "json"
		          }
		      },
		      preparePostData: function(data) {
		          data.phrase = $("#trinitySearch").val();
		          return data;
		      },
		      list: {
		        onChooseEvent: function() {
	                var lat = $("#trinitySearch").getSelectedItemData().lat;
	                var lon = $("#trinitySearch").getSelectedItemData().lon;
	                var place = $("#trinitySearch").getSelectedItemData().place;
	                console.log(lat,lon);
	               /* var resultArray =[];
	                var rec = {name : place, lat: parseFloat(lat), lon:parseFloat(lon)};
	                resultArray.push(rec); 
	                var jsonString = JSON.stringify(resultArray);*/
	               // Zooming to the selected location
	                zoomToSearch(mapObj,parseFloat(lon),parseFloat(lat),null,place,img_url,height,width);  
	                if(zoom_button== true){
		                zoomButton.onclick = function() {
							zoomToSearch(mapObj,parseFloat(lon),parseFloat(lat),null,place,img_url,height,width);   
						};
					}
					if(callbackFunc){
						var rec = {lat:parseFloat(lat) , lon:parseFloat(lon)}
						//console.log(rec);
						callbackFunc(rec);
					}
		        }         
		      },
		      requestDelay: 400
	    };
	    $("#trinitySearch").easyAutocomplete(options);   
	}	
}

// **** This function will zoom the map to the Search Box resulted location **** //

function zoomToSearch(mapObj,lon,lat,ext,plName,img_url,height,width){
	if(appConfigInfo.mapData == 'google'){
		if(ext != null){
			mapObj.getView().fit(ol.proj.transformExtent(ext, 'EPSG:4326','EPSG:3857'), mapObj.getSize());
			mapObj.getView().setCenter(ol.proj.transform([parseFloat(lon),parseFloat(lat)], 'EPSG:4326','EPSG:3857'));
			loadSingleMarkerOverlaySearch(mapObj,lon,lat,plName,img_url,height,width);
		}
		else{
			mapObj.getView().setZoom(17);
			mapObj.getView().setCenter(ol.proj.transform([parseFloat(lon),parseFloat(lat)], 'EPSG:4326','EPSG:3857'));
			loadSingleMarkerOverlaySearch(mapObj,lon,lat,plName,img_url,height,width);
		}
	}
	else{
		mapObj.getView().setCenter([lon,lat]);
		mapObj.getView().setZoom(12);
		loadSingleMarkerOverlaySearch(mapObj,lon,lat,plName,img_url,height,width);
	}
}

// **** This function will add the Search Box result location as animated marker to the map **** //

function loadSingleMarkerOverlaySearch(mapObj,lon,lat,plName,img_url,height,width){
	if(img_url == undefined){
		var overlayID = mapObj.getOverlayById('searchOverlayID');
	if(overlayID){
		mapObj.removeOverlay(overlayID);
	}
	var container=document.createElement('div');
	container.className = 'containerAPI ';
	var labelDiv = document.createElement('div');
	labelDiv.className = 'bottomleft';
	labelDiv.innerHTML = plName;
	container.appendChild(labelDiv);
	var marker_pos = new ol.Overlay({
        id: 'searchOverlayID',
        element: container,
        offset: [-10, -35],
        positioning: 'center'
    });
    mapObj.addOverlay(marker_pos);
    if(appConfigInfo.mapData == 'google'){
		marker_pos.setPosition(ol.proj.transform([parseFloat(lon),parseFloat(lat)], 'EPSG:4326','EPSG:3857'));
    }
    else{ 
		marker_pos.setPosition([lon,lat]);
    }
    marker_pos.setProperties({olname:"searchOverlay"});
	setTimeout(function(){
		tmpl.Overlay.removeMarker({map:mapObj,id:'searchOverlayID'})
	}, 5000);
	}else{
		
	var overlayID = mapObj.getOverlayById('searchOverlayID');
	if(overlayID){
		mapObj.removeOverlay(overlayID);
	}
	var container=document.createElement('div');
	container.className = 'containerAPI ';
	var elem = document.createElement("img");
	elem.setAttribute("src", img_url);
	elem.setAttribute("height", height);
	elem.setAttribute("width", width);
	var labelDiv = document.createElement('div');
	labelDiv.className = 'bottomleft';
	labelDiv.innerHTML = plName;
	container.appendChild(elem);
	container.appendChild(labelDiv);
	var marker_pos = new ol.Overlay({
        id: 'searchOverlayID',
        element: container,
        offset: [-10, -35],
        positioning: 'center'
    });
    mapObj.addOverlay(marker_pos);
    if(appConfigInfo.mapData == 'google'){
		marker_pos.setPosition(ol.proj.transform([parseFloat(lon),parseFloat(lat)], 'EPSG:4326','EPSG:3857'));
    }
    else{ 
		marker_pos.setPosition([lon,lat]);
    }
    marker_pos.setProperties({olname:"searchOverlay"});
	setTimeout(function(){
		tmpl.Overlay.removeMarker({map:mapObj,id:'searchOverlayID'})
	}, 5000);
	}
}

// **** This function removes the Search marker **** //

function removeAddSearchMarker(mapObj)
{
  var olyrID = mapObj.getOverlayById('searchOverlayID');
  if(olyrID)
  {
    mapObj.removeOverlay(olyrID);
  }
}


// **** This function will add the Google Search Box to the specified targetDiv and also shows the searched location with animated marker and map will be zoomed to that location. **** //

tmpl.Search.addSearch = function(param){
	
	var mapObj = param.map;
	var targetDiv = param.target;
	
	if(appConfigInfo.mapData == 'google'){
		var resultExtent;
		var lon=0,lat=0;
		var searchBox = new google.maps.places.SearchBox(document.getElementById(targetDiv));
		var start1 = new google.maps.LatLng(parseFloat(appConfigInfo
		.extent2),parseFloat(appConfigInfo.extent1));
		var end1 = new google.maps.LatLng(parseFloat(appConfigInfo.extent4),parseFloat(appConfigInfo.extent3));
		var defaultBounds = new google.maps.LatLngBounds();
		defaultBounds.extend(start1);
		defaultBounds.extend(end1);
		//searchBox.setBounds(defaultBounds);
		searchBox.addListener('places_changed', function(){
			var places = searchBox.getPlaces();
			if (places.length == 0){
				return;
			}
			var bounds = new google.maps.LatLngBounds();
			places.forEach(function(place){
				var x1,y1,x2,y2,placeLocation;
				var arry = [];
				placeLocation = place.geometry.location;
				placeLocation = placeLocation.toString();
				placeLocation = placeLocation.slice(1,-2);
				placeLocation = placeLocation.split(", ");
				var placeName = place.name;
				if (place.geometry.viewport){
					bounds.union(place.geometry.viewport);
					bounds=bounds.toString();
					bounds=bounds.slice(2,-2);
					bounds=bounds.split("), (");
					x1=parseFloat(bounds[0].split(",")[0]);
					y1=parseFloat(bounds[0].split(",")[1]);
					x2=parseFloat(bounds[1].split(",")[0]);
					y2=parseFloat(bounds[1].split(",")[1]);
					var extent =[y1,x1,y2,x2];
					if(place.types[0] == 'sublocality_level_1' || place.types[0] == 'sublocality_level_2' || place.types[0] == 'sublocality_level_3' ||place.types[0] == 'sublocality_level_4' || place.types[0] == 'sublocality'  || place.types[0] == 'subpremise' || place.types[0] == 'neighborhood' || place.types[0] == 'administrative_area_level_1' || place.types[0] == 'administrative_area_level_2' || place.types[0] == 'administrative_area_level_3' || place.types[0] == 'administrative_area_level_4' || place.types[0] == 'administrative_area_level_5' || place.types[0] == 'colloquial_area' || place.types[0] == 'locality' || place.types[0] == 'political' || place.types[0] == 'country' ){
						resultExtent = extent;
					}
					else{
						resultExtent = null;
					}
					searchBox.setBounds(defaultBounds);
					var rec = {lat: parseFloat(placeLocation[0]), lon:parseFloat(placeLocation[1]), extend:resultExtent};
					arry.push(rec);
					//console.log(arry);
					lat = parseFloat(placeLocation[0]);
					lon = parseFloat(placeLocation[1]);
					var jsonString = JSON.stringify(arry);
					//if(lat>appConfigInfo.extent2 && lat<appConfigInfo.extent4 && lon>appConfigInfo.extent1 && lon<appConfigInfo.extent3){
						return getLatLonDetails(placeLocation[1],placeLocation[0],resultExtent,placeName);
					//}
					//else{
					//	return getLatLonDetails('','','','');
						//alert("Searched Place is Out Of Project Area....");
					//}
				}
				else{
					bounds.extend(place.geometry.location);
					var ext=null;
					searchBox.setBounds(bounds);
					var rec = {lat: parseFloat(placeLocation[0]), lon:parseFloat(placeLocation[1]), extend:ext};
					arry.push(rec);
					lat = parseFloat(placeLocation[0]);
					lon = parseFloat(placeLocation[1]);
					var jsonString = JSON.stringify(arry);
					//if(lat>appConfigInfo.extent2 && lat<appConfigInfo.extent4 && lon>appConfigInfo.extent1 && lon<appConfigInfo.extent3){
						return getLatLonDetails(placeLocation[1],placeLocation[0],ext,placeName);
					//}
					//else{
					//	return getLatLonDetails('','','','');
						//alert("Searched Place is Out Of Project Area....");
					//}
				}
			});
		});
	}
	else
  {
    var options = {
      url: function(phrase) {    
          var p  = phrase;
          return "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/place_search/text/"+phrase+"/10";
        },
      getValue: "place",
      ajaxSettings: {
          dataType: "json",
          method: "GET",
          data: {
            dataType: "json"
          }
        },
      preparePostData: function(data) {
          data.phrase = $("#"+targetDiv).val();
          return data;
        },
      list: {
          onChooseEvent: function() {

                var lat = $("#"+targetDiv).getSelectedItemData().lat;
                var lon = $("#"+targetDiv).getSelectedItemData().lon;
                var place = $("#"+targetDiv).getSelectedItemData().place;

                var resultArray =[];
                var rec = {name : place, lat: parseFloat(lat), lon:parseFloat(lon)};
                resultArray.push(rec); 
                var jsonString = JSON.stringify(resultArray);
               // Zooming to the selected location
               //zoomToSearch(mapObj,parseFloat(lon),parseFloat(lat),null,place);    
                getLatLonDetails(parseFloat(lon),parseFloat(lat),null,place);
              }         
            },
      requestDelay: 400
    };
    $("#"+targetDiv).easyAutocomplete(options);
  }
	
}

// **** This function takes latitude,longitude,radius and type of location. It will return the places of specified type within the radius of given location. **** //

tmpl.Search.getLandMarks = function(params){
	var point=params.point;
	var callbackFunc  = params.callbackFunc;
	var custom_poi_type = params.POI_type;

	var dataFrom = params.dataFrom;
	var ignoreRadius = params.ignoreRadius;
	var radius = params.radius;
	if(ignoreRadius == undefined){
		
	}else{
		if(ignoreRadius == true){
			radius = 80000;
		}
	}
	var POI_type,keyword;
	if(custom_poi_type == "blood_bank"){
		keyword = 'blood bank';
		POI_type = 'health';
	}else{
		keyword = ''
		POI_type = custom_poi_type;
	}

	if(appConfigInfo.mapData == 'google'){
		if(dataFrom == 'google' || dataFrom == undefined){
			var searchresult;
		var olGM = new olgm.OLGoogleMaps({map: params.map});
		var gmap = olGM.getGoogleMapsMap();
		//point=point.slice(1,-1);
		//point=point.split(',');
		var coordinate = {lat: parseFloat(point[1]), lng: parseFloat(point[0])};
		var service = new google.maps.places.PlacesService(gmap);
		var resultArray22 = [];
		service.nearbySearch({
            location: coordinate,
            radius: radius,
		type: [POI_type],
			keyword: keyword
		},function googlecallback(results, status){
			//console.log("qq",POI_type,results);
         var resultArray = [];
			if(results == null){
				var record = {};
                //resultArray.push(record);
                searchresult=false;
			}else{
           if(results.length == 0){
                var record = {};
                //resultArray.push(record);
                searchresult=false;
            }
            else{
				if (status === google.maps.places.PlacesServiceStatus.OK){
                    for (var i = 0; i < results.length ; i++){
						if(results[i] !=undefined){
							var lat=results[i].geometry.location.lat();
							var lng=results[i].geometry.location.lng();
							function deg2rad(deg) {
                                return deg * (Math.PI/180)
                            }
							var R = 6371; // Radius of the earth in km
							var dLat = deg2rad(lat-point[1]);
							var dLon = deg2rad(lng-point[0]);
							var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
							Math.cos(deg2rad(lat)) * Math.cos(deg2rad(point[1])) *
							Math.sin(dLon/2) * Math.sin(dLon/2);
							var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
							var d = R * c; // Distance in km
							var distance=d.toFixed(2);
							distance = parseFloat(distance);
							var record = {name : results[i].name, lat: parseFloat(lat), lon:parseFloat(lng), distance: distance, poi_type : params.POI_type};
							resultArray22.push(record);
						}
                    }
					resultArray22.sort(function(a, b){return a.distance - b.distance});
					//console.log("hhhh",resultArray22);
				}
            }
            var no_of_POIs;
            if(params.Max_num_POIs < results.length){
                no_of_POIs = params.Max_num_POIs;
            }
            else{
                no_of_POIs = results.length;
            }
            for (var i = 0; i < no_of_POIs ; i++){
				resultArray.push(resultArray22[i]);
                searchresult=true;
            }
			}
			//alert("alert from api");
            callbackFunc(resultArray);
        });
		}
		else if(dataFrom == 'trinity'){
            	var lon= parseFloat(point[0]);
				var lat= parseFloat(point[1]);
				var maxPOI = params.Max_num_POIs;
				var type ;
				var rsltAry = [];
				var boolianone= false;
				var urlL;
				if(custom_poi_type == "blood_bank"){
					type=10;
				}else if(custom_poi_type == "hospital"){
					type=16;
				}else if(custom_poi_type == "fire_station"){
					type=29;
				}else if(custom_poi_type == "police"){
					type=58;
				}
				else if(custom_poi_type == "all"){
					type=99;
				}
				//var radius = params.radius;
				var rdus = radius;
				var dstncKMtr;
				
					urlL= "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/landmark_search/"+lon+"/"+lat+"/"+maxPOI+"/"+type+"/"+rdus;

				
				$.ajax({
			        url:urlL,
			        success: function (data) {
			            for (var i = 0; i < data.length ; i++){
					      	dstncKMtr = (data[i].distance)/1000;
					      	var record = {name : data[i].place, lat: data[i].lat, lon:data[i].lon, distance: dstncKMtr, type:data[i].type  };
							rsltAry.push(record);
						  }
						  //console.log(rsltAry);
						  callbackFunc(rsltAry);
			          
			        },
			        error: function () {
			        	console.log("there was an error!");
			        },
			    });
            }


	}
	else{
		var lon= parseFloat(point[0]);
		var lat= parseFloat(point[1]);
		var maxPOI = params.Max_num_POIs;
		var type ;
		var rsltAry = [];
		var boolianone= false;
		var urlL;
		if(custom_poi_type == "blood_bank"){
			type=10;
		}else if(custom_poi_type == "hospital"){
			type=16;
		}else if(custom_poi_type == "fire_station"){
			type=29;
		}else if(custom_poi_type == "police"){
			type=58;
		}
		else if(custom_poi_type == "all"){
			type=99;
		}
		//var radius = params.radius;
		var rdus = radius;
		var dstncKMtr;
		
			urlL= "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/landmark_search/"+lon+"/"+lat+"/"+maxPOI+"/"+type+"/"+rdus;

		
		$.ajax({
	        url:urlL,
	        success: function (data) {
	            for (var i = 0; i < data.length ; i++){
			      	dstncKMtr = (data[i].distance)/1000;
			      	var record = {name : data[i].place, lat: data[i].lat, lon:data[i].lon, distance: dstncKMtr, type: data[i].type };
					rsltAry.push(record);
				  }
				  callbackFunc(rsltAry);
	          
	        },
	        error: function () {
	        	console.log("there was an error!");
	        },
	    });
	}
}


// **** This function takes latitude,longitude. It will return the nearest places of given location. **** //
tmpl.Search.getNearestPlace = function(params){
	var point = params.point;
	var callbackFunc = params.callbackFunc; 
	if(appConfigInfo.mapData == "google"){
		var resultStatus;
		var x = parseFloat(point[0]);
		var y = parseFloat(point[1]);
		var coordinates = {lat: y, lng: x};
		var result = {};
			
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({
			'latLng': coordinates
		},function(results, status) {
			//console.log("placee",results);
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					//console.log(results);
					var address = results[0].address_components[1].long_name;
					result = {placename : address};
					resultStatus = true;
				}
			}
			callbackFunc(result);
		});
	}else{
		var rsltAry = [];
		var urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/nearest_place/"+point[0]+"/"+point[1]+"/1/3000";
	
		$.ajax({
	        url:urlL,
	        success: function (data) {
	        	 for (var i = 0; i < data.length ; i++){
			      	var record = {placename : data[i].place };
			      	
					rsltAry.push(record);
					
			    }
	            
			    callbackFunc(rsltAry);   
	        },
	        error: function () {
	        	console.log("there was an error!");
	        },
	    });
	}
}
//------------------------------------ End of Google Map services --------------------------------------//

//-------------------------- Beginning of Zoom to location, Extent and Layer ---------------------------//

// **** Zoom to specified Layer **** //

tmpl.Zoom.zoom = function(param){
	var mapObj = param.map;
	var zoomLevel  = param.zoomLevel;
	mapObj.getView().setZoom(zoomLevel);
}



tmpl.Zoom.toLayer = function(param){
	var mapObj = param.map;
	var lyrname = param.layer;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var existing;
	for(var i=0;i<length;i++){
		var existingLayer = Layers.item(i);
		if(existingLayer.get('title') == lyrname){
			existing = existingLayer;
			var extent = existingLayer.getSource().getExtent();
			if(extent[0] == extent[2] && extent[1] == extent[3]){
					var point = [extent[0],extent[1]];
					point = ol.proj.transform(point,'EPSG:3857','EPSG:4326');
					tmpl.Zoom.toXYcustomZoom({
						map: mapObj,
						zoom: 14,
						latitude: point[1],
						longitude: point[0]
					});
				}else{
					mapObj.getView().fit(extent, mapObj.getSize());
				}
			break;
		}
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == lyrname){
				var extent = tmpl_setMap_layer_global[i].layer.getSource().getExtent();
				//console.log(extent);
				if(extent[0] == extent[2] && extent[1] == extent[3]){
					var point = [extent[0],extent[1]];
					point = ol.proj.transform(point,'EPSG:3857','EPSG:4326');
					tmpl.Zoom.toXYcustomZoom({
						map: mapObj,
						zoom: 14,
						latitude: point[1],
						longitude: point[0]
					});
				}else{
					mapObj.getView().fit(extent, mapObj.getSize());
				}
				break;
			}
		}
		
	}
}

// **** Zoom to specified Extent **** //

tmpl.Zoom.toExtent = function(param){
	var mapObj = param.map;
	var extent = param.extent;
	if(appConfigInfo.mapData == "google"){
		var ext = ol.proj.transformExtent(extent,"EPSG:4326","EPSG:3857");
		mapObj.getView().fit(ext, mapObj.getSize());
	}else{
		mapObj.getView().fit(extent, mapObj.getSize());
	}
}

// **** Zoom to specified Location **** //

tmpl.Zoom.toXY = function(param){
	var mapObj = param.map;
	var lat = parseFloat(param.latitude);
	var lng = parseFloat(param.longitude);
	//if(ext != null){
	//	mapObj.getView().fit(ol.proj.transformExtent(ext, 'EPSG:4326', 'EPSG:3857'), mapObj.getSize());
	//}
	//else{
		if(appConfigInfo.mapData == "google"){
		mapObj.getView().setCenter(ol.proj.transform([lng,lat], 'EPSG:4326', 'EPSG:3857'));
		mapObj.getView().setZoom(18);
		}else{
		mapObj.getView().setCenter([lng,lat]);
		mapObj.getView().setZoom(15);
		}	
	//}
}


tmpl.Zoom.toXYWithoutZoom = function(param){
	var mapObj = param.map;
	var lat = parseFloat(param.latitude);
	var lng = parseFloat(param.longitude);
	//if(ext != null){
	//	mapObj.getView().fit(ol.proj.transformExtent(ext, 'EPSG:4326', 'EPSG:3857'), mapObj.getSize());
	//}
	//else{
		if(appConfigInfo.mapData == "google"){
		mapObj.getView().setCenter(ol.proj.transform([lng,lat], 'EPSG:4326', 'EPSG:3857'));
		//mapObj.getView().setZoom(18);
		}else{
		mapObj.getView().setCenter([lng,lat]);
		//mapObj.getView().setZoom(15);
		}	
	//}
}
// **** Zoom to XY with custom zoom level  Ms.PPK 09-11-16 12.44pm**** //

tmpl.Zoom.toXYcustomZoom = function(param){
	var mapObj = param.map;
	var zoomLevel = param.zoom;
	var lat = parseFloat(param.latitude);
	var lng = parseFloat(param.longitude);
	if(appConfigInfo.mapData == "google"){
		mapObj.getView().setZoom(zoomLevel);
		mapObj.getView().setCenter(ol.proj.transform([lng,lat], 'EPSG:4326', 'EPSG:3857'));
		
	}else{
		mapObj.getView().setCenter([lng,lat]);
		mapObj.getView().setZoom(zoomLevel);
	}	
}
//---------------------------- End of Zoom to location, Extent and Layer -------------------------------//

//--------------------------------- Beginning of Feature Updations  ------------------------------------//

// **** This function will update the specified feature **** //

tmpl.Feature.updateLatLong = function(param) {
	var mapObj = param.map;
	var id = param.id;
	var lon = param.longitude;
	var lat = param.latitude;
	var layerName = param.layer;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var existing;
	for(var i=0;i<length;i++){
		var existingLayer = Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layerName){
				existing = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					if(feature.getProperties()['id']==id){
						if(appConfigInfo.mapData==='google'){
							feature.getGeometry().setCoordinates(ol.proj.transform([parseFloat(lon),parseFloat(lat)], 'EPSG:4326','EPSG:3857'));
						}
						else{
							feature.getGeometry().setCoordinates([parseFloat(lon),parseFloat(lat)]);
						}
					}
				});
			}
		}
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == layerName){
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (feature) {
					if(feature.getProperties()['id']==id){
						if(appConfigInfo.mapData==='google'){
							feature.getGeometry().setCoordinates(ol.proj.transform([parseFloat(lon),parseFloat(lat)], 'EPSG:4326','EPSG:3857'));
						}
						else{
							feature.getGeometry().setCoordinates([parseFloat(lon),parseFloat(lat)]);
						}
					}
				});
			}
		}
		
	}
}

// **** This function will set the visibility of specified Feature **** //
tmpl.Feature.VisibilityFlag = false;
tmpl.Feature.changeVisibility = function(param){
	var mapObj = param.map;
	var id = param.id;
	var layerName = param.layer;
	var visibility = param.visible;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var existing;
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layerName){
				existing = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					if(feature.getProperties()['id']==id){
						if(visibility){
							//console.log("99");
							try{
								feature.setStyle(feature.getProperties()['sty']);
							}
							catch(err){
								console.error("SetStyle"+err);
							}
						}
						else{
							 var st = feature.getStyle();
							feature.setProperties({'sty':st});

							var emptyImgStyle = new ol.style.Style({ image: '' });
							feature.setStyle(emptyImgStyle);
						}
					}
				});
				var allFeatures = existingLayer.getSource().getFeatures();
				existingLayer.getSource().clear();
				existingLayer.getSource().addFeatures(allFeatures);
			}
		}
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			//console.log(tmpl_setMap_layer_global[i].title);
			if(tmpl_setMap_layer_global[i].title == layerName){
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (feature) {
					
					if(feature.getProperties()['id']==id){
						if(visibility){
						//	console.log("a");
							try{
								feature.setStyle(null);
								feature.setStyle(feature.getProperties()['sty']);
							}
							catch(err){
								console.error("SetStyle"+err);
							}
						}
						else{
							
							 var st = feature.getStyle();
							feature.setProperties({'sty':st});

							var emptyImgStyle = new ol.style.Style({ image: '' });
							feature.setStyle(emptyImgStyle);
						//	console.log("b");
						}
					}
				});
				var allFeatures = tmpl_setMap_layer_global[i].layer.getSource().getFeatures();
				tmpl_setMap_layer_global[i].layer.getSource().clear();
				tmpl_setMap_layer_global[i].layer.getSource().addFeatures(allFeatures);
			}
		}
		
	}
}

// **** This function removes the specified Feature **** //

tmpl.Feature.remove = function(param){
	var mapObj = param.map;
	var id = param.id;
	var layerName = param.layer;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var existing;
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layerName){
				existing = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					if(feature.getProperties()['id']==id){
						existingLayer.getSource().removeFeature(feature);
					}
				});
			}
		}
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == layerName){
				var layer = tmpl_setMap_layer_global[i].layer;
				layer.getSource().getFeatures().forEach(function (feature) {
					if(feature.getProperties()['id']==id){
						layer.getSource().removeFeature(feature);
						var index = global_fleet_layer_id.indexOf('fleet_'+layerName+'_'+id);
						global_fleet_layer_id[index] = '';
					}
				});
			}
		}
		
	}
}


tmpl.Feature.setProperty = function(param){
	var feature = param.feature;
	var propertyObj = param.properties;
	feature.setProperties(propertyObj);//set Properties to identify feature
}

// **** This function adds the Feature to specified Layer **** //
/*
tmpl.Feature.add = function(JsonObj,layerName,mapObj){
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var alreadyExist = false;
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer.get('title') === layerName){
			existingLayer.getSource().getFeatures().forEach(function (feature) {
				if(feature.getProperties()['id']==id){
					alreadyExist = true;
				}
			})
			if(alreadyExist){
				//alert("Already Exists");
			}else{
				existingLayer.getSource().addFeature(feature);
			}
		}
	}
}
*/
// **** This function will change the label according the specified label text, text color, background color **** //

tmpl.Feature.editLabel = function(param){
	var mapObj = param.map;
	var layerName = param.layer;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var labelLayer;
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layerName){
				labelLayer = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					if(feature.getProperties()['id']==param.id){
						if(param.label){
							feature.set('label',param.label);
							feature.getStyle().getText().setText(param.label);
						}
						if(param.color){
							feature.getStyle().getText().getFill().setColor(param.color);
						}
						if(param.bgcolor){
							feature.getStyle().getText().getStroke().setColor(param.bgcolor);
						}
					}
				});
				if(labelLayer != undefined)
					mapObj.removeLayer(labelLayer);
				var allFeatures = existingLayer.getSource().getFeatures();
				existingLayer.getSource().clear();
				existingLayer.getSource().addFeatures(allFeatures);
				if(labelLayer != undefined)
					mapObj.addLayer(labelLayer);
			}
		}
	}
	
	if(labelLayer == undefined){
		var temp_fetr = null;
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == layerName){
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (feature) {
				if(feature.get('id') == param.id){
					temp_fetr= feature;
					if(param.label){
						feature.set('label',param.label);
						feature.getStyle().getText().setText(param.label);
						
					}
					if(param.color){
						feature.getStyle().getText().getFill().setColor(param.color);
					}
					if(param.bgcolor){
						feature.getStyle().getText().getStroke().setColor(param.bgcolor);
					}
				}
				});
				if(temp_fetr != null){
					tmpl_setMap_layer_global[i].layer.getSource().removeFeature(temp_fetr);
					tmpl_setMap_layer_global[i].layer.getSource().addFeature(temp_fetr);
				}
			}
		}
	}

}


tmpl.Feature.changeIcon = function(param)
{
var mapObj = param.map;
var id = param.id;
var layerName = param.layer;
var icon = param.icon;
var image_scale = null;


 var image_scale = param.icon_scale;
	if(image_scale == undefined){
		image_scale = 1;
}

 var lyrs = mapObj.getLayers();
 var length = lyrs.getLength();
 var dataArr = [];
 
 var existing;
 for(var i=0;i<length;i++)
 {
   var lyr1=lyrs.item(i);
   if(lyr1)
   {
    if(lyr1.get('title') === layerName)
    {
      ///
	  existing = lyr1;
      lyr1.getSource().getFeatures().forEach(function (ff){
		if(ff.getProperties().features[0].get('id')== id){
			ff.setStyle(new ol.style.Style({
                    image: new ol.style.Icon(({
                     anchor: [0.5, 1],
                      src: icon,
            			scale : image_scale
                 
                    }))
                	}));
		}
      if(ff.getProperties()['id']==id)
      {
        if(icon)
        {

            var txt = null;

        	if(ff.getStyle().getText())
        		{
                 txt = ff.getStyle().getText().getText();
                 var fillColor = ff.getStyle().getText().getFill().getColor();
                 var strokeColor = ff.getStyle().getText().getStroke().getColor();
                 ff.setStyle(new ol.style.Style({
                          fill: new ol.style.Fill({
                                color: 'rgba(255, 255, 255, 0.2)'
                              }),
                          image: new ol.style.Icon(({
                           anchor: [0.5, 1],
                            src: icon,
                  			scale : image_scale
                          })),
                          text:new ol.style.Text({
                                font: 'Bold' + ' ' + '12px' + ' ' + 'Verdana',
                                textAlign:'center',
                                text : txt,
                                offsetX : 0,
                                offsetY : 0,
                                fill: new ol.style.Fill({
                                  color: fillColor,
                                  width:20
                                  }),
                                stroke : new ol.style.Stroke({
                                 color : strokeColor,
                                 width:8
                                 })
                          })
              }));
        		}
        	else
        		{
        		
                ff.setStyle(new ol.style.Style({
                    image: new ol.style.Icon(({
                     anchor: [0.5, 1],
                      src: icon,
            			scale : image_scale
                 
                    }))
                	}));
        		}


        }
       }

      //
    });
    var alfeatures = lyr1.getSource().getFeatures();
        lyr1.getSource().clear();
        lyr1.getSource().addFeatures(alfeatures);
  }
 }
}

if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == layerName){
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (ff) {
					if(ff.getProperties()['id']==id)
      {
        if(icon)
        {
            var txt = null;

        	if(ff.getStyle().getText())
        		{
                 txt = ff.getStyle().getText().getText();
                 var fillColor = ff.getStyle().getText().getFill().getColor();
                 var strokeColor = ff.getStyle().getText().getStroke().getColor();
                 ff.setStyle(new ol.style.Style({
                          fill: new ol.style.Fill({
                                color: 'rgba(255, 255, 255, 0.2)'
                              }),
                          image: new ol.style.Icon(({
                           anchor: [0.5, 1],
                            src: icon,
                  			scale : image_scale
                          })),
                          text:new ol.style.Text({
                                font: 'Bold' + ' ' + '12px' + ' ' + 'Verdana',
                                textAlign:'center',
                                text : txt,
                                offsetX : 0,
                                offsetY : 0,
                                fill: new ol.style.Fill({
                                  color: fillColor,
                                  width:20
                                  }),
                                stroke : new ol.style.Stroke({
                                 color : strokeColor,
                                 width:8
                                 })
                          })
              }));
        		}
        	else
        		{
        		
                ff.setStyle(new ol.style.Style({
                    image: new ol.style.Icon(({
                     anchor: [0.5, 1],
                      src: icon,
          			scale : image_scale
                    }))
                	}));
                
        		}

        }
       }
				});
				
				
				var alfeatures = tmpl_setMap_layer_global[i].layer.getSource().getFeatures();
				tmpl_setMap_layer_global[i].layer.getSource().clear();
				tmpl_setMap_layer_global[i].layer.getSource().addFeatures(alfeatures);
			}
		}
		
	}

}

tmpl.Layer.changeIcon = function(param)
{
var mapObj = param.map;
var layerName = param.layer;
var icon = param.icon;
var scale = param.icon_scale;
var angle = param.angle;
if(angle == undefined)
	angle = 0;
 var lyrs = mapObj.getLayers();
 var length = lyrs.getLength();
 var dataArr = [];
 
 var existing;
 for(var i=0;i<length;i++)
 {
   var lyr1=lyrs.item(i);
   if(lyr1)
   {
    if(lyr1.get('title') === layerName)
    {
	  existing = lyr1;
      lyr1.getSource().getFeatures().forEach(function (ff){
        if(icon)
        {
             ff.setStyle(new ol.style.Style({
                    
                      image: new ol.style.Icon(({
                       anchor: [0.5, 1],
                        src: icon,
						scale: scale,
						rotation: angle
                      }))
          }));
        }

    });
    var alfeatures = lyr1.getSource().getFeatures();
        lyr1.getSource().clear();
        lyr1.getSource().addFeatures(alfeatures);
  }
 }
}

if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == layerName){
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (ff) {

        if(icon)
        {
             ff.setStyle(new ol.style.Style({
                
                      image: new ol.style.Icon(({
                       anchor: [0.5, 1],
                        src: icon,
						scale: scale,
						rotation: angle
                      }))
          }));
        }
				});
				var alfeatures = tmpl_setMap_layer_global[i].layer.getSource().getFeatures();
				tmpl_setMap_layer_global[i].layer.getSource().clear();
				tmpl_setMap_layer_global[i].layer.getSource().addFeatures(alfeatures);
			}
		}
	}
}

tmpl.Layer.changeRotation = function(param)
{
	var mapObj = param.map;
	var getdata = param.features;
	var layerName = param.layer;
 var existing;

if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == layerName){
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (ff) {
			for(var j=0;j<getdata.length;j++){
				if(ff.get('id') == getdata[j].id){
					var anagle; 
					
					if(getdata[j].ot_track_angle != undefined)
						anagle = getdata[j].ot_track_angle;
					else
						anagle = 0;
					ff.getStyle().getImage().setRotation(anagle);
				}
			}
				});
				var alfeatures = tmpl_setMap_layer_global[i].layer.getSource().getFeatures();
				tmpl_setMap_layer_global[i].layer.getSource().clear();
				tmpl_setMap_layer_global[i].layer.getSource().addFeatures(alfeatures);
			}
		}
		
	}
}

//----------------------------------- End of Feature Updations  ---------------------------------------//

//----------------------------------- Beginning of Layer Updations -------------------------------------//

// **** This function will set the specified postition to the all feature labels  **** //

tmpl.Layer.setLabelPosition = function(param){
	var mapObj = param.map;
	var lyrName = param.layer;
	var offsetY = param.offsety;
	var offsetX = param.offsetx;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var existing;
	for(var i=0;i<length;i++){
		var existingLayer = Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === lyrName){
				existing = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					feature.getStyle().getText().setOffsetY(offsetY);
					feature.getStyle().getText().setOffsetX(offsetX);
				});
				var allFeatures = existingLayer.getSource().getFeatures();
				existingLayer.getSource().clear();
				existingLayer.getSource().addFeatures(allFeatures);
			}
		}
    }
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == lyrName){
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (feature) {
					feature.getStyle().getText().setOffsetY(offsetY);
					feature.getStyle().getText().setOffsetX(offsetX);
				});
				var allFeatures = tmpl_setMap_layer_global[i].layer.getSource().getFeatures();
				tmpl_setMap_layer_global[i].layer.getSource().clear();
				tmpl_setMap_layer_global[i].layer.getSource().addFeatures(allFeatures);
			}
			
		}
		
	}
}

// **** This function will clear the specified Layer data **** //

tmpl.Layer.clearData = function(param) {
    var mapObj = param.map;
    var layerName = param.layer;
    var Layers = mapObj.getLayers();
    var length = Layers.getLength();
    var existingLayer;
    var CircleLayerAttachmentBoolian = false;
    var lyrName_circle = layerName + "_API_CircleLayer";
	if(layerName != undefined){
    for (var i = 0; i < length; i++) {
        var exLayer = Layers.item(i);
		if(exLayer != undefined){
        if (exLayer.get('title') === layerName) {
            existingLayer = exLayer;
            exLayer.getSource().clear();
			exLayer.getSource().clear();
			try{
				mapObj.removeLayer(exLayer);
			}catch(e){
				
			}
            if (exLayer.get('CircleLayerAttached') == true) {
                CircleLayerAttachmentBoolian = true;
                //			console.log("CircleLayerAttachmentBoolian true>>",layerName);
            }

        }
		}
    }
	}
    if (CircleLayerAttachmentBoolian == true) {
        for (var j = 0; j < length; j++) {
            var exLayer2 = Layers.item(j);
            if (exLayer2.get('title') === lyrName_circle) {
                mapObj.removeLayer(exLayer2);
				break;
            }

        }

    }


    //console.log("before",globale_layer_names);
    if (existingLayer == undefined) {
        for (var i = 0; i < tmpl_setMap_layer_global.length; i++) {
            //console.log(tmpl_setMap_layer_global[i].title,layerName,tmpl_setMap_layer_global[i].title == layerName);
            if (tmpl_setMap_layer_global[i].title == layerName) {

                //xyz = tmpl_setMap_layer_global[i];
                tmpl_setMap_layer_global[i].layer.getSource().clear();
                if (global_fleet_layer_id.length > 0) {

                    if (globale_layer_names.indexOf(layerName) != -1) {
                        for (var k = 0; k < global_fleet_layer_id.length; k++) {
                            var lname = global_fleet_layer_id[k].split('fleet_')[1];
                            if (lname != undefined) {
                                lname = lname.split('_')[0];
                                if (lname == layerName) {
                                   // console.log("global_fleet_layer_id[k] >>>",global_fleet_layer_id[k]);
                                    global_fleet_layer_id[k] = '';
                                    global_fleet_layer_features[k] = '';
                                    global_fleet_layer_objects[k] = '';
                                }

                            }
                        }

                    }
                }
            }
        }

    }
    //console.log("after",globale_layer_names);
}

// **** It sets the specified Layer Visibility **** //

tmpl.Layer.changeVisibility = function(param){
	var mapObj = param.map;
	var layerName = param.layer;
	var visibility = param.visible;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var existing;
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		//console.log("first >>",existingLayer.get('title'));
		if(existingLayer){
			if(existingLayer.get('title') === layerName){
				//alert(1);
				existing = existingLayer;
				existingLayer.setVisible(visibility);
			}
		}
	}

	if(existing == undefined){
	
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			
			//console.log("second11 >>",tmpl_setMap_layer_global[i].title,tmpl_setMap_layer_global[i].visibility);
			if(tmpl_setMap_layer_global[i].title == layerName){
				if(visibility == false){
					tmpl_setMap_layer_global[i].layer.setMap(null);
					tmpl_setMap_layer_global[i].visibility = false;
					//alert(2);
				}
				else{
					tmpl_setMap_layer_global[i].layer.setMap(mapObj);
					tmpl_setMap_layer_global[i].visibility = true;
					//alert(3);
				}
			}
			//console.log("second >>",tmpl_setMap_layer_global[i].title,tmpl_setMap_layer_global[i].visibility);
		}
		
	}
}


tmpl.Layer.changeVisibilityCustom = function(param){
	var mapObj = param.map;
	var layerName = param.layer;
	var visibility = param.visible;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	    var lyrName_circle = layerName + "_API_CircleLayer";

	var CircleLayerAttachmentBoolian = false;
	var existing;
	for(i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			for(var j=0;j<layerName.length;j++){
				if(existingLayer.get('title') === layerName[j]){
					existing = existingLayer;
					existingLayer.setVisible(visibility);
		 if (existingLayer.get('CircleLayerAttached') == true) {
                CircleLayerAttachmentBoolian = true;
				 for (var k = 0; k < length; k++) {
            var exLayer2 = Layers.item(k);
			if(exLayer2 != undefined){
				console.log(exLayer2.get('title'),layerName[j]+"_API_CircleLayer");
            if (exLayer2.get('title') == layerName[j]+"_API_CircleLayer") {
                //mapObj.removeLayer(exLayer2);
				//alert();
                exLayer2.setVisible(visibility);

            }
			}
        }
            }
					

				}
			}
		}
	}


	   if (CircleLayerAttachmentBoolian == true) {
       

    }

	//if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			for(var j=0;j<layerName.length;j++){
				if(tmpl_setMap_layer_global[i].title == layerName[j]){
					if(visibility == false){
					tmpl_setMap_layer_global[i].layer.setMap(null);
					tmpl_setMap_layer_global[i].visibility = false;
					}
				else{
					tmpl_setMap_layer_global[i].layer.setMap(mapObj);
					tmpl_setMap_layer_global[i].visibility = true;
					}
				}
			}
		}
		
	//}
}



tmpl.Layer.setIndex = function(param){
	var mapObj = param.map;
	var layers = param.layers;
	var lyrs = mapObj.getLayers();
	var length = lyrs.getLength();
	var layer_existing;
	var existing;
	var layerObjects = [];
	for(var j=0;j<layers.length;j++){
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
				if(tmpl_setMap_layer_global[i].title == layers[j]){
					layerObjects[j] = {};
					layerObjects[j].layer = tmpl_setMap_layer_global[i].layer;
					layerObjects[j].type = 'setmap';
					tmpl_setMap_layer_global[i].layer.setMap(null);
				}
			}
		}
		for(var j=0;j<lyrs.length;j++){
			var ll=lyrs.item(j);
				if(ll.get('title') == layers[j]){
					layerObjects[j] = {};
					layerObjects[j].layer = ll;
					layerObjects[j].type = 'map';
					mapObj.addLayer(ll);
				}
		}
		for(var k=0;k<layerObjects.length;k++){
			if(layerObjects[k] != undefined){
			if(layerObjects[k].type = 'setmap'){
				layerObjects[k].layer.setMap(mapObj);
			}else{
				mapObj.addLayer(layerObjects[k].layer);
			}
			}
		}

}

// tmpl.Layer.setIndex = function(param){
	// var mapObj = param.map;
	// var layerIndex = param.index;
	// var lyrName = param.layer;
	// var lyrs = mapObj.getLayers();
	// var length = lyrs.getLength();
	// var layer_existing;
	// var existing;
	// for(var i=0;i<length;i++){
		// var ll=lyrs.item(i);
		// if(ll){
			// if(ll.get('title') === lyrName){
				// layer_existing = ll;
				// existing = ll;
				// //layer_existing.setZIndex(layerIndex);
				 // var layers = mapObj.getLayers();
  // var index = layers.getArray().indexOf(layer_existing);
  // layers.removeAt(index);
  // layers.insertAt(layerIndex, layer_existing);
			// }
		// }
	// }
	
	// if(existing == undefined){
		// for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			// if(tmpl_setMap_layer_global[i].title == lyrName){
				
				
			// }
		// }
		
	// }

// }

tmpl.Layer.VisibilitySwitcher = function(param)
{
	var mapObj = param.map;
	var id = param.id;
	var layerName = param.layer_name;
  var layer_status = false;
  var status = document.getElementById(id).checked;
  var lyrs = mapObj.getLayers();
  var length = lyrs.getLength();
  for(i=0;i<length;i++)
  {
    var l1=lyrs.item(i);
    if(l1)
    {
      if(l1.get('title') === layerName)
      {
        layer_status=true;
        if(status)
        {
         // console.log("true");
          l1.setVisible(true);
        }
        else
        {
         // console.log("false");
          l1.setVisible(false);
        }
      }           
    }
  }
  if(layer_status == false)
  {
    alert("Invalid Layer Name");
  }
}
//-------------------------------------- End of Layer Updations ----------------------------------------//

// **** It calculates the Extent of Base Map**** //

// tmpl.Extent.calculate = function(param){
	// var mapObj = param.map;
	// var extent;
    // if(appConfigInfo.mapData==='google'){
        // extent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
	// }else{
		// var a = mapObj.getView().calculateExtent(mapObj.getSize());
		// extent =[parseFloat(a[0]),parseFloat(a[1]),parseFloat(a[2]),parseFloat(a[3])];
	// }
    // return extent;
// }
tmpl.Extent.calculate = function(param){
	var mapObj = param.map;
	var extent;
	var a = mapObj.getView().calculateExtent(mapObj.getSize());
	extent =[parseFloat(a[0]),parseFloat(a[1]),parseFloat(a[2]),parseFloat(a[3])];
    if(appConfigInfo.mapData==='google'){
        extent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
	}
    return extent;
}

tmpl.Extent.getExtentOnPan = function(param){
	var mapObj = param.map;
	var flag = param.flag;
	var callbackFunc = param.callbackFunc;
	var extendPanOff = mapObj.get('moveendObjForgetExtendOnPan');
	mapObj.unByKey(extendPanOff);
	if(flag){
		var moveendVrbl= mapObj.on("moveend", function (e) {
			var view_port = mapObj.getView().calculateExtent(mapObj.getSize());
			if(appConfigInfo.mapData==='google'){
				view_port = ol.proj.transformExtent(view_port, 'EPSG:3857', 'EPSG:4326');
			}
			callbackFunc(view_port);
		});
		mapObj.set('moveendObjForgetExtendOnPan',moveendVrbl);
	}
	else{
		var extendPanOff = mapObj.get('moveendObjForgetExtendOnPan');
		if(extendPanOff){
			mapObj.unByKey(extendPanOff);
		}
	}
}


//------------------------------------ Beginning of Measurment Tools -----------------------------------//

tmpl.Measure.distance = function(param){
	var mapObj = param.map;
	var b1 = document.createElement('button');
	b1.title ='Measure Distance';
	b1.className = 'ol-map-measurebtn';
	b1.addEventListener('click', function(){tmpl.Measure.measure({type:"distance",map:mapObj});});
	var md = new ol.control.Control({
        element: b1
    });
	mapObj.addControl(md);
}

tmpl.Measure.area = function(param){
	var mapObj = param.map;
	var b1 = document.createElement('button');
	b1.title ='Measure Area';
	b1.className = 'ol-map-areabtn';
	b1.addEventListener('click', function(){tmpl.Measure.measure({type:"area",map:mapObj});});
	var ma = new ol.control.Control({
        element: b1
    });
	mapObj.addControl(ma);
}

function clearMeasureOverlay(mapObj)
{
	var allOverlays = mapObj.getOverlays();
	for(var i=0;i<allOverlays.getLength();i++){
		var overlay=allOverlays.item(i);
		if(overlay){
			if(overlay.get('olname') === 'measureToolTipOverlay'){
				mapObj.removeOverlay(overlay);
			}
		}
	}
}

tmpl.Measure.clear = function(param){
	var mapObj = param.map;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(var i=0;i<length;i++){
		var existingLayer = Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('lname') === 'vectorMeasureLayer'){
				clearMeasureOverlay(mapObj);
				existingLayer.getSource().clear();
			}
		}	
	}

}

tmpl.Measure.measure = function(param){
	var mapObj = param.map;	
	var measureType = param.type;	
	mapObj.removeInteraction(draw);
	mapObj.removeInteraction(select);

	mapObj.removeInteraction(selectE);


	tmpl.Measure.clear({map:mapObj});
	/*var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(var i=0;i<length;i++){
		var existingLayer = Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('lname') === 'vectorMeasureLayer'){
				//mapObj.removeLayer(existingLayer);
				clearMeasureOverlay(mapObj);
				existingLayer.getSource().clear();
			}
		}	
	}*/
	var source = new ol.source.Vector();
	vectorMeasureLayer = new ol.layer.Vector({
		source: source,
        style: new ol.style.Style({
			fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
				radius: 7,
                fill: new ol.style.Fill({
					color: '#ffcc33'
				})
            })
        })
    });
	vectorMeasureLayer.setProperties({lname:"vectorMeasureLayer"});
	var sketch;
	var measureTooltipElement,measureTooltip;
	var pointerMoveHandler = function(evt) {
        if (evt.dragging) {
            return;
        }
        var tooltipCoord = evt.coordinate;
		if (sketch) {
            var output;
            var geom = (sketch.getGeometry());
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea((geom));
				tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } 
            else if (geom instanceof ol.geom.LineString) {
                output = formatLength((geom));
                tooltipCoord = geom.getLastCoordinate();
            }
			measureTooltipElement.innerHTML = output;
			measureTooltip.setPosition(tooltipCoord);
        }
    };
	mapObj.addLayer(vectorMeasureLayer);
	mapObj.on('pointermove', pointerMoveHandler);
	var typeSelect = measureType;

	function addMeasureInteraction(drawLayer) {
        var type = (typeSelect == 'area' ? 'Polygon' : 'LineString');
        draw = new ol.interaction.Draw({
			source: source,
            type: /** @type {ol.geom.GeometryType} */ (type),
            style: new ol.style.Style({
				fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
					radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
			})
        });
        mapObj.addInteraction(draw);
		createMeasureTooltip();
        draw.on('drawstart',function(evt) {
            sketch = evt.feature;
		}, this);
        draw.on('drawend',function(evt) {
            measureTooltipElement.className = 'tooltip tooltip-static';
            measureTooltip.setOffset([0, -7]);
            sketch = null;
            measureTooltipElement = null;
            createMeasureTooltip();
            mapObj.removeInteraction(draw);            
        }, this);
	}
	function createMeasureTooltip() {
        if (measureTooltipElement) {
            measureTooltipElement.parentNode.removeChild(measureTooltipElement);
		}
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'tooltip tooltip-measure';
        measureTooltip = new ol.Overlay({
        	id : 'tooltip_OverlayID',
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        measureTooltip.setProperties({olname:"measureToolTipOverlay"});
        mapObj.addOverlay(measureTooltip);

	}
	var wgs84Sphere = new ol.Sphere(6378137);
	var formatLength = function(line) {
		var length;
		var coordinates = line.getCoordinates();
		length = 0;
		var sourceProj = mapObj.getView().getProjection();
		for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
			var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
			var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
			length += wgs84Sphere.haversineDistance(c1, c2);
		}
		var output;
		if (length > 100) {
			output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
		} 
		else {
			output = (Math.round(length * 100) / 100) +  ' ' + 'm';
		}
		return output;
	};
	var formatArea = function(polygon) {
        var area;
        var sourceProj = mapObj.getView().getProjection();
		var geom = /** @type {ol.geom.Polygon} */(polygon.clone().transform(
        sourceProj, 'EPSG:4326'));
        var coordinates = geom.getLinearRing(0).getCoordinates();
        area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
        var output;
        if (area > 10000) {
			output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
        }
        return output;
    };                
	addMeasureInteraction();
}


//--------------------------------------- End of Measurment Tools --------------------------------------//

//----------------------------------- Beginning of Information Tool ------------------------------------//

tmpl.Tooltip.add = function(param){
	var mapObj = param.map;	
	var offset = param.offset;	
	var coord = param.coordinate;	
	var featureDatas = param.html;	
	var position;
	var allOverlays = mapObj.getOverlays();
	for(var i=0;i<allOverlays.getLength();i++){
		overlay=allOverlays.item(i);
		if(overlay){
			if(overlay.get('olname') === 'custToolTipOverlay'){
				mapObj.removeOverlay(overlay);
			}
		}
	}
	var popup = new ol.Overlay.Popup({
        insertFirst: false, 
        panMapIfOutOfView : true
    });
	popup.setOffset(offset);
	popup.setProperties({olname:"custToolTipOverlay"});
	mapObj.addOverlay(popup);
	if(appConfigInfo.mapData==='google'){
		position =  ol.proj.transform([coord[0],coord[1]], 'EPSG:4326', 'EPSG:3857');
	}
	else{
		position = coord;
	}
	popup.show(position,featureDatas);
}

tmpl.Tooltip.addMultiple = function(param){
	var mapObj = param.map;	
	var offset = param.offset;	
	var coord = param.coordinate;	
	var featureDatas = param.html;	
	var position;
	/*var allOverlays = mapObj.getOverlays();
	for(var i=0;i<allOverlays.getLength();i++){
		overlay=allOverlays.item(i);
		if(overlay){
			if(overlay.get('olname') === 'custToolTipOverlay'){
				mapObj.removeOverlay(overlay);
			}
		}
	}*/
	var popup = new ol.Overlay.Popup({
        insertFirst: false, 
        panMapIfOutOfView : true
    });
	popup.setOffset(offset);
	popup.setProperties({olname:"custToolTipOverlayMultiple"});
	mapObj.addOverlay(popup);
	if(appConfigInfo.mapData==='google'){
		position =  ol.proj.transform([coord[0],coord[1]], 'EPSG:4326', 'EPSG:3857');
	}
	else{
		position = coord;
	}
	popup.show(position,featureDatas);
	return popup;
}

tmpl.Tooltip.remove = function(param){
	var mapObj = param.map;	
	var overlay;
	var allOverlays = mapObj.getOverlays();
	for(var i=0;i<allOverlays.getLength();i++){
		overlay=allOverlays.item(i);
		if(overlay){
			if(overlay.get('olname') === 'custToolTipOverlay'){
				overlay.setPosition(undefined);
			}
		}
	}
}

//--------------------------------------- End of Information Tool --------------------------------------//




tmpl.Create.getPointFeature = function(param){
var mapObj = param.map;
var lat = param.latitude;
var lon = param.longitude;
var geometry;

      if(appConfigInfo.mapData==='google')
      {
         geometry = new ol.geom.Point(ol.proj.transform([parseFloat(lon), parseFloat(lat)], 'EPSG:4326', 'EPSG:3857'));
      }
      else
      {
         var cor = [parseFloat(lon), parseFloat(lat)];
         geometry = new ol.geom.Point(cor);
        
      }

var featureval = new ol.Feature({
                   geometry     : geometry
              });


  return featureval;
}

tmpl.Pan.toCenter = function(param){
	var mapObj = param.map;
	// var point = ol.proj.transform([location[0], location[1]], 'EPSG:4326', 'EPSG:3857');

	
	if(appConfigInfo.mapData==='google'){
		 var point = ol.proj.fromLonLat([parseFloat(appConfigInfo.lon), parseFloat(appConfigInfo.lat)]);
		//console.log(point);
	}
      else{
      	var point = ol.proj.fromLonLat(ol.proj.transform([parseFloat(appConfigInfo.lon), parseFloat(appConfigInfo.lat)], 'EPSG:3857', 'EPSG:4326'));
      //var point = ol.proj.fromLonLat([parseFloat(appConfigInfo.lon), parseFloat(appConfigInfo.lat)]);
		//console.log(point);
      }
	var pan = ol.animation.pan({
		duration: 3000,
        source: mapObj.getView().getCenter()
    });
    mapObj.beforeRender(pan);
    mapObj.getView().setCenter(point);
}

tmpl.Info.getPlace = function(param){
	tmpl.Info.getPlaceFlag = true;
	tmpl.Info.getPlace.CallbackFunc = param.callbackFunc;
}

tmpl.Info.removeGetPlace = function(){
	tmpl.Info.getPlaceFlag = false;
	tmpl.Info.getPlace.CallbackFunc = function(){};
}

tmpl.Google.addTrafficLayer = function(param)
{
	var mapObj = param.map;
    var gTrafficOn = mapObj.get('olgmObj');
    var gmap = gTrafficOn.getGoogleMapsMap();
    var trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(gmap);
    mapObj.set('trafficLayerObj',trafficLayer);
}
tmpl.Google.removeTrafficLayer = function(param){
	var mapObj = param.map;
	 var gTrafcOff = mapObj.get('trafficLayerObj');
    if(gTrafcOff)
    {
      gTrafcOff.setMap(null);
    }
}

tmpl.Google.addWeatherLayer = function(param){
	var mapObj = param.map;
	var gWeatherOn = mapObj.get('olgmObj');
    var gmap = gWeatherOn.getGoogleMapsMap();
	var weatherLayer = new google.maps.weather.WeatherLayer({
	  temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
	});
	weatherLayer.setMap(gmap);
    mapObj.set('weatherLayerObj',weatherLayer);
}

// ************************************ POI Creation *****************************************//
tmpl.POI.getCategories = function(){	
	var categories = [{id:1,text:'Admimistrative Office'},
	{id:2,text:'Airport'},
	{id:3,text:'Ambulance Service'},
	{id:13,text:'Apartment'},
	{id:4,text:'Art Gallery'},
	{id:60,text:'Atm'},
	{id:5,text:'Auditorium'},
	{id:6,text:'Bank'},
	{id:7,text:'Blood Bank'},
	{id:8,text:'Bus Stand'},
	{id:9,text:'Categories'},
	{id:10,text:'Checkpost'},
	{id:11,text:'Cinema Theatre'},
	{id:12,text:'Clinic'},
	{id:14,text:'Companies'},
	{id:15,text:'Court'},
	{id:16,text:'Educational Institute'},
	{id:17,text:'Educational Others'},
	{id:18,text:'Fire Station'},
	{id:19,text:'Garden'},
	{id:20,text:'Govt Intstitutions'},
	{id:21,text:'Govt Office'},
	{id:22,text:'Helipads'},
	{id:23,text:'Historical Places'},
	{id:24,text:'Hospital'},
	{id:25,text:'Hostel'},
	{id:26,text:'Hotel Restaurant'},
	{id:27,text:'Industrial Area'},
	{id:28,text:'Information Centre'},
	{id:29,text:'Jail'},
	{id:30,text:'Jewellery Location'},
	{id:31,text:'Library'},
	{id:32,text:'Market'},
	{id:33,text:'Medical Shop'},
	{id:34,text:'Museum'},
	{id:35,text:'Office'},
	{id:36,text:'Other Police Installations'},
	{id:37,text:'Others'},
	{id:38,text:'Park'},
	{id:39,text:'Parking Lot'},
	{id:40,text:'Petrol Pump'},
	{id:41,text:'Place Worship'},
	{id:42,text:'Police Chowki'},
	{id:43,text:'Police Head Quarters'},
	{id:44,text:'Police Station'},
	{id:45,text:'Postoffice'},
	{id:46,text:'Prohibitedarea'},
	{id:47,text:'Pub Bar'},
	{id:48,text:'Railway Reservation Centre'},
	{id:49,text:'Railway Track'},
	{id:50,text:'Residence'},
	{id:61,text:'Restaurant'},
	{id:51,text:'Shelter Locations'},
	{id:52,text:'Shopping Complex'},
	{id:53,text:'Showroom'},
	{id:54,text:'Stadium'},
	{id:55,text:'Substation'},
	{id:56,text:'Touristspot'},
	{id:57,text:'Travel Agency'},
	{id:58,text:'Vip Buildings'},
	{id:59,text:'Waterbodies'}
	]
	return categories;
}
var POI_img_src = [{id:1,name:'admimistrative_office',img_url : 'poi/civic_building.png'},
	{id:2,name:'airport',img_url : 'poi/airport.png'},
	{id:3,name:'ambulance_service',img_url : 'poi/others.png'},
	{id:4,name:'art_gallery',img_url : 'poi/art_gallery.png'},
	{id:5,name:'auditorium',img_url : 'poi/others.png'},
	{id:6,name:'bank',img_url : 'poi/others.png'},
	{id:7,name:'blood_bank',img_url : 'poi/others.png'},
	{id:8,name:'bus_stand',img_url : 'poi/bus.png'},
	{id:9,name:'categories',img_url : 'poi/others.png'},
	{id:10,name:'checkpost',img_url : 'poi/others.png'},
	{id:11,name:'cinema_theatre',img_url : 'poi/movies.png'},
	{id:12,name:'clinic',img_url : 'poi/others.png'},
	{id:13,name:'colony_apartment_guest_house_bungalow',img_url : 'poi/civic_building.png'},
	{id:14,name:'companies',img_url : 'poi/others.png'},
	{id:15,name:'court',img_url : 'poi/courthouse.png'},
	{id:16,name:'educational_institute',img_url : 'poi/others.png'},
	{id:17,name:'educational_others',img_url : 'poi/others.png'},
	{id:18,name:'fire_station',img_url : 'poi/others.png'},
	{id:19,name:'garden',img_url : 'poi/others.png'},
	{id:20,name:'govt_intstitutions',img_url : 'poi/others.png'},
	{id:21,name:'govt_office',img_url : 'poi/others.png'},
	{id:22,name:'helipads',img_url : 'poi/others.png'},
	{id:23,name:'historical_places',img_url : 'poi/historic.png'},
	{id:24,name:'hospital',img_url : 'poi/doctor.png'},
	{id:25,name:'hostel',img_url : 'poi/others.png'},
	{id:26,name:'hotel_restaurant',img_url : 'poi/lodging.png'},
	{id:27,name:'industrial_area',img_url : 'poi/others.png'},
	{id:28,name:'information_centre',img_url : 'poi/others.png'},
	{id:29,name:'jail',img_url : 'poi/others.png'},
	{id:30,name:'jewellery_location',img_url : 'poi/jewelry.png'},
	{id:31,name:'library',img_url : 'poi/library.png'},
	{id:32,name:'market',img_url : 'poi/others.png'},
	{id:33,name:'medical_shop',img_url : 'poi/others.png'},
	{id:34,name:'museum',img_url : 'poi/museum.png'},
	{id:35,name:'office',img_url : 'poi/others.png'},
	{id:36,name:'other_police_installations',img_url : 'poi/others.png'},
	{id:37,name:'others',img_url : 'poi/others.png'},
	{id:38,name:'park',img_url : 'poi/amusement.png'},
	{id:39,name:'parking_lot',img_url : 'poi/others.png'},
	{id:40,name:'petrol_pump',img_url : 'poi/others.png'},
	{id:41,name:'place_worship',img_url : 'poi/worship_general.png'},
	{id:42,name:'police_chowki',img_url : 'poi/others.png'},
	{id:43,name:'police_head_quarters',img_url : 'poi/others.png'},
	{id:44,name:'police_station',img_url : 'poi/police.png'},
	{id:45,name:'postoffice',img_url : 'poi/post_office.png'},
	{id:46,name:'prohibitedarea',img_url : 'poi/others.png'},
	{id:47,name:'pub_bar',img_url : 'poi/bar.png'},
	{id:48,name:'railway_reservation_centre',img_url : 'poi/train.png'},
	{id:49,name:'railway_track',img_url : 'poi/others.png'},
	{id:50,name:'residence',img_url : 'poi/others.png'},
	{id:51,name:'shlter_locations',img_url : 'poi/others.png'},
	{id:52,name:'shopping_complex',img_url : 'poi/shopping.png'},
	{id:53,name:'showroom',img_url : 'poi/others.png'},
	{id:54,name:'stadium',img_url : 'poi/stadium.png'},
	{id:55,name:'substation',img_url : 'poi/others.png'},
	{id:56,name:'touristspot',img_url : 'poi/others.png'},
	{id:57,name:'travel_agency',img_url : 'poi/others.png'},
	{id:58,name:'vip_buildings',img_url : 'poi/others.png'},
	{id:59,name:'waterbodies',img_url : 'poi/others.png'},
	{id:60,name:'atm',img_url : 'poi/atm.png'},
	{id:61,name:'restaurant',img_url : 'poi/supermarket.png'}]

var drawVector_POI,draw_POI;
tmpl.POI.clearIcon = function(){
	if(drawVector_POI != undefined)
	drawVector_POI.getSource().clear();
}
tmpl.POI.add = function(param){
	var mapObj = param.map;
	tmpl.POI.clearInteractions({map : mapObj});
	//var html = param.html;
	//var offset = param.offset;
	var callbackFunc = param.callbackFunc;
	
	var Layers = mapObj.getLayers();
	var noLayer = false;
	  for(var i=0;i<Layers.getLength();i++){
		var tempLayer=Layers.item(i);
		if(tempLayer.get('lname') === 'drawVector_POI'){
			noLayer = true;
        }
    }
    if (!noLayer) {
		drawVector_POI = new ol.layer.Vector({
				source: new ol.source.Vector(),
				style: new ol.style.Style({
					image: new ol.style.Icon({
						anchor: [0.5, 1],
						src : param.img_url
					})
				})
			});
		drawVector_POI.setProperties({lname:"drawVector_POI"});
		mapObj.addLayer(drawVector_POI);
	}
		drawVector_POI.getSource().clear();
		mapObj.removeInteraction(draw_POI);
		//tmpl.Tooltip.remove({map : mapObj});
		draw_POI = new ol.interaction.Draw({
           // source: drawVector_POI.getSource(),
            type: "Point"
        });
        mapObj.addInteraction(draw_POI);
        draw_POI.on('drawend', function(event){
           var feature = event.feature;
       	var point_cor;
    	if(appConfigInfo.mapData==='google')		{
    		point_cor =ol.proj.transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
    		}
    	else
    		{
    		point_cor =feature.getGeometry().getCoordinates();
    		}
           
		//	var point = ol.proj.transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
			feature.setProperties({poi:"poi"});
			drawVector_POI.getSource().addFeature(feature);
			mapObj.removeInteraction(draw_POI);
	var point = {
		coordinates : point_cor
	};
		callbackFunc(point);
		
	});
}
var POI_Layer_save;
tmpl.POI.save = function(param){
	var mapObj = param.map;
	var poi_id = param.properties['POI_Category_Id'];
	var feature = drawVector_POI.getSource().getFeatures()[0];
	feature.setProperties(param.properties);
	feature.set('id',param.properties.POI_Id);
	var cor;
	if(appConfigInfo.mapData==='google')		{
		 cor =ol.proj.transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
		}
	else
		{
		 cor =feature.getGeometry().getCoordinates();
		}
	//var cor = ol.proj.transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326')
	feature.set('Latitude',cor[1]);
	feature.set('Longitude',cor[0]);
	if(param.properties['img_url'] == 'none'){
	var img_src = appConfigInfo.poi_img_url+'/'+poi_id+'.png';
		feature.setStyle( new ol.style.Style({
			image: new ol.style.Icon({	
				anchor: [0.5, 1],			
				src : img_src
			}),
			text:new ol.style.Text({
				font: 'Bold' + ' ' + '10px' + ' ' + 'Verdana',
                //textAlign:'center',
				offset : param.label.offset,
                text : param.properties['POI_Name'],
                fill: new ol.style.Fill({
					color : param.label.fill_color
                }),
                stroke : new ol.style.Stroke({
                    color : param.label.stroke_color,
                    width : param.label.width
                })
            })
		}));
	}else{
		feature.setStyle( new ol.style.Style({
			image: new ol.style.Icon({	
				anchor: [0.5, 1],			
				src : param.properties['img_url']
			}),
			text:new ol.style.Text({
				font: 'Bold' + ' ' + '10px' + ' ' + 'Verdana',
                //textAlign:'center',
				offset : param.label.offset,
                text : param.properties['POI_Name'],
                fill: new ol.style.Fill({
					color : param.label.fill_color
                }),
                stroke : new ol.style.Stroke({
                    color : param.label.stroke_color,
                    width : param.label.width
                })
            })
		}));
	}
	if(POI_Layer_save_flag == false){
		POI_Layer_save = new ol.layer.Vector({
			source: new ol.source.Vector({
				features : [feature]
			})
		});
		mapObj.addLayer(POI_Layer_save);
		POI_Layer_save.setProperties({lname:"POI_Layer_POI"});
		POI_Layer_save.setProperties({title:"POI_Layer"});
		POI_Layer_save_flag = true;
	}else{
		POI_Layer_save.getSource().addFeature(feature);
	}
	tmpl.POI.clearIcon();
}
var intr;
var POI_Layer = new ol.layer.Vector({source: new ol.source.Vector()}), POI_Layer_flag = false,POI_Layer_save_flag = false,draw_POI_flag =  false;

tmpl.POI.clearAll = function(){
	POI_Layer.getSource().clear();
	if(POI_Layer_save != undefined)
	POI_Layer_save.getSource().clear();
}

tmpl.POI.showAll = function(param){
	var mapObj = param.map;
	
	if(POI_Layer_save_flag == true)
	POI_Layer_save.getSource().clear();
	if(draw_POI_flag == true)
	mapObj.removeInteraction(draw_POI);
	tmpl.POI.clearIcon();
	tmpl.POI.clearInteractions({map : mapObj});
	var pois = param.poi;
	var featureArray = [];
	for(var i=0;i<pois.length;i++){
		var poi_id = pois[i]['POI_Category_Id'];
		var img_src = appConfigInfo.poi_img_url+'/'+poi_id+'.png';
		//console.log(img_src);
		var cor;
		if(appConfigInfo.mapData==='google')		{
			 cor = ol.proj.transform([pois[i]['Longitude'],pois[i]['Latitude']], 'EPSG:4326', 'EPSG:3857');
			}
		else
			{
			 cor =[pois[i]['Longitude'],pois[i]['Latitude']];
			}
		// var cor = ol.proj.transform([pois[i]['Longitude'],pois[i]['Latitude']], 'EPSG:4326', 'EPSG:3857');
		var pointGeom = new ol.geom.Point(cor);
        var feature = new ol.Feature({
            geometry : pointGeom,
			Latitude : pois[i]['Latitude'],
			Longitude : pois[i]['Longitude'],
			POI_Category_Id : pois[i]['POI_Category_Id'],
			POI_Category_Name : pois[i]['POI_Category_Name'],
			POI_Id : pois[i]['POI_Id'],
			POI_Name : pois[i]['POI_Name'],
			img_url : pois[i]['img_url'],
			id : pois[i]['POI_Id'],
			layer_name : 'POI_Layer',
			lname : 'POI_Layer_POI'
		});
		//console.log(param.label.offset);
		//console.log(pois[i]['img_url'] == 'none');
		if(pois[i]['img_url'] == 'none'){
		feature.setStyle( new ol.style.Style({
			image: new ol.style.Icon({
				anchor: [0.5, 1],				
				src : img_src
			}),
			text:new ol.style.Text({
				font: 'Bold' + ' ' + '10px' + ' ' + 'Verdana',
                textAlign:'center',
				offset : param.label.offset,
                text : pois[i]['POI_Name'],
                fill: new ol.style.Fill({
					color : param.label.fill_color
                }),
                stroke : new ol.style.Stroke({
                    color : param.label.stroke_color,
                    width : param.label.width
                    //width : 8
                })
            })
		})
		);
		}else{
			feature.setStyle( new ol.style.Style({
			image: new ol.style.Icon({
				anchor: [0.5, 1],				
				src : pois[i]['img_url']
			}),
			text:new ol.style.Text({
				font: 'Bold' + ' ' + '10px' + ' ' + 'Verdana',
                textAlign:'center',
				offset : param.label.offset,
                text : pois[i]['POI_Name'],
                fill: new ol.style.Fill({
					color : param.label.fill_color
                }),
                stroke : new ol.style.Stroke({
                    color : param.label.stroke_color,
                    width : param.label.width
                })
            })
		})
		);
		}
		featureArray.push(feature);
	}
	//alert("before layer creation");
	if(POI_Layer_flag ==  false){
		//alert("create layer");
		POI_Layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features : featureArray
			})
		});
		POI_Layer.setProperties({lname:"POI_Layer_POI"});
		POI_Layer.setProperties({title:"POI_Layer"});
		//mapObj.addLayer(POI_Layer);
		POI_Layer.setMap(mapObj);
		tmpl_setMap_layer_global.push({
			layer : POI_Layer,
			title :  'POI_Layer',
			visibility : true,
			map : mapObj
		});
		POI_Layer_flag = true;
	//}
		
	}else{
		//alert("existing layer-update data");
		for(var j=0;j<tmpl_setMap_layer_global.length;j++){
			if(tmpl_setMap_layer_global[j].title == "POI_Layer"){
				tmpl_setMap_layer_global[j].layer.getSource().clear();
				tmpl_setMap_layer_global[j].layer.getSource().addFeatures(featureArray);
			}
		}
		//POI_Layer.getSource().clear();
		//POI_Layer.getSource().addFeatures(featureArray);
	}
	//mapObj.addLayer(POI_Layer);
		
	
}
tmpl.POI.saveEdit = function(param){
	var mapObj = param.map;
	if(POI_Layer_save_flag == true){
	for(var i=0;i<POI_Layer_save.getSource().getFeatures().length;i++){
		var existingFeature = POI_Layer_save.getSource().getFeatures()[i];
		if(existingFeature.get('POI_Id') == param.properties.POI_Id){
			var poi_id = param.properties['POI_Category_Id'];
			var img_src = appConfigInfo.poi_img_url+'/'+poi_id+'.png';
			if(param.properties['img_url'] == 'none'){
			existingFeature.setStyle( new ol.style.Style({
			image: new ol.style.Icon({	
				anchor: [0.5, 1],				
				src : img_src
			}),
			text:new ol.style.Text({
				font: 'Bold' + ' ' + '10px' + ' ' + 'Verdana',
                textAlign:'center',
				offset : param.label.offset,
                text : param.properties['POI_Name'],
                fill: new ol.style.Fill({
					color : param.label.fill_color
                }),
                stroke : new ol.style.Stroke({
                    color : param.label.stroke_color,
                    width : param.label.width
                })
            })
			}));
			existingFeature.set("POI_Name",param.properties['POI_Name']);
			existingFeature.set("POI_Category_Id",param.properties['POI_Category_Id']);
			existingFeature.set("POI_Category_Name",param.properties['POI_Category_Name']);
			var cor;
			if(appConfigInfo.mapData==='google')		{
				 cor =  ol.proj.transform(existingFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
				}
			else
				{
				 cor = existingFeature.getGeometry().getCoordinates();
				}
			//var cor = ol.proj.transform(existingFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
			existingFeature.set("Latitude",cor[1]);
			existingFeature.set("Longitude",cor[0]);
			
			}else{
				
				existingFeature.setStyle( new ol.style.Style({
			image: new ol.style.Icon({	
				anchor: [0.5, 1],
				src : param.properties['img_url']
			}),
			text:new ol.style.Text({
				font: 'Bold' + ' ' + '10px' + ' ' + 'Verdana',
                textAlign:'center',
				offset : param.label.offset,
                text : param.properties['POI_Name'],
                fill: new ol.style.Fill({
					color : param.label.fill_color
                }),
                stroke : new ol.style.Stroke({
                    color : param.label.stroke_color,
                    width : param.label.width
                })
            })
		}));
		existingFeature.set("POI_Name",param.properties['POI_Name']);
			existingFeature.set("POI_Category_Id",param.properties['POI_Category_Id']);
			existingFeature.set("POI_Category_Name",param.properties['POI_Category_Name']);
			var cor;
			if(appConfigInfo.mapData==='google')		{
				 cor =ol.proj.transform(existingFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
				}
			else
				{
				 cor =existingFeature.getGeometry().getCoordinates();
				}
			//var cor = ol.proj.transform(existingFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
			existingFeature.set("Latitude",cor[1]);
			existingFeature.set("Longitude",cor[0]);
			}
	}
	}
	var features = POI_Layer_save.getSource().getFeatures();
	POI_Layer_save.getSource().clear();
	POI_Layer_save.getSource().addFeatures(features);
	}
	if(POI_Layer_flag == true){
		for(var i=0;i<POI_Layer.getSource().getFeatures().length;i++){
		var existingFeature = POI_Layer.getSource().getFeatures()[i];
		if(existingFeature.get('POI_Id') == param.properties.POI_Id){
			var poi_id = param.properties['POI_Category_Id'];
			var img_src = appConfigInfo.poi_img_url+'/'+poi_id+'.png';
			if(param.properties['img_url'] == 'none'){
			existingFeature.setStyle( new ol.style.Style({
			image: new ol.style.Icon({	
				anchor: [0.5, 1],
				src : img_src
			}),
			text:new ol.style.Text({
				font: 'Bold' + ' ' + '10px' + ' ' + 'Verdana',
                textAlign:'center',
				offset : param.label.offset,
                text : param.properties['POI_Name'],
                fill: new ol.style.Fill({
					color : param.label.fill_color
                }),
                stroke : new ol.style.Stroke({
                    color : param.label.stroke_color,
                    width : param.label.width
                })
            })
			}));
			existingFeature.set("POI_Name",param.properties['POI_Name']);
			existingFeature.set("POI_Category_Id",param.properties['POI_Category_Id']);
			existingFeature.set("POI_Category_Name",param.properties['POI_Category_Name']);
			var cor;
			if(appConfigInfo.mapData==='google')		{
				 cor = ol.proj.transform(existingFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
				}
			else
				{
				 cor =existingFeature.getGeometry().getCoordinates();
				}
			//var cor = ol.proj.transform(existingFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
			existingFeature.set("Latitude",cor[1]);
			existingFeature.set("Longitude",cor[0]);
			}else{
				
				existingFeature.setStyle( new ol.style.Style({
			image: new ol.style.Icon({	
				anchor: [0.5, 1],
				src : param.properties['img_url']
			}),
			text:new ol.style.Text({
				font: 'Bold' + ' ' + '10px' + ' ' + 'Verdana',
                textAlign:'center',
				offset : param.label.offset,
                text : param.properties['POI_Name'],
                fill: new ol.style.Fill({
					color : param.label.fill_color
                }),
                stroke : new ol.style.Stroke({
                    color : param.label.stroke_color,
                    width : param.label.width
                })
            })
		}));
		existingFeature.set("POI_Name",param.properties['POI_Name']);
			existingFeature.set("POI_Category_Id",param.properties['POI_Category_Id']);
			existingFeature.set("POI_Category_Name",param.properties['POI_Category_Name']);
			var cor;
			if(appConfigInfo.mapData==='google')		{
				 cor =  ol.proj.transform(existingFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
				}
			else
				{
				 cor = existingFeature.getGeometry().getCoordinates();
				}
			//var cor = ol.proj.transform(existingFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
			existingFeature.set("Latitude",cor[1]);
			existingFeature.set("Longitude",cor[0]);
			}
		}
	}
	var features = POI_Layer.getSource().getFeatures();
	POI_Layer.getSource().clear();
	POI_Layer.getSource().addFeatures(features);
	}
	previousEditFeture = undefined;
	mapObj.removeInteraction(intr);
}



tmpl.POI.saveApprovedPOI = function(param){
	var datas = param.data;
	var urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/ps/incClientPoi/"+datas.name+"/"+datas.category+"/"+datas.latitude+"/"+datas.longitude+"/"+datas.category_id+"/1/ghhh/0";
	$.ajax({
	    url: urlL,
	    success: function(data){
	    	console.log(data);
	    },
	    error: function(jqxhr) {
           //alert("saveApprovedPOI not working");
      	}
	});
}

tmpl.Overlay.displayApprovedPOI = function(param){
	var mapObj = param.map;
	var layerName = param.layer;
	var img_url = param.img_url;
	var label_color = param.label_color;
	var label_bgcolor = param.label_bgcolor;
if(label_color == undefined)
label_color = "#fff";

if(label_bgcolor == undefined)
label_bgcolor = "#000";

	var objNew = [];
	var layerApprovedPOI = [];	
	var urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/ps/ClientPoi";
	$.ajax({
	       type: 'GET', 
	       url: urlL,
	          success: function(data){		          	
	          	for(var i=0;i<data.length;i++){
					objNew[i] = {};
		            var obj = data[i];
		            objNew[i].id = obj.id;
					objNew[i].name = obj.name;
            		objNew[i].lat = obj.latitude;
					objNew[i].lon = obj.longitude;
					objNew[i].category = obj.category;
					objNew[i].category_id = obj.category_id;
					objNew[i].approved = obj.approved;
					objNew[i].is_rejected = obj.is_rejected;
					objNew[i].create_datetime = obj.create_datetime;
					objNew[i].img_url = img_url;
					objNew[i].label = obj.name;		
		            layerApprovedPOI.push(objNew[i]);		            	 
		        }
	          	
	var jsonobj = layerApprovedPOI;

	var getdata = jsonobj;
		var featureDataAry = [];
    for (var i = 0, length = getdata.length; i < length; i++){
		var geometry;
		var iconStyle = new ol.style.Icon( ({
                src: getdata[i].img_url,
				anchor: [0.5, 1]
            }));
		if(appConfigInfo.mapData==='google'){
			geometry = new ol.geom.Point(ol.proj.transform([parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)], 'EPSG:4326', 'EPSG:3857'));
		}
		else{
			var coordinate = [parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)];
			geometry = new ol.geom.Point(coordinate);
		}
		var featureval = new ol.Feature({
            geometry     : geometry
        });
		featureval.setProperties(getdata[i]);
		featureval.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            image: iconStyle,
			text:new ol.style.Text({
				font: 'Bold' + ' ' + '12px' + ' ' + 'Verdana',
                textAlign:'center',
                text : getdata[i].name,
                fill: new ol.style.Fill({
					color: label_color,
					width:20
                }),
                stroke : new ol.style.Stroke({
                    color : label_bgcolor,
                    width:6
                })
            })
		}));
		featureval.set('layer_name',layerName);
		featureDataAry.push(featureval);
}
	var source=  new ol.source.Vector({
        features: featureDataAry
    });
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var OverlayisLayerPresent = false;
	for(var i=0;i<length;i++){
		var layerTemp = Layers.item(i);
//console.log(layerTemp.get('title') , layerName);
		if(layerTemp.get('title') == layerName){
			OverlayisLayerPresent = true;
			layerTemp.getSource().addFeatures(featureDataAry);
		}
	}
	if (OverlayisLayerPresent == false) {
		var overlay = new ol.layer.Vector({
            title: layerName,
            visible: true,
            source: source
        });
		mapObj.addLayer(overlay);
		OverlayisLayerPresent = true;
	}
	
	          },
	          error: function(jqxhr) {
		           //alert("load ApprovedPOI not working");
		      }
	});
}



tmpl.POI.cancelEdit = function(param){

	var mapObj = param.map;
	//console.log(POI_Layer_save_flag,POI_Layer_flag);
	if(POI_Layer_save_flag == true){
	for(var i=0;i<POI_Layer_save.getSource().getFeatures().length;i++){
		var existingFeature = POI_Layer_save.getSource().getFeatures()[i];
		//console.log(POI_Layer_save.getSource().getFeatures().length);
		if(existingFeature.get('POI_Id') == param.POI_Id){
			//console.log(existingFeature.getProperties());
			var latitude = existingFeature.get('Latitude');
			var longitude = existingFeature.get('Longitude');
			var cor;
			if(appConfigInfo.mapData==='google')		{
				 cor = ol.proj.transform([longitude,latitude], 'EPSG:4326', 'EPSG:3857');
				}
			else
				{
				 cor =[longitude,latitude];
				}
			//var cor = ol.proj.transform([longitude,latitude], 'EPSG:4326', 'EPSG:3857');
			existingFeature.getGeometry().setCoordinates(cor);
		}
	}
	// var features = POI_Layer_save.getSource().getFeatures();
	// POI_Layer_save.getSource().clear();
	// POI_Layer_save.getSource().addFeatures(features);
	}
	if(POI_Layer_flag == true){
		for(var i=0;i<POI_Layer.getSource().getFeatures().length;i++){
		var existingFeature = POI_Layer.getSource().getFeatures()[i];
		//console.log(existingFeature.get('POI_Id'),param.POI_Id);
		if(existingFeature.get('POI_Id') == param.POI_Id){
			//console.log(existingFeature.getProperties());
			var latitude = existingFeature.get('Latitude');
			var longitude = existingFeature.get('Longitude');
			var cor;
			if(appConfigInfo.mapData==='google')		{
				 cor = ol.proj.transform([longitude,latitude], 'EPSG:4326', 'EPSG:3857');
				}
			else
				{
				 cor =[longitude,latitude];
				}
			//var cor = ol.proj.transform([longitude,latitude], 'EPSG:4326', 'EPSG:3857');
			existingFeature.getGeometry().setCoordinates(cor);
		}
	}
	// var features = POI_Layer.getSource().getFeatures();
	// POI_Layer.getSource().clear();
	// POI_Layer.getSource().addFeatures(features);
	}
	 mapObj.removeInteraction(intr);
}
tmpl.POI.edit = function(param){
	var mapObj = param.map;
	mycallback = param.callbackFunc;
	var point,editFeature,coordinate,previousEditFeture = undefined;
	if(draw_POI != undefined)
		tmpl.POI.clearInteractions({map : mapObj});
  var coordinates,lonlat;
  var  wktGeom;
  var format = new ol.format.WKT();
  //tmpl.Tooltip.remove({map : mapObj});
  window.app = {};
  var app = window.app;

  app.Drag = function() {
    ol.interaction.Pointer.call(this, {
      handleDownEvent: app.Drag.prototype.handleDownEvent,
      handleDragEvent: app.Drag.prototype.handleDragEvent,
      handleMoveEvent: app.Drag.prototype.handleMoveEvent,
      handleUpEvent: app.Drag.prototype.handleUpEvent
    });
    this.coordinate_ = null;
    this.cursor_ = 'pointer';
    this.feature_ = null;
    this.previousCursor_ = undefined;
  };
  ol.inherits(app.Drag, ol.interaction.Pointer);

  app.Drag.prototype.handleDownEvent = function(evt) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {
			if(layer == null){
				if(feature.get('lname') == 'POI_Layer_POI'){
					return feature;
				}
			}else if(layer.get('lname') == "POI_Layer_POI"){
					return feature;
			}

          });
      if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
      }
      return !!feature;
  };

  app.Drag.prototype.handleDragEvent = function(evt) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {    
            return feature;
          });
      var deltaX = evt.coordinate[0] - this.coordinate_[0];
      var deltaY = evt.coordinate[1] - this.coordinate_[1];
      var geometry = 
          (this.feature_.getGeometry());
      geometry.translate(deltaX, deltaY);
      this.coordinate_[0] = evt.coordinate[0];
      this.coordinate_[1] = evt.coordinate[1];
  };

  app.Drag.prototype.handleMoveEvent = function(evt) {
      if (this.cursor_) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
              return feature;
            });
        var element = evt.map.getTargetElement();
        if (feature) {
			editFeature = feature;
			point = feature.getGeometry().getCoordinates();
			var point;
			if(appConfigInfo.mapData==='google')		{
				point = ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
				}
			else
				{
			// do notng
				}
			//point = ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
          if (element.style.cursor != this.cursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.cursor_;
          }
        } else if (this.previousCursor_ !== undefined) {
          element.style.cursor = this.previousCursor_;
          this.previousCursor_ = undefined;
        }
      }
  };

  app.Drag.prototype.handleUpEvent = function(evt) {
      var value=this.feature_.getGeometry().getType();
      if(value==='Point')
      {
        lonlat =this.feature_.getGeometry();
      }
      else if(value==='LineString')
      {
        lonlat =this.feature_.getGeometry();
      }
      else if(value==='Polygon')
      {
        lonlat =this.feature_.getGeometry();
      }
	  	if(previousEditFeture != undefined){
			if(previousEditFeture.get('POI_Id') == editFeature.get('POI_Id')){
				
			}else{
				var poi_id = previousEditFeture.get('POI_Id');
				//console.log(poi_id);
				tmpl.POI.cancelEdit({
					map : mapObj,
					POI_Id : poi_id
				});
				mapObj.addInteraction(intr);
			}
		
		}
		
		// if(previousEditFeture != undefined){
		// if(previousEditFeture.get('POI_Id') != editFeature.get('POI_Id'))
			// previousEditFeture = editFeature;
		// else
			// previousEditFeture =  undefined;
		// }else{
			previousEditFeture = editFeature;
		//}
		
      if(appConfigInfo.mapData==='google')
      {         
		coordinate = ol.proj.transform(lonlat.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
        wktGeom= format.writeGeometry(lonlat.clone().transform('EPSG:3857', 'EPSG:4326'));
      }
      else
      {
    	  coordinate = lonlat.getCoordinates();
          wktGeom= format.writeGeometry(lonlat);
      //  wktGeom= format.writeGeometry(this.feature_.getGeometry());
      }
		var properties = {};
		
		for(var i=0; i<editFeature.getKeys().length; i++){
			var key = Object.keys(editFeature.getProperties())[i];
			if(key != "geometry" && key != "poi"){
				properties[key] = editFeature.get(key);
			}
		}
		var result = {
			new_coordinates : coordinate,
			properties : properties,
		};
		
      mycallback(result);
      this.coordinate_ = null;
      this.feature_ = null;
      return false;
  };
  intr=new app.Drag();
  mapObj.addInteraction(intr);
	 
}
tmpl.POI.delete = function(param){
	var mapObj = param.map;
	var callbackFunc = param.callbackFunc;
	tmpl.POI.clearInteractions({map:mapObj});
	tmpl.mapOnClickExtraForPOIDelete = function(evt){
		var pixel = mapObj.getEventPixel(evt.originalEvent);
		if(mapObj.hasFeatureAtPixel(pixel)){
			var layerName;
			var coordinate = evt.coordinate;
			var feature = mapObj.forEachFeatureAtPixel(evt.pixel,function (feature, layer){
				if(layer){
					if(layer.get('lname') == "POI_Layer_POI"){
                        return feature;
					}else{
						return "no feature";
					}
				}else{
					if(feature.get('lname') == 'POI_Layer_POI'){
						return feature;
					}
				}
            });
			//console.log(feature);
			if(feature != "no feature"){
				var properties = {};
				for(var i=0; i<feature.getKeys().length; i++){
					var key = Object.keys(feature.getProperties())[i];
					if(key != "geometry" && key != "poi"){
						properties[key] = feature.get(key);
					}
				}
				//mapObj.un('click',tmpl.mapOnClickExtraForPOIDelete);
				callbackFunc(properties);
			}
		}
	};
	mapObj.on('click',tmpl.mapOnClickExtraForPOIDelete);
}
tmpl.POI.saveDelete = function(param){
	var mapObj = param.map;
	if(POI_Layer_save_flag == true){
	for(var i=0;i<POI_Layer_save.getSource().getFeatures().length;i++){
		var existingFeature = POI_Layer_save.getSource().getFeatures()[i];
		if(existingFeature.get('POI_Id') == param.POI_Id){
			POI_Layer_save.getSource().removeFeature(existingFeature);
		}
	}
	}
	if(POI_Layer_flag == true){
		for(var i=0;i<POI_Layer.getSource().getFeatures().length;i++){
		var existingFeature = POI_Layer.getSource().getFeatures()[i];
		if(existingFeature.get('POI_Id') == param.POI_Id){
			POI_Layer.getSource().removeFeature(existingFeature);
		}
	}
	}
	mapObj.un('click',tmpl.mapOnClickExtraForPOIDelete);
}
tmpl.POI.cancelDelete = function(param){
	var mapObj = param.map;
	mapObj.un('click',tmpl.mapOnClickExtraForPOIDelete);
}

tmpl.POI.clearInteractions = function(param){
	var mapObj = param.map;
	mapObj.removeInteraction(draw_POI);
	  mapObj.removeInteraction(draw);
	  mapObj.removeInteraction(drawm);
	  mapObj.removeInteraction(intr);
	  mapObj.un('click',tmpl.mapOnClickExtraForPOIDelete);
}



////center map here 

tmpl.ContextMenu.MapToCenter = function(param){
	var mapObj = param.map;
	var obj = param.obj;
	var view = mapObj.getView();
	view.setCenter(obj.coordinate);
}

// context menu starts
var contextMenuGteCoordinate = [];
tmpl.ContextMenu.create = function(param){
	var mapObj = param.map;
	var menu_items = param.menu_items;

  	contextmenuobj = new ContextMenu({
                      width: 170,
                      default_items: false, //default_items are (for now) Zoom In/Zoom Out
                      items: menu_items
                  });
  	mapObj.addControl(contextmenuobj);
	 contextmenuobj.on('open', function(evt){
	    if(appConfigInfo.mapData=="google")
		{
		  contextMenuGteCoordinate=ol.proj.transform(evt.coordinate, 'EPSG:3857','EPSG:4326');
		}
		else
		{
		  contextMenuGteCoordinate= evt.coordinate;
		}
	    
   });
  	return contextmenuobj;
}

tmpl.ContextMenu.addMenu = function(param){
	var add_menu = param.add_menu;
	contextmenuobj.extend(add_menu);
}

tmpl.ContextMenu.clearMenu = function(){
	contextmenuobj.clear();
  $(".ol-ctx-menu-container").html("");
}
tmpl.ContextMenu.closeMenu = function(){
	contextmenuobj.close();
}

tmpl.ContextMenu.addMapToCenter = function(param){
	var add_menu = param.add_menu;
	contextmenuobj.extend(add_menu);
}

tmpl.ContextMenu.singleGetCoordinate = function(){
	return contextMenuGteCoordinate;
}

tmpl.ContextMenu.getCoordinate = function(contextmenuobj,myCallBack){
    contextmenuobj.on('open', function(evt){
	    if(appConfigInfo.mapData=="google")
		{
		  coordinate=ol.proj.transform(evt.coordinate, 'EPSG:3857','EPSG:4326');
		}
		else
		{
		  coordinate= evt.coordinate;
		}
	    myCallBack(coordinate); //new
   });
}

// end of context menu

// // Beginning of Multi Vehicle Track 
// tmpl.Track.vehicle = function (param) {
	// this.map = param.map;
	// this.vehicle_img = param.vehicle_img;
	// this.route_color = param.route_color;
	// this.sourceTrackOriginal = [];
	// this.track_lines_layer_flag =  false;
	// this.track_lines_layer = new ol.layer.Vector({source: new ol.source.Vector()});
	// this.track_points_layer_flag1 =  false;
	// this.track_end_marker_flag =  false;
	// this.track_points_layer1;
	// this.track_points_layer_flag =  false;
	// //this.track_first_call_flag =  false;
	// this.track_first_call_flag =  false;
	// this.track_first_call_zoom_flag = false;
	// this.track_points_layer;
	// this.track_end_Marker =  new ol.layer.Vector({source: new ol.source.Vector()});
	// this.track_ivlDraw,this.destinationTrackOriginal;
	// this.track_uniqueData = [];
	// this.extraAnimationCount = 1;
	// this.animationSpeed =  2000;
	// this.color = ['#FF5733','#10B00B','#0B80B0','#100BB0','#A30BB0','#A60A4A','#CD2733','#D3D012','#FF5733','#10B00B','#0B80B0','#100BB0','#A30BB0'];
	// this.colorIndex = 0;

	// } 


	// tmpl.Track.vehicle.prototype = {
		
		// startTrack : function (param){
			// var source = param.position;
		// this.sourceTrackOriginal.push(param.position);
		// if(this.track_first_call_zoom_flag == false){
			// var point1;
		// if(appConfigInfo.mapData=="google"){
			// point1 = ol.proj.transform([param.position[1],param.position[0]], 'EPSG:4326', 'EPSG:3857');
		// }else{
			// point1 = [param.position[1],param.position[0]];
		// }
		// this.map.getView().setCenter(point1);
			// this.map.getView().setZoom(17);
			// console.log(this.track_first_call_zoom_flag,this.track_first_call_flag,this.track_end_marker_flag);
			// this.track_first_call_zoom_flag = true;
			// var point;
			// if(appConfigInfo.mapData=="google"){
			// point = ol.proj.transform([this.sourceTrackOriginal[0][1],this.sourceTrackOriginal[0][0]], 'EPSG:4326', 'EPSG:3857');
		// }else{
			// point = [this.sourceTrackOriginal[0][1],this.sourceTrackOriginal[0][0]];
		// }
			
			// //console.log(point);
			// var pointGeom = new ol.geom.Point(point);
				// var n_feature = new ol.Feature({
					// geometry : pointGeom
				// }); 
				
				// if(this.track_end_marker_flag ==  false){
					// this.track_end_Marker = new ol.layer.Vector({
						// source: new ol.source.Vector({
							// features : [n_feature]
						// }),
						// style : new ol.style.Style({
							// image : new ol.style.Icon({
								// src : this.vehicle_img
							// })
						// })
					// });
					// this.map.addLayer(this.track_end_Marker);
					// this.track_end_marker_flag = true;
				// }else{
			// if(this.track_end_Marker.getSource().getFeatures().length == 1)
				// this.track_end_Marker.getSource().getFeatures()[0].getGeometry().setCoordinates(point);
			// else
				// this.track_end_Marker.getSource().addFeatures([n_feature]); 
				// }
				
				
		// }
		// if(this.track_first_call_flag == false){
			// this.track_first_call_flag = true;
			// if(this.sourceTrackOriginal.length == 1){	
			
			// }
			// this.SendToTrack();
			
		// }
		// },
		// routeLayer : function(param){
			// var visibility = param.visibility;
			// this.track_lines_layer.setVisible(visibility);
		// },
		// SendToTrack : function(){
		
		// //console.log("SendToTrack");
		// if(this.sourceTrackOriginal.length > 1){
			
			// this.TrackAnimation({
				// source : this.sourceTrackOriginal[0],
				// destination : this.sourceTrackOriginal[1]
			// });
		// }else{
		
			// this.track_first_call_flag = false;
		
		// }
	// },


		// TrackAnimation : function(param){
		
		// var source = param.source;
		// var destination = param.destination;
		// if(appConfigInfo.mapData == 'google'){
		// var source1 = new google.maps.LatLng(source[0],source[1]);
		// var destination1 = new google.maps.LatLng(destination[0],destination[1]);
		// var directionsService = new google.maps.DirectionsService;
		// var parent = this;
		
		 // directionsService.route({
	          // origin: source1,
	          // destination: destination1,
	          // travelMode: 'DRIVING'
	        // }, function(response, status) {
	          // if (status === 'OK') {
			  // this.track_uniqueData = [];
			  // for(var i=0;i<response.routes[0].overview_path.length;i++){
				// this.track_uniqueData.push([response.routes[0].overview_path[i].lat(),response.routes[0].overview_path[i].lng()]);
				
				// }
				// parent.extraAnimationCount = 1;
				// parent.extraAnimation(this.track_uniqueData);
	          // } else {
	            // window.alert('Directions request failed due to ' + status);
	          // }
	        // });
		// }else{
			
			// var parent = this;
			  // var request= {
			                // source : [ source[1],source[0] ],
			                // destination : [ destination[1],destination[0] ]
			                // };
			  // tmpl.Route.directionsService(request,
							// function(response){
								// try{
									// if(response==='NOTOK'){
										// console.log("APIEC-ROUTE/TEST null  :");
									// }else{
										// this.track_uniqueData = [];
										// for(var i=0;i<response.length;i++){
											// this.track_uniqueData.push([response[i].lat,response[i].lon]);	
										// }
			                            // //console.log(track_uniqueData);
										// parent.extraAnimationCount = 1;
										// parent.extraAnimation(this.track_uniqueData);
								 // }
						// }catch(e){console.error("APIEC ROUT/DIRSERV/track  :"+e);}
					// });
		// }
		// this.colorIndex = this.colorIndex + 1;
		// this.track_points_layer_flag1 = false;	
	// },

			// extraAnimation : function(uniqueData){
			// //console.log(uniqueData);          ////
			// if(this.extraAnimationCount < uniqueData.length){
				// var i = this.extraAnimationCount;
				// var lat = parseFloat(uniqueData[i][0]);
				// var plat = parseFloat(uniqueData[i-1][0]);
				// var lon = parseFloat(uniqueData[i][1]);
				// var plon = parseFloat(uniqueData[i-1][1]);
				// if(appConfigInfo.mapData=="google"){
				// var point = ol.proj.transform([lon,lat], 'EPSG:4326', 'EPSG:3857');
				// var p_point = ol.proj.transform([plon,plat], 'EPSG:4326', 'EPSG:3857');
				// }else{
					// point = [lon,lat];
					// p_point =[plon,plat];
				// }
				// console.log(point);
				// var pointGeom = new ol.geom.Point(point);
				// var n_feature = new ol.Feature({
					// geometry : pointGeom
				// }); 
				// var pfeature = new ol.Feature({
					// geometry : new ol.geom.Point(p_point)
				// }); 
			
				// this.drawAnimatedLine(p_point,point, 50, 10000, uniqueData);
				// }else{
					// if(this.sourceTrackOriginal.length > 1){
					// //console.log("test track unique",this.track_uniqueData[this.track_uniqueData.length-1]);
					// //this.destinationTrackOriginal = this.track_uniqueData[this.track_uniqueData.length-2];
					// this.sourceTrackOriginal.splice(0, 1);
					// //console.log("again calling SendToTrack",this.sourceTrackOriginal.length);
					// this.SendToTrack();
				// }else{
					// //this.destinationTrackOriginal = this.sourceTrackOriginal[0];
					// this.track_first_call_flag = false;
				// }
				
				
				// }
				// this.extraAnimationCount = this.extraAnimationCount + 1;
				
				// },
			
			
			
		// drawAnimatedLine : function (startPt, endPt, steps, time, track_uniqueData){
	    // var directionX = (endPt[0] - startPt[0]) / steps;
	    // var directionY = (endPt[1] - startPt[1]) / steps;
	    // var i = 0;
	    // var prevLayer;
		// var newEndPt;
		// var itsparent = this;
		
		// //console.log("something");
	    // itsparent.track_ivlDraw = setInterval(function () {
			// var map = itsparent.map;
	        // if (i > steps) {
	            // clearInterval(itsparent.track_ivlDraw);
				// itsparent.extraAnimation(track_uniqueData); /////// completed i/j phase
	           // // return;
	        // }
	        // newEndPt = [startPt[0] + i * directionX, startPt[1] + i * directionY];
			// itsparent.panMap(newEndPt);
	        // var line = new ol.geom.LineString([startPt, newEndPt]);
	        // var point = new ol.geom.Point(newEndPt);
	        // var fea = new ol.Feature(line);
			// var p_fea = new ol.Feature(point);
				// if(itsparent.track_end_marker_flag ==  false){
					// itsparent.track_end_Marker = new ol.layer.Vector({
						// source: new ol.source.Vector({
							// features : [p_fea]
						// }),
						// style : new ol.style.Style({
							// image : new ol.style.Icon({
								// src : itsparent.vehicle_img
							// })
						// })
					// });
					// map.addLayer(itsparent.track_end_Marker);
					// itsparent.track_end_marker_flag = true;
				// }else{
					// if(itsparent.track_end_Marker.getSource().getFeatures().length == 1)
						// itsparent.track_end_Marker.getSource().getFeatures()[0].getGeometry().setCoordinates(newEndPt);
					// else
						// itsparent.track_end_Marker.getSource().addFeatures([p_fea]); 
				// }
			
				
				// if(itsparent.track_lines_layer_flag ==  false){
					// itsparent.track_lines_layer = new ol.layer.Vector({
						// source: new ol.source.Vector({
							// features : [fea]
						// }),
						// style : new ol.style.Style({
							// stroke: new ol.style.Stroke({
								// color: itsparent.route_color,
								// width: 4
							// })
						// })
					// });
					// itsparent.track_lines_layer.set("track","trackAnimationLayer");
					// map.addLayer(itsparent.track_lines_layer);
					// itsparent.track_lines_layer_flag = true;
				// }else{
					// itsparent.track_lines_layer.getSource().addFeature(fea);
				// }
	        // i++;
	    // }, this.animationSpeed / steps);
		
		// },
			
		// panMap : function (point){
			// var map = this.map;
			// var current=point;
			// var currentgps = new ol.geom.Point(current);
	        // var cur_veh = new ol.Feature(currentgps);
	        // var view_port =  
			// map.getView().calculateExtent(map.getSize());
	        // var  vehicle_inside=cur_veh.getGeometry().intersectsExtent(view_port);
	        // if(vehicle_inside==false){
	            // map.getView().setCenter(current);
	        // }
		// },
		
		// clearTrack : function(){
			 // clearInterval(this.track_ivlDraw);
			 // this.track_end_Marker.getSource().clear();
			 // this.track_lines_layer.getSource().clear();
			 // this.track_first_call_zoom_flag = false;
			 // this.track_first_call_flag = false;

		// }
	// }

// End of Multi Vehicle Track 



var multi_track_zoom_map = [];
tmpl.Track.vehicle = function (param) {
	this.map = param.map;
	this.vehicle_img = param.vehicle_img;
	this.route_color = param.route_color;
	this.getHoverLabel = param.getHoverLabel;
	this.icon_scale = param.icon_scale;
	this.label = param.label;
	this.angle = param.angle;
	this.track_ivlDraw;
	this.markerFlag = false;
	this.layerFlag = false;
	this.track_end_marker = new ol.layer.Vector({
		source: new ol.source.Vector()
	});
	this.track_line_layer =  new ol.layer.Vector({
		source: new ol.source.Vector()
	});
	this.previousP = [];
	this.currentP = [];
	this.previous = [];
	this.current_track_flag = false;
	this.route_width;
	this.first_add_icon =  false;
	if(param.route_width == undefined)
		this.route_width = 4;
	else
		this.route_width = param.route_width
	this.multi_track_zoom_map_index = multi_track_zoom_map.length;
	multi_track_zoom_map.push(this);
} 
tmpl.Track.vehicle.prototype = {
	startTrack : function (param){
		var point = param.position;
		this.pos = [point[0],point[1]];
		this.previous.push(point);
		if(this.first_add_icon == false){
			var pt = [];
					pt[0] = point[0];
					pt[1] = point[1];
					if(appConfigInfo.mapData == 'google')
						pt = ol.proj.transform([pt[0],pt[1]], 'EPSG:4326', 'EPSG:3857');
					else
						pt = ol.proj.transform([pt[0],pt[1]], 'EPSG:4326', 'EPSG:4326');
					
						
					var point = new ol.geom.Point(pt);
				    var p_fea = new ol.Feature(point);
					var scale = 1;
					if(this.icon_scale != undefined)
						scale = this.icon_scale;
					var angle = 0;
					if(this.angle != undefined)
						angle = this.angle;
					p_fea.setStyle(new ol.style.Style({
							image : new ol.style.Icon({
								src : this.vehicle_img,
								scale : scale,
								rotation : angle
							})
						}));
						p_fea.set('layer_name','track_layer');
						p_fea.set('label',this.label);
					this.track_end_marker = new ol.layer.Vector({
						source: new ol.source.Vector({
							features : [p_fea]
						})
					});
					
					console.log("this.pos >>",this.pos);
					this.multipleTrackMapZoom(this);
					//map.addLayer(parent.track_end_marker);
					this.track_end_marker.setMap(this.map);
    				this.markerFlag = true;
			this.first_add_icon = true;
			
			var parentMap = this.map;
			if(this.getHoverLabel == true){
		
			var ta_tooltip = document.createElement('tooltip');
    ta_tooltip.id = 'trip-tooltip';
    ta_tooltip.className = 'ol-trip-tooltip';
    var overlay_mouseOver_label = new ol.Overlay({
        element: ta_tooltip,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
	
    parentMap.addOverlay(overlay_mouseOver_label);
		parentMap.on('pointermove', function(evt){
			
			var feature_mouseOver = parentMap.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
				if(layer == null){
					if(feature.get('layer_name') == 'track_layer'){
						return feature;
					}
				}
			});
			ta_tooltip.style.display = feature_mouseOver ? '' : 'none';
			if(feature_mouseOver) {
				overlay_mouseOver_label.setPosition(evt.coordinate);
				ta_tooltip.innerHTML = feature_mouseOver.getProperties().label;
			}
		});
	}
		}
		if(this.previous.length > 1){
			if(this.current_track_flag == false){
				this.current_track_flag = true;
				this.sendToTrack();
			}
		}else{
			this.current_track_flag = false;
		}
	},
	sendToTrack : function(){
		var parent = this;
	    var directionX = (this.previous[1][0] - this.previous[0][0]) / 50;
	    var directionY = (this.previous[1][1] - this.previous[0][1]) / 50;
	    var i = 0;
	    var prevLayer;
		var newEndPt;
		var angle = rotate({
			x1: this.previous[0][0],
			y1: this.previous[0][1],
			x2: this.previous[1][0],
			y2: this.previous[1][1]
		});

if(this.previous[0][0] == this.previous[1][0] && this.previous[0][1] == this.previous[1][1]){
				this.previous.splice(0, 1);
				if(this.previous.length > 1){
					this.sendToTrack();
				}else{
					this.current_track_flag = false;
				}
			}else{

    	parent.track_ivlDraw = setInterval(function () {
			var map = parent.map;
        	if (i > 50) {
            	clearInterval(parent.track_ivlDraw);
				parent.previous.splice(0, 1);
				if(parent.previous.length > 1){
					parent.sendToTrack();
				}else{
					parent.current_track_flag = false;
				}
           // return;
        	}else{
				newEndPt = [parent.previous[0][0] + i * directionX, parent.previous[0][1] + i * directionY];
				var latlng = new google.maps.LatLng(newEndPt[1], newEndPt[0]);
		
				if(parent.layerFlag == false){
				    parent.previousP[0] = newEndPt[0];
					parent.previousP[1] = newEndPt[1];
					if(appConfigInfo.mapData == 'google')
						parent.previousP = ol.proj.transform(parent.previousP, 'EPSG:4326', 'EPSG:3857');
						
					else
						parent.previousP = ol.proj.transform(parent.previousP, 'EPSG:4326', 'EPSG:4326');
					
				
				    parent.track_line_layer = new ol.layer.Vector({
				      source: new ol.source.Vector(),
				      style: new ol.style.Style({
				        stroke: new ol.style.Stroke({
				          color: parent.route_color,
				          width: parent.route_width
				        })
				      })
				    });
				    //parent.track_line_layer.setMap(map);
					map.addLayer(parent.track_line_layer);
				    parent.layerFlag = true;
				}else{
					parent.currentP[0] = newEndPt[0];
					parent.currentP[1] = newEndPt[1];
					var current;
					if(appConfigInfo.mapData == 'google')
						current = ol.proj.transform(parent.currentP, 'EPSG:4326', 'EPSG:3857');
					else
						current = ol.proj.transform(parent.currentP, 'EPSG:4326', 'EPSG:4326');
						
					var line = new ol.geom.LineString([parent.previousP, current]);
					var fea = new ol.Feature(line);
					parent.track_line_layer.getSource().addFeature(fea);
					parent.previousP = current;
				}
				if(parent.markerFlag == false){
					var pt = [];
					pt[0] = newEndPt[0];
					pt[1] = newEndPt[1];
					if(appConfigInfo.mapData == 'google')
						pt = ol.proj.transform([pt[0],pt[1]], 'EPSG:4326', 'EPSG:3857');
					else
						pt = ol.proj.transform([pt[0],pt[1]], 'EPSG:4326', 'EPSG:4326');
								
						
					var point = new ol.geom.Point(pt);
				    var p_fea = new ol.Feature(point);
					p_fea.setStyle(new ol.style.Style({
							image : new ol.style.Icon({
								src : parent.vehicle_img
							})
						}));
					parent.track_end_marker = new ol.layer.Vector({
						source: new ol.source.Vector({
							features : [p_fea]
						})
					});
					//map.addLayer(parent.track_end_marker);
					parent.track_end_marker.setMap(map);
    				parent.markerFlag = true;
				}else{
					parent.pos = newEndPt;
					parent.multipleTrackMapZoom(parent);
					if(isNaN(angle) == false)
					parent.track_end_marker.getSource().getFeatures()[0].getStyle().getImage().setRotation(angle);
					if(appConfigInfo.mapData == 'google')
						parent.track_end_marker.getSource().getFeatures()[0].getGeometry().setCoordinates(ol.proj.transform(newEndPt, 'EPSG:4326', 'EPSG:3857'));
					else
						parent.track_end_marker.getSource().getFeatures()[0].getGeometry().setCoordinates(ol.proj.transform(newEndPt, 'EPSG:4326', 'EPSG:4326'));
				}
				i = i + 1;
			}
        
		},10000 / 50)
}
	},
	clearTrack : function(){
			 clearInterval(this.track_ivlDraw);
			 this.track_end_marker.getSource().clear();
			 this.track_line_layer.getSource().clear();
			 this.layerFlag = false;
			 this.markerFlag = false;
			 this.first_add_icon = false;
			 this.previousP = [];
			 this.currentP = [];
			 this.previous = [];
			 this.current_track_flag = false;
			 try{
			var index = this.multi_track_zoom_map_index;
			multipleTrackMapZoomLayer.getSource().clear();
			 }catch(e){}
	},
	routeVehicle : function(param){
			var visibility = param.visibility;
			var map = param.map;
			if(visibility)
			 this.track_end_marker.setMap(map);
		 else
			 this.track_end_marker.setMap(null);
	},
	routeLayer : function(param){
		var visibility = param.visibility;
			var map = param.map;
			 this.track_line_layer.setVisible(visibility);
	},
multipleTrackMapZoom : function(obj){
var coordinate = [parseFloat(obj.pos[0]), parseFloat(obj.pos[1])];
coordinate = ol.proj.transform(coordinate,'EPSG:4326','EPSG:3857');
var geometry = new ol.geom.Point(coordinate);
				var featureval = new ol.Feature({
					geometry     : geometry
				});
	try{
	if(obj.feaPOS == undefined){
				obj.feaPOS = multipleTrackMapZoomLayer.getSource().getFeatures().length;
			multipleTrackMapZoomLayer.getSource().addFeature(featureval);
	}else{
		if(multipleTrackMapZoomLayer.getSource().getFeatures()[obj.feaPOS] == undefined){
				obj.feaPOS = multipleTrackMapZoomLayer.getSource().getFeatures().length;
			multipleTrackMapZoomLayer.getSource().addFeature(featureval);
		}else{
			multipleTrackMapZoomLayer.getSource().getFeatures()[obj.feaPOS].getGeometry().setCoordinates(coordinate);
		}
	}
}catch(e){}
   //console.log("EEEE >>>",multipleTrackMapZoomLayer.getSource().getFeatures().length);
	if(multipleTrackMapZoomLayer.getSource().getFeatures().length >1){
	try{
		var extent = multipleTrackMapZoomLayer.getSource().getExtent();
		var view_port = obj.map.getView().calculateExtent(obj.map.getSize());
	        var  vehicle_inside=featureval.getGeometry().intersectsExtent(view_port);
	        if(vehicle_inside==false){
				obj.map.getView().fit(extent, obj.map.getSize());
	        }
	}catch(e){}
	}
	else{
try{
		var view_port = obj.map.getView().calculateExtent(obj.map.getSize());
	        var  vehicle_inside=featureval.getGeometry().intersectsExtent(view_port);
	        if(vehicle_inside==false){
	            //console.log("sss");
				  obj.map.getView().setCenter(coordinate);
	        }
}catch(e){}
if(multipleTrackMapZoomLayerFlag){
		tmpl.Zoom.toXYcustomZoom({
			map : obj.map,
			latitude : obj.pos[1],
			longitude : obj.pos[0],
			zoom : 16
		});
multipleTrackMapZoomLayerFlag = false;
}
	}
}
};

var multipleTrackMapZoomLayerFlag = true;
var multipleTrackMapZoomLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
});






tmpl.Track.singleVehicle = function (param) {
	console.log("from api singleVehicle---",param);
	this.map = param.map;
	this.vehicle_img = param.vehicle_img;
	this.route_color = param.route_color;
	this.getHoverLabel = param.getHoverLabel;
	this.icon_scale = param.icon_scale;
	this.label = param.label;
	this.angle = param.angle;
	//this.id = param.id;
	//this.rendering_type = param.rendering_type;
	
	this.features = param.features;
	
	this.track_ivlDraw;
	this.markerFlag = false;
	this.layerFlag = false;
	this.track_end_marker = new ol.layer.Vector({
		source: new ol.source.Vector()
	});
	this.track_line_layer =  new ol.layer.Vector({
		source: new ol.source.Vector()
	});
	this.first_time_zoom_flag = false;
	this.first_add_icon = false;

	this.previousP = [];
	this.currentP = [];

	this.previous = [];
	this.current_track_flag = false;
	this.route_width;
	if(param.route_width == undefined)
		this.route_width = 4;
	else
		this.route_width = param.route_width;
	this.TrackSpeed = 5000;
} 
tmpl.Track.singleVehicle.prototype = {
	startTrack : function (param){
		
		var point = param.position;
		this.previous.push(point);
		if(this.first_add_icon == false){
			var pt = [];
					pt[0] = point[0];
					pt[1] = point[1];
					if(appConfigInfo.mapData == "google"){
						pt = ol.proj.transform([pt[0],pt[1]], 'EPSG:4326', 'EPSG:3857');
					}	
				
					var point1 = new ol.geom.Point(pt);
				    var p_fea = new ol.Feature(point1);
					var scale = 1;
					if(this.icon_scale != undefined)
						scale = this.icon_scale;
					var angle1 = 0;
					if(this.angle != undefined)
						angle1 = this.angle;
					//console.log(angle1);
					p_fea.setStyle(new ol.style.Style({
							image : new ol.style.Icon({
								src : this.vehicle_img,
								scale : scale,
								rotation : angle1
							})
						}));
						p_fea.set('layer_name','track_layer');
						p_fea.set('label',this.label);
						
						if(this.features){
							var getdata = this.features;
							for (var i = 0, length = getdata.length; i < length; i++){
							p_fea.setProperties(getdata[i]);
							}
						}
						
						//p_fea.set('id',this.id);
						//p_fea.set('rendering_type',this.rendering_type);
					this.track_end_marker = new ol.layer.Vector({
						source: new ol.source.Vector({
							features : [p_fea]
						})
					});
					
					//map.addLayer(parent.track_end_marker);
					this.track_end_marker.setMap(this.map);
    				this.markerFlag = true;
			this.first_add_icon = true;
			
			var parentMap = this.map;
			if(this.getHoverLabel == true){
		
			var ta_tooltip = document.createElement('tooltip');
    ta_tooltip.id = 'trip-tooltip';
    ta_tooltip.className = 'ol-trip-tooltip';
    var overlay_mouseOver_label = new ol.Overlay({
        element: ta_tooltip,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
	
    parentMap.addOverlay(overlay_mouseOver_label);
		parentMap.on('pointermove', function(evt){
			
			var feature_mouseOver = parentMap.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
				if(layer == null){
					if(feature.get('layer_name') == 'track_layer'){
						return feature;
					}
				}
			});
			ta_tooltip.style.display = feature_mouseOver ? '' : 'none';
			if(feature_mouseOver) {
				overlay_mouseOver_label.setPosition(evt.coordinate);
				ta_tooltip.innerHTML = feature_mouseOver.getProperties().label;
			}
		});
	}
		}
		if(this.first_time_zoom_flag == false){
			
				//var pt1 = ol.proj.transform(point, 'EPSG:4326', 'EPSG:3857');	
				var pt1 = point;
					tmpl.Zoom.toXYcustomZoom({
						map : this.map,
						latitude : pt1[1],
						longitude : pt1[0],
						zoom : 12
					});
					
					this.first_time_zoom_flag = true;
			}
		if(this.previous.length > 1){
			if(this.current_track_flag == false){
				this.sendToTrack();
				this.current_track_flag = true;
				gblTrackSameLatLong = false;
			}
		}
	},
	sendToTrack : function(){
		// if(this.previous[0][0] == this.previous[1][0] && this.previous[0][1] == this.previous[1][1]){
			// this.previous.splice(0, 1);
			// if(this.previous.length > 1){
				// var par = this;
				// setTimeout(function() {
					// par.sendToTrack();
				// }, 1000);
			// }else{
				// var par = this;
				// setTimeout(function() {
					// par.current_track_flag = false;
				// }, 400);
			// }
			// console.log("same lat long previous and current---");
		// }else{
		var parent = this;
	    var directionX = (this.previous[1][0] - this.previous[0][0]) / 50;
	    var directionY = (this.previous[1][1] - this.previous[0][1]) / 50;
	    var i = 0;
	    var prevLayer;
		var newEndPt;
		var angle = rotate({
			x1: this.previous[0][0],
			y1: this.previous[0][1],
			x2: this.previous[1][0],
			y2: this.previous[1][1]
		});
		if(this.previous.length >= 4){
			this.TrackSpeed = 2000;
		}else{
			this.TrackSpeed = 5000;
		}
    	parent.track_ivlDraw = setInterval(function () {
			var map = parent.map;
			if (i > 50) {
            	clearInterval(parent.track_ivlDraw);
				parent.previous.splice(0, 1);
				if(parent.previous.length > 1){
					parent.sendToTrack();
				}else{
					parent.current_track_flag = false;
					gblTrackSameLatLong = true;
				}
           // return;
        	}else{
				newEndPt = [parent.previous[0][0] + i * directionX, parent.previous[0][1] + i * directionY];
				var latlng = new google.maps.LatLng(newEndPt[1], newEndPt[0]);
		
				if(parent.layerFlag == false){
					parent.previousP[0] = newEndPt[0];
					parent.previousP[1] = newEndPt[1];
					//console.log("prev111 >>",parent.previousP);
					if(appConfigInfo.mapData == "google"){
						parent.previousP = ol.proj.transform(parent.previousP, 'EPSG:4326', 'EPSG:3857');
					}
					//console.log("prev111 >>",parent.previousP);
				    parent.track_line_layer = new ol.layer.Vector({
				      source: new ol.source.Vector(),
				      style: new ol.style.Style({
				        stroke: new ol.style.Stroke({
				          color: parent.route_color,//'blue',
				          width: parent.route_width
				        })
				      })
				    });
				    //parent.track_line_layer.setMap(map);
					map.addLayer(parent.track_line_layer);
				    parent.layerFlag = true;
					
				}else{
					//console.log("a");
					//console.log("previous11 >>>",parent.previousP);
					parent.currentP[0] = newEndPt[0];
					parent.currentP[1] = newEndPt[1];
					//console.log("previous22 >>>",parent.previousP);
					var current = parent.currentP;
					
					if(appConfigInfo.mapData == "google"){
						current = ol.proj.transform(current, 'EPSG:4326', 'EPSG:3857');
					}
					else{
						current = ol.proj.transform(current, 'EPSG:4326', 'EPSG:4326');
					}
					//console.log("previous, current >>>",parent.previousP, current);
					var line = new ol.geom.LineString([parent.previousP, current]);
					
					var fea = new ol.Feature(line);
					parent.track_line_layer.getSource().addFeature(fea);
					parent.previousP = current;
					//console.log("previousP >>>",parent.previousP);
				}
				if(parent.markerFlag == false){
					var pt = [];
					pt[0] = newEndPt[0];
					pt[1] = newEndPt[1];
					if(appConfigInfo.mapData == "google"){
						pt = ol.proj.transform([pt[0],pt[1]], 'EPSG:4326', 'EPSG:3857');
					}
					var point = new ol.geom.Point(pt);
				    var p_fea = new ol.Feature(point);
					p_fea.setStyle(new ol.style.Style({
							image : new ol.style.Icon({
								src : parent.vehicle_img
							})
					}));
					parent.track_end_marker = new ol.layer.Vector({
						source: new ol.source.Vector({
							features : [p_fea]
						})
					});
					//map.addLayer(parent.track_end_marker);
					parent.track_end_marker.setMap(map);
    				parent.markerFlag = true;
				}else{					
					parent.panMap(newEndPt);
					if(isNaN(angle) == false)
					parent.track_end_marker.getSource().getFeatures()[0].getStyle().getImage().setRotation(angle);
					if(appConfigInfo.mapData == "google"){
					parent.track_end_marker.getSource().getFeatures()[0].getGeometry().setCoordinates(ol.proj.transform(newEndPt, 'EPSG:4326', 'EPSG:3857'));
					}else{
						parent.track_end_marker.getSource().getFeatures()[0].getGeometry().setCoordinates(newEndPt);
					}
				}
				i = i + 1;
			}
        
		},this.TrackSpeed / 50)
	//}
	},
	panMap : function(point){
			var map = this.map;
			var current=point;
			if(appConfigInfo.mapData == "google"){
			current = ol.proj.transform(current, 'EPSG:4326', 'EPSG:3857');
			}
			var currentgps = new ol.geom.Point(current);
	        var cur_veh = new ol.Feature(currentgps);
	        try{
	        var view_port =  
			map.getView().calculateExtent(map.getSize());
	        var  vehicle_inside=cur_veh.getGeometry().intersectsExtent(view_port);
	        if(vehicle_inside==false){
	            map.getView().setCenter(current);
	        }
}catch(e){
	console.log("from api track error handled");
}
		},
	clearTrack : function(){

			 clearInterval(this.track_ivlDraw);
			 this.track_end_marker.getSource().clear();
			 this.track_line_layer.getSource().clear();
			 this.layerFlag = false;
			 this.markerFlag = false;
			 this.first_add_icon = false;
			 this.first_time_zoom_flag = false;
			 this.previousP = [];
			 this.currentP = [];
			 this.previous = [];
			 this.current_track_flag = false;
	},
	routeVehicle : function(param){
			var visibility = param.visibility;
			var map = param.map;
			if(visibility)
			 this.track_end_marker.setMap(map);
		 else
			 this.track_end_marker.setMap(null);
	},
	routeLayer : function(param){
		var visibility = param.visibility;
			var map = param.map;
			 this.track_line_layer.setVisible(visibility);
	}
};





// layer switcher starts 


var layerDeveloperCategories = [{
	"id":25,
	"text":'Administrative',
	"children": [
		{
			"id":1,
			"text":'Country'	
		},
		{
			"id":2,
			"text":'Province'	
		},
		{
			"id":3,
			"text":'Locality'	
		},
		{
			"id":4,
			"text":'Neighborhood'	
		},
		{	
			"id":5,
			"text":'Land parcel'
		}

	]
},
{
	"id":26,
	"text":' Landscape',
	"children": [
		{
			"id":6,
			"text":'Man-made'	
		},
		{
			"id":27,
			"text":'Natural',
			"state":"closed",
			"children": [
				{
					"id":7,
					"text":'Landcover'	
				},
				{
					"id":8,
					"text":'Terrain'	
				}
			]
		}
	]
},
{
	"id":28,
	"text":'Points of interest',
	"children": [
		{
			"id":9,
			"text":'Attraction'	
		},
		{
			"id":10,
			"text":'Business'	
		},
		{
			"id":11,
			"text":'Government'	
		},
		{
			"id":12,
			"text":'Medical'	
		},
		{
			"id":13,
			"text":'Park'	
		},
		{
			"id":14,
			"text":'Place of worship'	
		},
		{
			"id":15,
			"text":'School'	
		},
		{
			"id":16,
			"text":'Sports complex'	
		}
	]
},
{
	"id":29,
	"text":'Road',
	"children": [
		{
			"id":17,
			"text":'Highway',
			"state":"closed",
			"children":[
				{
					"id": 30,
					"text": 'Controlled Access'
				}
			]
		},
		{
			"id":18,
			"text":'Arterial'	
		},
		{
			"id":19,
			"text":'Local'	
		}
	]
},
{
	"id":31,
	"text":'Transit',
	"children": [
		{
			"id":20,
			"text":'Line'	
		},
		{
			"id":32,
			"text":'Station',
			"state":"closed",
			"children":[
				{
					"id":21,
					"text":'Airport'	
				},
				{
					"id":22,
					"text":'Bus'	
				},
				{
					"id":23,
					"text":'Rail'	
				}
			]
		},
		
	]
},
{
	"id":24,
	"text":'Water',
	"children": []
}
]

	var layerDeveloperCategoriesTrinity = [], geoserver_layer_name_trinity = [], layer_group_related_layer_id = [];
	var getTrinityLayerSwitcherData;
	
	tmpl.LayerSwitcher.getLayers = function(param){
		
		getTrinityLayerSwitcherData = param.callbackFunc;
		if(layerDeveloperCategoriesTrinity.length > 0)
			getTrinityLayerSwitcherData(layerDeveloperCategoriesTrinity);
		if(appConfigInfo.mapData == 'google'){
			return layerDeveloperCategories
		}else{
			return;
		}
	} 
	function getTrinityLayersList(mapObj){
		 var result = []; var geoserver_layer_name = []; var layer_unique_id = 1,layer_group_related_layer_id1 =[];
		 
		 $.ajax({
	        url: "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/layer/layermeta/active",
	        type: 'GET',
	        success: function(response) {
	            var test = response;
	            $.ajax({
			        url: "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/layer/layergroups/",
			        type: 'GET',
			        success: function(response) {
			            var test1 = response;
			            for(var i=0;i<test1.length;i++){  
			              result[i] = {};    
			              result[i].id = test1[i].group_id;  
			              result[i].text = test1[i].group_name;  
			              result[i].children = [];  
			              layer_group_related_layer_id1[i] = {};
			              layer_group_related_layer_id1[i].group_id = test1[i].group_id;
			              layer_group_related_layer_id1[i].layers = [];
			              for(var j=0;j<test.length;j++){   
			                if(test[j].layer_group_id == test1[i].group_id){ 
			                  var x = result[i].children.length;  
			                  result[i].children[x] = {};      
			                  result[i].children[x].id = layer_unique_id;    
			                  result[i].children[x].text = test[j].layer_display_name;   
			                  var y = geoserver_layer_name.length;   
			                  geoserver_layer_name[y] = {};      
			                  geoserver_layer_name[y].id = layer_unique_id;   
			                  geoserver_layer_name[y].text = test[j].layer;  
			                  
			                  var z = layer_group_related_layer_id1[i].layers.length;
			                  layer_group_related_layer_id1[i].layers[z] = {};
			                  layer_group_related_layer_id1[i].layers[z].id = layer_unique_id;
			                  
			                  layer_group_related_layer_id = layer_group_related_layer_id1;
			                  layer_unique_id = layer_unique_id + 1;      
			                }  
			              }}
			            geoserver_layer_name_trinity = geoserver_layer_name;
			            create_trinity_layers_objects(mapObj);
			            layerDeveloperCategoriesTrinity = result;
						//console.log(getTrinityLayerSwitcherData);
						if(getTrinityLayerSwitcherData != undefined)
							getTrinityLayerSwitcherData(layerDeveloperCategoriesTrinity);
						
			        }
			 });
	        }
	    });
		
	}
	
var layerCategories = [/*{ id:25, name:'administrative' },*/
	{ id:1, name:'administrative.country' },
	{ id:2, name:'administrative.province'	},
	{ id:3, name:'administrative.locality'	},
	{ id:4, name:'administrative.neighborhood' },
	{ id:5,	name:'administrative.land_parcel' },
	/*{ id:26, name:'landscape' },*/
	{ id:6, name:'landscape.man_made' },
	/*{ id:27, name:'landscape.natural' },*/
	{ id:7, name:'landscape.natural.landcover' },
	{ id:8, name:'landscape.natural.terrain' },
	/*{ id:28, name:'poi' },*/
	{ id:9, name:'poi.attraction' },
	{ id:10, name:'poi.business' },
	{ id:11, name:'poi.government'	},
	{ id:12, name:'poi.medical' },
	{ id:13, name:'poi.park' },
	{ id:14, name:'poi.place_of_worship' },
	{ id:15, name:'poi.school'	},
	{ id:16, name:'poi.sports_complex'	},
	{ id:29, name:'road' },
	{ id:17, name:'road.highway'	},
	/*{ id:30, name:'road.highway.controlled_access' },*/
	{ id:18, name:'road.arterial' },
	{ id:19, name:'road.local' },
	/*{ id:31, name:'transit'},*/
	{ id:20, name:'transit.line' },
	/*{ id:32, name:'transit.station' },*/
	{ id:21, name:'transit.station.airport' },
	{ id:22, name:'transit.station.bus' },
	{ id:23, name:'transit.station.rail' },
	{ id:24, name:'water' }];


tmpl.LayerSwitcher.switcher = function(param){
	var layersObj = param.layer;
	var mapObj = param.map;
	var res = layersObj;
	var glayerId = [];
 	var onoffswitch = [];
 	var on_layers_trinity = [];
	for (var i = 0, length = res.length; i < length; i++){
		 glayerId.push(res[i].layerId);	
	}
	if(appConfigInfo.mapData === "google"){
		for(var j=0;j<layerCategories.length;j++){
		    if(glayerId.indexOf(layerCategories[j].id) == -1){
		    	onoffswitch[j] = "off";
		    }else{
		    	if(res[glayerId.indexOf(layerCategories[j].id)].status == "on"){
		    		onoffswitch[j] = "on";
		    	}else{
		    		onoffswitch[j] = "off";
		    	}	     	
		 	}
		}
		//console.log(glayerId,onoffswitch);
		switchGoogleLayers(mapObj,onoffswitch);
	}
	else{
		for(var j=0;j<geoserver_layer_name_trinity.length;j++){
			//console.log(glayerId.indexOf(geoserver_layer_name_trinity[j].id),geoserver_layer_name_trinity[j].id);
		    if(glayerId.indexOf(geoserver_layer_name_trinity[j].id) == -1){
		    	on_layers_trinity[geoserver_layer_name_trinity[j].id] = "none";
		   }else{
		    	if(res[glayerId.indexOf(geoserver_layer_name_trinity[j].id)].status == "off"){
		    		on_layers_trinity[geoserver_layer_name_trinity[j].id] = "off";
		    	}else{
		    		on_layers_trinity[geoserver_layer_name_trinity[j].id] = "on";
		    	}	     	
		 	}
		}
		switchTrinityLayers(mapObj,on_layers_trinity);
	}	
}

// tmpl.LayerSwitcher.allLayersOn = function(param){
	// if(appConfigInfo.mapData === "google"){
	// var mapObj = param.map;
	// base_map_trinity.setVisible(false);
    // var glyr = new olgm.layer.Google({
        // styles: [  
            // {
               // "featureType": "all",
               // "stylers": [
                  // { "visibility": "on"}
                // ]
            // }
        // ]
    // });
    // layers.insertAt(0, glyr);
	// }else{
		// var mapObj = param.map;
		// base_map_trinity.setVisible(true);
		// streetLayer_trinity.setVisible(false);
		// for(var i=0;i<geoserver_layer_name_trinity.length;i++){
			// var layerId = geoserver_layer_name_trinity[i].id;
			// trinity_basemap_layers_objects[layerId].setVisible(false);
		// }
	// }
// }

tmpl.LayerSwitcher.allLayersOn = function(param){
	var mapObj = param.map;
	var layers = mapObj.getLayers();
    if(appConfigInfo.mapData === "google"){
		 mapObj.removeLayer(layers.item(0));
    var glyr = new olgm.layer.Google({
        styles: [  
            {
               "featureType": "all",
               "stylers": [
                  { "visibility": "on"}
                ]
            }
        ]
    });
    layers.insertAt(0, glyr);
    }else{
		for(var i=0;i<geoserver_layer_name_trinity.length;i++){
			var layerId = geoserver_layer_name_trinity[i].id;
			trinity_basemap_layers_objects[layerId].setVisible(false);
		}
		base_map_trinity.setVisible(true);
		base_map_streetLayer_trinity.setVisible(false);
	}
}

tmpl.LayerSwitcher.allLayersOff = function(param){
	if(appConfigInfo.mapData === "google"){
	
	}else{
		var mapObj = param.map;;
	    
		for(var i=0;i<geoserver_layer_name_trinity.length;i++){
			var layerId = geoserver_layer_name_trinity[i].id;
			trinity_basemap_layers_objects[layerId].setVisible(false);
		}
		base_map_trinity.setVisible(false);
		base_map_streetLayer_trinity.setVisible(true);
	}
}
tmpl.LayerSwitcher.baseMapon = function(param){
	if(appConfigInfo.mapData === "google"){
	
	}else{
		var mapObj = param.map;;
	    base_map_streetLayer_trinity.setVisible(false);
		for(var i=0;i<geoserver_layer_name_trinity.length;i++){
			var layerId = geoserver_layer_name_trinity[i].id;
			trinity_basemap_layers_objects[layerId].setVisible(false);
		}
		base_map_trinity.setVisible(true);
	}
}

var trinity_basemap_layers_objects = [];

function create_trinity_layers_objects(mapObj){
	
	
	//var layers = mapObj.getLayers();
	//var index = layers.getArray().indexOf(trinity_basemap_layers_objects[id]);
	
	  //layers.removeAt(index);
	  //x = x + 1;
	//  layers.insertAt(2, trinity_basemap_layers_objects[id]);

	var x = 1;
	for(var i=0;i<geoserver_layer_name_trinity.length;i++){
		var id = geoserver_layer_name_trinity[i].id;
		var name = geoserver_layer_name_trinity[i].text;
		//console.log(name);
		trinity_basemap_layers_objects[id] = new ol.layer.Tile({
			visible : true,
			source: new ol.source.TileWMS({
				url: appConfigInfo.wmsurl,  
				params: {'LAYERS': name, 'TILED': true, 'VERSION': appConfigInfo.wmsVersion},
				serverType: 'geoserver'
			})
		});
		mapObj.addLayer(trinity_basemap_layers_objects[id]);
		//var layers = mapObj.getLayers();
		//var index = layers.getArray().indexOf(trinity_basemap_layers_objects[id]);
		
		  //layers.removeAt(index);
		  //x = x + 1;
		//  layers.insertAt(2, trinity_basemap_layers_objects[id]);
		trinity_basemap_layers_objects[id].setVisible(false);
	}
	//console.log("finished");
}

function switchTrinityLayers(mapObj,on_layers_trinity){
	for(var i=0;i<geoserver_layer_name_trinity.length;i++){
		var layerId = geoserver_layer_name_trinity[i].id;
		var status = on_layers_trinity[layerId];
		//console.log(status,layerId);
		if(status == "on"){
			trinity_basemap_layers_objects[layerId].setVisible(true);
		}else if(status == "off"){
			trinity_basemap_layers_objects[layerId].setVisible(false);
		}
		
	}
	//streetLayer_trinity.setVisible(false);
}


function switchGoogleLayers(mapObj,switchSt)
{ 
    var layers = mapObj.getLayers();
    mapObj.removeLayer(layers.item(0));
    var glyr = new olgm.layer.Google({
        styles: [  
            {
               "featureType": "administrative.country",
               "stylers": [
                  { "visibility": switchSt[0]}
                ]
            },{
               "featureType": "administrative.province",
               "stylers": [
                  { "visibility": switchSt[1]}
                ]
            },{
               "featureType": "administrative.locality",
               "stylers": [
                  { "visibility": switchSt[2]}
                ]
            },{
               "featureType": "administrative.neighborhood",
               "stylers": [
                  { "visibility": switchSt[3]}
                ]
            },{
               "featureType": "administrative.land_parcel",
               "stylers": [
                  { "visibility": switchSt[4]}
                ]
            },{
               "featureType": "landscape.man_made",
               "stylers": [
                  { "visibility": switchSt[5]}
                ]
            },{
               "featureType": "landscape.natural.landcover",
               "stylers": [
                  { "visibility": switchSt[6]}
                ]
            },{
               "featureType": "landscape.natural.terrain",
               "stylers": [
                  { "visibility": switchSt[7]}
                ]
            },{
               "featureType": "poi.attraction",
               "stylers": [
                  { "visibility": switchSt[8]}
                ]
            },{
               "featureType": "poi.business",
               "stylers": [
                  { "visibility": switchSt[9]}
                ]
            },{
               "featureType": "poi.government",
               "stylers": [
                  { "visibility": switchSt[10]}
                ]
            },{
               "featureType": "poi.medical",
               "stylers": [
                  { "visibility": switchSt[11]}
                ]
            },{
               "featureType": "poi.park",
               "stylers": [
                  { "visibility": switchSt[12]}
                ]
            },{
               "featureType": "poi.place_of_worship",
               "stylers": [
                  { "visibility": switchSt[13]}
                ]
            },{
               "featureType": "poi.school",
               "stylers": [
                  { "visibility": switchSt[14]}
                ]
            },{
               "featureType": "poi.sports_complex",
               "stylers": [
                  { "visibility": switchSt[15]}
                ]
            },{
               "featureType": "road",
               "stylers": [
                  { "visibility": switchSt[16]}
                ]
            },{
               "featureType": "road.highway",
               "stylers": [
                  { "visibility": switchSt[17]}
                ]
            },{
               "featureType": "road.arterial",
               "stylers": [
                  { "visibility": switchSt[18]}
                ]
            },{
               "featureType": "road.local",
               "stylers": [
                  { "visibility": switchSt[19]}
                ]
            },{
               "featureType": "transit.line",
               "stylers": [
                  { "visibility": switchSt[20]}
                ]
            },{
               "featureType": "transit.station.airport",
               "stylers": [
                  { "visibility": switchSt[21]}
                ]
            },{
               "featureType": "transit.station.bus",
               "stylers": [
                  { "visibility": switchSt[22]}
                ]
            },{
               "featureType": "transit.station.rail",
               "stylers": [
                  { "visibility": switchSt[23]}
                ]
            },{
               "featureType": "water",
               "stylers": [
                  { "visibility": switchSt[24]}
                ]
            }
        ]
    });
    layers.insertAt(0, glyr);
}

/*
function switchGoogleLayers(mapObj,switchSt)
{ 
    var layers = mapObj.getLayers();
    mapObj.removeLayer(layers.item(0));
    var glyr = new olgm.layer.Google({
        styles: [  
            {
               "featureType": "administrative.country",
               "stylers": [
                  { "visibility": switchSt[0]}
                ]
            },{
               "featureType": "administrative.province",
               "stylers": [
                  { "visibility": switchSt[1]}
                ]
            },{
               "featureType": "administrative.locality",
               "stylers": [
                  { "visibility": switchSt[2]}
                ]
            },{
               "featureType": "administrative.neighborhood",
               "stylers": [
                  { "visibility": switchSt[3]}
                ]
            },{
               "featureType": "administrative.land_parcel",
               "stylers": [
                  { "visibility": switchSt[4]}
                ]
            },{
               "featureType": "landscape.man_made",
               "stylers": [
                  { "visibility": switchSt[5]}
                ]
            },{
               "featureType": "landscape.natural.landcover",
               "stylers": [
                  { "visibility": switchSt[6]}
                ]
            },{
               "featureType": "landscape.natural.terrain",
               "stylers": [
                  { "visibility": switchSt[7]}
                ]
            },{
               "featureType": "poi.attraction",
               "stylers": [
                  { "visibility": switchSt[8]}
                ]
            },{
               "featureType": "poi.business",
               "stylers": [
                  { "visibility": switchSt[9]}
                ]
            },{
               "featureType": "poi.government",
               "stylers": [
                  { "visibility": switchSt[10]}
                ]
            },{
               "featureType": "poi.medical",
               "stylers": [
                  { "visibility": switchSt[11]}
                ]
            },{
               "featureType": "poi.park",
               "stylers": [
                  { "visibility": switchSt[12]}
                ]
            },{
               "featureType": "poi.place_of_worship",
               "stylers": [
                  { "visibility": switchSt[13]}
                ]
            },{
               "featureType": "poi.school",
               "stylers": [
                  { "visibility": switchSt[14]}
                ]
            },{
               "featureType": "poi.sports_complex",
               "stylers": [
                  { "visibility": switchSt[15]}
                ]
            },{
               "featureType": "road.highway",
               "stylers": [
                  { "visibility": switchSt[16]}
                ]
            },{
               "featureType": "road.arterial",
               "stylers": [
                  { "visibility": switchSt[17]}
                ]
            },{
               "featureType": "road.local",
               "stylers": [
                  { "visibility": switchSt[18]}
                ]
            },{
               "featureType": "transit.line",
               "stylers": [
                  { "visibility": switchSt[19]}
                ]
            },{
               "featureType": "transit.station.airport",
               "stylers": [
                  { "visibility": switchSt[20]}
                ]
            },{
               "featureType": "transit.station.bus",
               "stylers": [
                  { "visibility": switchSt[21]}
                ]
            },{
               "featureType": "transit.station.rail",
               "stylers": [
                  { "visibility": switchSt[22]}
                ]
            },{
               "featureType": "water",
               "stylers": [
                  { "visibility": switchSt[23]}
                ]
            }
        ]
    });
    layers.insertAt(0, glyr);
}*/


tmpl.Layer.singleSwitcher = function(param){
	var layersObj = param.layer;
	var mapObj = param.map;
	var getdata = layersObj;
	var chkbx = [],chkbxId;
	for (var i = 0, length = getdata.length; i < length; i++){
		var glayerId = getdata[i].layerId - 1;
		chkbxId = getdata[i].checkboxId;
		chkbx[i]=document.getElementById(chkbxId);
		chkbx[i].name = layerCategories[glayerId].name;
		chkbx[i].onchange = function(e) {
	    	switchSingleLayers(mapObj,this.id,this.name);
    	};
	}
}


function switchSingleLayers(mapObj,chkbx,cname)
{ 
    var layers = mapObj.getLayers();
    mapObj.removeLayer(layers.item(0));
    var chkbxN=document.getElementById(chkbx);
    var switch1;
    if(chkbxN.checked)
    {
      switch1 = "on";
    }
    else
    {
      switch1 = "off";
    }
    if(appConfigInfo.mapData === "google"){
    	var glyr = new olgm.layer.Google({
	        styles: [  
	            {
	               "featureType": cname,
	               "stylers": [
	                  { "visibility": switch1}
	                ]
	            }
	        ]
	    });
    	layers.insertAt(0, glyr);
    }

}

// layer switcher ends

var modifyFence,drawFence,fenceVector;

tmpl.Fence.create = function(param){
	var mapObj = param.map;
	var callbackFunc = param.callbackFunc;
	var fillColor = param.fillColor;
	var strokeColor = param.strokeColor;

	mapObj.removeInteraction(modify1);
    mapObj.removeInteraction(draw);
    mapObj.removeInteraction(select);
    mapObj.removeInteraction(drawm);
    mapObj.removeInteraction(selectE);
	mapObj.removeInteraction(modifyFence);
    mapObj.removeInteraction(drawFence);
	var features;
	var format = new ol.format.WKT();
    var source;
	features = new ol.Collection();
	source = new ol.source.Vector({features : features});
    var noLayer=false;
    var existingLayer;
    var Layers = mapObj.getLayers();
    var length = Layers.getLength();
    for(i=0;i<length;i++){
		var tempLayer=Layers.item(i);
		if(tempLayer.get('lname') === 'fencevector'){
			noLayer = true;
            existingLayer = tempLayer;
			mapObj.removeLayer(fenceVector);
			noLayer = false;
        }
    }   
    if (!noLayer) {
		fenceVector =new ol.layer.Vector({
			source: source,
			style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: fillColor
          }),
          stroke: new ol.style.Stroke({
            color: strokeColor,
            width: 2
          })
        })
		});
		fenceVector.setProperties({lname:"fencevector"});
		fenceVector.setProperties({myId:"fenceUnique"});
		mapObj.addLayer(fenceVector);
		existingLayer=fenceVector;
    }
	if(modifyFence != undefined){
		mapObj.removeInteraction(modifyFence);
	}
      modifyFence = new ol.interaction.Modify({
        features: features,      
        deleteCondition: function(event) {
          return ol.events.condition.shiftKeyOnly(event) &&
              ol.events.condition.singleClick(event);
        }
      });
      
      var wktGeom,fenceWktGeom;
      modifyFence.on('modifyend', function(event) 
      {
         	var feature = event.features;
            var geometryVal =feature.a[0].getGeometry();
            var lonlat,coord;

            lonlat =feature.item(0).getGeometry().getInteriorPoint().getCoordinates();
            if(appConfigInfo.mapData==='google'){
                coord = ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326');
                wktGeom= format.writeGeometry(feature.item(0).getGeometry().clone().transform('EPSG:3857','EPSG:4326'));
			}
            else{
				coord = lonlat;//feature.getGeometry().getCoordinates();
				wktGeom= format.writeGeometry(feature.item(0).getGeometry());
            }           
            event.stopPropagation();
            mapObj.removeInteraction(drawFence);
            callbackFunc(coord, wktGeom);
      });  
      function addInteraction() {
        drawFence = new ol.interaction.Draw({
          features: features,
          source: fenceVector.getSource(),
          type: 'Polygon'
        });
        mapObj.addInteraction(drawFence);
        drawFence.on('drawend', function(event){
			
            var feature = event.feature;
            var geometryVal =feature.getGeometry();
            var lonlat;
            var coord,wktGeom;
            lonlat = feature.getGeometry().getInteriorPoint().getCoordinates();
            if(appConfigInfo.mapData==='google'){
                coord = ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326');
                wktGeom= format.writeGeometry(feature.getGeometry().clone().transform('EPSG:3857','EPSG:4326'));
			}
            else{
				coord = lonlat;//feature.getGeometry().getCoordinates();
				wktGeom= format.writeGeometry(feature.getGeometry());
            }
            
            event.stopPropagation();
            mapObj.removeInteraction(drawFence);
			mapObj.addInteraction(modifyFence);
            callbackFunc(coord, wktGeom);
        });
      }
	  
    addInteraction();
}

tmpl.Fence.removeInteraction = function(param){
	var mapObj = param.map;
	mapObj.removeInteraction(modifyFence);
}

tmpl.Fence.addGeometry = function(param){
	var mapObj = param.map;
	var lyrName = param.layer;
	var features = param.features;
	var format = new ol.format.WKT();
	var feature;
	var featureDataAry = [];

	for(var i=0;i<features.length;i++){
		if(appConfigInfo.mapData == 'google'){
			feature = format.readFeature(features[i].geometry, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			});
		}
		else{
			feature = format.readFeature(features[i].geometry, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:4326'
	        });
		} 	
		feature.setStyle(new ol.style.Style({
	        fill: new ol.style.Fill({
				color: features[i].color
	        }),
	        stroke: new ol.style.Stroke({
				color: features[i].color,
	            width: 2
	        })
	    }));
	    //feature.setProperties({"id":features[i].id});
		var keyNames = Object.keys(features[i]);
	    for(var name=0;name< keyNames.length;name++) {
	    	if(keyNames[name] == "geometry"){
	    	}else{
	    		var value = features[i][keyNames[name]];
	    		var x =keyNames[name]
   	 			feature.set(''+x+'',''+value+'');
	    	}
		}
	    //feature.setProperties(features[i]);

	    featureDataAry.push(feature);
	}
	var source=  new ol.source.Vector({
		features: featureDataAry
	});
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var isLayerPresent11 = false;
	for(i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') == lyrName){
				isLayerPresent11 = true;
				existingLayer.getSource().addFeatures(featureDataAry);	
			}
		}
	}
	if (isLayerPresent11 == false) {
		var newLayer = new ol.layer.Vector({
			title: lyrName,
			visible: true,
			source: source
		});
		isLayerPresent11 == true;
		mapObj.addLayer(newLayer);
	}
}


tmpl.Fence.delete = function(param){
	var mapObj = param.map;
	var id = param.id;
	var lyrName = param.layer;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var isLayerPresent11 = false;
	for(i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === lyrName){
				existingLayer.getSource().getFeatures().forEach(function (fea) {
					if(fea.getProperties()['id']==id){
						existingLayer.getSource().removeFeature(fea);
					}
				});				
			}
		}
	}
}


tmpl.Route.getDistanceTime =  function(param) {
	var mapObj = param.map;	
  	var origin = param.origin;
  	var destination = param.destination;
  	var callbackFunc = param.callbackFunc;
  	var dataTable = param.dataTable;
  	var distanceDetails = [];
    var service = new google.maps.DistanceMatrixService;
	service.getDistanceMatrix({
	    origins: [origin],
	    destinations: destination,
	    travelMode: 'DRIVING',
	    unitSystem: google.maps.UnitSystem.METRIC,
	    avoidHighways: false,
	    avoidTolls: false
	}, function(response, status) {
	    if (status !== 'OK') {
	      	alert('Error was: ' + status);
	    } else {
 			var results = response.rows[0].elements;
        	for (var j = 0; j < results.length; j++) {
          		var data = {Distance : results[j].distance.text, Duration : results[j].duration.text , DurationValue : results[j].duration.value};
          		distanceDetails.push(data);
        	}
        }
		callbackFunc(distanceDetails,dataTable);
    });	
}


tmpl.Route.cancelOnClick = function(param){
	
}
// tmpl.Route.onClick = function(param){
	// var click_source_route;
	// var click_destination_route = [];

	// var map1 = param.map;
	// var sourceImg = param.sourceImg;
	// var destinationImg = param.destinationImg;
	// var radius1 = param.radius;
	// var callbackFunc = param.callbackFunc;

	// map1.on('click', getCoord);

	// function getCoord(evt){
		// var feature;
	    // feature = evt.coordinate;
	  
		// if(appConfigInfo.mapData=="google")
		// {
		  // click_source_route=ol.proj.transform(feature, 'EPSG:3857','EPSG:4326');
		// }
		// else
		// {
		  // click_source_route= feature;
		// }
		// click_destination_route.push(click_source_route);

	    // if(click_destination_route.length == 2){
		    // tmpl.Route.getRoute({
		      // map : map1,
		      // source :  click_destination_route[0],
		      // destination : click_destination_route[1],
		      // sourceIcon : sourceImg,//"img/1.png",
		      // destinationIcon : destinationImg,//"img/2.png",
		       // radius :radius1,//20,
		        // getGeometry : test
		    // }); 
		    // map1.un('click', getCoord);
			// var geocodePoint = click_destination_route[0];
		    // click_destination_route = [];
		    // function test(data){
				// //console.log("data >>>",data);
			// tmpl.Geocode.getGeocode({
				// point : geocodePoint,
				// callbackFunc  : handleGeocode	
			// });
			// function handleGeocode(addrs){
				// var result = {
					// route : data,
					// geocode : addrs
				// };
				// callbackFunc(result);
			// }
			// }
	  	// }
	// }
	// tmpl.Route.cancelOnClick = function(param){
		// var map1 = param.map;
		// map1.un('click', getCoord);
	// }
// }


	
tmpl.Route.onClick = function(param){
	var click_source_route;
	var click_destination_route = [];
	var map1 = param.map;
	var sourceImg = param.sourceImg;
	var destinationImg = param.destinationImg;
	var radius1 = param.radius;
	var callbackFunc = param.callbackFunc;
	var iconArray = [sourceImg,destinationImg];
	var newLayer = new ol.layer.Vector({
		lname : 'route_onclik',
			source: new ol.source.Vector()
		});
	if(click_destination_route.length == 0){
	tmpl.Draw.draw({
			map : map1,
			type : 'Point',
      callbackFunc:getDrawFeatureDetails
		});
		function getDrawFeatureDetails(coord, feature, wktGeom, value){
			
			click_destination_route.push(coord);
			var projCoord = ol.proj.transform(coord,'EPSG:4326','EPSG:3857');
			var pointdata = new ol.geom.Point(projCoord);
		var feature2 = new ol.Feature({
			geometry: pointdata
		});
		feature2.setStyle(new ol.style.Style({
			image : new ol.style.Icon({
				src : sourceImg,
				anchor: [0.5, 1]
			})
		}));
			newLayer.getSource().addFeature(feature2);
			map1.addLayer(newLayer);
			
			tmpl.Draw.clear({
			map : map1
		});
			tmpl.Draw.draw({
			map : map1,
			type : 'Point',
			callbackFunc:getDrawFeature
		});
		function getDrawFeature(coord, feature, wktGeom, value){
			click_destination_route.push(coord);
			newLayer.getSource().clear();
				 tmpl.Route.getRoute({
		      map : map1,
		      source :  click_destination_route[0],
		      destination : click_destination_route[1],
		       sourceIcon : sourceImg,//"img/1.png",
		       destinationIcon : destinationImg,//"img/2.png",
		       radius :radius1,//20,
		       getGeometry : test
		    }); 
				tmpl.Draw.clear({
			map : map1
		});
			function test(data){
				//console.log("data >>>",data);
			tmpl.Geocode.getGeocode({
				point : click_destination_route[0],
				callbackFunc  : handleGeocode	
			});
			function handleGeocode(addrs){
				var result = {
					route : data,
					geocode : addrs
				};
				callbackFunc(result);
			}
			
			
			
			var dragedFeature;
			 window.app = {};
  var app = window.app;
var format = new ol.format.WKT();
  app.Drag = function() {
    ol.interaction.Pointer.call(this, {
      handleDownEvent: app.Drag.prototype.handleDownEvent,
      handleDragEvent: app.Drag.prototype.handleDragEvent,
      handleMoveEvent: app.Drag.prototype.handleMoveEvent,
      handleUpEvent: app.Drag.prototype.handleUpEvent
    });
    this.coordinate_ = null;
    this.cursor_ = 'pointer';
    this.feature_ = null;
    this.previousCursor_ = undefined;
  };
  ol.inherits(app.Drag, ol.interaction.Pointer);

  app.Drag.prototype.handleDownEvent = function(evt) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {
			  
			  console.log(layer.get('lname'));
			if(layer == null){
				if(feature.get('lname') == 'routeVector'){
					return feature;
				}
			}else if(layer.get('lname') == "routeVector"){
				if(feature.get('fname') == 'source' || feature.get('fname') == 'destination')
					return feature;
			}

          });
		  
      if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
      }
      return !!feature;
  };

  app.Drag.prototype.handleDragEvent = function(evt) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {    
            return feature;
          });
      var deltaX = evt.coordinate[0] - this.coordinate_[0];
      var deltaY = evt.coordinate[1] - this.coordinate_[1];
      var geometry = 
          (this.feature_.getGeometry());
      geometry.translate(deltaX, deltaY);
      this.coordinate_[0] = evt.coordinate[0];
      this.coordinate_[1] = evt.coordinate[1];
  };

  app.Drag.prototype.handleMoveEvent = function(evt) {
      if (this.cursor_) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
              return feature;
            });
        var element = evt.map.getTargetElement();
        if (feature) {
			editFeature = feature;
			point = feature.getGeometry().getCoordinates();
			var point;
			if(appConfigInfo.mapData==='google')		{
				point = ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
				}
			else
				{
			// do notng
				}
			//point = ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
          if (element.style.cursor != this.cursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.cursor_;
          }
        } else if (this.previousCursor_ !== undefined) {
          element.style.cursor = this.previousCursor_;
          this.previousCursor_ = undefined;
        }
      }
  };

  app.Drag.prototype.handleUpEvent = function(evt) {
      var value=this.feature_.getGeometry().getType();
      if(value==='Point')
      {
        lonlat =this.feature_.getGeometry();
      }
      else if(value==='LineString')
      {
        lonlat =this.feature_.getGeometry();
      }
      else if(value==='Polygon')
      {
        lonlat =this.feature_.getGeometry();
      }
	
      if(appConfigInfo.mapData==='google')
      {         
		coordinate = ol.proj.transform(lonlat.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
        wktGeom= format.writeGeometry(lonlat.clone().transform('EPSG:3857', 'EPSG:4326'));
      }
      else
      {
    	  coordinate = lonlat.getCoordinates();
          wktGeom= format.writeGeometry(lonlat);
      //  wktGeom= format.writeGeometry(this.feature_.getGeometry());
      }

		var result = {
			new_coordinates : coordinate
		};
		var dragFeature = this.feature_;
		if(dragFeature.get('fname') == 'source'){
			tmpl.Route.clearRoute({map : map1});
				 tmpl.Route.getRoute({
		      map : map1,
		      source :  ol.proj.transform(dragFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326'),
		      destination : click_destination_route[1],
		       sourceIcon : sourceImg,//"img/1.png",
		       destinationIcon : destinationImg,//"img/2.png",
		       radius :radius1,//20,
		        getGeometry : test1
		    }); 
			click_destination_route[0] = ol.proj.transform(dragFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
		}else if(dragFeature.get('fname') == 'destination'){
			tmpl.Route.clearRoute({map : map1});
				 tmpl.Route.getRoute({
		      map : map1,
		      source :  click_destination_route[0],
		      destination : ol.proj.transform(dragFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326'),
		       sourceIcon : sourceImg,//"img/1.png",
		       destinationIcon : destinationImg,//"img/2.png",
		       radius :radius1,//20,
		        getGeometry : test1
		    }); 
			click_destination_route[1] = ol.proj.transform(dragFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
		}
		function test1(data){
				//console.log("data >>>",data);
			tmpl.Geocode.getGeocode({
				point : click_destination_route[0],
				callbackFunc  : handleGeocode	
			});
			function handleGeocode(addrs){
				var result = {
					route : data,
					geocode : addrs
				};
				callbackFunc(result);
			}
		}
      //mycallback(result);
      this.coordinate_ = null;
      this.feature_ = null;
      return false;
  };
  intr=new app.Drag();
  map1.addInteraction(intr);
			
			
			
			
			
			
			
			
			
			
			
			
			
			}

		} 
		} 
	}
	

	tmpl.Route.cancelOnClick = function(param){
		var map1 = param.map;
		tmpl.Route.clearRoute({map : map1});
		tmpl.Draw.remove({
			map : map1
		});
	}
}

/*tmpl.Route.joinRoute = function(param){
	var mapObj = param.map;
	var datas = param.feature;
	var callbackFunc = param.callbackFunc;
	var sourceIcon = param.source_image;
	var destinationIcon = param.destination_image;
	
	var noLayer,routeLine1,routeLine2,sourcePoint,destinationPoint;
	var feature1,feature2,featureBuffer1,featureBuffer2;
	
	var format = new ol.format.WKT();
	
	for(var i=0;i<datas.length;i++){
		routeLine1 = datas[0].geometry;
		bufferLine1 = datas[0].buffer;

		routeLine2 = datas[1].geometry;
		bufferLine2 = datas[1].buffer;
		
		if(appConfigInfo.mapData == 'google'){
			feature1 = format.readFeature(routeLine1, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857',
				rname : 'route1',
				routeid : datas[i].id
			});
			featureBuffer1 = format.readFeature(bufferLine1, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			});

			feature2 = format.readFeature(routeLine2, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857',
				rname : 'route2',
				routeid : datas[i].id
			});
			featureBuffer2 = format.readFeature(bufferLine2, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			});
		}
		else{
			feature1 = format.readFeature(routeLine1, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:4326',
				rname : 'route1',
				routeid : datas[i].id
			});
			featureBuffer1 = format.readFeature(bufferLine1, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:4326'
			});

			feature2 = format.readFeature(routeLine2, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:4326',
				rname : 'route2',
				routeid : datas[i].id
			});
			featureBuffer2 = format.readFeature(bufferLine2, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:4326'
			});
		} 
		
		var sourcePoint1 = feature1.getGeometry().getFirstCoordinate();
		var destinationPoint1 = feature1.getGeometry().getLastCoordinate();
		
		var sourcePoint2 = feature2.getGeometry().getFirstCoordinate();
		var destinationPoint2 = feature2.getGeometry().getLastCoordinate();
		
		sourcePoint1 = ol.proj.transform(sourcePoint1, 'EPSG:3857', 'EPSG:4326');
		destinationPoint1 = ol.proj.transform(destinationPoint1, 'EPSG:3857', 'EPSG:4326');
		sourcePoint2 = ol.proj.transform(sourcePoint2, 'EPSG:3857', 'EPSG:4326');
		destinationPoint2 = ol.proj.transform(destinationPoint2, 'EPSG:3857', 'EPSG:4326');
		var stops = [
	     destinationPoint1,
	     sourcePoint2
	    ];
	    tmpl.Route.getRoute({
	      	map : mapObj,
	      	source :  sourcePoint1,
	      	destination : destinationPoint2,
	      	sourceIcon : sourceIcon,
	      	destinationIcon : destinationIcon,
	     	waypoints : stops,
	       //	waypointsIcon : "img/1.png",
	       	radius :param.radius,
	        getGeometry : test,
	        wayPointFormat:false
	    });
	    function test(a){
		    callbackFunc(a);
		}
	}
}*/
tmpl.Route.joinRoute = function(param){
	var mapObj = param.map;
	var datas = param.feature;
	var layerName = param.layerName;
	var callbackFunc = param.callbackFunc;

	var sourceIcon = param.source_image;
	var destinationIcon = param.destination_image;
	
	var routeLine1,feature1;
	var wayPoint = [],sourcePoint = [],destinationPoint = [];
	var sourcePointFirst,destinationPointLast,wayPointLat,wayPointLon;
	var format = new ol.format.WKT();
	if(datas.length >=2){
	for(var i=0;i<datas.length;i++){
		routeLine1 = datas[i].geometry;
		if(appConfigInfo.mapData == 'google'){
			feature1 = format.readFeature(routeLine1, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857',
				rname : 'route1',
				routeid : datas[i].id
			});
			
		}
		else{
			feature1 = format.readFeature(routeLine1, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:4326',
				rname : 'route1',
				routeid : datas[i].id
			});
			
		} 
		if(i == 0){
			sourcePointFirst = feature1.getGeometry().getFirstCoordinate();
			var latlon = feature1.getGeometry().getLastCoordinate()
			wayPointLat = ol.proj.transform(latlon, 'EPSG:3857', 'EPSG:4326');
			wayPoint.push({lat:wayPointLat[1],lon:wayPointLat[0]});
		}else if(i == (datas.length)-1){
			destinationPointLast = feature1.getGeometry().getLastCoordinate();
			var latlon = feature1.getGeometry().getFirstCoordinate()
			wayPointLat = ol.proj.transform(latlon, 'EPSG:3857', 'EPSG:4326');
			wayPoint.push({lat:wayPointLat[1],lon:wayPointLat[0]});
		}else{
			wayPointLat = ol.proj.transform(feature1.getGeometry().getFirstCoordinate(), 'EPSG:3857', 'EPSG:4326');
			var wayPointLon2 = ol.proj.transform(feature1.getGeometry().getLastCoordinate(), 'EPSG:3857', 'EPSG:4326');
			wayPoint.push({lat:wayPointLat[1],lon:wayPointLat[0]});
			wayPoint.push({lat:wayPointLon2[1],lon:wayPointLon2[0]});
		}
		
		
	}
	sourcePointFirst = ol.proj.transform(sourcePointFirst, 'EPSG:3857', 'EPSG:4326');
	destinationPointLast = ol.proj.transform(destinationPointLast, 'EPSG:3857', 'EPSG:4326');
	console.log("wayPoint >>",wayPoint);
	var stops = wayPoint;
    tmpl.Route.getRoute({
      	map : map,
      	source :  sourcePointFirst,
      	destination : destinationPointLast,
      	sourceIcon : sourceIcon,
      	destinationIcon : destinationIcon,
     	waypoints : stops,
       	waypointsIcon : "img/testroute.png",
       	radius :20,
        getGeometry : test//,
       // wayPointFormat:false
    });
    function test(a){
	    //console.log("a>>",a);
	    callbackFunc(a);
	}
}
}
tmpl.Route.clearAddedRoute = function(param){
	var mapObj = param.map;
	var layerName = param.layer;

	var Layers = mapObj.getLayers();
	var existing;
	for(i=0;i<Layers.getLength();i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layerName){
				existing = existingLayer;
				existingLayer.getSource().clear();
			}
		}
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == layerName){
				tmpl_setMap_layer_global[i].layer.getSource().clear();
			}
		}		
	}
}
// NEW TRIP ANIMATION //

var trip_lines_layer_flag =  false;
var trip_lines_layer_direction_flag =  false;
var trip_lines_layer =  new ol.layer.Vector({
						source: new ol.source.Vector()
					});
var trip_lines_layer_direction =  new ol.layer.Vector({
						source: new ol.source.Vector()
					});
var trip_points_layer_flag1 =  false;
var trip_end_marker_flag =  false;
var trip_points_layer1 = new ol.layer.Vector({
						source: new ol.source.Vector()
					});
var trip_points_layer_flag =  false;
var trip_points_layer = new ol.layer.Vector({
						source: new ol.source.Vector()
					});
var trip_end_Marker = new ol.layer.Vector({
	title:'trip_vehcile_marker',
						source: new ol.source.Vector()
					});
var ivlDraw;
var temp_store_animation_pause = {};
var temp_store_animation_stop = {};
var uniqueData = [];
var track_halt_points = [];
var track_halt_points_id = [];
var trak_animationSpeed = 100;
var trak_animationSteps = 15;
var mouseHoverDetails;
var ivlDrawTempDisplay = '';
tmpl.Trip.clear = function (param){
	var map = param.map;
	clearInterval(ivlDrawTempDisplay);
	trip_points_layer1.getSource().clear();
	trip_points_layer.getSource().clear();
	trip_end_Marker.getSource().clear();
	trip_lines_layer.getSource().clear();
	trip_lines_layer_direction.getSource().clear();
	trip_end_marker_flag = false;
	tmpl_trip_vehicle_display.getSource().clear();
	tmpl_trip_layer_display.getSource().clear();
	tmpl_trip_layer_display1.getSource().clear();
	tmpl_trip_halt_display.getSource().clear();
	tmpl_trip_halt_animation.getSource().clear();
	tmpl_trip_start_display.getSource().clear();
	tmpl_trip_start_animation.getSource().clear();
	tmpl_trip_end_display.getSource().clear();
	tmpl_trip_end_animation.getSource().clear();
	map.removeLayer(tmpl_trip_layer_display);
	map.removeLayer(tmpl_trip_layer_display1);
	tripAnimation_started = false;
	tmpl_trip_vehicle_display_flag = false;
	tmpl_trip_layer_display_flag =  false;
	tmpl_trip_halt_display_flag = false;
	tmpl_trip_halt_animation_flag = false;
	tmpl_trip_start_display_flag = false;
	tmpl_trip_start_animation_flag = false;
	tmpl_trip_end_display_flag = false;
	tmpl_trip_end_animation_flag = false;
	tripDataForReplyFromDisplay_flag = false;
	if(gbl_trip_clear_tooltip != undefined)
	gbl_trip_clear_tooltip.style.display = 'none';
	map.un('pointermove', mouseHoverDetails);
	clearInterval(ivlDraw);
}

tmpl.Trip.stopClear = function (param){
	var map = param.map;
	trip_points_layer1.getSource().clear();
	trip_points_layer.getSource().clear();
	trip_end_Marker.getSource().clear();
	trip_lines_layer.getSource().clear();
	trip_lines_layer_direction.getSource().clear();
	trip_end_marker_flag = false;
	// tmpl_trip_vehicle_display.getSource().clear();
	// tmpl_trip_layer_display.getSource().clear();
	// tmpl_trip_halt_display.getSource().clear();
	// tmpl_trip_start_display.getSource().clear();
	// tmpl_trip_end_display.getSource().clear();

	tmpl_trip_halt_animation.getSource().clear();
	tmpl_trip_start_animation.getSource().clear();
	tmpl_trip_end_animation.getSource().clear();
	map.un('pointermove', mouseHoverDetails);
	clearInterval(ivlDraw);
}
var tmpl_trip_halt_animation_flag = false;
var tmpl_trip_halt_animation =  new ol.layer.Vector({
						source: new ol.source.Vector()
					});
var tmpl_trip_start_animation_flag = false;
var tmpl_trip_start_animation =  new ol.layer.Vector({
	source: new ol.source.Vector()
});
var tmpl_trip_end_animation_flag = false;
var tmpl_trip_end_animation =  new ol.layer.Vector({
	source: new ol.source.Vector()
});


var tmpl_trip_layer_display_flag = false;
var tmpl_trip_layer_display =  new ol.layer.Vector({
						source: new ol.source.Vector()
					});
var tmpl_trip_layer_display1 =  new ol.layer.Vector({
	source: new ol.source.Vector()
});
var tmpl_trip_halt_display_flag = false;
var tmpl_trip_halt_display =  new ol.layer.Vector({
						source: new ol.source.Vector()
					});
var tmpl_trip_start_display_flag = false;
var tmpl_trip_start_display =  new ol.layer.Vector({
	source: new ol.source.Vector()
});
var tmpl_trip_end_display_flag = false;
var tmpl_trip_end_display =  new ol.layer.Vector({
	source: new ol.source.Vector()
});
var tmpl_trip_vehicle_display_flag = false;
var tmpl_trip_vehicle_display =  new ol.layer.Vector({
	source: new ol.source.Vector()
});
tmpl.Trip.routeLayer = function(param){
	var visibility = param.visibility;
	tmpl_trip_layer_display.setVisible(visibility);
	tmpl_trip_layer_display1.setVisible(visibility);
	tmpl_trip_halt_display.setVisible(visibility);
	tmpl_trip_start_display.setVisible(visibility);
	tmpl_trip_end_display.setVisible(visibility);
	if(visibility == true)
		trip_lines_layer.setVisible(false);
	else
		trip_lines_layer.setVisible(true);
};
tmpl.Trip.animatingRoute = function(param){
	var visibility = param.visibility;
	trip_lines_layer.setVisible(visibility);
	trip_lines_layer_direction.setVisible(visibility);
};

tmpl.Trip.routeVehicle = function(param){
	var visibility = param.visibility;
	var map = param.map;
	if(tripAnimation_started == true){
		tmpl_trip_vehicle_display.setMap(null);
		if(visibility == true)
		trip_end_Marker.setMap(map);
		else
		trip_end_Marker.setMap(null);
	}else{
		if(visibility == true)
		tmpl_trip_vehicle_display.setMap(map);
		else
		tmpl_trip_vehicle_display.setMap(null);
	}	
};
var tripDataForReplyFromDisplay;
var tripDataForReplyFromDisplay_flag = false;
var tripAnimation_started = false;
var tripDisplay_flag = false;
var Trip_global_delay_time = -1;
var displayFlag = false;

tmpl.Trip.delay =  function(val){
	//tripDataForReplyFromDisplay
	Trip_global_delay_time = val;
}
tmpl.Trip.display =  function(param){
	tmpl.Trip.clear({map : param.map});
	if(param.data.length == 1 || param.data.length == 0){
		alert("Not enough data");
	}else{
	tripDisplay_flag = true;
	tripDataForReplyFromDisplay = param;
	tripDataForReplyFromDisplay.noZoom = true;
	tripDataForReplyFromDisplay_flag = true;
	var tripVehicleId = param.id;
	var data1 = param.data;
	var map = param.map;
	var halt_points = param.halt_points;
	var halt_img;
	var img_url = param.img_url;
	var route_color = param.route_color;
	var callbackFunc = param.callbackFunc;
	var start_url = param.start_url;
	var end_url = param.end_url;
	var minHaltTime = param.minHalt;
	var returnTableData = param.returnTableData;
	var routeMouseOverDetails = param.routeMouseOverDetails;
	var vehicle_icon_scale = param.icon_scale;
	var label = param.label;
	var tooltipLocation = param.tooltipLocation;
	var tripEndCallbackFunc = param.tripEndCallbackFunc;
	var halt_points_index = [];
	var halt_points_indexTemp = [];
	if(param.routeMouseOverDetails == true){
		EnableTripToolTip(map,tooltipLocation);
	}
	if(param.halt_points == true){
		halt_img = param.halt_img;
	}
	var prevLat,prevLon;
	var tempFilterArray = [];
	var uniqueData = [];
	var track_halt_points_id = [],track_halt_points = [],track_halt_points111 = [];
	//console.log(data1);
	for(var i=0;i<data1.length;i++){
		var lat = parseFloat(data1[i].lat);
		var lon = parseFloat(data1[i].lon);
		var tempTime = data1[i].time.slice(0, 8);
		data1[i].time = tempTime;
		var str = lon.toString()+lat.toString();
		data1[i].id = str;
		data1[i].trip_icon = '';
		if(tempFilterArray.indexOf(str) == -1){
			tempFilterArray.push(str);
			uniqueData.push(data1[i]);
		}else{
			//uniqueData[uniqueData.length-1].time = data1[i].time;
		}
		//console.log(data1[i].speed,data1[i].speed == 0 );
		if(i<data1.length-1){
		if(data1[i].speed < 5){
			if(track_halt_points_id.indexOf(str) == -1){
			track_halt_points_id.push(str);
			halt_points_indexTemp.push(i);
			var tempTime1 = data1[i+1].time.slice(0, 8);
			data1[i+1].time = tempTime1;
			var haltDuration = time_diff(data1[i].time,data1[i+1].time);

			track_halt_points111.push({
				lat : data1[i].lat,
				lng : data1[i].lon,
				location : data1[i].location,
				date : data1[i].date,
				startTime : data1[i].time,
				endTime : data1[i+1].time,
				rendering_type : 11,
				haltDuration : haltDuration,
				id : str,
				trip_icon : halt_img
			});
			}else{
				track_halt_points111[track_halt_points111.length - 1].endTime = data1[i].time;
			}
		}
		}
	}
	for(var i=0;i<track_halt_points111.length;i++){
		var s = time_diff(track_halt_points111[i].startTime,track_halt_points111[i].endTime);
			s = parseInt((s.split(':')[0]) * 60 * 60) + parseInt(s.split(':')[1] * 60) + parseInt(s.split(':')[2]);
			s = parseInt(s);
			//console.log(track_halt_points111[i].startTime,track_halt_points111[i].endTime);
			//console.log(minHaltTime,s);
			if(minHaltTime != undefined){
				if(minHaltTime == 0){
					halt_points_index = [];
				}else{
					if(s > minHaltTime){
						//console.log(s,minHaltTime,s > minHaltTime,"valid--",track_halt_points111[i].haltDuration,track_halt_points111[i].startTime,track_halt_points111[i].endTime);
						halt_points_index.push(halt_points_indexTemp[i]);
						track_halt_points.push(track_halt_points111[i]);	
					}else{
						//console.log(s,minHaltTime,s > minHaltTime,"in valid--",track_halt_points111[i].haltDuration,track_halt_points111[i].startTime,track_halt_points111[i].endTime);
					}
				}
				
			}else{
				halt_points_index.push(halt_points_indexTemp[i]);
				track_halt_points.push(track_halt_points111[i]);
			}
	}
	for(var k=0;k<uniqueData.length;k++){
		for(l=0;l<track_halt_points.length;l++){
			if(uniqueData[k].id == track_halt_points[l].id){
				uniqueData[k].trip_icon = track_halt_points[l].trip_icon;
			}
		}
	}
	tripDataForReplyFromDisplay.track_halt_points = track_halt_points;
	tripDataForReplyFromDisplay.uniqueData = uniqueData;
	//console.log("track_halt_points111 >>",track_halt_points111);
	//tripDataForReplyFromDisplay = uniqueData;
	if(tmpl_trip_layer_display_flag == false){
		tmpl_trip_layer_display_flag = true;
		tmpl_trip_layer_display1 =  new ol.layer.Vector({
		title : "trip_line_display_layer1",
		source: new ol.source.Vector(),
		style : new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: route_color,
				width: 4
			})
		})
	});
		tmpl_trip_layer_display =  new ol.layer.Vector({
		title : "trip_line_display_layer",
		source: new ol.source.Vector(),
		style : new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: route_color,
				width: 4
			})
		})
	});
	tmpl_trip_layer_display1.set("display","TripLayerDisplay");
	tmpl_trip_layer_display.set("display","TripLayerDisplay");
	
		map.addLayer(tmpl_trip_layer_display1);
		map.addLayer(tmpl_trip_layer_display);
	}else{
		tmpl_trip_layer_display1.getSource().clear();
		tmpl_trip_layer_display.getSource().clear();
	}
	
	var gblIndex = 1;
function sendDataToDrawAnimationLineTemp(){
	var k = gblIndex;
	
	var prev = [parseFloat(uniqueData[k - 1].lon),parseFloat(uniqueData[k - 1].lat)];
		var pres = [parseFloat(uniqueData[k].lon),parseFloat(uniqueData[k].lat)];
		//console.log(prev,pres);
		if(appConfigInfo.mapData == "google"){
				prev = ol.proj.transform(prev, 'EPSG:4326', 'EPSG:3857');
				pres = ol.proj.transform(pres, 'EPSG:4326', 'EPSG:3857');
		}
		
		var properties = {
				location : uniqueData[k].location,
				speed : uniqueData[k].speed,
				date : uniqueData[k].date,
				time : uniqueData[k].time,
				lat : uniqueData[k].lat,
				lon : uniqueData[k].lon
			};
			drawAnimatedLineTemp(prev, pres, properties);
			gblIndex = gblIndex + 1;
}

	for(var k=1;k<uniqueData.length;k++){
		
		var prev = [parseFloat(uniqueData[k - 1].lon),parseFloat(uniqueData[k - 1].lat)];
		var pres = [parseFloat(uniqueData[k].lon),parseFloat(uniqueData[k].lat)];
		//console.log(prev,pres);
		if(appConfigInfo.mapData == "google"){
				prev = ol.proj.transform(prev, 'EPSG:4326', 'EPSG:3857');
				pres = ol.proj.transform(pres, 'EPSG:4326', 'EPSG:3857');
		}
		else{
		    	
		}
		var properties = {
				location : uniqueData[k].location,
				speed : uniqueData[k].speed,
				date : uniqueData[k].date,
				time : uniqueData[k].time,
				lat : uniqueData[k].lat,
				lon : uniqueData[k].lon
			};
		//drawAnimatedLineTemp(prev, pres, properties);
		//console.log(prev,pres);
		var lineString = new ol.geom.LineString([prev, pres]);
		var feature2 = new ol.Feature({
			geometry: lineString
		});
		
		feature2.setProperties(properties);
		tmpl_trip_layer_display1.getSource().addFeature(feature2);
		if(k == uniqueData.length - 1){
			tmpl.Zoom.toLayer({
					map : map,
					layer : "trip_line_display_layer1"
				});
			sendDataToDrawAnimationLineTemp();
		}
	}

	function drawAnimatedLineTemp(startPt, endPt, properties){
    var directionX = (endPt[0] - startPt[0]) / trak_animationSteps;
    var directionY = (endPt[1] - startPt[1]) / trak_animationSteps;
    var i = 0; var newEndPt;
    ivlDrawTempDisplay = setInterval(function () {
        if (i > trak_animationSteps) {
            clearInterval(ivlDrawTempDisplay);
			if(gblIndex < uniqueData.length){
				sendDataToDrawAnimationLineTemp();
			}else{
				tmpl_trip_layer_display1.getSource().clear();
			}
            return;
        }
        newEndPt = [startPt[0] + i * directionX, startPt[1] + i * directionY];
        var line = new ol.geom.LineString([startPt, newEndPt]);
        var point = new ol.geom.Point(newEndPt);
        var fea = new ol.Feature(line);
		fea.setProperties(properties);
		tmpl_trip_layer_display.getSource().addFeature(fea);
        i++;
    }, 0);
}

	for(var k=1;k<uniqueData.length;k++){
		
		
	}
	//console.log("uniqueData[0] >>",uniqueData[0]);
	var properties = {
				location : uniqueData[0].location,
				speed : uniqueData[0].speed,
				date : uniqueData[0].date,
				time : uniqueData[0].time,
				lat : uniqueData[0].lat,
				lon : uniqueData[0].lon
			};
	callbackFunc(properties);
	if(param.halt_points == true){
	if(tmpl_trip_halt_display_flag == false){
		tmpl_trip_halt_display_flag = true;
		tmpl_trip_halt_display =  new ol.layer.Vector({
		title : "trip_halt",
		source: new ol.source.Vector(),
		style : new ol.style.Style({
			image : new ol.style.Icon({
				src : halt_img,
				anchor: [0.5, 1]
			})
		})
	});
		map.addLayer(tmpl_trip_halt_display);
	}else{
		tmpl_trip_halt_display.getSource().clear();
	}
	
	for(var j=0;j<track_halt_points.length;j++){
		var pres = [parseFloat(track_halt_points[j].lng),parseFloat(track_halt_points[j].lat)];
		//console.log(pres);
		if(appConfigInfo.mapData == "google"){
			pres = ol.proj.transform(pres, 'EPSG:4326', 'EPSG:3857');
		}
		else{
		    	
		}
		//console.log(pres);
		var pointdata = new ol.geom.Point(pres);
		var feature2 = new ol.Feature({
			geometry: pointdata
		});
		feature2.setProperties(track_halt_points[j]);
		tmpl_trip_halt_display.getSource().addFeature(feature2);
	}
	//console.log(tmpl_trip_halt_display.getSource().getFeatures().length);
	}
	
	if(tmpl_trip_start_display_flag == false){
		tmpl_trip_start_display_flag = true;
		tmpl_trip_start_display =  new ol.layer.Vector({
		source: new ol.source.Vector(),
		title : "trip_start",
		style : new ol.style.Style({
			image : new ol.style.Icon({
				src : start_url,
				anchor: [0.45, 1],
				anchorOrigin: 'top-bottom'
			})
		})
	});
		map.addLayer(tmpl_trip_start_display);
	}else{
		tmpl_trip_start_display.getSource().clear();
	}
	
	
	if(tmpl_trip_end_display_flag == false){
		tmpl_trip_end_display_flag = true;
		tmpl_trip_end_display =  new ol.layer.Vector({
		source: new ol.source.Vector(),
		title : "trip_end",
		style : new ol.style.Style({
			image : new ol.style.Icon({
				src : end_url,
				anchor: [0.5, 1]
			})
		})
	});
		map.addLayer(tmpl_trip_end_display);
	}else{
		tmpl_trip_end_display.getSource().clear();
	}
	
	if(tmpl_trip_vehicle_display_flag == false){
		tmpl_trip_vehicle_display_flag = true;
			var scale = 1;
				if(vehicle_icon_scale != undefined)
					scale = vehicle_icon_scale;
		tmpl_trip_vehicle_display =  new ol.layer.Vector({
		source: new ol.source.Vector(),
		style : new ol.style.Style({
			image : new ol.style.Icon({
				src : img_url,
				scale : scale
			})
		})
	});
		tmpl_trip_vehicle_display.setMap(map);
	}else{
		tmpl_trip_vehicle_display.getSource().clear();
	}
	
		var end_pos = uniqueData.length-1;
		var start = [parseFloat(uniqueData[0].lon),parseFloat(uniqueData[0].lat)];
		var end = [parseFloat(uniqueData[end_pos].lon),parseFloat(uniqueData[end_pos].lat)];
		if(appConfigInfo.mapData == "google"){
			start = ol.proj.transform(start, 'EPSG:4326', 'EPSG:3857');
			end = ol.proj.transform(end, 'EPSG:4326', 'EPSG:3857');
		}
		else{
		    	
		}
		var pointdata_s = new ol.geom.Point(start);
		var pointdata_e = new ol.geom.Point(end);
		var feature2_s = new ol.Feature({
			geometry: pointdata_s
		});
		var feature2_v = new ol.Feature({
			geometry: pointdata_s
		});
		var feature2_e = new ol.Feature({
			geometry: pointdata_e
		});
		feature2_s.setProperties(uniqueData[0]);
		feature2_s.set('id','trip_start');
		feature2_s.set('rendering_type',12);	
		
		feature2_v.set('rendering_type',13);
		feature2_v.set('layer_name','trip_vehcile_marker');
		feature2_v.setProperties(uniqueData[0]);
		
		feature2_v.set('id',tripVehicleId);
		
		feature2_e.setProperties(uniqueData[end_pos]);
		feature2_e.set('rendering_type',12);
		feature2_e.set('id','trip_end');
		tmpl_trip_start_display.getSource().addFeature(feature2_s);
		tmpl_trip_vehicle_display.getSource().addFeature(feature2_v);
		tmpl_trip_end_display.getSource().addFeature(feature2_e);
		if(routeMouseOverDetails == true){
		var ta_tooltip = document.createElement('tooltip');
    ta_tooltip.id = 'trip-tooltip';
    ta_tooltip.className = 'ol-trip-tooltip';
    var overlay_mouseOver_label = new ol.Overlay({
        element: ta_tooltip,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
	
	map.addOverlay(overlay_mouseOver_label);
				map.on('pointermove', function(evt){
			
			var feature_mouseOver = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
			//if(layer){
				if(feature.get('layer_name') == 'trip_vehcile_marker'){
					
					return feature;
				}
			//}
			});
			ta_tooltip.style.display = feature_mouseOver ? '' : 'none';
			if(feature_mouseOver) {
				overlay_mouseOver_label.setPosition(evt.coordinate);
				ta_tooltip.innerHTML = label;
			}
		});
		
	}
	if(returnTableData == true){
		var callbackFunc=param.TableDataCallBack;
		var data= param.data;
		var grid_data = [];
		var table_data = [];
		var halt_index = 0;
		for(var i =0; i<data.length; i++){
			if(halt_points_index.indexOf(i) != -1){
				table_data[i] = {};
				table_data[i].latitude = data[i].lat;
				table_data[i].longitude = data[i].lon;
				table_data[i].date = data[i].date;
				table_data[i].time = data[i].time;
				table_data[i].location = data[i].location;
				table_data[i].speed = data[i].speed;
				table_data[i].haltInTime = track_halt_points[halt_index].startTime;
				table_data[i].haltOutTime = track_halt_points[halt_index].endTime;
				var s = time_diff(track_halt_points[halt_index].endTime,track_halt_points[halt_index].startTime)
				table_data[i].haltDuration = s;
				halt_index = halt_index + 1;
			}else{
			table_data[i] = {};
			table_data[i].latitude = data[i].lat;
			table_data[i].longitude = data[i].lon;
			table_data[i].date = data[i].date;
			table_data[i].time = data[i].time;
			table_data[i].location = data[i].location;
			table_data[i].speed = data[i].speed;
			table_data[i].haltInTime = '';
			table_data[i].haltOutTime = '';
			table_data[i].haltDuration = '';
			}
		}
		var index = grid_data.length;
			grid_data[index] = {};
			grid_data[index].typemessage = "trip start";
			grid_data[index].latitude = uniqueData[0].lat;
			grid_data[index].longitude = uniqueData[0].lon;
			grid_data[index].date = uniqueData[0].date;
			grid_data[index].time = uniqueData[0].time;
			grid_data[index].haltInTime = 0;
			grid_data[index].haltOutTime = 0;
			grid_data[index].haltDuration = 0;
			grid_data[index].location = uniqueData[0].location;
			index = index + 1;
		for(var i =0; i<track_halt_points.length; i++){
			grid_data[index] = {};
			grid_data[index].typemessage = "trip halt";
			grid_data[index].latitude = track_halt_points[i].lat;
			grid_data[index].longitude = track_halt_points[i].lng;
			grid_data[index].date = track_halt_points[i].date;
			grid_data[index].time = track_halt_points[i].startTime;
			grid_data[index].haltInTime = track_halt_points[i].startTime;
			grid_data[index].haltOutTime = track_halt_points[i].endTime;
			var s = time_diff(track_halt_points[i].endTime,track_halt_points[i].startTime);
			grid_data[index].haltDuration = s;
			grid_data[index].location = track_halt_points[i].location;
			index = index + 1;
		}
			grid_data[index] = {};
			grid_data[index].typemessage = "trip end";
			grid_data[index].latitude = uniqueData[uniqueData.length-1].lat;
			grid_data[index].longitude = uniqueData[uniqueData.length-1].lon;
			grid_data[index].date = uniqueData[uniqueData.length-1].date;
			grid_data[index].time = uniqueData[uniqueData.length-1].time;
			grid_data[index].haltInTime = 0;
			grid_data[index].haltOutTime = 0;
			grid_data[index].haltDuration = 0;
			grid_data[index].location = uniqueData[uniqueData.length-1].location;
		var result = {};
		result.grid_data = grid_data;
		result.table_data = table_data;
		xxx = result;
		//alert();
		//console.log(result,halt_points_index,track_halt_points);
		callbackFunc(result);
	}
}
};

function time_diff(t1, t2) 
{
  var timeStart = new Date("01/01/2007 " + t1).getHours();
var timeEnd = new Date("01/01/2007 " + t2).getHours(); 

 // get total seconds between the times
var delta = Math.abs(new Date("01/01/2007 " + t1) - new Date("01/01/2007 " + t2)) / 1000;

// calculate (and subtract) whole days
var days = Math.floor(delta / 86400);
delta -= days * 86400;

// calculate (and subtract) whole hours
var hours = Math.floor(delta / 3600) % 24;
delta -= hours * 3600;

// calculate (and subtract) whole minutes
var minutes = Math.floor(delta / 60) % 60;
delta -= minutes * 60;

// what's left is seconds
var seconds = delta % 60;
 
return hours+":"+minutes+":"+seconds;
}

tmpl.Trip.replay = function() {
	if(tripDataForReplyFromDisplay_flag == true){
		tripDataForReplyFromDisplay.hideAllLayers = true;
		tmpl.Trip.animation(tripDataForReplyFromDisplay);
		tripDataForReplyFromDisplay_flag = false;
	}
}
tmpl.Trip.play = function(){
					if(tripDataForReplyFromDisplay_flag == true){
						tripDataForReplyFromDisplay.hideAllLayers = true;
						tmpl.Trip.animation(tripDataForReplyFromDisplay);
						tripDataForReplyFromDisplay_flag = false;
					}else{
					//console.log(current_status_flag);
						
					}
				}
function rotate(seg) {
      b_x = 0;
      b_y = 1;
      a_x = seg.x2 - seg.x1;
      a_y = seg.y2 - seg.y1;
      angle_rad = Math.acos((a_x * b_x + a_y * b_y) / Math.sqrt(a_x * a_x + a_y * a_y));
      if (a_x < 0) {
        return 2 * Math.PI - angle_rad;
      } else {
        return angle_rad;
      }
    }
	var firs_delayFlag = false;				
tmpl.Trip.animation = function (param){
	var previousDistance = 0;
	console.log(param);
	var data1 = param.data;
	var map = param.map;
	var tripVehicleId = param.id;
	uniqueData = [];
	var halt_points = param.halt_points;
	var halt_img;
	var route_color = param.route_color;
	var callbackFunc = param.callbackFunc;
	var routeMouseOverDetails = param.routeMouseOverDetails;
	var hideAllLayers = param.hideAllLayers;
	var vehicle_icon_scale = param.icon_scale;
	var label = param.label;
	var tooltipLocation = param.tooltipLocation;
	var tripEndCallbackFunc = param.tripEndCallbackFunc;
	var noZoom = param.noZoom;
	var directionImgae = param.directionImgae;
	if(label == undefined)
		label = '';
	if(directionImgae == undefined)
		directionImgae = 'https://openlayers.org/en/v4.0.1/examples/data/arrow.png';
	tripAnimation_started = true;
	if(param.routeMouseOverDetails == true){
		EnableTripToolTip(map,tooltipLocation);
	}
	
	if(param.halt_points == true){
		halt_img = param.halt_img;
		temp_store_animation_stop.halt_img = halt_img;
	}
	var img_url = param.img_url;
	temp_store_animation_stop.map = map;
	temp_store_animation_stop.data = data1;
	temp_store_animation_stop.img_url = img_url;
	temp_store_animation_stop.callbackFunc = callbackFunc;
	temp_store_animation_stop.route_color = route_color;
	temp_store_animation_stop.routeMouseOverDetails = routeMouseOverDetails;
	temp_store_animation_stop.halt_points = halt_points;
	temp_store_animation_stop.track_halt_points = param.track_halt_points;
	temp_store_animation_stop.uniqueData = param.uniqueData;
	temp_store_animation_stop.icon_scale = param.icon_scale;
	temp_store_animation_stop.tooltipLocation = param.tooltipLocation;
	temp_store_animation_stop.tripEndCallbackFunc = param.tripEndCallbackFunc;
	temp_store_animation_stop.noZoom = param.noZoom;
	temp_store_animation_stop.directionImgae = param.directionImgae;
	animatebtn(map);
	//console.log("before sort:"+data1.length);
	var prevLat,prevLon;
	var tempFilterArray = [];
	//console.log(data1);
	for(var i=0;i<data1.length;i++){
		var lat = parseFloat(data1[i].lat);
		var lon = parseFloat(data1[i].lon);
		var tempTime11 = data1[i].time.slice(0, 8);
			data1[i].time = tempTime11;
		var str = lon.toString()+lat.toString();
		if(tempFilterArray.indexOf(str) == -1){
			tempFilterArray.push(str);
			uniqueData.push(data1[i]);
		}
		//console.log(data1[i].speed,data1[i].speed == 0 );
		if(data1[i].speed == 0){
			
			if(track_halt_points_id.indexOf(str) == -1){
			track_halt_points_id.push(str);
			track_halt_points.push({
				lat : data1[i].lat,
				lng : data1[i].lon,
				location : data1[i].location,
				date : data1[i].date,
				startTime : data1[i].time,
				endTime : data1[i].time,
				id : str
			});
			}else{
				track_halt_points[track_halt_points.length - 1].endTime = data1[i].time;
			}
		}
	}
	if(noZoom == true){
		
	}else{
		tmpl.Zoom.toXYcustomZoom({
			map : map,
			latitude : uniqueData[0].lat,
			longitude : uniqueData[0].lon,
			zoom : 16
		});
	}
	
	
	var index = 1;
	var i = index;
	var temp_halt_index = '';
	extraAnimation();
	function panMap(point){
		var map = this.map;
		var current=point;
		var currentgps = new ol.geom.Point(current);
        var cur_veh = new ol.Feature(currentgps);
        var view_port =  
		map.getView().calculateExtent(map.getSize());
        var  vehicle_inside=cur_veh.getGeometry().intersectsExtent(view_port);
        if(vehicle_inside==false){
            map.getView().setCenter(current);
        }
	}
	function drawAnimatedLine(startPt, endPt, steps, trak_animationSpeed, fn,properties,delay){
    var directionX = (endPt[0] - startPt[0]) / trak_animationSteps;
    var directionY = (endPt[1] - startPt[1]) / trak_animationSteps;
    var i = 0;
    var prevLayer;
	var newEndPt;
	
	temp_store_animation_pause = {
		startPt : startPt,
		endPt : endPt,
		steps : trak_animationSteps,
		time : trak_animationSpeed,
		properties : properties,
		delayProperties : delay
	};
	
	if(callbackFunc != undefined)
	callbackFunc(properties);
	var angle = rotate({
			x1: startPt[0],
			y1: startPt[1],
			x2: endPt[0],
			y2: endPt[1]
		});
    ivlDraw = setInterval(function () {
        if (i > trak_animationSteps) {
            clearInterval(ivlDraw);
			extraAnimation();
            return;
        }
        newEndPt = [startPt[0] + i * directionX, startPt[1] + i * directionY];
		panMap(newEndPt);
		temp_store_animation_pause.startPt = newEndPt;
		temp_store_animation_pause.steps = temp_store_animation_pause.steps - 1;
        var line = new ol.geom.LineString([startPt, newEndPt]);
        var point = new ol.geom.Point(newEndPt);
        var fea = new ol.Feature(line);
		fea.setProperties(properties);
		//console.log(newEndPt,endPt);
		
		if(newEndPt[0] == endPt[0] && newEndPt[1] == endPt[1]){
			fea.set('inter',false);
			//console.log(true);
		}
		else{
			fea.set('inter',true);
		}
		
		var delay_halt_fea = new ol.Feature(point);
		delay_halt_fea.setProperties(properties);
		
		var p_fea = new ol.Feature(point);
			
			if(trip_lines_layer_flag ==  false){
					trip_lines_layer = new ol.layer.Vector({
					source: new ol.source.Vector({
						features : [fea]
					}),
					//style: styleFunction
					style : new ol.style.Style({
						stroke: new ol.style.Stroke({
							color: route_color,
							width: 4
						})
					})
				});
				trip_lines_layer.set("trip","TripAnimationLayer");
				trip_lines_layer.setMap(map);
				tmpl_setMap_layer_global.push({
					layer : trip_lines_layer,
					title :  'TripAnimationLayer',
					visibility : true,
					map : map
				});
				//map.addLayer(trip_lines_layer);
				trip_lines_layer_flag = true;
trip_lines_layer.setVisible(false);
			}else{
				
				
				
				if(Trip_global_delay_time != -1){
					//console.log("outside",delay,Trip_global_delay_time);
					delay = parseInt(delay);
				if(delay < Trip_global_delay_time){
					trip_lines_layer.getSource().addFeature(fea);
					firs_delayFlag = false;
				}else{
					
					
					if(firs_delayFlag == false){
					//zzzzzzzzz
					delay_halt_fea.set('rendering_type',12);
					tmpl_trip_halt_animation.getSource().addFeature(delay_halt_fea);
					firs_delayFlag = true;
					//console.log("inside",delay,Trip_global_delay_time);
					}
					
					
					
				}
				}else{
					
					trip_lines_layer.getSource().addFeature(fea);
				}
			}
			if(trip_lines_layer_direction_flag ==  false){
					trip_lines_layer_direction = new ol.layer.Vector({
					source: new ol.source.Vector()
				});
				trip_lines_layer_direction.setMap(map);
				tmpl_setMap_layer_global.push({
					layer : trip_lines_layer_direction,
					title :  'TripAnimationLayerDirection',
					visibility : true,
					map : map
				});
				//map.addLayer(trip_lines_layer_direction);
				trip_lines_layer_direction_flag = true;
			}else{
		if(fea.get('inter') == false){
          var dx = newEndPt[0] - startPt[0];
          var dy = newEndPt[1] - startPt[1];
		 var xxx = new ol.geom.LineString([startPt, newEndPt]);
          var curdis = Math.round(xxx.getLength() * 100) / 100;
		  previousDistance = previousDistance + curdis;
		   var rotation = Math.atan2(dy, dx);
		   //console.log(previousDistance);
		  if(previousDistance > 600){
			  previousDistance = 0;
			 
          p_fea.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
              src: directionImgae,
              anchor: [0.75, 0.5],
              rotateWithView: true,
              rotation: -rotation
            })
          }));
		  }else{
			    p_fea.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
            radius: 0,
            fill: new ol.style.Fill({
              color: 'rgba(55, 155, 55, 1)',
            })
          })
          }));
		  }
			trip_lines_layer_direction.getSource().addFeature(p_fea);
		}
			}
			if(trip_end_marker_flag ==  false){
				var scale = 1;
				if(vehicle_icon_scale != undefined)
					scale = vehicle_icon_scale;
				
				
				
		
				 p_fea.setStyle(new ol.style.Style({
					image: new ol.style.Icon({
						src: img_url,
						rotation: angle,
						scale: scale
					})
				}));
				p_fea.setProperties(properties);
				p_fea.set('rendering_type',13);
				p_fea.set('id',tripVehicleId);
				p_fea.set('layer_name','trip_vehcile_marker');
				trip_end_Marker = new ol.layer.Vector({
					title:'trip_vehcile_marker',
					source: new ol.source.Vector({
						features : [p_fea]
					})
				});
				trip_end_Marker.setMap(map);
				
				tmpl_setMap_layer_global.push({
					layer : trip_end_Marker,
					title :  'trip_vehcile_marker',
					visibility : true,
					map : map
				});
					
				trip_end_marker_flag = true;
			}else{
				//p_fea.setProperties(properties);
				if(trip_end_Marker.getSource().getFeatures().length == 1){
					trip_end_Marker.getSource().getFeatures()[0].setProperties(properties);
					trip_end_Marker.getSource().getFeatures()[0].getStyle().getImage().setRotation(angle);
					trip_end_Marker.getSource().getFeatures()[0].getGeometry().setCoordinates(newEndPt);
				}
				else{
					trip_end_Marker.getSource().addFeatures([p_fea]); 
				}
			}
        i++;
    }, trak_animationSpeed);
}
	function extraAnimation(){
		if(index < uniqueData.length){
			i = index;
			var lat = parseFloat(uniqueData[i].lat);
			var plat = parseFloat(uniqueData[i-1].lat);
			var lon = parseFloat(uniqueData[i].lon);
			var plon = parseFloat(uniqueData[i-1].lon);
			var point,p_point,p_point1;
			var s = time_diff(uniqueData[i].time,uniqueData[i-1].time);
			s = s.split(':')[0] * 60 * 60 + s.split(':')[1] * 60 + s.split(':')[2];
			var delayProperties = s;
			if(appConfigInfo.mapData === "google"){
				point = ol.proj.transform([lon,lat], 'EPSG:4326', 'EPSG:3857');
				p_point = ol.proj.transform([plon,plat], 'EPSG:4326', 'EPSG:3857');
		    }
		    else{
		    	point = [lon,lat];
				p_point = [plon,plat];
		    }
			var pointGeom = new ol.geom.Point(p_point);
			var p_feature = new ol.Feature({
				geometry : pointGeom
			}); 
			if(track_halt_points_id.indexOf(tempFilterArray[i-1]) != -1){
				var inin = track_halt_points_id.indexOf(tempFilterArray[i-1]);
				var plat1 = parseFloat(track_halt_points[inin].lat);
			var plon1 = parseFloat(track_halt_points[inin].lng);
			if(appConfigInfo.mapData === "google"){
				p_point1 = ol.proj.transform([plon1,plat1], 'EPSG:4326', 'EPSG:3857');
			}else{
				p_point1 = [plon1,plat1];
			}
			var pointGeom1 = new ol.geom.Point(p_point1);
			var p_feature1 = new ol.Feature({
				geometry : pointGeom1
			});
			p_feature1.setProperties(track_halt_points[inin]);
			//console.log(p_point1);
			if(param.halt_points == true){
	
			if(trip_points_layer_flag1 ==  false){
				trip_points_layer1 = new ol.layer.Vector({
					source: new ol.source.Vector({
						features : [p_feature1]
					}),
					style : new ol.style.Style({
						image : new ol.style.Icon({
							anchor: [0.5, 1],
							src : halt_img,
							//offset : [0,-5]
						})
					})
				});
				trip_points_layer1.set('title','Halt_Layer');
				map.addLayer(trip_points_layer1);
				trip_points_layer_flag1 = true;
			}else{
				//trip_points_layer1.getSource().clear();
				trip_points_layer1.getSource().addFeature(p_feature1);
			}
			}
		}
			var properties = {
				location : uniqueData[i].location,
				speed : uniqueData[i].speed,
				date : uniqueData[i].date,
				time : uniqueData[i].time,
				lat : uniqueData[i].lat,
				lon : uniqueData[i].lon
			};
	if(hideAllLayers == true){
		tmpl_trip_vehicle_display.setVisible(false);
		trip_points_layer1.setVisible(false);
		trip_points_layer.setVisible(false);
		//trip_end_Marker
		//trip_lines_layer.setVisible(false);
	}
	//if(param.animationHaltPoints == true){
	if(param.halt_points == true){
			var track_halt_points_animation = [],uniqueDataAnimation = [];
		track_halt_points_animation = param.track_halt_points;
		uniqueDataAnimation = param.uniqueData;
		
	if(tmpl_trip_halt_animation_flag == false){
		tmpl_trip_halt_animation_flag = true;
		tmpl_trip_halt_animation =  new ol.layer.Vector({
		title : "trip_halt1",
		source: new ol.source.Vector(),
		style : new ol.style.Style({
			image : new ol.style.Icon({
				src : param.halt_img,
				anchor: [0.5, 1]
			})
		})
	});
		map.addLayer(tmpl_trip_halt_animation);
	}else{
		//console.log(temp_halt_index,(i-1));
		if(temp_halt_index == (i-1)){
			if((i-1) != 0){
			//console.log(temp_halt_index == (i-1));
		var pres = [parseFloat(uniqueDataAnimation[i-1].lon),parseFloat(uniqueDataAnimation[i-1].lat)];
		//console.log("aa",uniqueDataAnimation[i].trip_icon,pres);
		if(appConfigInfo.mapData == "google"){
			pres = ol.proj.transform(pres, 'EPSG:4326', 'EPSG:3857');
		}
		else{
		    	
		}
		var pointdata = new ol.geom.Point(pres);
		var feature2 = new ol.Feature({
			geometry: pointdata
		});
		feature2.setProperties(track_halt_points_animation[i-1]);
		tmpl_trip_halt_animation.getSource().addFeature(feature2);
		//tmpl_trip_halt_animation.getSource().clear();
		}
		}
		if(uniqueDataAnimation[i].trip_icon != ''){
			temp_halt_index = i;
		}
		
	}
	
	
	if(i == 1){
	if(tmpl_trip_start_animation_flag == false){
		tmpl_trip_start_animation_flag = true;
		tmpl_trip_start_animation =  new ol.layer.Vector({
		source: new ol.source.Vector(),
		title : "trip_start1",
		style : new ol.style.Style({
			image : new ol.style.Icon({
				src : param.start_url,
				anchor: [0.45, 1],
				anchorOrigin: 'top-bottom'
			})
		})
	});
		map.addLayer(tmpl_trip_start_animation);
		var pres = [parseFloat(uniqueData[0].lon),parseFloat(uniqueData[0].lat)];
		if(appConfigInfo.mapData == "google"){
			pres = ol.proj.transform(pres, 'EPSG:4326', 'EPSG:3857');
		}
		else{
		    	
		}
		var pointdata = new ol.geom.Point(pres);
		var feature2 = new ol.Feature({
			geometry: pointdata
		});
		feature2.setProperties(uniqueData[0]);
		feature2.set('rendering_type',12);
		tmpl_trip_start_animation.getSource().addFeature(feature2);
	}else{
		//tmpl_trip_start_animation.getSource().clear();
				var pres = [parseFloat(uniqueData[0].lon),parseFloat(uniqueData[0].lat)];
		if(appConfigInfo.mapData == "google"){
			pres = ol.proj.transform(pres, 'EPSG:4326', 'EPSG:3857');
		}
		else{
		    	
		}
		var pointdata = new ol.geom.Point(pres);
		var feature2 = new ol.Feature({
			geometry: pointdata
		});
		feature2.setProperties(uniqueData[0]);
		feature2.set('rendering_type',12);
		tmpl_trip_start_animation.getSource().addFeature(feature2);
		//tmpl_trip_start_animation.getSource().clear();
	}
	}
	}
	if(i == uniqueData.length-1){
	
	}
	//}
	drawAnimatedLine(p_point,point, trak_animationSteps, trak_animationSpeed, function () {},properties,delayProperties);
	
	}else{
		//alert("zzz");
		tmpl.Trip.stop();
		if(tripEndCallbackFunc != undefined)
		tripEndCallbackFunc();
	}
		index = index + 1;
	}
	function panMap(point){
		var current=point;//[lat,lon];
		var currentgps = new ol.geom.Point(current);
        var cur_veh = new ol.Feature(currentgps);
        var view_port =  
		map.getView().calculateExtent(map.getSize());
        var  vehicle_inside=cur_veh.getGeometry().intersectsExtent(view_port);
        if(vehicle_inside==false){
            map.getView().setCenter(current);
        }
	}

 function animatebtn(map) {
            try {
			
				var current_status_flag = "start";

                tmpl.Trip.pause = function(){
					if(current_status_flag == "none"){
						
					}else if(current_status_flag == "start"){
						clearInterval(ivlDraw);
						current_status_flag = "pause";
					}else if(current_status_flag == "pause"){
						
					}else if(current_status_flag == "stop"){
						
					}
				}
				tmpl.Trip.play = function(){
					if(tripDataForReplyFromDisplay_flag == true){
						tripDataForReplyFromDisplay.hideAllLayers = true;
						tmpl.Trip.animation(tripDataForReplyFromDisplay);
						//tmpl.Trip.display(tripDataForReplyFromDisplay);
						tripDataForReplyFromDisplay_flag = false;
					}else{
						
					//console.log(current_status_flag);
					if(current_status_flag == "none"){
						//tmpl.Trip.clear({map : temp_store_animation_stop.map});
						tmpl.Trip.stopClear({map : temp_store_animation_stop.map});
						tmpl.Trip.animation(temp_store_animation_stop);
					}else if(current_status_flag == "start"){
						
					}else if(current_status_flag == "pause"){
						drawAnimatedLine(temp_store_animation_pause.startPt,temp_store_animation_pause.endPt, temp_store_animation_pause.steps, temp_store_animation_pause.time, function () {},temp_store_animation_pause.properties,temp_store_animation_pause.delayProperties);
					}else if(current_status_flag == "stop"){
						
						//tmpl.Trip.clear({map : temp_store_animation_stop.map});
						tmpl.Trip.stopClear({map : temp_store_animation_stop.map});
						tmpl.Trip.animation(temp_store_animation_stop);
					}
					current_status_flag = "start";	
					}
				}
					
			   tmpl.Trip.stop = function(param){
					if(current_status_flag == "none"){
						
					}else if(current_status_flag == "start"){
						clearInterval(ivlDraw);
						current_status_flag = "stop";
					}else if(current_status_flag == "pause"){
						clearInterval(ivlDraw);
						current_status_flag = "stop";
					}else if(current_status_flag == "stop"){
						
					}
					 
				}
					var animationSpeedLevel = 3;
					tmpl.Trip.speedInc = function(){
						var level = animationSpeedLevel + 1;
						if(level >= 5 ){
							animationSpeedLevel = 5;
							trak_animationSpeed = 30;
						}else if(level == '4' || level == 4){
							trak_animationSpeed = 50;
						}else if(level == '3' || level == 3){
							trak_animationSpeed = 100;
						}else if(level == '2' || level == 2){
							trak_animationSpeed = 250;
						}else if(level == '1' || level == 1){
							trak_animationSpeed = 450;
						}
					}
					tmpl.Trip.speedDec = function(){
						var level = animationSpeedLevel - 1;
						if(level == '5' || level == 5){
							trak_animationSpeed = 30;
						}else if(level == '4' || level == 4){
							trak_animationSpeed = 50;
						}else if(level == '3' || level == 3){
							trak_animationSpeed = 100;
						}else if(level == '2' || level == 2){
							trak_animationSpeed = 250;
						}else if(level <= 1){
							trak_animationSpeed = 450;
							animationSpeedLevel = 1;
						}
					}
					tmpl.Trip.speed = function(param){
						//tmpl.Trip.pause();
						var level = param.level;
						if(level == '5' || level == 5){
							trak_animationSpeed = 30;
						}else if(level == '4' || level == 4){
							trak_animationSpeed = 50;
						}else if(level == '3' || level == 3){
							trak_animationSpeed = 100;
						}else if(level == '2' || level == 2){
							trak_animationSpeed = 250;
						}else if(level == '1' || level == 1){
							trak_animationSpeed = 450;
						}
						//console.log(trak_animationSpeed);
					}
            } catch (err) {
                console.warn("API EC Code: TRPG0091_BTN" + err);
            } 
        }
}

function DisableTripToolTip(map) {
    map.un('pointermove', mouseHoverDetails);
}
var gbl_trip_clear_tooltip;
function EnableTripToolTip(map,loc) {
	//if(mouseHoverDetails != undefined)
    //DisableTripToolTip(map);

    var ta_tooltip = document.createElement('tooltip');
    ta_tooltip.id = 'trip-tooltip';
    ta_tooltip.className = 'ol-trip-tooltip';
    var overlay_mouseOver_trip = new ol.Overlay({
        element: ta_tooltip,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
    map.addOverlay(overlay_mouseOver_trip);

    this.map = map;

    mouseHoverDetails = function(evt) {

        var feature_mouseOver = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {

          if(layer){
			if(layer.get('trip') == "TripAnimationLayer" || layer.get('display') =="TripLayerDisplay"){
				return feature;
			}
		}else{
			for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == 'TripAnimationLayer'){
				break;
				return feature;
			}
		}
		}

        });
		gbl_trip_clear_tooltip = ta_tooltip;
        ta_tooltip.style.display = feature_mouseOver ? '' : 'none';
        if (feature_mouseOver) {
			//console.log("feature_mouseOver >>",feature_mouseOver.getProperties());
            overlay_mouseOver_trip.setPosition(evt.coordinate);
			if(loc == false){
				if(feature_mouseOver.getProperties().speed == undefined){
					//console.log("From API - speed is undefined, replaced with empty string");
					feature_mouseOver.getProperties().speed = '';
				}
				ta_tooltip.innerHTML =  "Speed:" + feature_mouseOver.getProperties().speed +"Km/h," + feature_mouseOver.getProperties().date + "," + feature_mouseOver.getProperties().time;
			}else{
				if(feature_mouseOver.getProperties().speed == undefined){
					//console.log("From API - speed is undefined, replaced with empty string");
					feature_mouseOver.getProperties().speed = '';
				}
				ta_tooltip.innerHTML = feature_mouseOver.getProperties().location +"," + "Speed:" + feature_mouseOver.getProperties().speed +"Km/h," + feature_mouseOver.getProperties().date + "," + feature_mouseOver.getProperties().time;
			}
        }
    };
    map.on('pointermove', mouseHoverDetails);

}


function TripPoints(map){
	var featureArray = [];
	var point;
	for(var i=0;i<uniqueData.length;i++){
		var lat = parseFloat(uniqueData[i].lat);
		var lon = parseFloat(uniqueData[i].lon);
		if(appConfigInfo.mapData === "google"){
			point = ol.proj.transform([lon,lat], 'EPSG:4326', 'EPSG:3857');
		}else{
			point = [lon,lat];
		}
		var pointGeom = new ol.geom.Point(point);
        var feature = new ol.Feature({
            geometry : pointGeom
		});
		featureArray.push(feature);
	}
	if(trip_points_layer_flag ==  false){
		trip_points_layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features : featureArray
			})
		});
		map.addLayer(trip_points_layer);
		trip_points_layer_flag = true;
	}else{
		trip_points_layer.getSource().clear();
		trip_points_layer.getSource().addFeatures(featureArray);
	}
}

/*
tmpl.Feature.getLatLong = function(param) {
	var mapObj = param.map;
	var id = param.id;
	var layerName = param.layer;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var latlon;
	for(var i=0;i<length;i++){
		var existingLayer = Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layerName){
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					if(feature.getProperties()['id']==id){
						if(appConfigInfo.mapData==='google'){
							latlon = feature.getGeometry().getCoordinates();
							latlon = ol.proj.transform(latlon, 'EPSG:3857','EPSG:4326')
							
						}
						else{
							latlon = feature.getGeometry().getCoordinates();
						}
					}
				});
			}
		}
	}
	return latlon;
}*/

tmpl.Feature.getLatLong = function(param) {
	var mapObj = param.map;
	var id = param.id;
	var layerName = param.layer;
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var latlon;
	var existing;
	for(var i=0;i<length;i++){
		var existingLayer = Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === layerName){
				existing = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (feature) {
					if(feature.getProperties()['id']==id){
						if(appConfigInfo.mapData==='google'){
							latlon = feature.getGeometry().getCoordinates();
							latlon = ol.proj.transform(latlon, 'EPSG:3857','EPSG:4326')
							
						}
						else{
							latlon = feature.getGeometry().getCoordinates();
						}
					}
				});
			}
		}
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == layerName){
				
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (feature) {
					if(feature.get('id') == id){
					
						if(appConfigInfo.mapData==='google'){
							latlon = feature.getGeometry().getCoordinates();
							latlon = ol.proj.transform(latlon, 'EPSG:3857','EPSG:4326')
							
						}
						else{
							latlon = feature.getGeometry().getCoordinates();
						}
					}
				});
			}
			
		}
		
	}
	return latlon;
}



}).call(this,{});


function createContextMenu(mapObj,menu_items)
{
  contextmenuobj = new ContextMenu({
                      width: 170,
                      default_items: false, //default_items are (for now) Zoom In/Zoom Out
                      items: menu_items
                  });
  mapObj.addControl(contextmenuobj);
  return contextmenuobj;
}

function addMenu(add_menu)
{
  contextmenuobj.extend(add_menu);
}

function clearMenu()
{
  contextmenuobj.clear();
}

function closeMenu()
{
  contextmenuobj.close();
}

function mapToCenter(mapObj,obj){
	var view = mapObj.getView();
	view.setCenter(obj.coordinate);
}

function getFeatureOnMenuOpen(mapObj,myCallBack)
{
	
  contextmenuobj.on('open', function(evt){
	  var layer;
  var feature = mapObj.forEachFeatureAtPixel(evt.pixel, function(ft, lay){
layer = lay;	        
			return ft; 

  });
 
  var result;
  if(feature != undefined){
	  
	  if(layer == null){
		  
		result = {
			layerName : feature.get('layer_name'),
			featureId : feature.get('id'),
			properties : feature.getProperties()
		};
	  }else{
		  
		result = {
			layerName : layer.get('title'),
			featureId : feature.get('id'),
			properties : feature.getProperties()
		};
	  }
	
  }else{
	  
	   result = {
			  layerName : undefined,
			  featureId : ''
			  
		  };
	  
  }
    myCallBack(result); 
  });
}




/*
Array.prototype.contains = function ( needle ) {
   for (i in this) {
       if (this[i] == needle) return true;
   }
   return false;
}*/

var bufferLayer;
/*var bufferLayer = new ol.layer.Vector({
    	source: new ol.source.Vector()
	});*/
tmpl.Layer.clearBuffer = function(param){
        var mapObj = param.map;
		if(bufferLayer != undefined)
        bufferLayer.getSource().clear();
}

tmpl.Layer.getFeaturesWithinBuffer = function(param){
	var rdus = param.radius;
	var lyrName = param.layerName;
	var propertyId = param.propertyId;
	var mapObj = param.map;
	var mycallback = param.callbackFunc;
    var wgs84Sphere = new ol.Sphere(6378137);
	var format = new ol.format.WKT();
	var featureArray = [], featureJson = [], resultArray = [], featureId = [];
	var rec,ft,src,lonlatConvrtd,circle4326,circle3857,circleFeature,cirGeomtry,cirGeomtry4326,circleExtent,wktBufferGeom;
	bufferLayer = new ol.layer.Vector({
    	source: new ol.source.Vector()
	});
	/*if(bufferLayer != undefined)
        bufferLayer.getSource().clear();*/
	bufferLayer.setProperties({lname:"bufferVector"});
	mapObj.addLayer(bufferLayer);
	var st = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgb(255,0,0)',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.2)'
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: 'rgba(55, 155, 55, 0.5)',
            })
          })
    });
 	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('lname') === "bufferVector"){
				existingLayer.getSource().clear();
			}
			if(existingLayer.get('title') === lyrName){
				src = existingLayer.getSource();
				existingLayer.getSource().getFeatures().forEach(function (fea) {
					featureArray.push(fea);
					if(fea.getProperties()['id']==propertyId){	
						ft=fea;
					}
				});
			}
		}
	}
	lonlat =ft.getGeometry().getCoordinates();
    if(appConfigInfo.mapData == 'google')
    {
       lonlatConvrtd=ol.proj.transform([lonlat[0],lonlat[1] ], 'EPSG:3857', 'EPSG:4326');
       circle4326 = ol.geom.Polygon.circular(wgs84Sphere, [lonlatConvrtd[0], lonlatConvrtd[1]], rdus, 64);
       circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
       circleFeature =new ol.Feature(circle3857);
       circleFeature.setStyle(st);
       bufferLayer.getSource().addFeature(circleFeature);
       cirGeomtry = circleFeature.getGeometry();
       cirGeomtry4326 = cirGeomtry.clone().transform('EPSG:3857', 'EPSG:4326');
       circleExtent = cirGeomtry4326.getExtent();
       wktBufferGeom= format.writeGeometry(cirGeomtry4326);   
    }
    else
    {
       circle4326 = ol.geom.Polygon.circular(wgs84Sphere, [lonlat[0], lonlat[1]], rdus, 64);
       circle3857 = circle4326;
       circleFeature =new ol.Feature(circle3857);
       circleFeature.setStyle(st);
       bufferLayer.getSource().addFeature(circleFeature);
       cirGeomtry = circleFeature.getGeometry();
       cirGeomtry4326 = cirGeomtry;
       circleExtent = cirGeomtry4326.getExtent();
       wktBufferGeom= format.writeGeometry(cirGeomtry4326);
    }
    for(var i=0;i<featureArray.length;i++){
    	var coord = featureArray[i].getGeometry().getCoordinates();
		var coordConvert = ol.proj.transform([coord[0],coord[1] ], 'EPSG:3857', 'EPSG:4326');
		var containsCoordinate= ol.extent.containsCoordinate(circleExtent, coordConvert);
		if(containsCoordinate == true){
			var id = featureArray[i].getProperties()['id'];
			featureId.push(id);
			var featureGeometry = format.writeGeometry(featureArray[i].getGeometry().clone().transform('EPSG:3857', 'EPSG:4326'));
			featureJson.push({index: id, geometry : featureGeometry});
			//featureJson.push(featureGeometry);
		}
    }
  
    var jsonString = JSON.stringify(featureJson);
 
    var rsltAry = [];
	var urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/contain/fromjson/"+wktBufferGeom+"/"+jsonString;
	$.ajax({
	        url:urlL,
	        success: function (data) {
	        	//console.log(data);
	            for (var i = 0; i < data.length ; i++){
	            	if(data[i].result == true){
	            		var record = {id : data[i].id };
						rsltAry.push(record);
	            	}
			      	
			    }
			    mycallback(rsltAry);   
	        },
	        error: function () {
	        	console.log("there was an error!");
	        },
    });
    return true;  
}


//////heatmap


//circle radius


tmpl.Create.circle = function(param){
	var mapObj = param.map;
	var latlon = param.latlon;
	var rdus = param.radius;
	var strokeColor = param.strokeColor;
	var fillColor = param.fillColor;
	var mycallback = param.callbackFunc;

    var wgs84Sphere = new ol.Sphere(6378137);
	var format = new ol.format.WKT();
	var featureArray = [], featureJson = [], resultArray = [], featureId = [];
	var circle4326,circle3857,circleFeature,cirGeomtry,cirGeomtry4326,circleExtent,wktBufferGeom,style;
	var noLayer=false;
    var existingLayer;
    var Layers = mapObj.getLayers();
    var length = Layers.getLength();
    for(i=0;i<length;i++){
		var tempLayer=Layers.item(i);
		if(tempLayer.get('lname') === 'circleLayer'){
			noLayer = true;
            existingLayer = tempLayer;
           //existingLayer.getSource().clear();
        }
    }
    if (!noLayer) {
		circleLayer = new ol.layer.Vector({
	    	source: new ol.source.Vector()
		});
		circleLayer.setProperties({lname:"circleLayer"});
		circleLayer.set('title','circleLayer');
		mapObj.addLayer(circleLayer);
		existingLayer = circleLayer;
	}
	if(strokeColor && fillColor){
		style = new ol.style.Style({
	        stroke: new ol.style.Stroke({
	            color: strokeColor,
	            width: 1
	        }),
	        fill: new ol.style.Fill({
	            color: fillColor
	        }),
	        image: new ol.style.Circle({
	            radius: 7,
	            fill: new ol.style.Fill({
	              color: 'rgba(55, 155, 55, 0.5)',
	            })
	          })
	    });
	}else{
		style = new ol.style.Style({
	        stroke: new ol.style.Stroke({
	            color: 'rgb(255,0,0)',
	            width: 1
	        }),
	        fill: new ol.style.Fill({
	            color: 'rgba(255,0,0,0.2)'
	        }),
	        image: new ol.style.Circle({
	            radius: 7,
	            fill: new ol.style.Fill({
	              color: 'rgba(55, 155, 55, 0.5)',
	            })
	          })
	    });
	}
 	if(appConfigInfo.mapData == 'google')
    {
       //lonlatConvrtd=lonlat;//ol.proj.transform([lonlat[0],lonlat[1] ], 'EPSG:3857', 'EPSG:4326'); 
       circle4326 = ol.geom.Polygon.circular(wgs84Sphere, [latlon[1], latlon[0]], rdus, 64);
       circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
       circleFeature =new ol.Feature(circle3857);
       circleFeature.setStyle(style);
       existingLayer.getSource().addFeature(circleFeature);
       cirGeomtry = circleFeature.getGeometry();
       cirGeomtry4326 = cirGeomtry.clone().transform('EPSG:3857', 'EPSG:4326');
       wktBufferGeom= format.writeGeometry(cirGeomtry4326);   
    }
    else
    {
       circle4326 = ol.geom.Polygon.circular(wgs84Sphere, [latlon[1], latlon[0]], rdus, 64);
       circle3857 = circle4326;
       circleFeature =new ol.Feature(circle3857);
       circleFeature.setStyle(style);
       existingLayer.getSource().addFeature(circleFeature);
       cirGeomtry = circleFeature.getGeometry();
       cirGeomtry4326 = cirGeomtry;
       wktBufferGeom= format.writeGeometry(cirGeomtry4326);
    }
    mycallback(wktBufferGeom);
  //  mapObj.addControl(new ol.control.LayerSwitcher());
}



///polygon layer

tmpl.Create.polygon = function(param){
	var mapObj = param.map;
	var lyrname = param.layer;
	var jsonobj = param.features;
	var strokeColor = param.strokeColor;
	var fillColor = param.fillColor;
	//var width = param.width;
    var format = new ol.format.WKT();
  	var drawStyle;
  	var getdata = jsonobj; 
	if (jsonobj)
  	{
	    try{ }
	    catch(e)
	    {
	      return false; 
	    }
	}
  	if(getdata.length==0)
  	{
    	return false;
  	}
  	var noLayer=false;
    var existingLayer;
    var Layers = mapObj.getLayers();
    var length = Layers.getLength();
    for(i=0;i<length;i++){
		var tempLayer=Layers.item(i);
		if(tempLayer.get('title') == lyrname){
			noLayer = true;
            existingLayer = tempLayer;
           // existingLayer.getSource().clear();
        }
    }
    if (!noLayer) {
		ovrlayPolygon = new ol.layer.Vector({
			title: lyrname,
			visible: true,
			source: new ol.source.Vector()
		});
		ovrlayPolygon.setProperties({lname:lyrname});
		
		mapObj.addLayer(ovrlayPolygon);
		existingLayer = ovrlayPolygon;
	}
  	var featureDataAry = [];
  	if(strokeColor!=null && fillColor!=null){
		drawStyle = new ol.style.Style({
	        stroke: new ol.style.Stroke({
	            color: strokeColor,
	            width: 1
	        }),
	        fill: new ol.style.Fill({
	            color: fillColor
	        }),
	        image: new ol.style.Circle({
	            radius: 7,
	            fill: new ol.style.Fill({
	              color: 'rgba(55, 155, 55, 0.5)',
	            })
	          }),
              text:new ol.style.Text({
                    font: 'Bold' + ' ' + '12px' + ' ' + 'Verdana',
                    textAlign:'center',
                    text : '',
                    offsetX : 0,
                    offsetY : 0,
                    fill: new ol.style.Fill({
                      color: fillColor,
                      width:20
                      }),
                    stroke : new ol.style.Stroke({
                     color : strokeColor,
                     width:8
                     })
              })
	    });
	}else{
	  	drawStyle = new ol.style.Style({
	      	fill: new ol.style.Fill({
	          	color: 'rgba(255, 0, 0, 0.2)' 
	      	}),
	     	stroke: new ol.style.Stroke({
	          	color: 'rgba(0,0,0,0.5)',//clor,//'#ffcc33',
	          	width: 1
	      	}),
	      	image: new ol.style.Circle({
	          	radius: 1, 
	          	fill: new ol.style.Fill({
	             	color:'rgba(155,150,100,0.5)'//clor// '#DC143C'//'#ffcc33'
	          	})
	     	}),
              text:new ol.style.Text({
                    font: 'Bold' + ' ' + '12px' + ' ' + 'Verdana',
                    textAlign:'center',
                    text : '',
                    offsetX : 0,
                    offsetY : 0,
                    fill: new ol.style.Fill({
                      color: 'red',
                      width:20
                      }),
                    stroke : new ol.style.Stroke({
                     color : 'red',
                     width:8
                     })
              })
	  	}); 
	}
  	for (var i = 0, length = getdata.length; i < length; i++) 
  	{
    	if(appConfigInfo.mapData==='google')
    	{
      		var feature = format.readFeature( getdata[i].geometry );
      		feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      		//console.log("feature.getProperties() :",feature.getProperties());
      		feature.setProperties(getdata[i].properties);
			feature.setProperties({id:getdata[i].id});
      		feature.setStyle(drawStyle);
      		featureDataAry.push(feature);
    	}
	    else
	    {
	      var feature = format.readFeature( getdata[i].geometry );
	      feature.getGeometry();
	      feature.setStyle(drawStyle);
	      feature.setProperties(getdata[i].properties);
		  feature.setProperties({id:getdata[i].id});
	      featureDataAry.push(feature);
	    }
    }
	existingLayer.getSource().addFeatures(featureDataAry);
  //  mapObj.addControl(new ol.control.LayerSwitcher());
    return true;
}

tmpl.Style.categorisePolygon = function(param){
	var categorisedData = param.categories;
	var layer = param.layer;
	var property = param.property;
	var mapObj = param.map;
	var label = param.label;
	var PolygonLayer;
	var polyStyle,featureArray = [];
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') == layer){
				PolygonLayer = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (fea) {
					featureArray.push(fea);
				});
			}
		}
	}	
	if(PolygonLayer != undefined)
	mapObj.removeLayer(PolygonLayer);
	for (var j = 0, length = categorisedData.length; j < length; j++){
		for (var i = 0, length1 = featureArray.length; i < length1; i++){
			var featureProperty =parseFloat(featureArray[i].getProperties()[0][property]);
			if(featureProperty >= categorisedData[j].min_range && featureProperty <= categorisedData[j].max_range){
				polyStyle = new ol.style.Style({
		          	fill: new ol.style.Fill({
		              	color: categorisedData[j].fillColor 
		          	}),
		         	stroke: new ol.style.Stroke({
		              	color: categorisedData[j].strokeColor,//clor,//'#ffcc33',
		              	width: 1
		          	}),
		          	image: new ol.style.Circle({
		              	radius: 1, 
		              	fill: new ol.style.Fill({
		                 	color:'rgba(155,150,100,0.7)'//clor// '#DC143C'//'#ffcc33'
		              	})
		         	})
		      	}); 
		      	featureArray[i].setStyle(polyStyle); 
			}	
		}		
	}
	if(PolygonLayer != undefined)
	mapObj.addLayer(PolygonLayer);
}

////point style
tmpl.Create.point = function(param){
var mapObj = param.map;
var lat = param.latitude;
var lon = param.longitude;
var geometry;

      if(appConfigInfo.mapData==='google')
      {
         geometry = new ol.geom.Point(ol.proj.transform([parseFloat(lon), parseFloat(lat)], 'EPSG:4326', 'EPSG:3857'));
      }
      else
      {
         var cor = [parseFloat(lon), parseFloat(lat)];
         geometry = new ol.geom.Point(cor);
        
      }

var featureval = new ol.Feature({
                   geometry     : geometry
              });


  return featureval;
}

tmpl.Create.pointLayer = function(param){
	var mapObj = param.map;
	var jsonobj = param.features;
	var layerName = param.layer;
	//var layerSwitcher = param.layerSwitcher;
	var strokeColor = param.strokeColor;
	var fillColor = param.fillColor;

	var getdata = jsonobj;
	if(getdata.length==0){
		return false;
	}
	var featureDataAry = [];
	var style;
	if(strokeColor!=null && fillColor!=null){
		style = new ol.style.Style({
	        image: new ol.style.Circle({
				radius: 5,
	            fill: new ol.style.Fill({
		                color: fillColor
			    }),
			    stroke: new ol.style.Stroke({
			        width: 1,
			        color: strokeColor
			    })
	        })
		});
	}else{
		style = new ol.style.Style({
	        image: new ol.style.Circle({
				radius: 5,
	            fill: new ol.style.Fill({
		                color: 'rgba(124,252,0,0.2)'
			    }),
			    stroke: new ol.style.Stroke({
			        width: 1,
			        color: 'rgb(124,252,0)'
			    })
	        })
		});
	}
    for (var i = 0, length = getdata.length; i < length; i++){
		var geometry;
		if(appConfigInfo.mapData==='google'){
			geometry = new ol.geom.Point(ol.proj.transform([parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)], 'EPSG:4326', 'EPSG:3857'));
		}
		else{
			var coordinate = [parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)];
			geometry = new ol.geom.Point(coordinate);
		}
		var featureval = new ol.Feature({
            geometry     : geometry
        });
		featureval.setStyle(style);
		featureval.setProperties(getdata[i].properties);
		featureDataAry.push(featureval);
	}
	var source=  new ol.source.Vector({
        features: featureDataAry
    });
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var pointLayerPresent = false;
	for(var i=0;i<length;i++){
		var layerTemp = Layers.item(i);
		if(layerTemp.get('title') == layerName){
			pointLayerPresent = true;
			layerTemp.getSource().addFeatures(featureDataAry);
		}
	}
	if (pointLayerPresent == false) {
		var overlay = new ol.layer.Vector({
            title: layerName,
            visible: true,
            source: source
        });
		mapObj.addLayer(overlay);
		/*if(layerSwitcher)
			mapObj.addControl(new ol.control.LayerSwitcher());*/
		pointLayerPresent = true;
	}
	return true;
}


tmpl.Style.categorisePoint = function(param){
	var categorisedData = param.categories;
	var layer = param.layer;
	var property = param.property;
	var mapObj = param.map;
	var strokeColor = param.strokeColor;
	var fillColor = param.fillColor;

	var pointStyle,featureArray = [];
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var PointLayer;
	for(i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') == layer){
				PointLayer = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (fea) {
					featureArray.push(fea);
				});
			}
		}
	}	
	if(PointLayer != undefined)
	mapObj.removeLayer(PointLayer);
	for (var j = 0, length = categorisedData.length; j < length; j++){
		for (var i = 0, length1 = featureArray.length; i < length1; i++){
			var featureProperty =parseFloat(featureArray[i].getProperties()[0][property]);
			if(featureProperty >= categorisedData[j].min_range && featureProperty <= categorisedData[j].max_range){
				pointStyle = new ol.style.Style({
		          	image: new ol.style.Circle({
						radius: categorisedData[j].radius,
			            fill: new ol.style.Fill({
				                color: fillColor
					    }),
					    stroke: new ol.style.Stroke({
					        width: 1,
					        color: strokeColor
					    })
			        })
		      	}); 
		      	featureArray[i].setStyle(pointStyle); 
			}	
		}		
	}
	if(PointLayer != undefined)
	mapObj.addLayer(PointLayer);
}




function clustering(mapObj){

	var distance = document.getElementById('distance');

      var count = 20000;
      var features = new Array(count);
      var e = 4500000;
      for (var i = 0; i < count; ++i) {
        var coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e];
        features[i] = new ol.Feature(new ol.geom.Point(coordinates));
      }
      var source = new ol.source.Vector({
        features: features
      });

      var clusterSource = new ol.source.Cluster({
        distance: parseInt(distance.value, 10),
        source: source
      });
      var styleCache = {};
      var clusters = new ol.layer.Vector({
        source: clusterSource,
        style: function(feature) {
          var size = feature.get('features').length;
          //alert(size);
          var style = styleCache[size];
          if (!style) {
            style = new ol.style.Style({
              image: new ol.style.Circle({
                radius: 10,
                stroke: new ol.style.Stroke({
                  color: '#fff'
                }),
                fill: new ol.style.Fill({
                  color: '#3399CC'
                })
              }),
              text: new ol.style.Text({
                text: size.toString(),
                fill: new ol.style.Fill({
                  color: '#fff'
                })
              })
            });
            styleCache[size] = style;
          }
          return style;
        }
      });

       mapObj.addLayer(clusters);

       /*distance.addEventListener('input', function() {
       	alert(distance.value);
        clusterSource.setDistance(parseInt(distance.value, 10));   
      });*/
}


tmpl.Fence.clear = function(param){
	var mapObj = param.map;
	tmpl.Fence.removeInteraction({map:mapObj});
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(var i=0;i<length;i++){
		var existingLayer = Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('lname') === 'fencevector'){
				mapObj.removeLayer(existingLayer);
			}
		}	
	}
}
/*
tmpl.HeatMap.create = function(param){
	var mapObj = param.map;
	var getdata = param.data;
	var layer = param.layer;
	var blur = param.blur;
	if(blur == undefined)
	blur = 10;
	var radius = param.radius;
	if(radius == undefined)
	radius = 20;
	var weight;	
	var featureDataAry = [];
	var geometry;
	for (var i = 0, length = getdata.length; i < length; i++){
		if(appConfigInfo.mapData==='google'){
			geometry = new ol.geom.Point(ol.proj.transform([parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)], 'EPSG:4326', 'EPSG:3857'));
		}
		else{
			var coordinate = [parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)];
			geometry = new ol.geom.Point(coordinate);
		}
		var featureval = new ol.Feature({
            geometry     : geometry
			
        });
		if(getdata[i].weight){
			weight = getdata[i].weight;
			featureval.set('weight', weight);
		}
		featureval.setProperties(getdata[i].properties);
		featureDataAry.push(featureval);      
	}
	var vector_heat = new ol.layer.Heatmap({		
		source: new ol.source.Vector({
			   features: featureDataAry
		}),
		title :layer,
		blur: blur,
		radius: radius,
		opacity: .5	   
	});
    //mapObj.addLayer(vector_heat);	  

tmpl_setMap_layer_global.push({
    			layer : vector_heat,
    			title :  layer
    		});
		
	vector_heat.setMap(mapObj);
			
}*/
var gbl_routeIds = [];
var gbl_route_edit_data = [];
tmpl.Route.add = function(param){

	var mapObj = param.map;
	var datas = param.feature;
	var layerName = param.layerName;
	var width = param.width;
	
	
	var noLayer,routeLine,sourcePoint,destinationPoint,sourceIcon,destinationIcon,cordStart,cordEnd,sourceMarker,destinationMarker,sourceStyle,destinationStyle,wayPoint;
	var wayPointLatLon,feture_waypoint,globalwaypointStyle,feature;
	var fature_waypoint_Array=[],wayPointId=[];

	var format = new ol.format.WKT();
	
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer.get('lname') === layerName){
			noLayer = true;
			routeLayer = existingLayer;
		}
	}
	if (!noLayer){
		routeLayer = new ol.layer.Vector({
             source: new ol.source.Vector()//,
            // style: new ol.style.Style({
                // stroke: new ol.style.Stroke({
                    // color: 'red',
                    // width: 6
                // })
            // })
        });
		routeLayer.setProperties({lname:layerName});
		routeLayer.setProperties({title:layerName});
		mapObj.addLayer(routeLayer);
	}

	for(var i=0;i<datas.length;i++){
		wayPointId = [];
		routeLine = datas[i].geometry;
		/*sourcePoint = [parseFloat(datas[i].source.lon) ,parseFloat(datas[i].source.lat)];
		console.log("sourcePoint :",sourcePoint);*/
		var sourcePointArray = datas[i].source.geometry;
		/*var ts = sourcePointArray.split("POINT(")[1];
		ts = ts.split(')')[0];
		ts = ts.split(' ');
		var lats = parseFloat(ts[1]);
		var lons = parseFloat(ts[0]);*/
		var p1 = sourcePointArray.split('(');
		var p2 = p1[1].split(')');
		var p3 = p2[0].split(' ');
		var lats = parseFloat(p3[1]);
		var lons = parseFloat(p3[0]);
		sourcePoint = [lons , lats];
		//console.log("sourcePoint :",sourcePoint);
		var destinationPointArray = datas[i].destination.geometry;
		/*var td = destinationPointArray.split("POINT(")[1];
		td = td.split(')')[0];
		td = td.split(' ');
		var latd = parseFloat(td[1]);
		var lond = parseFloat(td[0]);*/
		var p1d = destinationPointArray.split('(');
		var p2d = p1d[1].split(')');
		var p3d = p2d[0].split(' ');
		var latd = parseFloat(p3d[1]);
		var lond = parseFloat(p3d[0]);
		destinationPoint = [lond , latd];
		//console.log("destinationPoint :",destinationPoint);
		//destinationPoint = [parseFloat(datas[i].destination.lon) , parseFloat(datas[i].destination.lat)];
		sourceIcon = datas[i].source.image;
		destinationIcon = datas[i].destination.image;
		wayPoint = datas[i].waypoints;
//		console.log("wayPoint >>",wayPoint);	
		wayPointId.push(datas[i].source.id);
		wayPointId.push(datas[i].destination.id);
		if(appConfigInfo.mapData == 'google'){
			feature = format.readFeature(routeLine, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			});
		}
		else{
			feature = format.readFeature(routeLine, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:4326'
	        });
		} 
		//feature.setProperties({'id':datas[i].id});
		
		var featureStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: datas[i].route_color,
                    width: width
                })
            });
		feature.setStyle(featureStyle);
		
		var keyNames = Object.keys(datas[i]);
	    for(var name=0;name< keyNames.length;name++) {
	    	if(keyNames[name] == "geometry"){
	    	}else{
	    		var value = datas[i][keyNames[name]];
	    		var x =keyNames[name]
   	 			feature.set(''+x+'',''+value+'');
	    	}
		}
		
		cordStart =  ol.proj.transform(sourcePoint, 'EPSG:4326', 'EPSG:3857');
		cordEnd =  ol.proj.transform(destinationPoint, 'EPSG:4326', 'EPSG:3857');
		sourceMarker = new ol.Feature({
	        geometry: new ol.geom.Point(cordStart)
	    });
		sourceStyle =  new ol.style.Style({
	        image: new ol.style.Icon({
				anchor: [0.5, 1],
				src: sourceIcon
			})
	    });
		sourceMarker.setStyle(sourceStyle);
		//sourceMarker.setProperties({'id':datas[i].source.id});
		
		var keyNames1 = Object.keys(datas[i].source);
	    for(var name=0;name< keyNames1.length;name++) {
	    	if(keyNames1[name] == "geometry"){
	    	}else{
	    		var value = datas[i].source[keyNames1[name]];
	    		var x =keyNames1[name]
   	 			sourceMarker.set(''+x+'',''+value+'');
	    	}
		}
		
		
		destinationMarker = new ol.Feature({
	        geometry: new ol.geom.Point(cordEnd)
	    });
		destinationStyle =  new ol.style.Style({
	        image: new ol.style.Icon({
	            anchor: [0.5, 1],
	            src: destinationIcon
	        })
	    });
		destinationMarker.setStyle(destinationStyle);
		//destinationMarker.setProperties({'id':datas[i].destination.id});
		
		var keyNames2 = Object.keys(datas[i].destination);
	    for(var name=0;name< keyNames2.length;name++) {
	    	if(keyNames2[name] == "geometry"){
	    	}else{
	    		var value = datas[i].destination[keyNames2[name]];
	    		var x =keyNames2[name]
   	 			destinationMarker.set(''+x+'',''+value+'');
	    	}
		}
		
		for(var j=0;j<wayPoint.length;j++){
			var wayPointArray = wayPoint[j].geometry;
			/*var tw = wayPointArray.split("POINT(")[1];
			tw = tw.split(')')[0];
			tw = tw.split(' ');
			var latw = parseFloat(tw[1]);
			var lonw = parseFloat(tw[0]);*/
			var p1w = wayPointArray.split('(');
			var p2w = p1w[1].split(')');
			var p3w = p2w[0].split(' ');
			var latw = parseFloat(p3w[1]);
			var lonw = parseFloat(p3w[0]);
			if (appConfigInfo.mapData == "google") {
	          	wayPointLatLon = ol.proj.transform([lonw, latw], 'EPSG:4326', 'EPSG:3857');
	        } else {
	         	wayPointLatLon = [lonw, latw];
	        }
			/*if (appConfigInfo.mapData == "google") {
	          	wayPointLatLon = ol.proj.transform([parseFloat(wayPoint[j].lon), parseFloat(wayPoint[j].lat)], 'EPSG:4326', 'EPSG:3857');
	        } else {
	         	wayPointLatLon = [parseFloat(wayPoint[j].lon), parseFloat(wayPoint[j].lat)];
	        }*/
	        feture_waypoint = new ol.Feature({
	          	geometry: new ol.geom.Point(wayPointLatLon)
	        });
	        globalwaypointStyle = new ol.style.Style({
			     image: new ol.style.Icon({
			        src: wayPoint[j].image,
			     })
		    });
		    feture_waypoint.setStyle(globalwaypointStyle);
		   // feture_waypoint.setProperties({'id':wayPoint[j].id});
			
			var keyNames3 = Object.keys(wayPoint[j]);
			for(var name=0;name< keyNames3.length;name++) {
				if(keyNames3[name] == "geometry"){
				}else{
					var value = wayPoint[j][keyNames3[name]];
					var x =keyNames3[name]
					feture_waypoint.set(''+x+'',''+value+'');
				}
			}
			
			
		    routeLayer.getSource().addFeature(feture_waypoint);
		    wayPointId.push(wayPoint[j].id);
		}
		routeLayer.getSource().addFeature(sourceMarker);
	    routeLayer.getSource().addFeature(destinationMarker);
		routeLayer.getSource().addFeature(feature);	
		
		var rec = {routeId: datas[i].id,pointsId: wayPointId};
		gbl_routeIds.push(rec);		
	}
	console.log("gbl_routeIds :",gbl_routeIds);
}


var gbl_routeIdsOnClick =[];

tmpl.Route.addOnClickRoute = function(param){

	var mapObj = param.map;
	var datas = param.feature;
	var layerName = param.layerName;
	
	var noLayer,routeLine,sourcePoint,destinationPoint,sourceIcon,destinationIcon,cordStart,cordEnd,sourceMarker,destinationMarker,sourceStyle,destinationStyle,wayPoint;
	var wayPointLatLon,feture_waypoint,globalwaypointStyle,feature,featureBuffern,bufferLine;
	var fature_waypoint_Array=[],wayPointId=[];

	var format = new ol.format.WKT();
	
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer.get('lname') === layerName){
			noLayer = true;
			routeLayer = existingLayer;
		}
	}
	if (!noLayer){
		routeLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 6
                })
            })
        });
		routeLayer.setProperties({lname:layerName});
		routeLayer.setProperties({title:layerName});
		mapObj.addLayer(routeLayer);
	}

	for(var i=0;i<datas.length;i++){
		wayPointId = [];
		routeLine = datas[i].geometry;
		bufferLine = datas[i].buffer;
		
		if(appConfigInfo.mapData == 'google'){
			feature = format.readFeature(routeLine, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857',
				rname : 'route',
				routeid : datas[i].id
			});
			featureBuffer = format.readFeature(bufferLine, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			});
		}
		else{
			feature = format.readFeature(routeLine, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:4326',
				rname : 'route',
				routeid : datas[i].id
	        });
			featureBuffer = format.readFeature(bufferLine, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:4326'
			});
		} 
		
		var sourcePoint1 = feature.getGeometry().getFirstCoordinate();
		sourcePoint = ol.proj.transform(sourcePoint1, 'EPSG:3857', 'EPSG:4326');
		var destinationPoint1 = feature.getGeometry().getLastCoordinate();
		destinationPoint = ol.proj.transform(destinationPoint1, 'EPSG:3857', 'EPSG:4326');
		
		sourceIcon = datas[i].source_image;
		destinationIcon = datas[i].destination_image;
		
		cordStart = sourcePoint1;// ol.proj.transform(sourcePoint, 'EPSG:4326', 'EPSG:3857');
		cordEnd =  destinationPoint1;//ol.proj.transform(destinationPoint, 'EPSG:4326', 'EPSG:3857');
		sourceMarker = new ol.Feature({
	        geometry: new ol.geom.Point(cordStart),
			rname: 'source',
			routeid : datas[i].id
	    });
		sourceStyle =  new ol.style.Style({
	        image: new ol.style.Icon({
				anchor: [0.5, 1],
				src: sourceIcon
			})
	    });
		sourceMarker.setStyle(sourceStyle);
		
		destinationMarker = new ol.Feature({
	        geometry: new ol.geom.Point(cordEnd),
			rname: 'destination',
			routeid : datas[i].id
	    });
		destinationStyle =  new ol.style.Style({
	        image: new ol.style.Icon({
	            anchor: [0.5, 1],
	            src: destinationIcon
	        })
	    });
		destinationMarker.setStyle(destinationStyle);
		
		var keyNames = Object.keys(datas[i]);
	    for(var name=0;name< keyNames.length;name++) {
	    	if(keyNames[name] == "geometry"){
	    	}else{
	    		var value = datas[i][keyNames[name]];
	    		var x =keyNames[name]
   	 			feature.set(''+x+'',''+value+'');
				featureBuffer.set(''+x+'',''+value+'');
				sourceMarker.set(''+x+'',''+value+'');
				destinationMarker.set(''+x+'',''+value+'');
	    	}
		}
		
		routeLayer.getSource().addFeature(sourceMarker);
	    routeLayer.getSource().addFeature(destinationMarker);
		routeLayer.getSource().addFeature(feature);	
		routeLayer.getSource().addFeature(featureBuffer);
		
		gbl_route_edit_data[i] = {};
		gbl_route_edit_data[i].source = cordStart;
		gbl_route_edit_data[i].destination = cordEnd;
		gbl_route_edit_data[i].layerName = layerName;
		gbl_route_edit_data[i].routeLayer = routeLayer;
		gbl_route_edit_data[i].id = datas[i].id;
		
		var rec = {routeId: datas[i].id};
		gbl_routeIdsOnClick.push(rec);		
	}
	//console.log("gbl_routeIdsOnClick :",gbl_routeIdsOnClick);
}

tmpl.Route.editOnClickRoute = function(param){
	var map1 = param.map;
	var routeId = param.routeId;
	var editId;
	var routeLayer;
	var layerName;
	for(var i=0;i<gbl_route_edit_data.length;i++){
		if(gbl_route_edit_data[i].id == routeId){
			editId = routeId;
			routeLayer = gbl_route_edit_data[i].routeLayer;
			layerName = gbl_route_edit_data[i].layerName;
		}
	}
	 window.app = {};
  var app = window.app;
var format = new ol.format.WKT();
  app.Drag = function() {
    ol.interaction.Pointer.call(this, {
      handleDownEvent: app.Drag.prototype.handleDownEvent,
      handleDragEvent: app.Drag.prototype.handleDragEvent,
      handleMoveEvent: app.Drag.prototype.handleMoveEvent,
      handleUpEvent: app.Drag.prototype.handleUpEvent
    });
    this.coordinate_ = null;
    this.cursor_ = 'pointer';
    this.feature_ = null;
    this.previousCursor_ = undefined;
  };
  ol.inherits(app.Drag, ol.interaction.Pointer);

  app.Drag.prototype.handleDownEvent = function(evt) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {

			if(layer.get('title') == layerName){
				if(feature.get('rname') == 'source' || feature.get('rname') == 'destination'){
					if(feature.get('routeid') == editId)
						return feature;
				}
			}

          });
		  
      if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
      }
      return !!feature;
  };

  app.Drag.prototype.handleDragEvent = function(evt) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {    
            return feature;
          });
      var deltaX = evt.coordinate[0] - this.coordinate_[0];
      var deltaY = evt.coordinate[1] - this.coordinate_[1];
      var geometry = 
          (this.feature_.getGeometry());
      geometry.translate(deltaX, deltaY);
      this.coordinate_[0] = evt.coordinate[0];
      this.coordinate_[1] = evt.coordinate[1];
  };

  app.Drag.prototype.handleMoveEvent = function(evt) {
      if (this.cursor_) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
              return feature;
            });
        var element = evt.map.getTargetElement();
        if (feature) {
			editFeature = feature;
			point = feature.getGeometry().getCoordinates();
			var point;
			if(appConfigInfo.mapData==='google')		{
				point = ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
				}
			else
				{
			// do notng
				}
			//point = ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
          if (element.style.cursor != this.cursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.cursor_;
          }
        } else if (this.previousCursor_ !== undefined) {
          element.style.cursor = this.previousCursor_;
          this.previousCursor_ = undefined;
        }
      }
  };

  app.Drag.prototype.handleUpEvent = function(evt) {
      var value=this.feature_.getGeometry().getType();
      if(value==='Point')
      {
        lonlat =this.feature_.getGeometry();
      }
      else if(value==='LineString')
      {
        lonlat =this.feature_.getGeometry();
      }
      else if(value==='Polygon')
      {
        lonlat =this.feature_.getGeometry();
      }
	
      if(appConfigInfo.mapData==='google')
      {         
		coordinate = ol.proj.transform(lonlat.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
        wktGeom= format.writeGeometry(lonlat.clone().transform('EPSG:3857', 'EPSG:4326'));
      }
      else
      {
    	  coordinate = lonlat.getCoordinates();
          wktGeom= format.writeGeometry(lonlat);
      //  wktGeom= format.writeGeometry(this.feature_.getGeometry());
      }

		var result = {
			new_coordinates : coordinate
		};
		var dragFeature = this.feature_;
		if(dragFeature.get('rname') == 'source'){
			tmpl.Route.clearRoute({map : map1});
				 tmpl.Route.getRoute({
		      map : map1,
		      source :  ol.proj.transform(dragFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326'),
		      destination : click_destination_route[1],
		       sourceIcon : sourceImg,//"img/1.png",
		       destinationIcon : destinationImg,//"img/2.png",
		       radius :radius1,//20,
		        getGeometry : test1
		    }); 
			click_destination_route[0] = ol.proj.transform(dragFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
		}else if(dragFeature.get('rname') == 'destination'){
			tmpl.Route.clearRoute({map : map1});
				 tmpl.Route.getRoute({
		      map : map1,
		      source :  click_destination_route[0],
		      destination : ol.proj.transform(dragFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326'),
		       sourceIcon : sourceImg,//"img/1.png",
		       destinationIcon : destinationImg,//"img/2.png",
		       radius :radius1,//20,
		        getGeometry : test1
		    }); 
			click_destination_route[1] = ol.proj.transform(dragFeature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
		}
		function test1(data){
				//console.log("data >>>",data);
			tmpl.Geocode.getGeocode({
				point : click_destination_route[0],
				callbackFunc  : handleGeocode	
			});
			function handleGeocode(addrs){
				var result = {
					route : data,
					geocode : addrs
				};
				callbackFunc(result);
			}
		}
      //mycallback(result);
      this.coordinate_ = null;
      this.feature_ = null;
      return false;
  };
  intr=new app.Drag();
  map1.addInteraction(intr);
			
}


tmpl.Route.deleteOnClickRoute = function(param){
	var mapObj = param.map;
	var routeId = param.routeId;
	var lyrName = param.layerName;

	var Layers = mapObj.getLayers();
	var existing;
	for(var i=0;i<Layers.getLength();i++){
		var existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') === lyrName){
				existing = existingLayer;
				existingLayer.getSource().getFeatures().forEach(function (fea) {
					if(fea.getProperties()['id']==routeId){
						existingLayer.getSource().removeFeature(fea);
					}
				});
			}
		}
	}
	if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == lyrName){
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (fea) {
					if(fea.getProperties()['id']==routeId){
						tmpl_setMap_layer_global[i].layer.getSource().removeFeature(fea);
					}
				});
			}
		}		
	}
}


/*tmpl.Route.addOnClickRoute = function(param){

	var mapObj = param.map;
	var datas = param.feature;
	var layerName = param.layerName;
	
	var noLayer,routeLine,bufferLine;
	var feature,featureBuffer;
	
	var format = new ol.format.WKT();
	
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	for(var i=0;i<length;i++){
		var existingLayer=Layers.item(i);
		if(existingLayer.get('lname') === layerName){
			noLayer = true;
			routeLayer = existingLayer;
		}
	}
	if (!noLayer){
		routeLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 6
                })
            })
        });
		routeLayer.setProperties({lname:layerName});
		routeLayer.setProperties({title:layerName});
		mapObj.addLayer(routeLayer);
	}

	for(var i=0;i<datas.length;i++){
		wayPointId = [];
		routeLine = datas[i].geometry;
		bufferLine = datas[i].buffer;
		if(appConfigInfo.mapData == 'google'){
			feature = format.readFeature(routeLine, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			});
			featureBuffer = format.readFeature(bufferLine, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			});
		}
		else{
			feature = format.readFeature(routeLine, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:4326'
	        });
			featureBuffer = format.readFeature(bufferLine, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			});
		} 
		//feature.setProperties({'id':datas[i].id});
		
		var keyNames = Object.keys(datas[i]);
	    for(var name=0;name< keyNames.length;name++) {
	    	if(keyNames[name] == "geometry"){
	    	}else{
	    		var value = datas[i][keyNames[name]];
	    		var x =keyNames[name]
   	 			feature.set(''+x+'',''+value+'');
				featureBuffer.set(''+x+'',''+value+'');
	    	}
		}

		routeLayer.getSource().addFeature(feature);	
		routeLayer.getSource().addFeature(featureBuffer);
		

		var rec = {routeId: datas[i].id};
		gbl_routeIdsOnClick.push(rec);		
	}
	console.log("gbl_routeIdsOnClick :",gbl_routeIdsOnClick);
}*/


var circleLayer;
tmpl.Layer.clearCircle = function(param){
        var mapObj = param.map;
		if(circleLayer != undefined)
        circleLayer.getSource().clear();
}


var drawPOI,modifyPOI,modifyPOIC;
tmpl.Create.POICircle = function(param){
	var mapObj = param.map;
	var icon = param.image;
	var rdus = param.radius;
	var callbackFunc = param.callbackFunc;

	/*mapObj.removeInteraction(drawPOI);
	mapObj.removeInteraction(modifyPOI);*/
	
	tmpl.POI.clearPOICircleInteractions({map:mapObj});

	var format = new ol.format.WKT();
    var features = new ol.Collection();
	var source = new ol.source.Vector();
    var noLayer=false;
    var existingLayer,latlon;

    var lonlat,coord,wktGeom,address;

    var Layers = mapObj.getLayers();
    for(i=0;i<Layers.getLength();i++){
		var tempLayer=Layers.item(i);
		if(tempLayer.get('lname') === 'poivector'){
			noLayer = true;
            existingLayer = tempLayer;
			existingLayer.getSource().clear();

			tmpl.Layer.clearCircle({map:mapObj});

		}
    }   
    if (!noLayer) {
		poiVector =new ol.layer.Vector({
			source: source,
			style: new ol.style.Style({
				image: new ol.style.Icon(({
                anchor: [0.5, 1],
				src: icon
            }))
        })
		});
		poiVector.setProperties({lname:"poivector"});
		poiVector.setProperties({myId:"poiUnique"});
		poiVector.setProperties({title:"poivector"});
		mapObj.addLayer(poiVector);
		existingLayer=poiVector;
    }

    modifyPOI = new ol.interaction.Modify({
  		features: features,
	  	deleteCondition: function(event) {
    		return ol.events.condition.shiftKeyOnly(event) &&
        	ol.events.condition.singleClick(event);
  		}
	});

	modifyPOI.on('modifyend', function(event){
    	tmpl.Layer.clearCircle({map:mapObj});
       	var feature = event.features;
        var geometryVal =feature.a[0].getGeometry();       
        lonlat =feature.item(0).getGeometry().getCoordinates();
        if(appConfigInfo.mapData==='google'){
            coord = ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326');
            wktGeom= format.writeGeometry(feature.item(0).getGeometry().clone().transform('EPSG:3857','EPSG:4326'));
		}
        else{
			coord = lonlat;//feature.getGeometry().getCoordinates();
			wktGeom= format.writeGeometry(feature.item(0).getGeometry());
        }           
        event.stopPropagation();
        mapObj.removeInteraction(drawPOI);       
        tmpl.Geocode.getGeocode({
			point : [coord[0],coord[1]],
			callbackFunc  : handleGeocode	
		});
        function handleGeocode(data){
        	address = data.address;
			tmpl.Create.circle({map:mapObj,latlon:[coord[1],coord[0]],radius:param.radius,strokeColor:null,fillColor:null,callbackFunc:test2});
			function test2(a){
				var rec = {point:wktGeom,radius:rdus,address:address,geometry:a};
				callbackFunc(rec);
			}
        }
        
    }); 
    function addInteractionPOI() {
        drawPOI = new ol.interaction.Draw({
          features: features,
          source: poiVector.getSource(),
          type: 'Point'
        });
        mapObj.addInteraction(drawPOI);
        drawPOI.on('drawend', function(event){	
            var feature = event.feature;
            var geometryVal =feature.getGeometry();
            lonlat = feature.getGeometry().getCoordinates();
            if(appConfigInfo.mapData==='google'){
                coord = ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326');
                latlon = [coord[1],coord[0]];
                wktGeom= format.writeGeometry(feature.getGeometry().clone().transform('EPSG:3857','EPSG:4326'));
			}
            else{
				coord = lonlat;//feature.getGeometry().getCoordinates();
				latlon = [coord[1],coord[0]];
				wktGeom= format.writeGeometry(feature.getGeometry());
            }
            event.stopPropagation();
            mapObj.removeInteraction(drawPOI);
			mapObj.addInteraction(modifyPOI);
				console.log(coord[1]);
			tmpl.Zoom.toXYcustomZoom({
			  map : mapObj,
			  latitude : coord[1],
			  longitude : coord[0],
			  zoom : 15
			});
    	
				
				
			tmpl.Geocode.getGeocode({
				point : coord,
				callbackFunc  : handleGeocode	
			});
	        function handleGeocode(data){
	        	address = data.address;
				tmpl.Create.circle({map:mapObj,latlon:latlon,radius:param.radius,strokeColor:null,fillColor:null,callbackFunc:test2});
				function test2(a){
					var rec = {point:wktGeom,radius:rdus,address:address,geometry:a};
					callbackFunc(rec);	
				}
	        }
					
   		});
      }
    addInteractionPOI();  
}

var CircleLayer;
tmpl.POI.addPOICircleGeometry = function(param) {
    var mapObj = param.map;
    var lyrName = param.layer;
    var features = param.features;
    var format = new ol.format.WKT();
    var feature;
    var featureDataAry = [];
    var lyrName_circle = lyrName + "_API_CircleLayer";
    // This layerName is Attaching With User Giving LayerName  // By Joel
    //mapObj.removeInteraction(modifyPOI);
    tmpl.Layer.clearData({
        map: mapObj,
        layer: lyrName
    });
    //  tmpl.Layer.clearData is modified as ABOVE
    ///////////////////////////////////////////////	tmpl.Layer.clearData({map:map,layer:'POILayer'});

    tmpl.POI.clearPOICircleInteractions({
        map: mapObj
    });

    for (var i = 0; i < features.length; i++) {
        if (appConfigInfo.mapData == 'google') {
            feature = format.readFeature(features[i].geometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
        } else {
            feature = format.readFeature(features[i].geometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:4326'
            });
        }
        feature.setStyle(new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 1],
                src: features[i].image
            }))
        }));
        var keyNames = Object.keys(features[i]);
        for (var name = 0; name < keyNames.length; name++) {
            if (keyNames[name] == "geometry") {} else {
                var value = features[i][keyNames[name]];
                var x = keyNames[name]
                feature.set('' + x + '', '' + value + '');
            }
        }
        featureDataAry.push(feature);
    }
    var source = new ol.source.Vector({
        features: featureDataAry
    });
    var Layers = mapObj.getLayers();
    var length = Layers.getLength();
    var isLayerPresent11 = false;
    var CircleLayerTemp = false;

    for (i = 0; i < length; i++) {
        var existingLayer = Layers.item(i);
        if (existingLayer) {
            if (existingLayer.get('title') == lyrName) {
                isLayerPresent11 = true;
                existingLayer.getSource().addFeatures(featureDataAry);
            } else if (existingLayer.get('title') == lyrName_circle) {
                CircleLayerTemp = existingLayer;
                //mapObj.removeLayer(existingLayer); 
                // Here Removable, But layerArray Contain this layer, So removing only after exiting the loop 
            }

        }
    }
    if (CircleLayerTemp != false) {
        mapObj.removeLayer(CircleLayerTemp);
    }

    if (isLayerPresent11 == false) {
        var newLayer = new ol.layer.Vector({
            title: lyrName,
            visible: true,
            source: source
        });
        isLayerPresent11 == true;
        newLayer.setProperties({
            lname: lyrName
        });
        newLayer.setProperties({
            myId: "myUnique"
        });
        newLayer.setProperties({
            title: lyrName
        });
        newLayer.setProperties({
            CircleLayerAttached: true
        });
        mapObj.addLayer(newLayer);
        //	existingLayer = newLayer;  //removed by joel
    }



    CircleLayer = new ol.layer.Vector({
        title: lyrName_circle,
        visible: true,
        //CircleLayerAttached: false,
        //CircleLayer:true,
        source: new ol.source.Vector()
    });

    CircleLayer.setProperties({
        lname: lyrName_circle
    });
    CircleLayer.setProperties({
        myId: "myUnique2"
    });
    CircleLayer.setProperties({
        title: lyrName_circle
    });
    //CircleLayer.setProperties({CircleLayerAttached:false});
    mapObj.addLayer(CircleLayer);


    var wgs84Sphere = new ol.Sphere(6378137);
    var circle4326, circle3857, circleFeature, cirGeomtry, cirGeomtry4326, wktBufferGeom, style;
    style = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgb(255,0,0)',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.2)'
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'rgba(55, 155, 55, 0.5)',
            })
        })
    });
    for (var j = 0; j < features.length; j++) {


        var circleLatlon = features[j].geometry;
        /*var tc = circleLatlon.split("POINT(")[1];
        tc = tc.split(')')[0];
        tc = tc.split(' ');
        var latc = parseFloat(tc[1]);
        var lonc = parseFloat(tc[0]);*/
        var p1 = circleLatlon.split('(');
        var p2 = p1[1].split(')');
        var p3 = p2[0].split(' ');
        var latc = parseFloat(p3[1]);
        var lonc = parseFloat(p3[0]);
        if (appConfigInfo.mapData == 'google') {
            circle4326 = ol.geom.Polygon.circular(wgs84Sphere, [lonc, latc], features[j].radius, 64);
            circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
            circleFeature = new ol.Feature(circle3857);
            circleFeature.setStyle(style);
            circleFeature.setId("c_" + features[j].id);
            circleFeature.set("id", "c_" + features[j].id);

            var keyNames1 = Object.keys(features[j]);
            for (var name = 0; name < keyNames1.length; name++) {
                if (keyNames1[name] == "geometry") {} else {
                    var value1 = features[j][keyNames1[name]];
                    var x1 = keyNames1[name];
                    circleFeature.set('' + x + '', '' + value + '');
                }
            }

            CircleLayer.getSource().addFeature(circleFeature);
            cirGeomtry = circleFeature.getGeometry();
            cirGeomtry4326 = cirGeomtry.clone().transform('EPSG:3857', 'EPSG:4326');
            wktBufferGeom = format.writeGeometry(cirGeomtry4326);
        } else {
            circle4326 = ol.geom.Polygon.circular(wgs84Sphere, [lonc, latc], features[j].radius, 64);
            circle3857 = circle4326;
            circleFeature = new ol.Feature(circle3857);
            circleFeature.setStyle(style);
            circleFeature.setId("c_" + features[j].id);
            circleFeature.set("id", "c_" + features[j].id);

            var keyNames1 = Object.keys(features[j]);
            for (var name = 0; name < keyNames1.length; name++) {
                if (keyNames1[name] == "geometry") {} else {
                    var value1 = features[j][keyNames1[name]];
                    var x1 = keyNames1[name];
                    circleFeature.set('' + x + '', '' + value + '');
                }
            }

            //circleFeature.setProperties(features[j].getProperties());

            CircleLayer.getSource().addFeature(circleFeature);
            cirGeomtry = circleFeature.getGeometry();
            cirGeomtry4326 = cirGeomtry;
            wktBufferGeom = format.writeGeometry(cirGeomtry4326);
        }
    }
}


var resultGetEditDetailsPOI = {};
tmpl.Feature.cancelPOICircleEdit = function(param){
	var mapObj = param.map;
	var feature = resultGetEditDetailsPOI.feature;
	if(feature == undefined){
		mapObj.removeInteraction(modifyPOIC);
	}else{
		feature.getGeometry().setCoordinates(resultGetEditDetailsPOI.coordinates);

		var existingLayer = resultGetEditDetailsPOI.existingLayer;
		var existingCircle = resultGetEditDetailsPOI.existingCircle;

		existingCircle.setStyle(new ol.style.Style({
							        stroke: new ol.style.Stroke({
							            color: 'rgb(255,0,0)',
							            width: 1
							        }),
							        fill: new ol.style.Fill({
							            color: 'rgba(255,0,0,0.2)'
							        }),
							        image: new ol.style.Circle({
							            radius: 7,
							            fill: new ol.style.Fill({
							              color: 'rgba(55, 155, 55, 0.5)'	
							            })
							        })
							    })
					          );
							 
		var editedCircle = existingLayer.getSource().getFeatureById(resultGetEditDetailsPOI.cPropertyId);
		existingLayer.getSource().removeFeature(editedCircle);
		existingLayer.getSource().addFeature(existingCircle);
		mapObj.removeInteraction(modifyPOIC);
		feature_poi_edit_id = '';
		feature_poi_edit_layer = '';
		feature_poi_edit_layer_callback = '';
	}
}

var feature_poi_edit_id;
var feature_poi_edit_layer;
var feature_poi_edit_layer_callback;

tmpl.POI.editPOICircle = function(param){
	var mapObj = param.map;
	var callbackFunc = param.callbackFunc;
	var zoom = param.zoom;

	var propertyId = param.id;
	var lyrName = param.layerName;
	
	feature_poi_edit_layer_callback = param.getDetailsCallbackFunc;
	feature_poi_edit_id = propertyId;
	feature_poi_edit_layer = lyrName;

	var ft,latlon,wktGeom,coord,value,previousFeature,zoomExtent,zoomCoord,existingLayer,existingCircle;
	
	var format = new ol.format.WKT();

	tmpl.POI.clearPOICircleInteractions({map:mapObj});

	var selectfeatureIdEdit = new ol.interaction.Select({wrapX: false,condition: ol.events.condition.click});
 	var Layers = mapObj.getLayers();
	
	for(i=0;i<Layers.getLength();i++){
		existingLayer=Layers.item(i);
		if(existingLayer){
			if(existingLayer.get('title') == lyrName){
				existingLayer.getSource().getFeatures().forEach(function (fea) {
					if(fea.getProperties()['id']==propertyId){
						value = fea.getGeometry().getType();
						previousFeature = fea;
						ft=fea;

						existingCircle = CircleLayer.getSource().getFeatureById("c_"+propertyId);//existingLayer.getSource().getFeatureById("c_"+propertyId);

						existingCircle.setStyle(new ol.style.Style({
						        stroke: new ol.style.Stroke({
						            color: 'green',
						            width: 1
						        }),
						        fill: new ol.style.Fill({
						            color: 'green'
						        }),
						        image: new ol.style.Circle({
						            radius: 7,
						            fill: new ol.style.Fill({
						              color: 'green',
						            })
						          })
						    })
				          );
						CircleLayer.getSource().removeFeature(existingCircle);
						//existingLayer.getSource().removeFeature(existingCircle);
						CircleLayer.getSource().addFeature(existingCircle);
						//existingLayer.getSource().addFeature(existingCircle);
						
					//	existingLayer.getSource().clear();
						existingLayer.getSource().removeFeature(previousFeature);
						existingLayer.getSource().addFeature(previousFeature);		
					}
				});
			}
			
			
		}
	}
	var circleRadius = ft.getProperties().radius;
	if(zoom == true)
	{
		zoomExtent =existingCircle.getGeometry().getExtent();
	    if(appConfigInfo.mapData == "google"){
	    	zoomCoord = ol.proj.transformExtent(zoomExtent, 'EPSG:3857', 'EPSG:4326');
	    }else{
	    	zoomCoord = zoomExtent;
	    }
		tmpl.Zoom.toExtent({
			map : mapObj,
			extent : zoomCoord
		});
	}
    selectfeatureIdEdit.getFeatures().a = [];
	selectfeatureIdEdit.getFeatures().a.push(ft);
	modifyPOIC = new ol.interaction.Modify({
        features: selectfeatureIdEdit.getFeatures()
    });

	resultGetEditDetailsPOI.coordinates = ft.getGeometry().getCoordinates();

resultGetEditDetailsPOI.existingCircle = existingCircle;

resultGetEditDetailsPOI.existingLayer =existingLayer;

    modifyPOIC.on('modifyend',function(){
    	if(value==='Point' ){
			lonlat =ft.getGeometry().getCoordinates();
	    }
	    else if(value==='LineString'){
			lonlat =ft.getGeometry().getFirstCoordinate();
	    }
	    else if(value==='Polygon' || value==='Circle')
	    {
			lonlat =ft.getGeometry().getInteriorPoint().getCoordinates();
	    }
    	if(appConfigInfo.mapData == "google"){
    		wktGeom= format.writeGeometry(ft.getGeometry().clone().transform('EPSG:3857','EPSG:4326'));
    		coord = ol.proj.transform(lonlat, 'EPSG:3857', 'EPSG:4326');
    	
    	}else{
    		wktGeom= format.writeGeometry(ft.getGeometry());
    		coord =lonlat;
    	}

		var existingCircle2 = existingLayer.getSource().getFeatureById("c_"+propertyId);
		resultGetEditDetailsPOI.cPropertyId ="c_"+propertyId;
		existingLayer.getSource().removeFeature(existingCircle2);

		var wgs84Sphere = new ol.Sphere(6378137);
		var circle4326,circle3857,circleFeature,cirGeomtry,cirGeomtry4326,wktBufferGeom,style;
		style = new ol.style.Style({
	        stroke: new ol.style.Stroke({
	            color: 'rgb(255,0,0)',
	            width: 1
	        }),
	        fill: new ol.style.Fill({
	            color: 'rgba(255,0,0,0.2)'
	        }),
	        image: new ol.style.Circle({
	            radius: 7,
	            fill: new ol.style.Fill({
	              color: 'rgba(55, 155, 55, 0.5)',
	            })
	          })
	    });

		if(appConfigInfo.mapData == 'google')
	    {
	       circle4326 = ol.geom.Polygon.circular(wgs84Sphere, coord, circleRadius, 64);
		   circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
	       circleFeature =new ol.Feature(circle3857);
	       circleFeature.setStyle(style);
	       circleFeature.setId("c_"+propertyId);
		   circleFeature.set("id", "c_" + propertyId);
	       existingLayer.getSource().addFeature(circleFeature);
	       cirGeomtry = circleFeature.getGeometry();
	       cirGeomtry4326 = cirGeomtry.clone().transform('EPSG:3857', 'EPSG:4326');
	       wktBufferGeom= format.writeGeometry(cirGeomtry4326); 	   
	    }
	    else
	    {
	       circle4326 = ol.geom.Polygon.circular(wgs84Sphere, coord, circleRadius, 64);
	       circle3857 = circle4326;
	       circleFeature =new ol.Feature(circle3857);
	       circleFeature.setStyle(style);
	       circleFeature.setId("c_"+propertyId);
		   circleFeature.set("id", "c_" + propertyId);
	       existingLayer.getSource().addFeature(circleFeature);
	       cirGeomtry = circleFeature.getGeometry();
	       cirGeomtry4326 = cirGeomtry;
	       wktBufferGeom= format.writeGeometry(cirGeomtry4326);
	    }

	    tmpl.Geocode.getGeocode({
			point : coord,
			callbackFunc  : handleGeocode	
		});
        function handleGeocode(data){
        	address = data.address;
        	var rec = {point:wktGeom,radius:circleRadius,address:address,geometry:wktBufferGeom};
			callbackFunc(rec);
        }
		resultGetEditDetailsPOI.geometry = {geometry : wktGeom, coordinates : coord, value : value};
		resultGetEditDetailsPOI.feature = ft;
	})
	mapObj.addInteraction(modifyPOIC);
}

tmpl.POI.clearPOICircleInteractions = function(param){
	var mapObj = param.map;
	mapObj.removeInteraction(drawPOI);
	mapObj.removeInteraction(modifyPOI);
	mapObj.removeInteraction(modifyPOIC);
}

tmpl.Search.All = function(param){
	//console.log(param.point);
	var map = param.map;
	var point = param.point;
	var callback = param.callbackFunc;
	var result = {};
	function handleLandMarks(data){
		if(data[0] != undefined)
			result.landmark = data[0].name;
		function handleGeocode(data){
			result.address = data.address;
			function handlePlace(data,c){
				if(appConfigInfo.mapData == "google"){
					if(data.address != undefined){
						zz = c;
var x = zz.formatted_address.split(',');
if(x[x.length-3] == " Bengaluru"){
result.placename = x[x.length-4];
result.landmark = x[0] +','+ x[1];
}else{
	result.placename = x[x.length-3];
	result.landmark = x[0];
}

						//console.log(c[1].address_components[0].long_name,c[1].address_components[0].long_name,c[2].address_components[0].long_name);
						//if(isNaN(c[0].address_components[0].long_name) && isNaN(c[0].address_components[0].long_name[0]) && c[0].address_components[0].long_name != 'Unnamed Road')
							//result.placename = c[0].address_components[0].long_name;
				
					}else{
						result.placename = '';
					}
					}else
						result.placename = data[0].placename;
				function handlePolice(data){
					if(data[0] != undefined)
						result.policestation = data[0].name;
					else
						result.policestation = '';
				
					callback(result);
				}
				tmpl.Search.getLandMarks({
					map : map,
					point : point,
					radius : 20000,
					POI_type : "police",
					Max_num_POIs : 1,
					callbackFunc : handlePolice
				});
				
			}
			tmpl.Geocode.getGeocode({
					point : point,
					callbackFunc : handlePlace
				});
		}
		tmpl.Geocode.getGeocode({
			point : point,
			callbackFunc  : handleGeocode	
		});
	}
		tmpl.Search.getLandMarksRoad({
			map : map,
			point : point,
			radius : '20000',
			POI_type : "route",
			Max_num_POIs : 1,
			callbackFunc : handleLandMarks
		});	
}

tmpl.Layer.clusters=function(param){
	var map=param.map;
	var data=param.data;
	var rad=param.radius;
	var col=param.borderColor;
	var colin=param.fillColor;
	var fcolor=param.fontColor;
	var distance=param.distance;
	var layerName=param.layer;
	//console.log("data: ",data);
	var FeaturesData = [];
for(var i=0; i<data.length; i++){
   var latlong = new ol.Feature({
       geometry: new ol.geom.Point(ol.proj.transform([data[i].lon, data[i].lat],'EPSG:4326','EPSG:3857'))
       //geometry: new ol.geom.Point([sdata[i].lon, data[i].lat])
   });
		latlong.setId(data[i].id);
		latlong.setProperties(data[i]);
    FeaturesData.push(latlong);
}
var source = new ol.source.Vector({
  features: FeaturesData
});

var clusterSource = new ol.source.Cluster({
  distance: distance,
  source: source
});

var styleCache = {};
var clusters = new ol.layer.Vector({
  source: clusterSource,
  title: layerName,
  style: function(feature, resolution) {
	  //console.log(feature, resolution);
    var size = feature.get('features').length;
    var style = styleCache[size];
   
    if (!style) {
      style = [new ol.style.Style({
        image: new ol.style.Circle({
        	radius:rad,
            stroke: new ol.style.Stroke({
            	width:1,
            color: col
          }),
          fill: new ol.style.Fill({
            color: colin,
			opacity:'90%'
          })
        }),
        text: new ol.style.Text({
          text: size.toString(),
          fill: new ol.style.Fill({
            color: fcolor
          })
        })
      })];
	 
      styleCache[size] = style;
    }
	 if(size == 1){
		  style = new ol.style.Icon( ({
                src: feature.get('img_url'),
				anchor: [0.5, 1]
            }));
			console.log(feature.get('img_url'));
			return style;
	  }
    return style;
  }
});
clusters.setMap(map);
//map.addLayer(clusters);
}

var allClusterTypeData = [];
var allClusterType = [];
var allClusterType1 = [];
tmpl.Overlay.createWithCluster = function(param){
	var mapObj = param.map;
	var jsonobj = param.features;
	var radius = param.radius;
	var distance = param.distance;
	var fillColor = param.fillColor;
	var allLayer = param.allLayer;
	var layerName = param.layer;
	var layerSwitcher = param.layerSwitcher;
	var getdata = jsonobj;
	var getHoverLabel = param.getHoverLabel;
	if(allLayer == true){
	allClusterTypeData = [];
	allClusterType = [];
	allClusterType1 = [];
	}
	if(getdata.length==0){
		return false;
	}
	//clustredLayerFlag[layerName] = 1;
	var featureDataAry = [];
    for (var i = 0, length = getdata.length; i < length; i++){
		var geometry;
		if(appConfigInfo.mapData==='google'){
			geometry = new ol.geom.Point(ol.proj.transform([parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)], 'EPSG:4326', 'EPSG:3857'));
		}
		else{
			var coordinate = [parseFloat(getdata[i].lon), parseFloat(getdata[i].lat)];
			geometry = new ol.geom.Point(coordinate);
		}
		var featureval = new ol.Feature({
            geometry     : geometry
			
        });
		//console.log(getdata[i].img_url);
		featureval.set('img_url',getdata[i].img_url);
		featureval.setProperties(getdata[i]);
		featureval.setId(getdata[i].id);
		featureval.set('layer_name',layerName);
		featureDataAry.push(featureval);
		if(allLayer == true){
		if(allClusterType1.indexOf(getdata[i].category_id) == -1){
			allClusterType1.push(getdata[i].category_id);
			allClusterTypeData[getdata[i].category_id] = [];
		}
		allClusterType[getdata[i].id] = 1;
		allClusterTypeData[getdata[i].category_id].push(featureval);
		
		}
	}
    //console.log("eeeeeee >>",allClusterTypeData);
	var source=  new ol.source.Vector({
        features: featureDataAry
    });
	var clusterSource = new ol.source.Cluster({
	        distance: distance,
	        source: source
	});
	var styleCache = {};
	
	var Layers = mapObj.getLayers();
	var length = Layers.getLength();
	var OverlayisLayerPresent = false;
	for(var i=0;i<length;i++){
		
		
		var layerTemp = Layers.item(i);
		//console.log(layerTemp.get('title'),layerName,layerTemp.get('title') == layerName);
		if(layerTemp.get('title') == layerName){
			//OverlayisLayerPresent = true;
			//layerTemp.getSource().addFeatures(featureDataAry);
			//console.log("before");
			OverlayisLayerPresent = false;
			layerTemp.getSource().clear();
			//console.log("before");
			try{
			mapObj.removeLayer(layerTemp);
			
			}
			catch(e){
				//console.log("dddd",e);
			}
			break;
		}
	}
	
	if (OverlayisLayerPresent == false) {
		console.log("123");	
		
		var overlay = new ol.layer.Vector({
            title: layerName,
			'cluster' : true,
            visible: true,
            source: clusterSource,
            style : function(fea12) {
            	if(fea12 != undefined){
                var size = fea12.get('features').length;
				for(var j=0;j<fea12.get('features').length;j++){
					if(fea12.get('features')[j].get('img_url') == ''){
						size = size - 1;
					}
				}
                var style = styleCache[size];
                var style2 = styleCache[size];
                //test = fea12;
				//console.log("inside cluster",fea12.getProperties('features')[0].getProperties());
				//console.log("inside cluster",fea12.get('features')[0].getProperties().img_url);
                if(size == 1){
                	//if (!style2) {
						if(getHoverLabel == true){
style2 = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        }),
                        image: new ol.style.Icon( ({
                             anchor: [0.5, 1],
                            src: fea12.get('features')[0].getProperties().img_url
                        }))
				
                       
            		});
					
				
			var ta_tooltip = document.createElement('tooltip');
    ta_tooltip.id = 'trip-tooltip';
    ta_tooltip.className = 'ol-trip-tooltip';
    var overlay_mouseOver_label = new ol.Overlay({
        element: ta_tooltip,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
    mapObj.addOverlay(overlay_mouseOver_label);
		mapObj.on('pointermove', function(evt){
			
			var feature_mouseOver = mapObj.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
				
				
			//if(layer){fea12.get('features')[0].getProperties().img_url
				if(feature.get('features')[0].get('layer_name') == layerName){
					return feature;
				}
			//}
			});
			ta_tooltip.style.display = feature_mouseOver ? '' : 'none';
			if(feature_mouseOver) {
			//console.log(feature_mouseOver.getProperties().features[0].get('label'));
				overlay_mouseOver_label.setPosition(evt.coordinate);
				ta_tooltip.innerHTML = feature_mouseOver.getProperties().features[0].get('label');//feature_mouseOver.getProperties().label;
			}
		});
		}else{
		style2 = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        }),
                        image: new ol.style.Icon( ({
                             anchor: [0.5, 1],
                            src: fea12.get('features')[0].getProperties().img_url
                        })),
						text: new ol.style.Text({
                            text: fea12.get('features')[0].getProperties().label,
							offsetY: 7,
                            fill: new ol.style.Fill({
                              color: fea12.get('features')[0].getProperties().label_color,
                            }),
							 stroke: new ol.style.Stroke({
							  width: 5,
                              color: fea12.get('features')[0].getProperties().labelbg_color,
                            }),
                          })
                       
            		});
		}
                	
                	fea12.setStyle(style2);
                	//fea12.getStyle().getText().setOffsetY(-50);
            		//styleCache[size] = style2;
                	//}
                }else if(size == 0){
					style = new ol.style.Style({
                          image: new ol.style.Circle({
                            radius: 0,
                            stroke: new ol.style.Stroke({
                              color: 'rgba(0,0,0,0)'
                            }),
                            fill: new ol.style.Fill({
                              color: 'rgba(0,0,0,0)'
                            })
                          })
                        });
                        styleCache[size] = style;
					
				}else{
                	if (!style) {
                        style = new ol.style.Style({
                          image: new ol.style.Circle({
                            radius: radius,
                            stroke: new ol.style.Stroke({
                              color: '#fff'
                            }),
                            fill: new ol.style.Fill({
                              color: fillColor
                            })
                          }),
                          text: new ol.style.Text({
                            text: size.toString(),
                            fill: new ol.style.Fill({
                              color: '#fff'
                            })
                          })
                        });
                        styleCache[size] = style;
                     }
                }
            	}
                return style;
              }
        });
		//console.log("after");
		mapObj.addLayer(overlay);
		
		
		//if(layerSwitcher)
			//mapObj.addControl(new ol.control.LayerSwitcher());
		OverlayisLayerPresent = true;
	}
	//console.log("eeeeeee >>",allClusterTypeData);
	return true;
}


tmpl.Layer.changeShape = function(param)
{
var mapObj = param.map;
var layerName = param.layer;
var icon = param.icon;
var sides = param.sides;
var shape = param.shape;

 var lyrs = mapObj.getLayers();
 var length = lyrs.getLength();
 var dataArr = [];
 
 var existing;
 for(var i=0;i<length;i++)
 {
   var lyr1=lyrs.item(i);
   if(lyr1)
   {
    if(lyr1.get('title') === layerName)
    {
	  existing = lyr1;
      lyr1.getSource().getFeatures().forEach(function (ff){
        if(shape == 'icon'){
             ff.setStyle(new ol.style.Style({
                    
                      image: new ol.style.Icon(({
                       anchor: [0.5, 1],
                        src: icon
                      }))
          }));
        }else if(shape == 'square'){
			 ff.setStyle(
			new ol.style.Style({
          image: new ol.style.RegularShape({
            fill: fill,
            stroke: new ol.style.Stroke({color: 'while', width: 2}),
            points: 4,
            radius: 10,
            angle: Math.PI / 4
          })
        })
		  );
		}else if(shape == 'triangle'){
			 ff.setStyle(
			new ol.style.Style({
          image: new ol.style.RegularShape({
            fill: fill,
            stroke: new ol.style.Stroke({color: 'while', width: 2}),
            points: 4,
            radius: 10,
            angle: Math.PI / 4
          })
        })
		  );
		}

    });
    var alfeatures = lyr1.getSource().getFeatures();
        lyr1.getSource().clear();
        lyr1.getSource().addFeatures(alfeatures);
  }
 }
}

if(existing == undefined){
		for(var i=0;i<tmpl_setMap_layer_global.length;i++){
			if(tmpl_setMap_layer_global[i].title == layerName){
				tmpl_setMap_layer_global[i].layer.getSource().getFeatures().forEach(function (ff) {

       if(shape == 'icon'){
             ff.setStyle(
			 new ol.style.Style({
                
                      image: new ol.style.Icon(({
                       anchor: [0.5, 1],
                        src: icon
                      }))
          })
		  );
        }else{
			
		}
				});
				var alfeatures = tmpl_setMap_layer_global[i].layer.getSource().getFeatures();
				tmpl_setMap_layer_global[i].layer.getSource().clear();
				tmpl_setMap_layer_global[i].layer.getSource().addFeatures(alfeatures);
			}
		}
	}
}

tmpl.Search.getLandMarksRoad = function(params){
	var point=params.point;
	var callbackFunc  = params.callbackFunc;
	var custom_poi_type = params.POI_type;

	var dataFrom = params.dataFrom;
	var ignoreRadius = params.ignoreRadius;
	var radius = params.radius;
	if(ignoreRadius == undefined){
		
	}else{
		if(ignoreRadius == true){
			radius = 8000000;
		}
	}
	var POI_type,keyword;
	if(custom_poi_type == "blood_bank"){
		keyword = 'blood bank';
		POI_type = 'health';
	}else{
		keyword = ''
		POI_type = custom_poi_type;
	}

	if(appConfigInfo.mapData == 'google'){
		if(dataFrom == 'google' || dataFrom == undefined){
			var searchresult;
		var olGM = new olgm.OLGoogleMaps({map: params.map});
		var gmap = olGM.getGoogleMapsMap();
		//point=point.slice(1,-1);
		//point=point.split(',');
		var coordinate = {lat: parseFloat(point[1]), lng: parseFloat(point[0])};
		var service = new google.maps.places.PlacesService(gmap);
		var resultArray22 = [];
		service.nearbySearch({
            location: coordinate,
            radius: radius,
		types: ['atm','shopping_mall','bar','movie_theater','route',]
			//keyword: keyword
		},function googlecallback(results, status){
			//console.log("qq",POI_type,results);
         var resultArray = [];
			if(results == null){
				var record = {};
                //resultArray.push(record);
                searchresult=false;
			}else{
           if(results.length == 0){
                var record = {};
                //resultArray.push(record);
                searchresult=false;
            }
            else{
				if (status === google.maps.places.PlacesServiceStatus.OK){
                    for (var i = 0; i < results.length ; i++){
						if(results[i] !=undefined){
							var lat=results[i].geometry.location.lat();
							var lng=results[i].geometry.location.lng();
							function deg2rad(deg) {
                                return deg * (Math.PI/180)
                            }
							var R = 6371; // Radius of the earth in km
							var dLat = deg2rad(lat-point[1]);
							var dLon = deg2rad(lng-point[0]);
							var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
							Math.cos(deg2rad(lat)) * Math.cos(deg2rad(point[1])) *
							Math.sin(dLon/2) * Math.sin(dLon/2);
							var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
							var d = R * c; // Distance in km
							var distance=d.toFixed(2);
							distance = parseFloat(distance);
							var record = {name : results[i].name, lat: parseFloat(lat), lon:parseFloat(lng), distance: distance, poi_type : params.POI_type};
							resultArray22.push(record);
						}
                    }
					resultArray22.sort(function(a, b){return a.distance - b.distance});
					//console.log("hhhh",resultArray22);
				}
            }
            var no_of_POIs;
            if(params.Max_num_POIs < results.length){
                no_of_POIs = params.Max_num_POIs;
            }
            else{
                no_of_POIs = results.length;
            }
            for (var i = 0; i < no_of_POIs ; i++){
				resultArray.push(resultArray22[i]);
                searchresult=true;
            }
			}
			//alert("alert from api");
            callbackFunc(resultArray);
        });
		}
		else if(dataFrom == 'trinity'){
            	var lon= parseFloat(point[0]);
				var lat= parseFloat(point[1]);
				var maxPOI = params.Max_num_POIs;
				var type ;
				var rsltAry = [];
				var boolianone= false;
				var urlL;
				if(custom_poi_type == "blood_bank"){
					type=10;
				}else if(custom_poi_type == "hospital"){
					type=16;
				}else if(custom_poi_type == "fire_station"){
					type=29;
				}else if(custom_poi_type == "police"){
					type=58;
				}
				else if(custom_poi_type == "all"){
					type=99;
				}
				//var radius = params.radius;
				var rdus = radius;
				var dstncKMtr;
				
					urlL= "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/landmark_search/"+lon+"/"+lat+"/"+maxPOI+"/"+type+"/"+rdus;

				
				$.ajax({
			        url:urlL,
			        success: function (data) {
			            for (var i = 0; i < data.length ; i++){
					      	dstncKMtr = (data[i].distance)/1000;
					      	var record = {name : data[i].place, lat: data[i].lat, lon:data[i].lon, distance: dstncKMtr, type:data[i].type  };
							rsltAry.push(record);
						  }
						  //console.log(rsltAry);
						  callbackFunc(rsltAry);
			          
			        },
			        error: function () {
			        	console.log("there was an error!");
			        },
			    });
            }


	}
	else{
		var lon= parseFloat(point[0]);
		var lat= parseFloat(point[1]);
		var maxPOI = params.Max_num_POIs;
		var type ;
		var rsltAry = [];
		var boolianone= false;
		var urlL;
		if(custom_poi_type == "blood_bank"){
			type=10;
		}else if(custom_poi_type == "hospital"){
			type=16;
		}else if(custom_poi_type == "fire_station"){
			type=29;
		}else if(custom_poi_type == "police"){
			type=58;
		}
		else if(custom_poi_type == "all"){
			type=99;
		}
		//var radius = params.radius;
		var rdus = radius;
		var dstncKMtr;
		
			urlL= "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.project+"/landmark_search/"+lon+"/"+lat+"/"+maxPOI+"/"+type+"/"+rdus;

		
		$.ajax({
	        url:urlL,
	        success: function (data) {
	            for (var i = 0; i < data.length ; i++){
			      	dstncKMtr = (data[i].distance)/1000;
			      	var record = {name : data[i].place, lat: data[i].lat, lon:data[i].lon, distance: dstncKMtr, type: data[i].type };
					rsltAry.push(record);
				  }
				  callbackFunc(rsltAry);
	          
	        },
	        error: function () {
	        	console.log("there was an error!");
	        },
	    });
	}
}

tmpl.Route.ETAforICCC = function(param){
	var mapObj = param.map;
	var dist = param.dist;
	var dtime = param.dtime;
	var point = param.point;
	var ta_tooltip = document.createElement('tooltip');
    ta_tooltip.id = 'trip-tooltip';
    ta_tooltip.className = 'ol-trip-tooltip';
    ta_tooltip.innerHTML =  "Distance:" + dist + ", Time:" + dtime;
    var overlay_mouseOver_trip = new ol.Overlay({
        element: ta_tooltip,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
    mapObj.addOverlay(overlay_mouseOver_trip);
    overlay_mouseOver_trip.setPosition(ol.proj.transform(point, 'EPSG:4326','EPSG:3857'));
}

tmpl.Overlay.addOverlay = function(param){
	var mapObj = param.map;
	var point = param.point;
	var img_url = param.img_url;
	var count = param.count;
	var features = param.features;
	var callbackFunc = param.callbackFunc;
	var overlayID = mapObj.getOverlayById('clusterOverlayID');
	if(overlayID){
		mapObj.removeOverlay(overlayID);
	}
	var container1=document.createElement('div');
	container1.className = 'containerAPI ';
	container1.id = 'containerCircular ';
	var elem;
	if(img_url.length > 1){
		for(var i=0;i<count;i++){
			elem = document.createElement("img");
			elem.setAttribute("src", img_url[i]);
			elem.setAttribute("title", features[i].device_name);
			elem.className = 'field';
			elem.id = i;
			container1.appendChild(elem);
		}
	}else{
		for(var i=0;i<count;i++){
			elem = document.createElement("img");
			elem.setAttribute("src", img_url[0]);
			elem.setAttribute("title", features[i].device_name);
			elem.className = 'field';
			elem.id = i;
			container1.appendChild(elem);
		}
	}
	setTimeout(function(){
		var radius = 75;
		var fields = $('.field');
		var width = 100;//container.width();
		var height = 100;//container.height();
		var angle = 0, step = (2*Math.PI) / fields.length;
		fields.each(function() {
			var x = Math.round(width/2 + radius * Math.cos(angle) - $(this).width()/2);
			var y = Math.round(height/2 + radius * Math.sin(angle) - $(this).height()/2);	
			$(this).css({
				left: x + 'px',
				top: y + 'px'
			});
			//console.log(x,y);
			angle += step;
			//console.log(fields);
		});
		for(var i=0;i<fields.length;i++){
			fields[i].onclick = function() {
				//alert("i>"+this.id);
				callbackFunc(this.id);
			};
		}
		
	}, 50);
	
	// elem.setAttribute("height", height);
	// elem.setAttribute("width", width);
	// var labelDiv = document.createElement('div');
	// labelDiv.className = 'bottomleft';
	// labelDiv.innerHTML = plName;
	//container.appendChild(labelDiv);
	var marker_pos = new ol.Overlay({
        id: 'clusterOverlayID',
        element: container1,
        offset: [-50,-50],
        positioning: 'center'
    });
    mapObj.addOverlay(marker_pos);
    if(appConfigInfo.mapData == 'google'){
		marker_pos.setPosition(ol.proj.transform(point, 'EPSG:4326','EPSG:3857'));
    }
    else{ 
		marker_pos.setPosition(point);
    }
    marker_pos.setProperties({olname:"clusterOverlay"});
	
	/*mapObj.on('moveend',function() {
		var overlayID = mapObj.getOverlayById('clusterOverlayID');
		if(overlayID){
			mapObj.removeOverlay(overlayID);
		}
		
	});*/
	// setTimeout(function(){
		// tmpl.Overlay.removeMarker({map:mapObj,id:'clusterOverlayID'})
	// }, 5000);
}


tmpl.Map.getCategories = function(param){
	var mapObj = param.map;
	var assetResourceEvent = param.type;

	var urlL;

	if(assetResourceEvent == 'asset'){
		urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.gisProject+"/GetAsset";
	}else if(assetResourceEvent == 'resource'){
		urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.gisProject+"/GetResourceCategory";
	}

	$.ajax({
		type: "GET", 
	    url: urlL,
	    success: function(data){
	    	console.log("data >>",data);
	    },
	    error: function(jqxhr) {
	    	console.log("getCategories not working");
	    }
	});

}

tmpl.Map.getCategoryDetails = function(param){
	var mapObj = param.map;
	var category = param.category;
	var assetResourceEvent = param.type;

	var urlL;

	if(category.length == 1){
		if(assetResourceEvent == 'asset'){
			urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.gisProject+"/GetAssetDetails/"+category[0];
		}else if(assetResourceEvent == 'resource'){
			urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.gisProject+"/GetResourceDetails/"+category[0];
		}

		$.ajax({
		type: "GET", 
	    url: urlL,
	    success: function(data){
	    	console.log("data >>",data);
	    },
	    error: function(jqxhr) {
	    	console.log("getCategories not working");
	    }
	});
	}
}

tmpl.Map.createCategoryLayers = function(param){
	var mapObj = param.map;
	var assetResourceEvent = param.type;
	var category = param.category;
	var urlL;

	if(category =='all'){
		if(assetResourceEvent == 'asset'){
			urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.gisProject+"/GetAllAssetDetail";
		}else if(assetResourceEvent == 'resource'){
			urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.gisProject+"/GetAllResourceDetails";
		}
	}else{
		if(assetResourceEvent == 'asset'){
			urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.gisProject+"/GetAssetDetails/"+category;
		}else if(assetResourceEvent == 'resource'){
			urlL = "http:"+appConfigInfo.connection.url+"/"+appConfigInfo.connection.gisProject+"/GetResourceDetails/"+category;
		}
		
	}

	

	var objNew = [];

	$.ajax({
		type: "GET", 
	    url: urlL,
	    success: function(data){
	    	console.log("data >>",data);

	    	/*for(var i=0;i<categoriesIds.length;i++){
	    		  categoriesIds[i] = parseInt(categoriesIds[i]);
	        	  tmpl.Layer.clearData({
	        			map : mapObject,
	        			layer : 'layer'+categoriesIds[i]
	        		});
	    	}*/




	    },
	    error: function(jqxhr) {
	    	console.log("layer creation not working");
	    }
	});

}