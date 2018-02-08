// By defining config information as json object we can avoid these 20 global variables and more changes in the API code are not required while using this json object.

var appConfigInfo = {
	mapData : "google",
	extent1 : 77.378372,
	extent2 : 12.734456,
	extent3 : 77.882713,
	extent4 : 13.2803290722673,
	
	projection : "EPSG:4326",
	googleprojection : "EPSG:3857",
	wmsVersion : "1.1.1",
	trinityzoom : 10,
	googleMaxZoom : 21,
	trinityMaxZoom : 21,
	url : "http://192.168.1.165:9090/geoserver_bangalore/gwc/service/wms",//"http://192.168.0.250:8899/geoserver/wms",
	layer :"bangalore_map",
	gwc : true,
	
	lon : 77.59455035,
	lat : 12.97161007,
	
	poi_img_url : "http://192.168.1.165:8989/trinityAPI/v2.12/poi",
	gwcurl : "http://192.168.1.165:9090/geoserver_bangalore/gwc/service/wms",
	wmsurl : "http://192.168.1.165:9090/geoserver_bangalore/wms",
	streetLayer : "bangalore_street_view",
	
	googleSatelliteView : true,
	googlezoom : 12,
	googleMinZoom : 1,
	trinityMinZoom : 1,
	setResolution : false,

 	trinitySatelliteView : true, 
 	trinitySatelliteurl : "http://192.168.1.165:9090/geoserver_mumbai_cad",//"
	trinitySatelliteLayer : "mumbai_satellite_basemap",
 	trinitySatellitegwc : true,
	drawRestrictionURL : 'http://192.168.1.165:8989/bangalore/landmark_search/withInBoundary/',
 	connection:
	{
		url:"//192.168.1.165:8989",
		project : "bangalore",
		gisProject:"trinityICCC/getAsset"
	}
};


