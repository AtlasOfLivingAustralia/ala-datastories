<script setup>
	import * as d3 from 'd3'
	import axios from 'axios'
	import RadialGraph from '../../components/RadialSeasonGraph.vue'
	import HexDensityMap from '../../components/HexDensityMap.vue'
	import swiftData from '../../assets/data/swift-filtered.json'
	import caladeniaData from '../../assets/data/caladenia-filtered.json'
	import Menu from '../../components/Menu.vue'
	import Footer from '../../components/Footer.vue'

</script>

<template>
	<Menu homePath="../../" />
	<div class="datastory-outer">
  		<div class="datastory-wrapper">
  			
  			    <h1>Seasonal Change</h1>

		    	<p class="intro">The living world is constantly changing, and the ALA's data can reveal some of these changes. This story investigates the annual cycle of seasonal change, and how this cycle can show us more about the Atlas and its data. 
		    	</p>

		    	<section>

			    	<h3>Visualising Seasonal Change</h3>	

			    	<p>Some flowers only appear at a certain time of year. Here's a graph of occurrences of a genus of native orchids, the Caladenia. We can see that they flower in Spring - but is this column chart the best way to show this cycle?</p>

			    	<h4>Caladenia Orchids, occurrences by month</h4>

					<svg viewBox = "0 0 800 290" v-if="caladeniaMonths" class="colGraph">
						<g>
							<rect v-for="(y,i) in caladeniaMonths" :x="bGraph.padding.left + i*bGraph.xSpacing" :width="bGraph.xSpacing-2" :height="bGraph.yScale(y.count)" :y="bGraph.baseline - bGraph.yScale(y.count)" fill="var(--ala-ocean-quarter)">
							</rect>
						</g>

						<g>
							<line :x1="bGraph.padding.left" :x2="bGraph.w - bGraph.padding.right" :y1="bGraph.baseline" :y2="bGraph.baseline" stroke="black" stroke-width="0.5"></line>
							<text class="tick month" v-for="(y,i) in caladeniaMonths" :x="bGraph.padding.left + (i+0.5)*bGraph.xSpacing" :y="bGraph.baseline + 15" :class="{show: +y.label%5 == 0 }">
								{{y.label.substring(0,3)}}
							</text>
						</g>

						<g>
							<text class="tick" v-for="t in bGraph.yTicks" x="5" :y="bGraph.baseline - bGraph.yScale(t)">
								{{t.toLocaleString()}}
							</text>
						</g>
					</svg>

					<p>The seasons form a cycle, caused by the Earth's orbit of the Sun. So how about showing the year as a circular graph?</p>


					<div class="radial-figure-layout">
						<RadialGraph class="staticRadial" query="genus:Caladenia" query-title="Caladenia Orchids"/>

						<figure>
							<img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Orchid_%27White_Fingers%27_%28Caladenia_catenata%29_-_Flickr_-_Tatters_%E2%9D%80.jpg">
							<figcaption>
								Caladenia catenata, by Tatters ❀ CC BY-SA 2.0
							</figcaption>	
						</figure>
					</div>
					
					<p>Here's the same data shown on a radial graph. We're also using colour to show the number of observations. Hover over a section of the graph to see the number of observations per month.</p>

					<p>We can explore some different species to observe different patterns of seasonality. Some species, like magpies, don't show much variation at all</p>

					<div class="radial-figure-layout">
						<RadialGraph class="staticRadial" query="Cracticus tibicen" query-title="Magpies"/>

						<figure>
							<img src="https://upload.wikimedia.org/wikipedia/commons/1/10/Cracticus_tibicen_hypoleuca_male_domain.jpg">
							<figcaption>
								JJ Harrison (https://www.jjharrison.com.au/), CC BY-SA 3.0
							</figcaption>	
						</figure>
					</div>

					<p>Some animals only appear for a few months each year, as part of an annual life cycle. The Golden Sun Moth, an endangered moth from the Monaro grasslands, appears only for a couple of months in late spring and early summer.</p>


					<div class="radial-figure-layout">
						<RadialGraph class="staticRadial" query="Synemon plana" query-title="Golden Sun Moth"/>

						<figure>
							<img src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Synemon_plana_Westwood_1877.png">
							<figcaption>
								Synemon plana, John O. Westwood 1877
							</figcaption>	
						</figure>
					</div>



					<p>Exploring different species reveals more reasons for seasonal change, relating both to the habits and behaviour of plants and animals, and the attention of human observers. Select from the list below to investigate:</p>

					<ul>
						<li>Reptiles like the <span>Eastern Brown Snake</span> or <span>Blue-tongued Lizard</span> are more active in warmer months, so they are observed more frequently</li>

						<li>Some plants, like the <span>Purple Coral Pea</span>(Hardenbergia) or the <span>Golden Wattle</span> also become more noticeable at certain times, often when they flower</li>

						<li>Migratory species like the <span>Eastern Curlew</span> are only present in Australia for a few months of the year</li>

						<li>Notice that many species show a bump in frequency in January - this is likely an artefact in the data caused by some dates defaulting to 1st January.</li>
					</ul>

					<select v-model="pickSpeciesIdx" @change="setPickSpecies">
						<!-- <option disabled value="">Select a species</option> -->
						<option v-for="(p,i) in pickSeasonalOptions" :value="i">{{p.name}}</option>
					</select>
					<div class="radial-figure-layout">
							<RadialGraph v-if="pickSpecies" class="staticRadial" :query="pickSpecies.sci" :query-title="pickSpecies.common"/>

							<figure v-if="pickSpecies">
								<img :src="pickSpecies.img">
								<figcaption>
									{{pickSpecies.caption}}
								</figcaption>	
							</figure>
					</div>
				</section>

				<section>
					<h3>Mapping Seasonal Change</h3>

					<p>Seasonal change also occurs across space. Swift Parrots are endangered migratory birds that spend summer in cool southern forests, but migrate north during winter.</p>

					<p class="interactionTip">Drag the slider or animate to see this change on the map</p>

					<p>Week {{weekFilterInput}} of Year</p>
					<p> <input class="swiftSlider" type="range" min="1" max="52" width="200px" v-model="weekFilterInput">
						Animate: <button @click="startWeekTicker">Start</button> <button @click="stopWeekTicker">Stop</button>
					</p>

					<HexDensityMap class="swiftMap" v-bind:width="400" v-bind:height="400" :obsData="swiftParrotDays" v-bind:binScale=1 :projection="d3.geoMercator().center([ 137, -29.5 ]).translate([45,65]).scale(1000)" v-bind:weekFilter="+weekFilterInput"></HexDensityMap>



					
					<p>This kind of view can also show us differences within groups of living things. Orchids can't fly, but we can still see seasonal change in this map of Caladenias. Different species flower earlier or later in the year, in different climates: notice how the observations in late spring come from southern and alpine regions?
					</p>


					<p>Week {{caladeniaFilterInput}} of Year</p>
					<p> <input class="swiftSlider" type="range" min="1" max="52" width="200px" v-model="caladeniaFilterInput">
						Animate: <button @click="startCaladeniaTicker">Start</button> <button @click="stopCaladeniaTicker">Stop</button>
					</p>


					<HexDensityMap class="swiftMap" v-bind:width="500" v-bind:height="400" :obsData="caladeniaDays" v-bind:binScale=2 :projection="d3.geoMercator().center([ 134, -27.5 ]).translate([250,200]).scale(575)" v-bind:weekFilter="+caladeniaFilterInput"></HexDensityMap>
				</section>

			</div>
		</div>
	
	<Footer />

</template>




<script>
export default {

  	name: 'Seasonal',

	data () {
	    return {
	    	caladeniaMonths:[],
	    	pickSeasonalOptions:[
			  {name: "Eastern Brown Snake",value: {common:"Eastern Brown Snake",sci: "Pseudonaja textilis",img:"https://upload.wikimedia.org/wikipedia/commons/d/de/Eastern_Brown_Snake_-_Kempsey_NSW.jpg",caption:"Poyt448 Peter Woodard"}}, 
			  {name: "Blue-tongued lizard",value: {common:"Blue-tongued lizard",sci:"Tiliqua scincoides",img:"https://upload.wikimedia.org/wikipedia/commons/e/e7/Tiliqua_scincoides_scincoides.jpg",caption:"JJ Harrison (https://www.jjharrison.com.au/), CC BY-SA 3.0"}},
			  {name: "Eastern Curlew",value: {common:"Eastern Curlew", sci:"Numenius madagascariensis",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Far_Eastern_Curlew_-_Lake_Wollumboola.jpg/512px-Far_Eastern_Curlew_-_Lake_Wollumboola.jpg", caption: "JJ Harrison, CC BY-SA 3.0" }}, 
			  {name: "Echidna",value: {common: "Echidna" , sci:"Tachyglossus aculeatus",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Echidna%2C_Mulligans_Flat_Nature_Reserve%2C_ACT.jpg/512px-Echidna%2C_Mulligans_Flat_Nature_Reserve%2C_ACT.jpg",caption:"Wildlifecartoons, CC BY-SA 4.0"}},
			  {name: "Golden Wattle",value: {common:"Golden Wattle",sci:"Acacia pycnantha",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Acacia_pycnantha_kz02.jpg/512px-Acacia_pycnantha_kz02.jpg",caption:"Krzysztof Ziarnek, Kenraiz, CC BY-SA 4.0"}},
			  {name: "Purple coral pea",value: {common:"Purple coral pea",sci:"Hardenbergia violacea",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Hardenbergia_violacea_kz04.jpg/512px-Hardenbergia_violacea_kz04.jpg",caption:"Krzysztof Ziarnek, Kenraiz, CC BY-SA 4.0"}}],
	    	pickSpeciesIdx: 0,
	    	pickSpecies:null,
	    	swiftParrotObs: swiftData,
	    	swiftProj: d3.geoMercator().center([ 135, -29.5 ]).translate([50,70]).scale(1000),
	    	weekFilterInput:1, 
	    	weekTicker:null,
	    	caladeniaFilterInput:1,
	    	caladeniaTicker:null,
	    	caladeniaObs: caladeniaData
	    }
	},

  	methods:{
		getMonthFacets(query){
			const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		  	
		  	var q = "https://biocache-ws.ala.org.au/ws/occurrence/facets?q="+query+"&facets=month&qualityProfile=ALA&spatiallyValid=true&fsort=index"
		 
			axios.get(q).then((response) =>{
			  	const months = response.data[0].fieldResult ? response.data[0].fieldResult : []
			  	monthNames.forEach((m,i) => {
				    if (!months.some(o => o.label == m)){
				      var missingMonth = {label:m,count:0}
				      months.splice(i,0,missingMonth); // add a missing month
				    } 
			  	})
			  	console.log(months)
			  	this.caladeniaMonths = months;
			})
		},

		setPickSpecies(){
			this.pickSpecies = this.pickSeasonalOptions[this.pickSpeciesIdx].value
			console.log(this.pickSpeciesIdx)
		},

		incrementWeekTicker(){
		  	if (this.weekFilterInput == 52){
		  		this.weekFilterInput = 1;
		  	} else {
		  		this.weekFilterInput++
		  	}
		},

		startWeekTicker(){
			if (this.weekTicker) return;
		  	this.weekTicker = setInterval(this.incrementWeekTicker,250)
		 },

		stopWeekTicker(){
		  	clearInterval(this.weekTicker)
		},

		incrementCaladeniaTicker(){
		  	if (this.caladeniaFilterInput == 52){
		  		this.caladeniaFilterInput = 1;
		  	} else {
		  		this.caladeniaFilterInput++
		  	}
		},

		startCaladeniaTicker(){
			if (this.caladeniaTicker) return;
		  	this.caladeniaTicker = setInterval(this.incrementCaladeniaTicker,250)
		 },

		stopCaladeniaTicker(){
		  	clearInterval(this.caladeniaTicker)
		},
  	},

  computed: {

  	bGraph(){
  		let e = {};
  		// e.h = 240;
  		e.w = 800;
  		e.baseline = 270;
  		e.padding = {left:20, right: 20,top:40};
  		e.xSpacing = (e.w - e.padding.left - e.padding.right) / (this.caladeniaMonths.length);
  		let max = d3.max(this.caladeniaMonths.map(d => d.count))
  		e.yScale = d3.scaleLinear().domain([0,max]).range([0,e.baseline-e.padding.top])
  		e.xTicks = this.caladeniaMonths.map(m => m.label)
  		e.yTicks = d3.ticks(0,max,5)
  		return e;
  	},

  	swiftParrotDays(){
  		return this.swiftParrotObs
				.filter(s => s.eventDate)
				.map(s => {
			  let d = new Date(s.eventDate)
			  let doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
			  s.doy = doy
			  return s;
			})
  	},


  	caladeniaDays(){
  		return this.caladeniaObs
				.filter(s => s.eventDate)
				.map(s => {
			  let d = new Date(s.eventDate)
			  let doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
			  s.doy = doy
			  return s;
			})
  	}


  },

  mounted(){
  	this.getMonthFacets("genus:Caladenia")
  	console.log(this.caladeniaMonths)
  	this.pickSpecies = this.pickSeasonalOptions[0].value;
  }
}
</script>



<style lang="css" scoped>

	svg.colGraph{
		width:100%;
		max-width:800px;
	}

	svg text.title{
		font-weight: bold;
	}



	svg .tick{
		font-size:11px;
	}

	svg .month.tick{
		text-anchor: middle;
	}

	.staticRadial{
/*		width:50%;*/
		min-width:320px;
/*		height:420px;*/
		flex:2;
	}


	.radial-figure-layout{
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		max-width:900px;
		margin:2rem 0;
	}

	.radial-figure-layout figure{
		width:30%;
		height:320px;
		min-width: 320px;
/*		max-height:320px;*/
		display: block;
		background-color: var(--ala-concrete);
		padding:1rem;
		margin:0;
		text-align: center;
		flex:1;
	}

	.radial-figure-layout figure img{
/*		width:100%;*/
		max-width:90%;
		height:90%;
		padding:0.5rem;
		box-sizing: border-box;
		object-fit: contain;
		background-color: white;
/*		max-height:320px;*/

	}

	.radial-figure-layout figure figcaption{
		font-size: 0.8rem;
		margin-top:0.25rem;
	}

	.swiftMap{
		max-width:800px;
		width:100%;
	}

	input.swiftSlider{
		width:240px;
		margin-right:2rem;
	}

	  @media only screen and (max-width: 600px) {

  	svg .tick.month{
		font-size:20px;
		transform:translate(0px,5px);
	}

	svg .tick{
		font-size:20px;
	}

  }


</style>