

<template>
  <main id="map">
    <l-map  ref="map" v-model:zoom="zoom" v-model:center="center" :useGlobalLeaflet="false" @ready="mapReady" @update:bounds="boundsUpdated" @update:center="centerUpdated" >
      <l-tile-layer :url="baseLayer.url"
                    layer-type="base"
                    :name="baseLayer.name"></l-tile-layer>
      <l-wms-tile-layer v-if="queryLoaded"
            :key="wmsLayer.name"
            :url="hexBaseUrl"
            :visible="wmsLayer.visible"
            :name="wmsLayer.name"
            :layers="wmsLayer.layers"
            format="image/jpeg"
            layer-type="base"
            :detectRetina="true">
      </l-wms-tile-layer>
      <l-circle-marker v-for="o in obs" :lat-lng="[o.decimalLatitude,o.decimalLongitude]" :radius="4" :color="'black'" :fillColor="'white'" :fillOpacity="0.6" :weight="1.5">
          <l-popup :className="'hexMapPopup'">
            <ObsTile :obs-data="o"/>
          </l-popup>
      </l-circle-marker>
    </l-map>
  </main>
</template>


<script>
  import "leaflet/dist/leaflet.css";
  import { LMap, LTileLayer, LWmsTileLayer, LCircleMarker, LPopup } from "@vue-leaflet/vue-leaflet";
  import ObsTile from '../components/ObsTile.vue';

  export default {
    components: {
      LMap,
      LTileLayer,
      LWmsTileLayer,
      LCircleMarker,
      LPopup,
      ObsTile
    },

    props: {
      query: {
        type: String,
        required:true,
        default:"*"
      },
      recordCount:{
        type: Number,
        required:false,
        default:134343000
      },
      queryLoaded: false,
      obs:{
        type: Array,
        default:[]
      }
    },

    computed:{
      hexBaseUrl(){ // build the base URL
        const maxcount = Math.sqrt(this.recordCount)*10; // scaling w square root of total records
        const binCounts = [1000,100,10,1].map(c => Math.floor(maxcount/c)); //scale down w maxcount
        const binColours= ["4Cffc557","72fcad54","99f99650","BFf57e4d","FFf26649"]
        const colstring = binColours[0]+","+binCounts[0]+","+binColours[1]+","+binCounts[1]+","+binColours[2]+","+binCounts[2]+","+binColours[3]+","+binCounts[3]+","+binColours[4];
        const envString = encodeURIComponent("size:3;colormode:hexbin;color:"+colstring);
        return encodeURI("https://api.test.ala.org.au/occurrences/mapping/wms/reflect?&q="+this.query+"&outline=false&ENV="+envString);
      },
      radiusMeters(){
        return this.radius*1000;
      }
    },


    methods: {
          mapReady (){
            console.log("map is ready");
            this.bounds = this.$refs.map.leafletObject.getBounds();
            // this.radius = this.getRadius();
            // console.log(this.radius)
          },

          centerUpdated (center) {
            this.center = center;
            this.radius = this.getRadius();
          },
          boundsUpdated (bounds) {
            // console.log(bounds)
            this.bounds = bounds;
            this.radius = this.getRadius();
          },

          // setCircle(){
          //   this.circle.center = this.center;
          //   this.circle.radius = this.radiusMeters;
          //   this.circle.show = true;
          // },

          // unsetCircle(){
          //   this.circle.show = false;
          // },

          getRadius(){
          return this.getDistanceFromLatLonInKm(this.center.lat,this.center.lng,this.bounds._northEast.lat,this.bounds._northEast.lng) * 0.6;
          },

          getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
            var dLon = this.deg2rad(lon2-lon1); 
            var a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
              ; 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c; // Distance in km
            return d;
          },

          // toggleCircle(){
          //   if (this.circle)
          // }

          deg2rad(deg) {
            return deg * (Math.PI/180)
          }
    },

    data() {

      return {
        zoom: 5,
        center: [-28, 133],
        baseLayer: {
          url: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
          name:"Stadia Maps Basemap"
        },
        bounds:null,
        radius:null,
        wmsLayer: {
          name: 'ALA Hex Map',
          layers:'',
          visible: true,
          format: 'image/png'

        }
      };
    },
  };

</script>


<style scoped>

  #map{
    height: 60vh;
    width: 100%;
  }

  .leaflet-popup-content-wrapper{
    padding:0.25em;
  }
</style>
