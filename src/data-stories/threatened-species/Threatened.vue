<script setup>
	import threatenedSpeciesData from '../../assets/data/threatenedSpecies.json'
	import HexMap from '../../components/HexMap.vue'
	import * as d3 from 'd3'
	import axios from 'axios'
	import Menu from '../../components/Menu.vue'
	import Footer from '../../components/Footer.vue'
</script>

<template>
	<Menu homePath="../.."/>
	<div class="datastory-outer">
  		<div class="datastory-wrapper">

		    <h1>Threatened Species</h1>

		    <p class="intro">We hear a lot about threats to biodiversity, and about the need for action and intervention in response. In our research this issue was one of the central concerns raised by users of the ALA. This story investigates how the threats to biodiversity are evidenced in the ALA, as well as what it can show about our responses.</p>


		    <section>

		    	<h3>Exploring Threatened Species</h3>
				<p>One of the key mechanisms used by Australian governments is the listing of threatened species in various categories - and we can find this information in the ALA.</p>

				<p>One of the first issues we discover is that the classification systems used by Federal, State and Territory governments are all different.</p>

				<p class="interactionTip">This table shows the numbers of listed species in each category across jurisdictions. Click on a cell to explore those species.</p>

				<table class="tsmatrix">
					<tr style="height:80px">
						<th></th>
						<th v-for="c in colourMap.keys()">
							<span class="angled-header">{{keyNames.get(c)}}</span>		
						</th>
					</tr>
					<tr v-for="s in tsSummary">
						<td><span class="state-label">{{s.state}}</span></td>
						<td v-for="c in colourMap.keys()" class="matrixcell" >
							<div class="matrixinner" @click="setTsFocus({state:s.state,code:c})" :class="{focus: tsFocus.state==s.state && tsFocus.code==c}" v-if="s[c]" :style="{background: colourMap.get(c), color: c=='EX' || c=='EW' ? 'white' : 'black'}">
									{{s[c]}}
							</div>
						</td>	
					</tr>
				</table>

				<h3 v-if="tsFocus.state">{{tsFocusSpecies.length}} species listed as {{keyNames.get(tsFocus.code)}} in {{tsFocus.state}}</h3>

				<div class="tsFocusWrapper">	
					<ul class="tsList">
						<li class="listEntry" v-for="s in tsFocusSpecies" @click="setFocusSpecies(s)" :class="{focus: focusSpecies && focusSpecies.name == s.name}">
							{{s.species}}
						</li>
					</ul>

					<div class="focusSpecies" v-if="focusSpecies">
						<h4>{{focusSpecies.commonName}}</h4>
						<h4><em>{{focusSpecies.name}}</em></h4>
						<img v-if="focusSpeciesImage" :src="'https://images.ala.org.au/image/proxyImageThumbnailLarge?imageId='+focusSpeciesImage"> 
						<p v-if="!focusSpeciesImage">(No Image)</p>
						<p>{{focusSpeciesSummary}}</p> 
						<p><a :href="'https://bie.ala.org.au/species/'+focusSpecies.lsid" target="_blank">More info</a>
						</p>
					</div>
				</div>

				

		    </section>

		    <section>
		    	<h3>Calling the Roll</h3>
		    	<p>Tables, lists and maps provide one way to explore and investigate threatened species; here's another one. What if we just showed the whole list, one at a time? It's a bit like calling the roll: a way to name and briefly recognise each one.</p>

		    	<p class="interactionTip">This is number {{rollIndex}} of {{tsdata.length}} species. At this rate, it will take you about 8 hours and 20 minutes to read the names of every conservation listed species.</p>

		    	<button @click="startTicker">Start</button>
		    	<button @click="stopTicker">Stop</button>

		    	<div class="rollcall">
					  <div class="inner">
					  <img v-if="rollSpeciesImage" class="rollImg" :src="'https://images.ala.org.au/image/proxyImageThumbnailLarge?imageId='+rollSpeciesImage">
					   <div v-if="!rollSpeciesImage" class="rollImg"><p>No Image</p></div>

					  <h1>{{rollSpecies.commonName ? rollSpecies.commonName : rollSpecies.name }}</h1>
					  <h3 style="margin-bottom:0.5em">
					  	<em>{{rollSpecies.commonName ? rollSpecies.name : "" }}</em>
					  </h3>
					  <p class="stateStatus" v-for="s in rollSpecies.statuses">
					   {{s.state}}: 
					   	<span class="status" :style="{'background-color': colourMap.get(s.status), color: s.status == 'EX' || s.status == 'EW' ? 'white' : 'black'}"> 
					   	{{keyNames.get(s.status)}}
					   	</span>
					   </p>
					</div>
				</div>

		    </section>

		    <section>
		    	<h3>De-Extinction?</h3>
				<p>Data held in the ALA also shows traces of recent interventions to support threatened species. This graph shows a timeline of observations since 1980. We can see big gains in Endangered and Critically Endangered species, but also a boom in Extinct species since 2019. Are we seeing de-extinction? Not quite, but we can see traces of increasing attention and new forms of intervention.</p>

		    	<select name="" v-model="eGraphCat" @change="getExtinctionData">
		    		<option value="Extinct">Extinct</option>
		    		<option value="Critically Endangered">Critically Endangered</option>
		    		<option value="Endangered">Endangered</option>
		    	</select>

		    	<svg viewBox = "0 0 800 300" v-if="extinctionGraphData" >
		    		<g>
		    			<rect v-for="(y,i) in extinctionGraphData" :x="eGraph.padding.left + i*eGraph.xSpacing" :width="eGraph.xSpacing-2" :height="eGraph.yScale(y.count)" :y="eGraph.baseline - eGraph.yScale(y.count)" fill="var(--ala-ocean-quarter)">
		    			</rect>
		    		</g>

		    		<g>
		    			<line :x1="eGraph.padding.left" :x2="eGraph.w - eGraph.padding.right" :y1="eGraph.baseline" :y2="eGraph.baseline" stroke="black" stroke-width="0.5"></line>
		    			<text class="yearTick" v-for="(y,i) in extinctionGraphData" :x="eGraph.padding.left + i*eGraph.xSpacing" :y="eGraph.baseline + 15" :class="{show: +y.label%5 == 0 }">
		    				{{y.label}}
		    			</text>
		    		</g>

		    		<g>
		    			<text class="tick" v-for="t in eGraph.yTicks" x="5" :y="eGraph.baseline - eGraph.yScale(t)">
		    				{{t.toLocaleString()}}
		    			</text>
		    		</g>
		    	</svg>

		    </section>

		    <section>
		    	
		    	<h3>Behind the Fences</h3>
				<p>Increasingly fenced reserves are being used to exclude introduced predators like foxes and cats, and enable vulnerable species to be reintroduced - especially mammals. These maps focus on three sites, showing how many threatened and even "extinct" species are recorded.</p>
				<p><ul>
					<li><a href="https://www.australianwildlife.org/where-we-work/scotia/" target="_blank" class="newtab">Scotia Sanctuary</a> is a 650 sq km reserve in western NSW, managed by the Australian Wildlife Conservancy. It was established in 1994.</li>
					<li><a href="https://www.nationalparks.nsw.gov.au/visit-a-park/parks/mallee-cliffs-national-park" target="_blank" class="newtab">Mallee Cliffs National Park</a> in south-western NSW includes a 9,570 hectare predator-free fenced area. It is managed under a partnership between NSW National Parks and the Austalian Wildlife Conservancy</li>
					<li><a href="https://www.australianwildlife.org/where-we-work/the-pilliga/" target="_blank" class="newtab">The Pilliga</a> in northern NSW is a 35,000 hectare reserve co-managed by NSW National Parks and the AWC.</li>
				</ul></p>

				Show: <select v-model.lazy="exMapFocusIndex" @change="getExMapData">
					<option v-for="i in [0,1,2]" :value="i">{{exMapLocations[i].name}}</option>
				</select>

				<div class="exMapWrapper"> 
				 <HexMap v-if="exMapFocus" :query="'countryConservation:*&lat='+exMapFocus.lat+'&lon='+ exMapFocus.lon+'&radius='+ exMapFocus.radius" :record-count="exMapData ? exMapData.totalRecords : null" :query-loaded="exMapLoaded" :obs="exMapData ? groupedExMapObs : []" :filterCenter="{lat: exMapFocus.lat, lng: exMapFocus.lon}" :filterRadius="exMapFocus.radius" :zoom="exMapFocus.mapZoom"  />
				</div>

				<div class="data-table-wrapper" v-if="exMapData">
			        <table>
			          <tr>
			            <th>Species</th>
			            <th>National Status</th>
			            <th>NSW Status</th>
			            <th>Observations</th>
			          </tr>

			          <tr v-for="s in mammalRanksStatus">
			            <td>
			              <a :href="`https://bie.ala.org.au/species/${s.lsid}`" target="_blank">{{s.commonName}}</a>
			            </td>
			            <td>
			            	<span class="status" :style="{background: colourMap.get(s.nationalStatus), color: s.nationalStatus=='EX' || s.nationalStatus=='EW' ? 'white' : 'black'}">{{s.nationalStatus}}</span>
			            </td>
			            <td>
			            	<span class="status" :style="{background: colourMap.get(s.nswStatus), color: s.nswStatus=='EX' || s.nswStatus=='EW' ? 'white' : 'black'}">{{s.nswStatus}}</span>
			            </td>
			            <td>{{s.count.toLocaleString()}}</td>
			          </tr>
			        </table>
			     </div>


		    </section>

		    <p></p>
		 </div>
	</div>

	<Footer />

