# coast-mapping
Mapping changes in island coastline using Google Earth Engine

<!-- wp:paragraph -->
<p>Through explorations in open science sessions and in collaboration with university students and volunteers, we developed a set of tools for exploring the effects of sea level rise using Google Earth Engine. These tools are based around NDWI, an index that can be calculated from satellite imagery to indicate whether an area is water or not water (land). Using this, and by focusing on the coastal area, we can calculate changes in the area of land, which is affected by sea level rise, erosion, and infrastructure.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Island Coast</strong><br>The first tool assesses changes on an entire island. After a polygon outlining the approximate coast is input, the code creates a buffer to include a bit of ocean on one side, and a bit of land on the other. These can be inspected and adjusted to make sure that the island's coast is fully included, but inland water bodies are not.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Guide:</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Code:</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Coastal Scan</strong><br>The second tool highlights potential areas of interest, by calculating the NDWI at two different time points and displaying the difference. The result is a map that shows green in areas with decreasing NDWI (indicating new land), and red in areas with increasing NDWI (indicating land loss due to erosion or sea level rise).</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Beaches Area</strong><br>The third tool is an expansion on the island coast tool, that is able to do the same calculation for a collection of polygons. The idea is that by defining smaller areas of particular concern, the calculation can be done more efficiently and accurately, and comparisons can be made within a specific beach or low-lying area, for example. This tool outputs a table of land areas for a given time period, which can be collected and plotted to map changes over time.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Inspector NDWI</strong><br>The last tool is useful for inspecting a single feature from a collection, to verify that the NDWI classification aligns with expectations based on imagery. The classification is displayed in blue and green, for water and land, and it can be compared against the raw NDWI data to clarify any issues that might be occurring. This can, for example, show if some shallow ocean areas are being classified as land, or if there is some seasonal water on land that might be affecting results. The classification threshold can also be adjusted to test specific values to see how the map changes.</p>
<!-- /wp:paragraph -->
