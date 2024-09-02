<template>
	<div class="bubbleLayout" :style="{height: size+'px'}">
		<div class="bubble-bg">
			<p class="got-none" v-if="speciesData.length == 0">No Species</p>
		</div>
		<div class="bubble-wrapper" v-for="b in bubbleLayout" :key="b.data.lsid" :style="{transform:'translate('+(b.x - b.r)+'px,'+(b.y - b.r)+'px)'}" :class="{root: b.children}">
			<SpeciesBubble :bubble="b" :root="b.children ? true : false"></SpeciesBubble>
		</div>

		<div class="label-wrapper" v-for="b in bubbleLayout" :style="{transform:'translate('+(b.x - b.r)+'px,'+(b.y - b.r)+'px)', width:b.r*2+'px', height:b.r*2+'px'}" >
			<div class="text-wrapper" v-if="b.r > 20">
				<p v-if="!b.children && b.data.commonName">{{b.data.commonName}}
				<span class="count">({{formatBinCount(b.data.count)}})</span></p>
				<p v-if="!b.children && !b.data.commonName"><em>{{b.data.name}}</em>
				<span class="count">({{formatBinCount(b.data.count)}})</span></p>
			</div>
		</div>


	</div>
</template>

<script>

	import SpeciesBubble from '../components/SpeciesBubble.vue';
	import * as d3 from 'd3'

	export default{

		components: {
	      SpeciesBubble
	    },

		props: ['speciesData','bubbleCount','size'],

		data(){
			return{
				 padding: 8
			}
		},

		computed: {

			bubbleLayout(){
				const numBubbles = this.bubbleCount;
				if (this.speciesData.length == 0){ // no species data, no layout
					return;
				}
				let bubbleData = {name:"No Species", children: this.speciesData.slice(0,numBubbles)}
				let rootData = d3.hierarchy(bubbleData);

				let bubbleTotal = d3.sum(bubbleData.children, c => c.count);

				const pack = d3.pack()
			      .size([this.size,this.size])
			      .padding(this.padding)

				 const root = pack(d3.hierarchy(bubbleData)
      				.sum(d => d.count)
      				.sort((a, b) => b.count - a.count));

				return root.descendants();
			}
		},

		methods:{
			formatBinCount(count){
	            if (count < 1000) return count;
	            if (count >= 1000 && count < 10000) return (count/1000).toFixed(1)+"k";
	            if (count >= 10000 && count < 1000000) return Math.floor(count/1000)+"k";
	            return (count/1000000).toFixed(1)+ "M";
	      	}
		}
	}

</script>

<style>

	.bubbleLayout{
		position:relative;
	}

	.bubbleLayout .bubble-bg{
		width:100%;
		height:100%;
		background-color: var(--ala-lightgrey);
		border-radius: 50%;
		position:absolute;
	}
	.got-none{
		text-align: center;
		position:relative;
		top:45%;
	}


	.bubbleLayout .bubble-wrapper, .bubbleLayout .label-wrapper {
		position:absolute;
		transition: transform 0.5s;
	}

	.bubbleLayout .label-wrapper {
		pointer-events: none;
	}

/*	.bubbleLayout .bubble-wrapper.root{
		background-color: none;
	}*/

	.text-wrapper{
		font-size:75%;
		width:80%;
		min-width:72px;
		text-align:center;
		bottom:20%;
		left:50%;
		transform:translateX(-50%);
		margin:0;
		padding:0;
		text-shadow: 1px 1px 3px black, -1px -1px 3px black;
		color:white;
		position:absolute;
		z-index:1;
		hyphens:auto;

	}


	.text-wrapper p{
		margin:0rem;
		line-height: 1.05em;
		hyphens:auto;
	}

	.text-wrapper span.count{
		font-size: 80%;
		display: block;
		margin-top:0.25em;
	}



</style>