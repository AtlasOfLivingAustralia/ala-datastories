<template>
	<div class="bubbleLayout" :style="{height: size+'px'}">
		<div class="bubble-wrapper" v-for="b in bubbleLayout" :key="b.data.lsid" :style="{transform:'translate('+(b.x - b.r)+'px,'+(b.y - b.r)+'px)'}" :class="{root: b.children}">
			<SpeciesBubble :bubble="b" :root="b.children ? true : false"></SpeciesBubble>
		</div>

		<div class="label-wrapper" v-for="b in bubbleLayout" :style="{transform:'translate('+(b.x - b.r)+'px,'+(b.y - b.r)+'px)', width:b.r*2+'px', height:b.r*2+'px'}" >
			<div class="text-wrapper" v-if="b.r > 20">
				<p v-if="!b.children">{{b.data.commonName ? b.data.commonName : b.data.name}}
				<span class="count">({{b.data.count}})</span></p>
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
			    // console.log("bubble layout " + this.speciesData.length)
				const numBubbles = this.bubbleCount;
				let bubbleData = {name:"No Species", children: this.speciesData.slice(0,numBubbles)}
				let rootData = d3.hierarchy(bubbleData);

				let bubbleTotal = d3.sum(bubbleData.children, c => c.count);

				const pack = d3.pack()
			      .size([this.size,this.size])
			      .padding(this.padding)
			      //.radius(d => 5 + Math.sqrt(d.value/bubbleTotal))

				 const root = pack(d3.hierarchy(bubbleData)
      				.sum(d => d.count)
      				.sort((a, b) => b.count - a.count));

				return root.descendants();
			}
		},
	}

</script>

<style>

	.bubbleLayout{
		position:relative;
	}

	.bubbleLayout .bubble-wrapper, .bubbleLayout .label-wrapper {
		position:absolute;
		transition: transform 0.5s;
	}

	.bubbleLayout .label-wrapper {
		pointer-events: none;
	}

	.bubbleLayout .bubble-wrapper.root{
		background-color: none;
	}

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

	}


	.text-wrapper p{
		margin:0rem;
		line-height: 1.05em;
	}

	.text-wrapper span.count{
		font-size: 80%;
		display: block;
		margin-top:0.25em;
	}



</style>