</template>



<script>

	export default {

		name: 'Threatened',

		data () {
		    return {
		    	tsdata: threatenedSpeciesData,
		    	tsFocus:{},
		    	focusSpecies:null,
		    	focusSpeciesImage:null,
		    	focusSpeciesSummary:null,
		    	rollTicker:null,
		    	rollIndex:0,
		    	rollSpeciesImage:null,
		    	eGraphCat:"Endangered",
		    	extinctionGraphData:null,

		    	exMapLocations:[ 
		    		{name: "Scotia", value:{lat:-33.20,lon:141.166,radius:15, mapZoom:11} }, 
		    		{name: "Mallee Cliffs",value:{lat:-34.208,lon:142.535,radius:15, mapZoom:11}}, 
		    		{name: "Pilliga",value:{lat:-30.589,lon:149.24,radius:15, mapZoom:11}}],
		    	exMapFocus:{lat:-33.236,lon:141.166,radius:15, mapZoom:11},
		    	exMapFocusIndex:0,
		    	exMapData:null,
		    	exMapLoaded:false,

		    	listKeys: new Map([["dr649","ACT"],["dr656","Aus"],["dr650","NSW"],["dr655","VIC"],["dr653","SA"],["dr651","NT"],["dr2201","WA"],["dr652","QLD"],["dr654","TAS"]]),
		    	statusMap:new Map([["Critically Endangered","CR"],["Vulnerable","VU"],["Endangered","EN"],["Extinct in the wild","EW"],["Extinct","EX"],["Conservation Dependent","CD"],["Near Threatened","NT"],["Threatened","TH"],["Rare","RA"]]),
		    	keyNames: new Map([["NT","Near Threatened"], ["RA","Rare"], ["VU","Vulnerable"], ["EN","Endangered"],["P","Priority"], ["TH","Threatened"], ["CR","Critically Endangered"], ["CD","Conservation Dependent"], ["EW","Extinct in the Wild"], ["EX","Extinct"]]),
		    	colourMap: new Map([ ["NT","#E0FFA7"], ["RA","#E0FFA7"], ["P","#F2FF5C"], ["VU","#F2FF5C"], ["EN","#FFE897"], ["TH","#FFDD88"], ["CR","#FFC6A5"], ["CD","#FF9D93"], ["EW","#FF4E53"], ["EX","#000000"] ])

		    }
		  },

		computed:{
		  	tsSummary(){
		  		let summary = []
				for (const s of this.listKeys.values()){
				    const g = d3.group(this.tsdata, d => d[s])
				    var r = {state:s}
				    Array.from(this.colourMap.keys()).forEach(k => {if (g.get(k)) r[k] = g.get(k).length})
				    if (s == "Aus") summary.unshift(r); else summary.push(r)
				}
				return summary;
		  	},

		  	tsFocusSpecies(){
		  		if (!this.tsFocus.state) return [];
		  		return this.tsdata.filter(d => d[this.tsFocus.state] == this.tsFocus.code).map(l =>{
					let dName = l.commonName ? l.commonName : `${l.name}`;
					return {...l, species:dName};
				});
		  	},

		  	rollSpecies(){
		  		// console.log(this.tsdata[this.rollIndex])
		  		let s = this.tsdata[this.rollIndex];
		  		let spStates = Array.from(this.listKeys.values()).filter(st => s.hasOwnProperty(st))

		  		s.statuses = spStates.map(st => {return {state:st, status:s[st]} })
		  		this.getRollSpeciesImage(s);
		  		return s;
		  	},

		  	eGraph(){
		  		let e = {};
		  		e.h = 280;
		  		e.w = 800;
		  		e.baseline = 260;
		  		e.padding = {left:20, right: 20};
		  		e.xSpacing = (e.w - e.padding.left - e.padding.right) / (this.extinctionGraphData.length);
		  		let max = d3.max(this.extinctionGraphData.map(d => d.count))
		  		e.yScale = d3.scaleLinear().domain([0,max]).range([0,e.baseline])
		  		e.xTicks = d3.ticks(1980,2022,5)
		  		e.yTicks = d3.ticks(0,max,5)
		  		return e;
		  	},
		  	groupedExMapObs(){

	          // add computed speciesGroups to occurences and pass these in
	          // so we can have custom icons etc
	          let go = this.exMapData.occurrences.map(o => {
	            let sg;
	            if (o.speciesGroups.includes("Plants")) sg = "Plants";
	            else if (o.speciesGroups.includes("Fungi")) sg = "Fungi";
	            else if (o.speciesGroups.includes("Birds")) sg = "Birds";
	            else if (o.speciesGroups.includes("Mammals")) sg = "Mammals";
	            else if (o.speciesGroups.includes("Reptiles")) sg = "Reptiles";
	            else if (o.speciesGroups.includes("Fishes")) sg = "Fishes";
	            else if (o.speciesGroups.includes("Amphibians")) sg = "Amphibians";
	            else if (o.speciesGroups.includes("Fungi")) sg = "Fungi";
	            else if (o.speciesGroups.includes("Chromista")) sg = "Kelp";
	            else if (o.speciesGroups.includes("Molluscs") || o.speciesGroups.includes("Crustaceans") ) sg = "Molluscs";
	            else if (o.speciesGroups.includes("Arthropods") && !o.speciesGroups.includes("Crustaceans") ) sg = "Insects";
	            else if (o.speciesGroups.includes("Protozoa") || o.speciesGroups.includes("Bacteria")) sg = "Microbes";
	            else if (o.speciesGroups.includes("Animals")) sg = "Inverts"
	            o.speciesGroup = sg;
	            return o;
	          })
	          return go;
			},

			mammalRanksStatus(){
				let source = this.exMapData ? this.exMapData.facetResults[0].fieldResult : [];
				let mammals = source.map(s => {
					let bits = s.label.split('|');
					let m = {commonName: bits[2], lsid: bits[1], count: s.count}
					let tsmatch = this.tsdata.find(ts => ts.lsid == m.lsid);
					if (tsmatch) m.nationalStatus = tsmatch.Aus;
					if (tsmatch) m.nswStatus = tsmatch.NSW
					return m;
				})
				return mammals;
			}
		},

		methods:{

		  	setTsFocus(f){
		  		this.tsFocus = f;
		  	},

		  	setFocusSpecies(s){
		  		this.focusSpecies = s;
		  		this.getFocusSpeciesSummary(s)
		  		axios.get('https://api.ala.org.au/species/species/'+s.lsid)
		        .then((response) => {
		        	this.focusSpeciesImage = response.data.imageIdentifier
		        })
		  	},

		  	getFocusSpeciesSummary(s){
		  		axios.get(`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&origin=*&titles=${s.name}`)
		  		.then((response) =>{
		  			const k = Object.keys(response.data.query.pages)[0];
		  			this.focusSpeciesSummary = k == -1 ? "No Wikipedia Entry" : response.data.query.pages[k].extract
		  		})
		  	},

		  	getRollSpeciesImage(s){
		  		axios.get('https://api.ala.org.au/species/species/'+s.lsid)
		        .then((response) => {
		        	this.rollSpeciesImage = response.data.imageIdentifier
		        })
		  	},

		  	incrementTicker(){
		  		if (this.rollIndex == this.tsdata.length-1){
		  			clearInterval(this.rollTicker)
		  		} else {
		  			this.rollIndex++
		  		}
		  	},

		  	startTicker(){
		  		this.rollTicker = setInterval(this.incrementTicker,3000)
		  	},

		  	stopTicker(){
		  		clearInterval(this.rollTicker)
		  	},

		  	getExtinctionData(){
		  		let queryParams = { q:`(countryConservation:${this.eGraphCat}) OR (stateConservation:${this.eGraphCat}) AND year:[1980 TO 2022]`,  
                  spatiallyValid:true,
                  qualityProfile:"ALA",
                  sort:"eventDate", 
                  dir:"desc",
                  fsort:"index",
                  flimit:200,
                  taxonRank:"species",
                  facets: ["year"]
                }
		  		axios.get('https://biocache-ws.ala.org.au/ws/occurrence/facets?',{params:queryParams, paramsSerializer: { indexes: null }})
		  		.then((response) => {
		  			this.extinctionGraphData = response.data[0].fieldResult;
		  			//console.log(this.extinctionGraphData)
		  		})
		  	},

		  	getExMapData(){
		  		
		  		this.exMapLoaded = false;
		  		let newLocation = this.exMapLocations[this.exMapFocusIndex].value;
		  		
		  		//let queryParams = { q:'countryConservation:*',  
		  		let queryParams = { q:'class:Mammalia',
                  spatiallyValid:true,
                  qualityProfile:"ALA",
                  sort:"eventDate", 
                  dir:"desc",
                  pageSize:200,
                  lat: newLocation.lat,
                  lon: newLocation.lon,
                  radius: newLocation.radius,
                  flimit:10,
                  facets:["names_and_lsid"]
                }
                axios
		        .get('https://api.ala.org.au/occurrences/occurrences/search?',
		          {params:queryParams,
		          paramsSerializer: {indexes: null}})
		        .then((response) => {
		          this.exMapFocus = this.exMapLocations[this.exMapFocusIndex].value
		          this.exMapData = response.data;
		          console.log(response.data)
		          this.exMapLoaded = true;
		        })

		  	}

		},

		mounted(){
			// this.startTicker();
			this.getExtinctionData();
			// this.exMapFocus = this.exMapLocations[0].value;
			this.getExMapData();
		}


	}

