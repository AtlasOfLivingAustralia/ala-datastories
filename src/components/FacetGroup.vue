<template>
	 <h4>{{facetFormat[field].label}}</h4>
        <ul class="facetList">
          <li v-for="a in trimmedFacetData" 
            @click="clickFacet(a)" 
            :class="{focus: localFocus == a.label}">
            <div class="bar" :style="{width: 100*a.count/localTotal+'%'}"></div>
            <div class="foreground">
              <img class="groupIcon" v-if="a.icon" :src="`${siteRoot}/icons/${a.icon}`" alt="">
              <div class="label">{{a.label}}</div> 
              <div class="count">{{formatCount(a.count)}}</div>
            </div>
          </li>
          <li v-if="truncateFacetData && computedFacets.length > truncateLength">
            <span @click="truncateFacetData = false">+ show {{computedFacets.length - truncateLength}} more</span></li>
          <li v-if="!truncateFacetData && computedFacets.length > truncateLength">
            <span @click="truncateFacetData = true">- hide {{computedFacets.length - truncateLength}} </span></li>  
        </ul>
</template>

<script>

  import { apiState } from '../apiState.js'
  import speciesGroups from '../assets/data/speciesGroups.json'
  import axios from 'axios'
	
	export default {
      
      data(){
        return{
          apiState,
          truncateFacetData: true,
          truncateLength: 15,
          localFacets: null,
          localFocus: null,
          facetFormat: {
                  speciesGroup: { label:"Lifeform"},
                  dataResourceName: { label: "Data Resource"},
                  stateConservation: {label: "State Conservation Status"},
                  countryConservation: {label: "National Conservation Status"},
                  
                },
          siteRoot: import.meta.env.BASE_URL

        }
      },

	    props: ["field","facetResults","totalCount","geoFilter"],

      computed: {
      

        trimmedFacetData(){
          if (this.truncateFacetData) return this.computedFacets.slice(0,this.truncateLength)
          return this.computedFacets;  
        },

        localTotal(){
          let t = 0
          this.computedFacets.forEach(f => t += f.count)
          return t;
        },

        computedFacets(){
          let facets = [];
          let source = this.localFacets ? this.localFacets : this.facetResults; 
          // use local facets if loaded
          let facetResult = source.find(r => r.fieldName == this.field);
          if (!facetResult) return [];
          
          if (this.field == "speciesGroup"){
            speciesGroups.forEach(f => {
                let matchFacet = facetResult.fieldResult.find(r => r.label == f.label);
                if (matchFacet){ // it's a 1:1 mapping with the speciesGroup facets
                  facets.push({...matchFacet, fq:f.fq, icon:f.icon})
                } else { // a grouping OR a renamed group
                  if (f.id == "reptiles"){
                    f.count = this.getFacetCount(facetResult,"Reptiles")
                  }

                  if (f.id == "amphibians"){
                    f.count = this.getFacetCount(facetResult,"Amphibians")
                  }

                  if (f.id == "fishes"){
                    f.count = this.getFacetCount(facetResult,"Fishes")
                  }
                  if (f.id == "insects"){
                      f.count = this.getFacetCount(facetResult,"Arthropods") - this.getFacetCount(facetResult,"Crustaceans")
                  }
                  if (f.id == "molluscs"){
                    f.count = this.getFacetCount(facetResult,"Molluscs") + this.getFacetCount(facetResult,"Crustaceans")
                  }
                  if (f.id == "inverts"){
                    f.count = this.getFacetCount(facetResult,"Animals") - this.getFacetCount(facetResult,"Mammals") - this.getFacetCount(facetResult,"Birds") - this.getFacetCount(facetResult,"Reptiles") - this.getFacetCount(facetResult,"Fishes") - this.getFacetCount(facetResult,"Molluscs") - this.getFacetCount(facetResult,"Arthropods") - this.getFacetCount(facetResult,"Amphibians");
                  }
                  if (f.id == "chromista"){
                    f.count = this.getFacetCount(facetResult,"Chromista")
                  }
                  if (f.id == "microbes"){
                    f.count = this.getFacetCount(facetResult,"Protozoa") + this.getFacetCount(facetResult,"Bacteria")
                  }
                  facets.push(f)
                }
              })
          } else {
            facets = facetResult.fieldResult;
          }
          return facets.filter(f => f.count > 0).sort((a,b) =>  b.count - a.count);
        }
      },

	    methods: {

        clickFacet(facet){
          this.localFocus = this.localFocus == facet.label ? null : facet.label;
          apiState.setFilter({field: this.field, value: facet.label, fieldLabel: this.facetFormat[this.field].label, valueLabel:facet.label, fq:facet.fq, icon:facet.icon ? facet.icon : '' })
        },
	    	
        formatCount(count){
	        	if (count < 1000) return count;
            if (count < 10000) return (count/1000).toFixed(1)+ "k";;
	        	if (count >= 10000 && count < 1000000) return Math.floor(count/1000)+"k";
	        	return (count/1000000).toFixed(1)+ "M";
		    },

        getFacetCount(facets,field){
          let match = facets.fieldResult.find(fr => fr.label == field);
          return match ? match.count : 0
        },

        truncateLabel(label,len){
          if (label.length > len) return label.substring(0,len)+ "…"
          return label;
        },

        loadFacets(){
          let queryParams = { 
                  q:"*",  
                  spatiallyValid:true,
                  qualityProfile:"ALA",
                  fsort:"count",
                  flimit:200,
                  count:5,
                  lat: this.geoFilter.lat,
                  lon: this.geoFilter.lon,
                  radius: this.geoFilter.radius,
                  facets: this.field
                }
          const joinedQuery = Object.keys(this.apiState.filterState)
          .filter(k => k != this.field) // filter out this facet field
          .map(k => this.apiState.filterState[k].fq)
          .join(" AND "); // boolean query
          queryParams.q = "*";
          if (joinedQuery) queryParams.q = "* AND " + joinedQuery;

          axios.get('https://api.ala.org.au/occurrences/occurrences/search?',
          {params:queryParams,
          paramsSerializer: {
            indexes: null, // serialise the array value (facets)
          }})
        .then((response) => {
          this.localFacets = response.data.facetResults;
        })
  		 }
  	},


    watch: {
      'apiState.query'(globalQuery){ // watching the global state
          if (this.apiState.filterState[this.field]){
            this.loadFacets(); // this field is involved, load local facets
          } else {
            if (this.localFacets){
               this.localFacets = null; // unset local facets
            }
            this.localFocus = null; // remove 
          }
      },

      geoFilter: {
        handler() {
          if (this.apiState.filterState[this.field]){
            this.loadFacets();
          } 
        },
      deep: true
      }
  }
  

  }

