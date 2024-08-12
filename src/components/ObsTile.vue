<template>
  <main>
    <img v-if="obsData.thumbnailUrl" :src="obsData.thumbnailUrl">
    <!-- <img class="placeholder" v-if="!obsData.thumbnailUrl" src="../assets/img/ala-logo.png"> -->
    <div class="info">
      <p v-if="obsData.vernacularName">
        <a class="newtab" :href="'https://biocache.ala.org.au/occurrences/'+obsData.uuid" target="_blank" title="View this occurrence in the ALA">{{obsData.vernacularName}}</a>
      </p>
      <p v-if="obsData.scientificName && !obsData.vernacularName">
        <a class="newtab" :href="'https://biocache.ala.org.au/occurrences/'+obsData.uuid" target="_blank" title="View this occurrence in the ALA">
        <em>{{obsData.scientificName}}</em></a>
      </p>
      <p v-if="obsData.scientificName && obsData.vernacularName">
        <em>{{obsData.scientificName}}</em>
      </p>

     

       <img v-if="(obsData.taxonRank == 'species' || obsData.taxonRank == 'subspecies' || obsData.taxonRank=='variety') && !popup" class="focusSpeciesButton" src="../assets/img/focus-species.svg" @click="apiState.setFilter({field:'lsid',fieldLabel:'Species',value: obsData.speciesGuid,valueLabel: displayName, fq:'lsid:'+obsData.speciesGuid})" title="Focus on this species">

      <p class="smaller">{{formattedDate}}</p>
      <p class="smaller">
        <a class="newtab" :href="'https://collections.ala.org.au/public/show/'+obsData.dataResourceUid" target="_blank" title="View this Data Resource in the ALA">
          {{obsData.dataResourceName}}
        </a>
      </p>

       <div class="status" :if="obsData.countryConservation" :class="formatStatus(obsData.countryConservation)" :title="obsData.countryConservation">{{formatStatus(obsData.countryConservation)}}</div>


    </div>
  </main>
</template>

<script>

    import { apiState } from '../apiState.js'
	
	export default {

	    props: ["obsData","popup"],

      data() {
        return {
           apiState
        }
       
      },

      computed: {

        displayName(){
          return this.obsData.vernacularName ? this.obsData.vernacularName : this.obsData.scientificName
        },

        formattedDate(){
          //console.log(this.obsData.eventDate)
          if (! this.obsData.eventDate) return "no date";
          let obsDate = new Date();
          obsDate.setTime(this.obsData.eventDate);
          // let dateString = obsDate.toUTCString();
          let d = new Intl.DateTimeFormat('en-AU').format(obsDate);
          return d;
        }
      },

      methods: {
        formatStatus(status){
          if (status == "Vulnerable") return "VU"
          if (status == "Endangered") return "EN"
          if (status == "Critically Endangered") return "CE"
          if (status == "Conservation Dependent") return "CD"
          if (status == "Extinct") return "EX" 
        }
      }
	}

</script>

<style type="text/css" scoped>

  main{
    display: inline-flex;
    height:76px;
    margin: 0 0.25em;
    background: white;
    box-sizing: border-box;
    box-shadow: 0px 0px 4px rgba(0,0,0,0.2);
    padding:0.25em 1.25em 0.25em 0.25em;
    position:relative;
  }

  main img{
    height:100%;
    width:68px;
    object-fit: cover;
    display:inline-block;
    float:left;
    border-radius:0.25rem;
  }

  img.placeholder{
    opacity:0.25;
    padding:0.5em;
    box-sizing: border-box;
  }
  
  .info{
    display: inline-block;
    font-size:0.75rem;
    float:left;
    padding:0 0.5em;
    color:#637073;
  }

  .info p{
    margin:0;
    line-height: 1.3em;
  }

  .info p.smaller{
    font-size:90%;
    font-weight:300;
  }

  img.focusSpeciesButton{
    width:14px;
    height:14px;
    position:absolute;
    top:0.35em;
    right:0.3em;
    cursor:pointer;
  }

  .status{
    display: inline-block;
    position:absolute;
    right:0.25rem;
    bottom:0.25rem;
    padding: 0.02rem 0.1rem 0.0rem 0.1rem;
    font-weight: bold;
    user-select: none;
  }






</style>