</script>



<style lang="css" scoped>

	/* table */
	table.tsmatrix{
		width:100%;
		max-width:900px;
		border-collapse:collapse;
	/*	table-layout: fixed;*/
	}

	table.tsmatrix td{
		width:5%;
	}

	table.tsmatrix tr{
		vertical-align: bottom;
		border-bottom: 1px solid var(--ala-concrete);
	}

	.matrixcell{
		padding:0;
		min-width:20px;
	}

	.matrixinner{
		cursor:pointer; 
		padding:0.25rem; 
		text-align:center; 
		height:20px; 
/*		border:2px solid transparent;*/
	}

	.matrixinner:hover, .matrixinner.focus{
/*		border:2px solid black;*/
/*		font-weight: bold;*/
		text-decoration: underline;
	}

	.angled-header{
		font-size:80%;
		font-weight:400;
		text-align: left;
		position:absolute; 
		transform:translate(0px) rotate(-30deg) translate(10px,-15px); 
		width:160px; 
		transform-origin:0px 100%;
		color:var(--ala-darkgrey);
	}

	.state-label{
/*		font-weight: bold;*/
	}

	.tsFocusWrapper{
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
		align-items: flex-start;
	}

	ul.tsList{
		list-style: none;
		text-indent: 0;
		margin:0 1rem 1rem 0;
		padding:0;
		width:360px;
		max-height:320px;
		overflow-y: scroll;
	}

	ul.tsList li{
		display: block;
		cursor: pointer;
		font-size:90%;
		padding:0.1rem;
	}

	ul.tsList li:hover{
		background-color: var(--ala-concrete);

	}

		ul.tsList li.focus{
		background-color: var(--ala-light-orange);

	}

	.focusSpecies{
/*		display: inline-block;*/
		width: 40%;
		min-width: 360px;
		background-color: var(--ala-concrete);
		padding:0.5rem 1rem;

	}

	.focusSpecies h4{
		font-weight: 500;
		margin:0.25rem 0 0;
		font-size: 110%;
	}

	.focusSpecies p{
		font-size:90%;
	}

	.focusSpecies img{
		width:320px;
		height:240px;
		object-fit: contain ;
		background-color: white;
		margin-top:0.5rem;
		padding:0.5rem;
	}


