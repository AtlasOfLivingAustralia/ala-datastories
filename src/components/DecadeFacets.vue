<template>
	<div class="timelineWrapper">
		<div class="tile" v-for="d in decadeFacets" :class="{focus: localFocus == d.label}">
			<div class="fill" v-if="d.count > 0" 
				:style="{opacity: 0.2 + (d.count/maxCount)*0.8}" 
				@click="clickFacet(d)"></div>
			<span class="label">{{d.label}}</span>	
		</div>

	</div>
</template>

<script>
	
	  import { apiState } from '../apiState.js'
	  import axios from 'axios'

	  export default {

	  	data(){
	  		return{
	  			apiState,
	  			localFacets:null,
	  			localFocus:null,
	  			field:"decade"
	  		}
	  	},

	  	props: ["facetResults","geoFilter"],

	  	computed: {
	  		decadeFacets(){

	  			let source = this.localFacets ? this.localFacets : this.facetResults
	  			console.log(source)
	  			let facetResult = source.find(r => r.fieldName == 'decade');
	  			console.log(facetResult)

	  			let facetdata = facetResult ? facetResult.fieldResult : []

	  			let sorted = facetdata.filter(f => f.label != "Not supplied")
	  			.sort((a,b) => +a.label - +b.label);

	  			//let firstDecade = +sorted[0].label;
	  			let firstDecade = 1750;

	  			//let lastDecade = +sorted[sorted.length-1].label;
	  			let lastDecade = 2020;

	  			let df = [];
	  			for (let d=firstDecade; d<lastDecade+1; d+=10){

	  				let match = sorted.find(s => +s.label == d)
	  				if (match){
	  					df.push(match)	
	  				} else {
	  					df.push({label:d,count:0})
	  				}	
	  				
	  			}
	  			// console.log(df)
	  			return df;

	  		},

	  		maxCount(){
	  			let countSorted = this.decadeFacets.slice(0).sort((a,b) => b.count - a.count)
	  			return countSorted[0].count;
	  		}

	  	},

	  	methods:{
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
	                  facets: 'decade'
	                }
		          // console.log(this.apiState.filterState);
		          const joinedQuery = Object.keys(this.apiState.filterState)
		          .filter(k => k != 'decade') // filter out my field
		          .map(k => this.apiState.filterState[k].fq)
		          .join(" AND "); // boolean query
		          queryParams.q = "*";
		          if (joinedQuery) queryParams.q = "* AND " + joinedQuery;

		          //axios.get('https://api.ala.org.au/occurrences/occurrences/facets?',
		          axios.get('https://api.ala.org.au/occurrences/occurrences/search?',
		          {params:queryParams,
		          paramsSerializer: {
		            indexes: null, // serialise the array value (facets)
		          }})
		        .then((response) => {
		          this.localFacets = response.data.facetResults;
		        })
	  		},
	  		clickFacet(facet){
	          this.localFocus = this.localFocus == facet.label ? null : facet.label;
	          apiState.setFilter({field: 'decade', value: facet.label, fieldLabel: 'decade', valueLabel:facet.label, fq:facet.fq})
	        },
	    	

	  	},

	  watch: {
      'apiState.query'(globalQuery){ // watching the global state
          if (this.apiState.filterState[this.field]){
            this.loadFacets(); // this field is involved, load local facets
          } else {
            if (this.localFacets){
               this.localFacets = null; // unset local facets
               console.log("clearing local facets for " + this.field)
            }
            this.localFocus = null; // remove 
          }
      },

      geoFilter: {
        handler() {
          
          if (this.apiState.filterState[this.field]){
            console.log("reloading facets on geo " + this.field)
            this.loadFacets();
          } 
        },
      deep: true
      }
  }
	}

	  

</script>

<style>
	.timelineWrapper{
		width: 100%;
		height:4rem;
		display: flex;
		margin:2rem auto;
	}

	.tile{
		width:5rem;
		font-size: 0.6rem;
		height:2rem;
		position:relative;
		border-left:1px solid white;
	}

	.tile .label{
		position:absolute;
		bottom:0;
		color:#9d9d9d;
	}

	.fill{
		background-color: var(--ala-ocean);
		width:100%;
		height:60%;
		
		position:absolute;
		cursor:pointer;
/*		z-index:;*/
	}

	.tile.focus .fill, .tile:hover .fill{
			background-color: var(--ala-orange);

	}

	.tile.focus .label{
		font-weight: bold;
		color:unset;
	}


</style>