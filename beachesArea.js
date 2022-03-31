//SETTINGS
var threshold = 0.2; // Set a threshold for water on the NDWI index
var start = '2015-01-01'; // Make sure to select dates that fit your imagery
var end =  '2015-12-31'; // e.g. Sentinel 2 launched in 2015

//IMPORTS
var s2 = ee.ImageCollection('COPERNICUS/S2'); //1.1 import sentinel 2 satellite imagery
var ROI = ee.FeatureCollection("users/sevold/arusquare"); //1.2 import aruba as a square that includes coastal waters for imagery clipping
var beaches = ee.FeatureCollection("users/sevold/arubabeaches"); //1.3 import featurecollection "allthebeaches"

//PREPROCESSING
var spatialFiltered = s2.filterBounds(ROI);
var temporalFiltered = spatialFiltered.filterDate(start, end)

//FUNCTIONS
//https://developers.google.com/earth-engine/guides/feature_collection_mapping

//Function to compute feature geometry area and add as a property.
var addArea = function(feature) {
  return feature.set({areaM2: feature.geometry().area()});
};

// Function to calculate NDWI from image and add as another band
var addNDWI = function(image) {
 var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
 return image.addBands(ndwi);
};

var withNDWI = temporalFiltered.map(addNDWI); // add 'NDWI' band to imagery
var bluest = withNDWI.qualityMosaic('NDWI'); //get the bluest image for each pixel and combine into one image

// Function to compute feature land area and add as a property,
// i.e. how much beach is in each beach polygon
var addLand = function(feature) {
  var blueROI = bluest.clip(feature); // clips to the beach 
  var landBinary = blueROI.select('NDWI').lt(threshold); // 0 for water, 1 for non-water
  var land = landBinary.reduceRegion({ // number of pixels that are not water
    reducer: ee.Reducer.sum(),
    geometry: feature.geometry(),
    scale: 10
  });
  var landPixels = land.getNumber('NDWI');//ee.Number(blue.get('NDWI'));
  var landArea = landPixels.multiply(100);
  return feature.set({landM2: landArea});
};

var beachAreas = beaches.map(addArea); // add area property to beach features

var beachLand = beachAreas.map(addLand); // add land area to beach features

// Export the data to a CSV file.
Export.table.toDrive({
  collection: beachLand,
  description:'ArubaBeaches_'+start+'_'+end,
  fileFormat: 'CSV'
});

print(beachLand.reduceColumns(ee.Reducer.toList(), ['landM2']).get('list'));
