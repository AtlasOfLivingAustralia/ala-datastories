## Documentation of ALA Lens interface and components


ALA Lens is a Vue.js web application composed of a set of nested components. This documentation describes each interface element and the components that comprise it, as well as data sources, ALA API endpoints and dependencies for each.

### App.vue

As well as setting up the microsite landing page the root component coordinates app state and the main API queries for the map and occurrences.

App.vue defines view modes for the Discover Species / Explore Data tabs, and switches the lower interface components accordingly. It also defines interface elements around the map including: 
- focus bar (showing current focus / filters and occurrence count) 
- scrolling panel of observation tiles
- "search here" button to set spatial focus
- legend for hex map colours

App.vue queries `https://api.ala.org.au/occurrences/occurrences/search` with the current spatial focus, and loads facets for `speciesGroup`, `dataResourceName`, `countryConservation` and `decade`. Facet data is passed to the _FacetGroup_ and _DecadeFacets_ components. A simple in-memory cache stores API query results within a session and uses stored results where possible to minimise API queries. 

Faceted data for species groups is transformed into a custom set of groups using `assets/data/speciesGroups.json`. This structure defines species groups, their labels, icons and associated API queries. 

Occurence data is also annotated with these custom species groups and passed  to the _Hexmap_ component. 

App.vue defines a set of locations, including radii and map zoom levels, in the form: `{label: "Daintree", lat:-16.09484060306643, lon:145.3829383850098, radius:13.820092175436397, zoom:11}`. On loading one of these locations is selected at random. The user can modify the location or use their geolocation at any time.


### HexMap.vue

This component renders the map base layer, the hex tile density map, the custom map markers and the dashed circle that outlines the current spatial focus. It uses the vue-leaflet library to compose Leaflet map components and bind these to data from the API. 

To generate the hex density map the component queries `https://api.ala.org.au/occurrences/mapping/wms/reflect?` and passes in a set of colours with counts based on the total occurrence count in the current query. Bin colours are defined by interpolating between ALA Flamingo orange and ALA Honey across a log scale as follows:
- maximum count = 12 * square root of total occurrences
- bin 5: count > maximum count; colour: #f26649 (ALA flamingo); alpha: 100%
- bin 4: count > max count / 10; colour: #f57e4d; alpha: 75%
- bin 3: count > max count / 100; colour: #f99650; alpha: 60%
- bin 2: count > max count / 1000; colour: #fcad54; alpha: 45%
- bin 1: count > 0; colour: #ffc557; alpha: 30%

Markers are generated based on occurrences passed in to the component. Custom icons are assigned based on species groups, as well as a marker shadow. Markers are linked to popups which use the _ObsTile_ component to show details of the occurrence.

The map components communicates with _App.vue_; for example a double click on the map sets the spatial focus to the double click location, triggering a new API call in _App.vue_.


### ObsTile.vue

Observation tiles show details of individual occurrence records in the map footer and in map markers. The component is passed data for a single occurrence. It provides links to the full occurrence record as well as information on the data resource. A 'focus' button sets the tile's species as a global focus. Clicking on the thumbnail image triggers a modal image display through an event passed to App.vue

When instanced in a marker popup, the tile is assigned a 'popup' class which modifies its styling.


### SpeciesRank.vue

This component lays out the species bubble interfaces and handles data processing and API calls. It loads data on species for the current spatial focus in two stages

It queries `https://api.ala.org.au/occurrences/occurrences/search?` with facets `names_and_lsid` and a facet limit of 1000. This is required for the distinctive species calculation. A second query with the addition of `countryConservation:*` is used to load species with national conservation status.

Locally distinctive species are calculated by comparing the ranked query results for the local area, with a list of 50,000 *global* species counts for the whole ALA. These are stored in a local file at `assets/data/occurrencerank-50k-total.json`. This list should be regenerated periodically for the distinctiveness calculations to remain accurate! 

The most "distinctive" species are those whose local frequency is highest, compared to their global frequency. In the default configuration of this component this is actually calculated on the basis of difference in rank (rather than proportional frequency). That is, a species with a local rank of 5 and a global rank of 500 has a score of (500 - 5 = 495). Whereas a species with a local rank of 100 and a global rank of 50 has a score of (50 - 100 = -50). A minimum proportion is set for distinctive species, to prevent extremely uncommon species appearing here (for example taxa with a handful of localised occurrences). This proportion is set here at 0.1% - so any species with fewer than 0.1% of the total local occurrences is excluded.


