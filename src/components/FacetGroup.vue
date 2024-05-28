<template>
	 <h4>{{format.label}}</h4>
        <ul class="facetList">
          <li v-for="a in facetData" @click="setQueryFacet(field,a.label)" :class="{focus:this.facetFocus[field] == a.label}">
            <span class="label">{{a.label}}</span> 
            <span class="count">({{formatCount(a.count)}})</span>
            <div class="bar" :style="{width: 100*a.count/totalCount+'%'}"></div>
          </li>
        </ul>
</template>

<script>
	
	export default {

	    props: ["field","format","facetData","facetFocus","totalCount"],
	    emits: ["setFacet"],

	    methods: {
	    	formatCount(count){
	        	if (count < 10000) return count;
	        	if (count >= 10000 && count < 1000000) return Math.floor(count/1000)+"k";
	        	return (count/1000000).toFixed(1)+ "M";
		    },

		    setQueryFacet(field,value){
		    	this.$emit('setFacet',{field:field,value:value});
		    }
		 }
	}

</script>

<style type="text/css">
  .facetList{
    list-style: none;
    height:20vh;
    overflow-y: scroll;
    overflow-x: hidden;
    padding:0;
    margin: 0 1.5em 0 0;
    font-size:13px;
    font-weight: 400;
    line-height: 1.5em;
  }

  .facetList li{
    cursor:pointer;
    position:relative;
    margin-bottom: 0.2em;
    white-space: nowrap;
  }

  .facetList li .label{
    padding-left:0.5em;
    margin-right: 0.5em;
  }

  .facetList li:hover .label, .facetList li.focus .label{
    font-weight: 600;
  }

  .facetList li .count{
    color:#9d9d9d;
    font-size:90%;
  }

  .facetList li:hover .count, .facetList li.focus .count{
    color:unset;
    font-weight: 600;
  }

  .facetList li .bar{
    background-color: lightblue;
    position: absolute;
    left:0;
    top:0;
    height:100%;
    z-index:-1;
    opacity:0.66;
  }

  .facetList li:hover .bar, .facetList li.focus .bar{
    background-color: #F26649;
  }

</style>