/* roll call */

.rollcall{
	width:100%; 
	max-width:400px;
	height:500px;
	border:15px solid black;
	box-sizing: border-box;
	padding:20px;
	text-align:center;
/*	font-family:sans-serif;*/
	display:flex;
	align-items:center;
	justify-content:center;
}

.rollImg{
	width:180px;
	height:180px;
	object-fit:contain;
	background:black;
	border: 6px solid black;
}

div.rollImg{
	display:inline-block;
}

.rollImg p{
	color:white;
	padding-top:60px;
}



p.stateStatus{
  font-size:80%;
  margin: 0.75em 0;
  padding:0;
}
.status{
  padding:3px;
}
.rollcall .inner{
	display:inline-block;
	vertical-align:middle;
}

button{
	margin: 0.5rem 0.25rem;
}

svg .yearTick{
/*	display: none;*/
	font-size:10px;
	opacity:0;
}

svg .tick{
	font-size:10px;
}

.yearTick.show{
	opacity:1;
}


/* reserves map */

.exMapWrapper{
	height:480px;
	width:100%;
	position: relative;
	margin: 0.5rem 0;
}


  .data-table-wrapper{
    max-height:350px;
    position:relative;
/*    overflow-y: scroll;*/
  }

  .data-table-wrapper table{
    font-size:80%;
    width:100%;
  }

  .data-table-wrapper table th{
    position:sticky;
    top:0;
    background: white;
    text-align: left;
    border-bottom: 1px solid #212121;
    z-index:1;
  }

  .data-table-wrapper table td{
    position:relative;
  }

  .data-table-bar{
    height:95%;
    background-color: var(--ala-ocean-quarter); 
    position:absolute;

    z-index:-1;
  }

  .data-table-wrapper table td .status{
  	padding:0.1rem 0.5rem;
  }

  @media only screen and (max-width: 600px) {

  	svg .yearTick{
/*	display: none;*/
	font-size:20px;
	transform:translate(0px,5px);
	}

	svg .tick{
		font-size:20px;
	}

  }




</style>