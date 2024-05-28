<template>
  <main>
    <img v-if="obsData.thumbnailUrl" :src="obsData.thumbnailUrl">
    <img class="placeholder" v-if="!obsData.thumbnailUrl" src="../assets/img/ala-logo.png">
    <div class="info">
      <p v-if="obsData.vernacularName">
        <a :href="'https://biocache.ala.org.au/occurrences/'+obsData.uuid" target="_blank">{{obsData.vernacularName}}</a>
      </p>
      <p v-if="obsData.scientificName && !obsData.vernacularName">
        <a :href="'https://biocache.ala.org.au/occurrences/'+obsData.uuid" target="_blank">
        <em>{{obsData.scientificName}}</em>
        </a>
      </p>
      <p v-if="obsData.scientificName && obsData.vernacularName">
        <em>{{obsData.scientificName}}</em>
      </p>

      <p class="smaller">{{formattedDate}}</p>
      <p class="smaller">
        <a :href="'https://collections.ala.org.au/public/show/'+obsData.dataResourceUid" target="_blank">
          {{obsData.dataResourceName}}
        </a>
      </p>
    </div>
  </main>
</template>

<script>
	
	export default {

	    props: ["obsData"],

      computed: {

        formattedDate(){
          let obsDate = new Date();
          obsDate.setTime(this.obsData.eventDate);
          // let dateString = obsDate.toUTCString();
          return new Intl.DateTimeFormat('en-AU').format(obsDate);
        }
      }
	}

</script>

<style type="text/css" scoped>

  main{
    display: inline-flex;
/*    max-width:80px;*/
    height:85px;
    margin: 0 0.25em;
/*    border:1px solid #9D9D9D;*/
    background: white;
    box-sizing: border-box;
    box-shadow: 0px 0px 6px rgba(0,0,0,0.2);
    padding:0.25em;
  }

  main img{
    height:100%;
    width:85px;
    object-fit: cover;
    display:inline-block;
    float:left;
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
/*    width:100px;*/
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

</style>