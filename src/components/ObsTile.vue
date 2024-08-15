<template>
  <main>
    <div class="imgwrap" @click="showModal">
      <img v-if="obsData.thumbnailUrl" :src="obsData.thumbnailUrl" @mouseover="tileHover"  >
      <div class="maximise"></div>
    </div>
    <div class="info" @mouseover="tileHover">
      
      <div class="head">
        <p v-if="obsData.vernacularName" class="commonName">
          <a class="newtab" :href="'https://biocache.ala.org.au/occurrences/'+obsData.uuid" target="_blank" title="View this occurrence in the ALA">{{obsData.vernacularName}}</a>
        </p>
        <p v-if="obsData.scientificName && !obsData.vernacularName" class="sciName">
          <a class="newtab" :href="'https://biocache.ala.org.au/occurrences/'+obsData.uuid" target="_blank" title="View this occurrence in the ALA">
          <em>{{obsData.scientificName}}</em></a>
        </p>
        <p v-if="obsData.scientificName && obsData.vernacularName" class="sciName">
          {{obsData.scientificName}}
        </p>
      </div>
      
      <div class="foot">
        <p class="smaller date">{{formattedDate}}</p>
        <p class="smaller dataResource">
          <a class="newtab" :href="'https://collections.ala.org.au/public/show/'+obsData.dataResourceUid" target="_blank" title="View this Data Resource in the ALA">
            {{obsData.dataResourceName}}
          </a>
        </p>
      </div>

      <img v-if="(obsData.taxonRank == 'species' || obsData.taxonRank == 'subspecies' || obsData.taxonRank=='variety') && !popup" class="focusSpeciesButton" src="../assets/img/focus-species.svg" @click="apiState.setFilter({field:'lsid',fieldLabel:'Species',value: obsData.speciesGuid,valueLabel: displayName, fq:'lsid:'+obsData.speciesGuid})" title="Focus on this species">

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
        },

        tileHover(){
          this.$emit('tilehover',this.obsData.uuid)
        },

        showModal(){
          this.$emit('showModal',{ ...this.obsData, 'formattedDate': this.formattedDate})
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
    padding:0.25em 1.5em 0.25em 0.25em;
    position:relative;
    cursor: pointer;
    border:1px solid transparent;
  }

  main:hover{
    background-color: var(--ala-concrete);
    border:1px solid var(--ala-flamingo);
  }

  main img{
    height:100%;
    width:68px;
    object-fit: cover;
    display:inline-block;
    float:left;
    border-radius:0.25rem;
  }

  .info{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    font-size:0.8rem;
    padding:0 0.5em;
    color:#637073;
    justify-content: space-between;
  }

  .info p{
    margin:0;
    line-height: 1.3em;
  }

  .info p.smaller{
    font-size:0.65rem;
/*    font-weight:400;*/
    line-height: 1.0em;
  }

/*  .info p.date{
    margin-top:0.2rem;
  }*/

  .info p.sciName{
    font-style: italic;
  }

  .info .foot{
    opacity:0.75;
    margin-bottom:0.1rem;
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
    font-weight: 600;
    user-select: none;
  }

  .maximise{
    background-image:url('assets/img/modal-expand.svg');
    background-size: 85%;
    background-position: 52% 52%;
    position: relative;
    z-index: 2;
    height: 100%;
    background-repeat: no-repeat;
    opacity:0;
  }

  .imgwrap:hover .maximise{
    opacity:1;
  }






</style>