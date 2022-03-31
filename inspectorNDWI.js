// Define the time period you're interested in
var start = '2017-01-01';
var end =  '2017-12-31';
var beach = 'Boca Grandi';

// Threshold for water on the NDWI index
var threshold = 0.3;

// Import the geometry of your beach of interest
var BOI = ee.FeatureCollection("users/sevold/arubabeaches").filter("name == '"+beach+"'").first().geometry();

// Import the Sentinel dataset
var sentinel2 = ee.ImageCollection('COPERNICUS/S2');

// Filter the Sentinel 2 data using your location of interest
var spatialFiltered = sentinel2.filterBounds(BOI);

// Then filter it using your dates of interest
var temporalFiltered = spatialFiltered.filterDate(start, end);

// This is a function to calculate NDWI from a Sentinel 2 raster and add it as another layer
var addNDWI = function(image) {
 var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
 return image.addBands(ndwi);
};

// Here we apply the function above to our filtered image collection
var withNDWI = temporalFiltered.map(addNDWI);

// Collect peak "blueness" from our images into one map
var bluest = withNDWI.qualityMosaic('NDWI');

// And cut it out to the shape of our region, between the buffers
var beachNDWI = bluest.clip(BOI);

// This makes maps with values of 1 for non-water, and 0 for water
var onIsland = beachNDWI.select('NDWI').lt(threshold);

// Display the NDWI result in the map area
var visNDWI = {min: -1, max: 1, bands: ['NDWI'], palette: ['red', 'white', 'blue']};

// Zoom level can be adjusted to fit your island, e.g. for Aruba it is 11, Hispaniola is 8
Map.centerObject(BOI, 13);

// Add the NDWI layer to the map
Map.addLayer(beachNDWI, visNDWI, 'NDWI');

var visLand = {min: 0, max: 1, bands:['NDWI'], palette: ['blue', 'green']};

Map.addLayer(onIsland, visLand, 'Land');