</script>

<style type="text/css">
  .facetList{
    list-style: none;
    overflow-x: hidden;
    padding:0;
    margin: 0 1.5em 0 0;
    font-size:13px;
    font-weight: 400;
    line-height: 1.5em;
    height:400px;
    overflow-y:auto;
    display: block;
   
  }

  .facetList li{
    cursor:pointer;
    position:relative;
    margin-bottom: 0.2em;
    white-space: nowrap;
    height:1.4rem;
  }

  .facetList li .foreground{
    position:absolute;
    z-index:1;
    top:1px;
    width:100%;
    display: ;
  }

  .facetList .foreground .label{
    padding-left:0.5em;
    margin-right: 0.5em;
    display: inline-block;
    overflow-x: hidden;
    text-overflow: ellipsis;
    width:90%;
  }

  .facetList .foreground .groupIcon{
    width:14px;
    max-height:14px;
    vertical-align:baseline;
    margin: 0.25rem 0.2rem 0.2rem;
  }

  .facetList li.focus{
    background-color: #e9bcb170;
/*    var(--ala-light-orange);*/
  }

  .facetList li:hover .label, .facetList li.focus .label{
    font-weight: 600;
  }

  .facetList li .count{
    color:#9d9d9d;
    font-size:90%;
    position:absolute;
    right:0;
    display: inline-block;
  }

  .facetList li:hover .count, .facetList li.focus .count{
    color:unset;
    font-weight: 600;
  }

  .facetList li .bar{
    background-color: var(--ala-ocean);
/*    position: absolute;*/
/*    left:0;*/
/*    top:0;*/
    height:100%;

    z-index:1;
    opacity:0.25;
    display: block;

  }

  .facetList li:hover .bar, .facetList li.focus .bar{
    background-color: var(--ala-orange);
    opacity:0.5;
  }

</style>