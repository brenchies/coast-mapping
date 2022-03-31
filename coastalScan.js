// Define the time period you're interested in
var year1 = '2017';
var year2 = '2021';

// Import your region of interest
var ROI = ee.FeatureCollection("users/sevold/Aruba").first().geometry();

// Create buffers around the island's coast
var bufferOcean = ROI.buffer(650);  // island coast plus a bit
var bufferLand = ROI.buffer(-300);  // island coast minus a bit
var bufferOut = bufferOcean.difference(bufferLand);

// Import the Sentinel dataset
var sentinel2 = ee.ImageCollection('COPERNICUS/S2');

// Filter the Sentinel 2 data using your location of interest
var spatialFiltered = sentinel2.filterBounds(bufferOut);

// Then filter it using your dates of interest
var temporalFiltered1 = spatialFiltered.filterDate(year1+'-01-01',year1+'-12-31');
var temporalFiltered2 = spatialFiltered.filterDate(year2+'-01-01',year2+'-12-31');

// This is a function to calculate NDWI from a Sentinel 2 raster and add it as another layer
var addNDWI = function(image) {
 var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
 return image.addBands(ndwi);
};

// Here we apply the function above to our filtered image collection
var withNDWI1 = temporalFiltered1.map(addNDWI);
var withNDWI2 = temporalFiltered2.map(addNDWI);

// Collect peak "blueness" from our images into one map
var bluest1 = withNDWI1.qualityMosaic('NDWI');
var bluest2 = withNDWI2.qualityMosaic('NDWI');

// And cut it out to the shapes of our region, once for each buffer
var bluestClip1 = bluest1.clip(bufferOut);
var bluestClip2 = bluest2.clip(bufferOut);

var bluestChange = bluestClip2.subtract(bluestClip1);

var minVis = bluestChange.reduceRegion({
      reducer: ee.Reducer.min(),
      geometry: bufferOut,
      scale : 30
      });
var maxVis = bluestChange.reduceRegion({
      reducer: ee.Reducer.max(),
      geometry: bufferOut,
      scale : 30
      });
      
// Display the NDWI result in the map area
var visParams = {min: -0.5, max: 0.5, bands: ['NDWI'], palette: ['green', 'white', 'red']};
Map.centerObject(ROI, 11);
Map.addLayer(bluestChange, visParams, 'Change in NDWI');
