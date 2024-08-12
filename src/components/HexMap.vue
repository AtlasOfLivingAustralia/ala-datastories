

<template>
  <main id="map">
    <l-map  ref="map" :zoom="zoom" :center="filterCenter" :useGlobalLeaflet="false" @ready="mapReady" @update:bounds="boundsUpdated" @update:center="centerUpdated" :options="{attributionControl: false, zoomControl:false, doubleClickZoom:false}" :detectRetina="true" @dblclick="doubleClick">
      <l-control-zoom position="topright"  ></l-control-zoom>
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
      <l-circle :lat-lng="filterCenter" :radius="filterRadiusMeters" :color="'#c44d34'" :fill="false" :weight=2 :dashArray="'5 10'"
    />
      <l-marker v-for="o in obs" :lat-lng="[o.decimalLatitude,o.decimalLongitude]" :options="{riseOnHover:true}" @click="clickMarker(o)" :key="o.uuid">
        <l-icon
          :icon-size="[21,28]"
          :icon-anchor="[10.5,28]"
          :shadow-size="[30,9]"
          :shadow-anchor="[15,4]"
          :popup-anchor="[0,-30]"
          :icon-url="`/markers/${o.speciesGroup.toLowerCase()}-marker${focusMarkerId==o.uuid?'-focus':''}.png`"
          shadow-url="/markers/marker-shadow.png"
        />
          
        
        <l-popup :className="'hexMapPopup'" offset="[0,30]">
            <ObsTile :obs-data="o" popup="true"/>
          </l-popup>    

      </l-marker>


    </l-map>
  </main>
</template>


<script>
  import "leaflet/dist/leaflet.css";
  import { LMap, LTileLayer, LWmsTileLayer, LCircleMarker, LCircle, LPopup, LControlZoom, LMarker, LIcon } from "@vue-leaflet/vue-leaflet";
  import ObsTile from '../components/ObsTile.vue';

  export default {
    components: {
      LMap,
      LTileLayer,
      LWmsTileLayer,
      LCircleMarker,
      LMarker,
      LIcon,
      LCircle,
      LPopup,
      LControlZoom,
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
      },
      // center:{},
      zoom:{},
      filterCenter:{},
      filterRadius:{}
    },

    data() {
      return {
        mapCenter: null,
        focusMarkerId:"",
        baseLayer: {
          // url: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
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

    computed:{
      hexBaseUrl(){ // build the base URL
        const maxcount = Math.sqrt(this.recordCount)*10; // scaling w square root of total records
        const binCounts = [1000,100,10,1].map(c => Math.floor(maxcount/c)); //scale down w maxcount
        const binColours= ["4Cffc557","72fcad54","99f99650","BFf57e4d","FFf26649"]
        const colstring = binColours[0]+","+binCounts[0]+","+binColours[1]+","+binCounts[1]+","+binColours[2]+","+binCounts[2]+","+binColours[3]+","+binCounts[3]+","+binColours[4];
        const envString = encodeURIComponent("size:3;colormode:hexbin;color:"+colstring);
        //console.log("https://api.test.ala.org.au/occurrences/mapping/wms/reflect?&q="+this.query+"&outline=false&ENV="+envString)
        return encodeURI("https://api.test.ala.org.au/occurrences/mapping/wms/reflect?&q="+this.query+"&outline=false&ENV="+envString);

      },
      radiusMeters(){
        return this.radius*1000;
      },
      filterRadiusMeters(){
        return this.filterRadius*1000;
      }
    },


    methods: {
          mapReady (){
            console.log("map is ready");
            this.bounds = this.$refs.map.leafletObject.getBounds();
            // this.radius = this.getRadius();
            // console.log(this.radius)
          },

          doubleClick(){
            console.log("double click")
            this.$emit("setGeoFocus")
          },

          clickMarker(obs){
            // obs.focus = true;
            // this.focusMarkerId = obs.uuid
            if (this.focusMarkerId == obs.uuid){
              this.focusMarkerId = "";
            } else {
              this.focusMarkerId = obs.uuid;
              console.log("focused "+ obs.uuid)
            }
            this.$forceUpdate();
             // console.log(this.focusMarkerId)
          },

          centerUpdated (center) {
            // console.log("map filterCenter")
             //console.log(this.filterCenter.lat + " - " + this.filterCenter.lng)
            // console.log(center)
            this.mapCenter = center;
            this.radius = this.getViewRadius();
          },
          boundsUpdated (bounds) {
            // console.log(bounds)
            this.bounds = bounds;
            this.radius = this.getViewRadius();
          },

          getViewRadius(){
            let halfh = this.getDistanceFromLatLonInKm(this.mapCenter.lat,this.mapCenter.lng, this.bounds._northEast.lat ,this.mapCenter.lng);
            let halfw = this.getDistanceFromLatLonInKm(this.mapCenter.lat,this.mapCenter.lng, this.mapCenter.lat ,this.bounds._northEast.lng)
            let mindist = Math.min(halfh,halfw)
            return mindist * 0.9;

          },

          getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
            var dLon = this.deg2rad(lon2-lon1); 
            var a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c; // Distance in km
            return d;
          },

          deg2rad(deg) {
            return deg * (Math.PI/180)
          }
    },



    mounted(){
      this.focusMarkerId = "";
    }
  };

</script>


<style>

  #map{
    height: 100%;
    width: 100%;
  }

  .leaflet-popup-content-wrapper{
    padding:0.25em;
  }

  .leaflet-marker-icon.bounce{
    
  }
  
</style>
