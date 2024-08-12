<template>
	<!-- <a :href="'https://bie-ws.ala.org.au/species/'+bubble.data.lsid" target="_blank" class="bubble-link"> -->
		<div class="bubble" :style="{width:bubble.r*2+'px', height:bubble.r*2+'px'}"
			:class="{small: bubble.r < 25, focus: apiState.getFilterValue('lsid') == bubble.data.lsid }" 
			:title="bubble.r < 25 ? displayName : ''"
			@click="apiState.setFilter({field:'lsid', fieldLabel:'Species',value: bubble.data.lsid, valueLabel: displayName, fq:'lsid:'+bubble.data.lsid})">

			<img :src="imageURL" v-if="imageLoaded">

			<div class="status" :if="conservationStatus" :class="formatStatus(conservationStatus)" :title="conservationStatus">{{formatStatus(conservationStatus)}}</div>
		</div>
	<!-- </a> -->

</template>

<script type="text/javascript">
		import axios from 'axios'
		import { apiState } from '../apiState.js'
		export default {

			props:['bubble','root','focusSpecies'],

			data(){
				return {
					imageURL:null,
					imageLoaded:false,
					apiState,
					conservationStatus:""
				}
			},

			mounted(){
				this.loadSpeciesImage();
			},

			computed:{
				displayName(){
					return this.bubble.data.commonName ? this.bubble.data.commonName : this.bubble.data.name
				}

			},

			methods:{

				async loadSpeciesImage(){
					this.imageLoaded = false;
					if (!this.bubble.data.lsid) return;

					let response = await fetch('https://bie-ws.ala.org.au/ws/species/'+ this.bubble.data.lsid)
					let data = await response.json();
					// console.log(data);
					let im;
					if ( data.imageIdentifier != null){
						// console.log("loaded " + data.imageIdentifier);
						im = "https://images.ala.org.au/image/proxyImageThumbnail?imageId="+data.imageIdentifier
						this.imageLoaded = true;
					} else {
						im = null
					}
					// set species status
					if (data.conservationStatuses.AUS) this.conservationStatus = data.conservationStatuses.AUS.status;

					this.imageURL = im;
					} ,

				formatStatus(status){
		          if (status == "Vulnerable") return "VU"
		          if (status == "Endangered") return "EN"
		          if (status == "Critically Endangered") return "CE"
		          if (status == "Conservation Dependent") return "CD"
		          if (status == "Extinct") return "EX" 
		        }
			},

			watch:{
				bubble(){
					this.loadSpeciesImage();
				}
			}

		}
	

</script>


<style type="text/css">
	
	.bubble{
		position:relative;
		top:0;
		left:0;
		background-color:#666;
		border-radius:50%;
		padding:2 rem;
		display:flex;
		align-items:center;
		background-size: cover;
		background-position: 50% 50%;
/* 		overflow: hidden;*/
		border: 1.0px solid var(--ala-darkgrey); 
/*		var(--ala-light-orange);*/
		transition-property: width, height;
		transition-duration: 0.5s;
/*		box-shadow: 0px 0px 4px rgba(0,0,0,0.4);*/
		cursor:pointer;
		box-sizing:border-box;

	}

	a.bubble-link{
		text-decoration: none;
	}

	.bubble:hover, .bubble.focus{
		border-color:var(--ala-orange);
	}

	.bubble:hover p, .bubble.focus p{
		transform:scale(1.1);
	}

	.bubble:hover img, .bubble.focus img{
		opacity: 1.0;
	}

	.root .bubble{
		background-color: var(--ala-ocean-quarter);
		background-size: cover;
		border:none;
		cursor:default;
	}


	.bubble.small .text-wrapper{
		display: none;
	}


	.bubble img{
		position:absolute;
		width:100%;
		height:100%;
		object-fit: cover;
		z-index:0;
		opacity:0.6;
		border-radius:50%;

	}

	.bubble div.status{
	    display: inline-block;
	    position: absolute;
	    width: 1.2rem;
	    text-align: center;
	    /* right: 50%; */
	    bottom: -0.3rem;
	     padding: 0 0.1rem; 
	    font-weight: bold;
	    user-select: none;
	    font-size: 0.66rem;
	    left: calc(50% - 0.65rem);
	    border-radius: 0.5rem;

	  }
	

</style>