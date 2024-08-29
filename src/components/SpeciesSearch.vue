<script setup>
	  import { apiState } from '../apiState.js'
	  import axios from 'axios'
	  import debounce from 'lodash.debounce'
</script>

<template>
	<div class="speciesSearch">
		<h4>Search for Species</h4>
		<div class="searchInterface">

			<input class="searchInput" type="text" v-model="searchInput">
			<ul class="searchResults">
				<li v-for="s in searchResults" @click="apiState.setFilter({field:'lsid', fieldLabel:'Species',value: s.guid, valueLabel: s.commonName, fq:'lsid:'+s.guid})">
					<img class="speciesFocus" src="../assets/img/focus-species.svg">
					{{s.commonName}}
					(<em>{{s.name}}</em>)
				</li>
			</ul>	
		</div>
	</div>

</template>

<script>
export default {

  name: 'speciesSearch',

  data () {
    return {
    	apiState,
    	searchInput:"",
    	searchResults:[]
    }
  },

  created() {
    this.debouncedWatch = debounce((newValue, oldValue) => {
      //console.log('New value:', newValue);
    	this.getSearchResults();
    }, 500);
  },

  methods: {
  	getSearchResults(){
  		if (this.searchInput == ""){
  			this.searchResults = [];
  			return;
  		} 
  		if (this.searchInput.length < 4) return;
  		let qparams = {
  			q: this.searchInput,
  			limit:20,
  			indexType:"TAXON"
  		}
  		console.log("searching")
  		axios.get('https://api.ala.org.au/species/search/auto?',{params: qparams})
  		.then((response) =>{
  			let results = response.data.autoCompleteList;
  			results = results.filter(r => r.rankString == "species"); // only species
  			let uniqueSpecies = [...new Set( results.map(r => r.guid))]; // unique guids
  			let uniqueResults = uniqueSpecies.map(u => results.find(r => r.guid == u))
  			this.searchResults = uniqueResults
  		})
  	}
  },

   watch: {
    searchInput(...args) {
      this.debouncedWatch(...args);
    },
  },


}


</script>

<style lang="css" scoped>

	.speciesSearch{
		margin: 1rem auto 5rem;
		width:50%;
		min-width:360px;
		max-width:900px;
		height:240px;

	}
	.speciesSearch h4{
		text-align: center;
	}


	input.searchInput{
		font-size:110%;
		width:100%;
	}

	.searchPrompt{
		font-weight: 300;
		font-size: 110%;
/*		margin-right:0.5rem;*/
		padding-top:0.15rem;
		display: block;
		margin:1.0rem auto 0.5rem;
		text-align: center;
	}

	.searchInterface{
		position: relative;
		text-align: center;
	}

	ul.searchResults{
		list-style: none;
		margin:0.25rem 0;
		padding:0;
		text-align: left;
		position:absolute;
		width:100%;
	}

	ul.searchResults li{
		font-size: 90%;
		padding:0.25rem 0.25rem;
		display: block;
		cursor: pointer;
		margin:0;
	}

	ul.searchResults li:hover{
		background-color: var(--ala-concrete);
		color:var(--ala-orange);
	}

	img.speciesFocus{
		width:13px;
		position:relative;
		top:1px;
		left:1px;
		margin-right:3px;
	}


</style>