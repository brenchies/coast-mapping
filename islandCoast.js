// Define the time period you're interested in
var start = '2021-01-01';
var end =  '2021-12-31';

// Threshold for water on the NDWI index
var threshold = 0.2;

// Import the geometry of Aruba's coastline
var ROI = ee.FeatureCollection("users/sevold/Aruba").first().geometry();

// Import your region of interest
// var ROI = myIslandCoastline;

// Create buffers around the island's coast
var bufferOut = ROI.buffer(150);  // island coast plus a bit, 150 m from shore
var bufferIn = ROI.buffer(-150);  // island coast minus a bit, 150 m inland

// Import the Sentinel dataset
var sentinel2 = ee.ImageCollection('COPERNICUS/S2');

// Filter the Sentinel 2 data using your location of interest
var spatialFiltered = sentinel2.filterBounds(bufferOut);

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
var bluestBuf = bluest.clip(bufferOut.difference(bufferIn, ee.ErrorMargin(1)));

// This makes maps with values of 0 for non-water, and 1 for water
var waterCoast = bluestBuf.select('NDWI').gt(threshold);

// This calculates the number of blue pixels that are in the coastal area
var blueCoast = waterCoast.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: bufferOut.difference(bufferIn, ee.ErrorMargin(1)),
  scale: 10,
  maxPixels: 1e10
  });
  
// This gets the number out of the dictionary element that results from the above reducer
var blueOcean = blueCoast.getNumber('NDWI');

// If your island is very small and doesn't have any inland water, you can
// uncomment the lines below to do the calculation
// var blueOut = waterCoast.reduceRegion({
//   reducer: ee.Reducer.sum(),
//   geometry: bufferOut,
//   scale: 10,
//   maxPixels: 1e10
//   });
// var blueOcean = blueOut.getNumber('NDWI');

// This calculates the area of the pixels, which are 10m x 10m, in square meters
var blueArea = blueOcean.multiply(100);

// Print out the area of blue coverage in the console so you can write it down!
print('Area of water = ');
print(blueArea);

// Display the NDWI result in the map area
var visNDWI = {min: -1, max: 1, bands: ['NDWI'], palette: ['red', 'white', 'blue']};

// Zoom level can be adjusted to fit your island, e.g. for Aruba it is 11, Hispaniola is 8
Map.centerObject(ROI, 11);

// Add the NDWI layer to the map
Map.addLayer(bluest, visNDWI, 'NDWI');

// Add layers to display your buffer zones so you can check them against
// the satellite imagery to make sure they include just the coast
// These layers are invisible by default, you can enable them under the Layers button
Map.addLayer(bufferOut, {color: 'FFFF00'}, 'outer buffer', 0, 0.4);
Map.addLayer(bufferIn, {color: '880000'}, 'inner buffer', 0, 0.4);

var islandArea = bufferOut.area().subtract(blueArea);
print('Area of land = ');
print(islandArea);
