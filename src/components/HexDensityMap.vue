

<template>
	<svg :viewBox="`0 0 ${width} ${height}`">


		<g>
			<path :d="geoPath" fill="#fafafa" stroke="#eee" stroke-width="0.5px"></path>
		</g>
		
		<g>
			<path v-for="(b,i) in filteredBins" :transform="`translate(${b.x},${b.y})`" :d="hex()" :fill="binFills[i]"></path>
		</g>

		 <g transform="translate(5,5)">
			<g v-for="(x,i) in [0,1,2,5,10,15,20,25,30,40,50,60,70,80,90]" :transform="`translate(${tickScale(x*binScale)},0)`">
			<rect :fill="colorScale(x*binScale)" width=15 height=10></rect>
			
			<!-- <rect :fill="colorScale(i*10*binScale)" width=15 height=10></rect> -->
			</g>
			<g v-for="t in ticks">
				<text class="tick" dy="18" :dx="tickScale(t)" text-anchor="middle">{{t}}</text>
				
				<!-- <text class="tick" dy="18" :dx="1.5*(t)" text-anchor="middle">{{t*binScale}}</text> -->
			</g>

			
		</g>


	</svg>

	<!-- <p v-for="(b,i) in hexBins">{{i}}</p> -->
</template>



<script>
	import * as d3 from 'd3'
	import * as d3hexbin from "d3-hexbin";
	import states from "../assets/data/aus-states.json"
	const hexbin = d3hexbin

	export default {

	  name: 'HexDensityMap',
	  props: {
	  	width: Number,
	  	height: Number,
	  	obsData: Array,
	  	projection: Function,
	  	weekFilter: Number,
	  	binScale:Number
	  },
	  

	  data () {
	    return {
	    	binRadius:4,
	    	ausMap: states
	    }
	  },

	  computed:{
	 
	  	hexBins(){
	  		const h = hexbin.hexbin()
		      .extent([[0, 0], [this.width, this.height]])
		      .radius(this.binRadius)
		      .x(d => d.xy[0])
		      .y(d => d.xy[1]);
		    const projData = this.obsData.map(o => ({xy: this.projection([o.decimalLongitude,o.decimalLatitude]), day:o.doy }))
		    return h(projData);
	  	},

	  	filteredBins(){
	  		const h = hexbin.hexbin()
		      .extent([[0, 0], [this.width, this.height]])
		      .radius(this.binRadius)
		      .x(d => d.xy[0])
		      .y(d => d.xy[1]);
	  		const projData = this.filteredData.map(o => ({xy: this.projection([o.decimalLongitude,o.decimalLatitude]), day:o.doy }))
	  		// console.log(projData)
		    return h(projData);

	  	},

	  	filteredData(){
	  		if (!this.weekFilter) return this.obsData;
	  		let f = this.obsData.filter(o => (o.doy > +this.weekFilter*7) && (o.doy < (+this.weekFilter+1)*7))
	  		// let f = this.obsData.filter(o => (o.doy ==this.weekFilter))
	  		// console.log(f.length)
	  		return f
	  	},

	  	binFills(){
	  		let fills = this.filteredBins.map(b => this.colorScale(b.length))
	  		return fills
	  	},

	  	geoPath(){
	  		let pathGenerator = d3.geoPath().projection(this.projection)
	  		let p = pathGenerator(this.ausMap)
	  		// console.log(p)
	  		return p
	  	},

	  	ticks(){
	  		// return d3.range(0,100*this.binScale);
	  		return d3.ticks(0,100*this.binScale,6);
	  	},

	  	tickScale(){
	  		return d3.scaleSqrt([0, 100*this.binScale],[0,150])
	  	}
	  },

	  methods:{

	  	hex(){
	  		return hexbin.hexbin().hexagon(this.binRadius)
	  	},

	  	colorScale(value){
	  		let col = d3.scaleSequentialSqrt(d3.interpolateOrRd)
	  		// let col = d3.scaleSequential(d3.interpolateOrRd)
	  		// .domain([0, d3.max(this.hexBins.map(d => d.length))]);
	  		.domain([0, 100*this.binScale]);
	  		return col(value)
	  	}
	  }

	  
	}



</script>



<style lang="css" scoped>
.tick{
	font-size:8px;
}

</style>