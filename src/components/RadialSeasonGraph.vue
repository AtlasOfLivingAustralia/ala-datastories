<template>

	<svg viewBox="0 0 500 500" >
		<g transform="translate(250,250)">
			<g class="arcGroup" v-for="(p,i) in arcPaths"  >
				<title>{{months[i].label}}: {{months[i].count}} occurrences</title>
				<path :d="p" :fill="arcFills[i]" ></path>
			</g>

			<g v-for="(m,i) in months" :transform="`rotate(${i*30 - 75}) translate(${innerRadius-10},0)`">
				<text class="monthLabel" transform="rotate(90)" text-anchor="middle">{{m.label.substring(0,3)}}</text>
			</g>

			<g>
				<text class="title" text-anchor="middle">
					{{queryTitle}}
				</text>
				<text class="subtitle" text-anchor="middle" dy="10">
					occurrences by month
				</text>
			</g>
		</g>
	</svg>

</template>

<script>
  	import axios from 'axios' 
  	import * as d3 from 'd3'
  	

	export default {

		name: 'RadialGraph',
		props: ["query","queryTitle"],
		data () {
		    return {
		    	months:[],
		    	innerRadius:100,
		    	outerRadius:240,
		    	graphWidth: 500
		    }
		},

		computed:{
			scaleY(){
				return d3.scaleRadial()
			      .domain([0, d3.max(this.months.map(d => d.count))])
			      .range([this.innerRadius, this.outerRadius]);
			},
			
			// radial band scale
			scaleX(){
				return d3.scaleBand()
		    	.domain(this.months.map(d => d.label))
		    	.range([0, 2 * Math.PI])
		     	.align(0);
			},

			arcFills(){
				let col = d3.scaleSequential(d3.interpolateOrRd).domain([0, d3.max(this.months.map(d => d.count))])
				return this.months.map(m => col(m.count))
			},

			arcPaths(){
				return this.months.map(m =>{
					let arc = d3.arc()
				    .innerRadius(d => this.scaleY(0))
				    .outerRadius(d => this.scaleY(d.count))
				    .startAngle((d) => this.scaleX(d.label))
				    .endAngle((d) => this.scaleX(d.label) + this.scaleX.bandwidth())
				    .padAngle(1.5 / this.innerRadius)
				    .padRadius(this.innerRadius);
				    return arc(m);
				})
			}
		},


	  	methods: {

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
				  	this.months = months;
				})
			}
		},

		mounted(){
			this.getMonthFacets(this.query)
		},

		watch:{
			query(){
				this.getMonthFacets(this.query)
			}
		}
	  }

</script>

<style lang="css" scoped>

	svg{
		font-family: 'Roboto', sans-serif;
		font-weight: 400;
	}

	.monthLabel{
		font-size:0.6rem;
	}

	.title{
		font-weight: 500;
	}

	.subtitle{
		font-size:80%;
		font-weight:400;
	}

	.arcGroup{
		cursor:pointer;
	}
</style>