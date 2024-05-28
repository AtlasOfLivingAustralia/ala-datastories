
<script setup>
  import HexMap from './components/HexMap.vue'
  import FacetGroup from './components/FacetGroup.vue'
  import ObsTile from './components/ObsTile.vue'
  import axios from 'axios'
</script>


<script>
  export default {
    data() {
      return {  queryParams:{ q:"*", 
                    pageSize:50, 
                    spatiallyValid:true,
                    sort:"eventDate", 
                    dir:"desc",
                    fsort:"count",
                    flimit:50,
                    facets: ["speciesGroup","dataResourceName","stateConservation"],

                },
                occurrenceData:null,
                filterQuery:{}, // storing the facet query state
                queryLoaded: false,
                geoFilter:false,
                apiCache:{},
                facetFormat: {
                  speciesGroup: { label:"Lifeform", 
                                  fields: ["Plants","Fungi","Birds","Mammals","Insects","Amphibians","Reptiles","Fishes","Molluscs"]
                                },
                  dataResourceName: { label: "Data Resource"},
                  stateConservation: {label: "State Conservation Status"}
                }
              }

    },

    computed:{
        occurrenceCount(){
          if (!this.queryLoaded) return 134343000;
          return this.occurrenceData.totalRecords;
        },
        hexMapQuery(){
          let hq = this.queryParams.q;
          if (this.geoFilter){ // add the geo query fields to the hex map layer
            hq = hq + "&lat=" +this.queryParams.lat +"&lon=" +this.queryParams.lon + "&radius=" + this.queryParams.radius;
          }
          return hq;
        }
    },

    methods: {
      
      queryApi(){
        this.queryLoaded = false;
        // check if we have stored data in the cache, use it if so
        // don't cache anything with a geo filter
        if (this.apiCache[this.queryParams.q] && !this.geoFilter){
          this.occurrenceData = this.apiCache[this.queryParams.q]
          this.queryLoaded = true;
          console.log("loaded from cache " + this.queryParams.q)
          return;
          }

       axios
        .get('https://api.ala.org.au/occurrences/occurrences/search?',
          {params:this.queryParams,
          paramsSerializer: {
            indexes: null, // serialise the array value (facets)
          }})
        .then((response) => {
          console.log(response.data);
          this.occurrenceData = response.data;
          if (!this.geoFilter) this.apiCache[this.queryParams.q] = response.data;
          this.queryLoaded = true;
        })
      },

      buildFacets(fieldName){
          let facetResult = this.occurrenceData.facetResults.find(r => r.fieldName == fieldName);
          let facets = facetResult.fieldResult;
          let groupFields = this.facetFormat[fieldName].fields
          if (groupFields) facets = facets.filter(f => groupFields.indexOf(f.label) > -1);
          return facets;
      },

      setQueryFacet(fieldName,facetValue){
          if (this.filterQuery && this.filterQuery[fieldName] == facetValue){ // already set
                delete this.filterQuery[fieldName] // toggle off
        } else {
             this.filterQuery[fieldName] = facetValue; // set
        }
        const joinedQuery = Object.keys(this.filterQuery).map(k => k + ':"'+this.filterQuery[k]+'"').join(" AND "); // boolean query
        if (joinedQuery) this.queryParams.q = "* AND " + joinedQuery;
        if (joinedQuery) this.queryParams.q = joinedQuery;
        if (!joinedQuery) this.queryParams.q = "*";
        this.queryApi();
      },

      receiveFacet(facetObj){ // receive the emit and set the facet
        console.log(facetObj)
        this.setQueryFacet(facetObj.field,facetObj.value);
      },

      formatCount(count){
            if (count < 10000) return count;
            if (count >= 10000 && count < 1000000) return Math.floor(count/1000)+"k";
            return (count/1000000).toFixed(1)+ "M";
      },

      setGeoFilter(){
        let mapradius = this.$refs.hexmap.getRadius();
        let mapcenter = this.$refs.hexmap.center;
        // this.$refs.hexmap.setCircle();
        this.queryParams.lat = mapcenter.lat;
        this.queryParams.lon = mapcenter.lng;
        this.queryParams.radius = mapradius;
        this.geoFilter = true;
        this.queryApi();
      },

      unsetGeoFilter(){
        delete this.queryParams.lat;
        delete this.queryParams.lon;
        delete this.queryParams.radius;
        this.geoFilter = false;
        this.queryApi();
      }

     },

    mounted(){
      this.queryApi();
      // console.log(this.$refs.hexmap.center)
    },


  }

</script>

<template>
   
    <HexMap :query="hexMapQuery" :record-count="occurrenceCount" :query-loaded="queryLoaded" :obs="occurrenceData ? occurrenceData.occurrences: []" ref="hexmap" />
    
    <div class="mapFooter">
      <div class="mapInfo">
          <h4>{{occurrenceData ? formatCount(occurrenceData.totalRecords) : 0}} occurrences</h4> 
          <button @click="setGeoFilter">Focus area</button>
          <button @click="unsetGeoFilter">Clear area</button>
      </div>
     
      <div class="obsTileWrapper" v-if="occurrenceData">
        <ObsTile v-for="o in occurrenceData.occurrences" :obs-data="o"/>
      </div>

    </div>

    <section id="facets">
      <div class="facetColumn" v-if="occurrenceData" v-for="f in queryParams.facets">
        <facet-group :field="f" :format="facetFormat[f]" :facet-data="buildFacets(f)" :facet-focus="filterQuery" :total-count="occurrenceData.totalRecords" @set-facet="receiveFacet"></facet-group>
      </div>
    </section>

</template>

<style type="text/css">
  #facets{
    display:block;
    padding:0 1em;
  }

  .facetColumn{
    width:33%;
    float:left;
    display: inline-block;
  }

  .mapFooter{
    height:96px;
    background-color: #F2F2F2;
/*    width:100%;*/
    margin:0;
    padding:0.5em 0.5em 0em 1em;
/*    box-sizing: border-box;*/
  }

  .mapInfo{
/*    width:160px;*/
/*    display: flex;*/
    float:left;
    padding-right:0.5rem;
  }

  .mapInfo h4{
    margin-top:0.5rem;
  }

  .mapInfo button{
    background-color: white;
    border: 1px solid #aaa;
    display: block;
    margin-bottom:0.25rem;
    cursor:pointer;

  }

  .obsTileWrapper{
/*    height:60px;*/
/*    height:100%;*/
    overflow-x: scroll;
    white-space: nowrap;
    padding-bottom:0.6em;
  }



</style>
  



