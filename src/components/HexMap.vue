

<template>
  <main id="map">
    <l-map ref="map" :zoom="zoom" :center="localCenter" :useGlobalLeaflet="false" @ready="mapReady" @update:bounds="boundsUpdated" @update:center="centerUpdated" :options="mapOptions" :detectRetina="true" @dblclick="doubleClick" >
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
      
    <!-- search area circle -->
      <l-circle :lat-lng="localCenter" :radius="filterRadiusMeters" :color="'#c44d34'" :fill="false" :weight=2 :dashArray="'5 10'"/>

    <!-- draggable handle -->
      <l-marker :lat-lng="dragHandlePos" :radius="12" :draggable="true" :fill="true" :stroke="false" :fill-color="'#c44d34'" :fill-opacity="1" @mousedown="radiusHandleDragStart" @mouseup="radiusHandleDragEnd">
        <l-icon
          :icon-size="[36,25]"
          :icon-anchor="[18,12.5]"
          :icon-url="`${siteRoot}/markers/drag-handle.png`"
        />
      </l-marker>

    <!-- sample markers -->
      <l-marker v-for="o in obs" :lat-lng="[o.decimalLatitude,o.decimalLongitude]" :options="{riseOnHover:true}" @click="clickMarker(o.uuid)" :key="o.uuid" :z-index-offset="bounceMarkerId==o.uuid ? 30 : 0">
        <l-icon
          :icon-size="[21,28]"
          :icon-anchor="[10.5,28]"
          :shadow-size="[30,9]"
          :shadow-anchor="[15,4]"
          :popup-anchor="[0,-30]"
          :icon-url="`${siteRoot}/markers/${o.speciesGroup.toLowerCase()}-marker${focusMarkerId==o.uuid||bounceMarkerId==o.uuid?'-focus':''}.png`"
          :shadow-url="`${siteRoot}/markers/marker-shadow.png`"
          :class-name="`${bounceMarkerId==o.uuid ? 'focus': ''}`"
        />
        <l-popup :className="'hexMapPopup'" offset="[0,30]">
          <ObsTile :obs-data="o" popup="true" @show-modal="passModal"/>
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
      zoom:{},
      filterCenter:{},
      filterRadius:{}
    },

    data() {
      return {
        mapCenter: null,
        mapOptions: { attributionControl: false, 
                      zoomControl:false, 
                      doubleClickZoom:false, 
                      scrollWheelZoom:false, 
                      dragging:true},
        focusMarkerId:"",
        bounceMarkerId:"",
        baseLayer: {
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
          name:"Carto Voyager"
        },
        bounds:null,
        radius:null,
        wmsLayer: {
          name: 'ALA Hex Map',
          layers:'',
          visible: true,
          format: 'image/png'
        },
        localCenter:this.filterCenter,
        localRadius: this.filterRadius,
        siteRoot: import.meta.env.BASE_URL
      }
    },

    computed:{
      hexBaseUrl(){ // build the base URL for the hex map
        const base = 'https://api.ala.org.au/occurrences/mapping/wms/reflect?&q='
        const colstring = this.mapBins[0].col+","+this.mapBins[0].count+","+this.mapBins[1].col+","+this.mapBins[1].count+","+this.mapBins[2].col+","+this.mapBins[2].count+","+this.mapBins[3].col+","+this.mapBins[3].count+","+this.mapBins[4].col;
        const envString = encodeURIComponent("size:3;colormode:hexbin;color:"+colstring);
        return encodeURI(base+this.query+"&outline=false&ENV="+envString);
      },

      mapBins(){
        let maxcount = Math.sqrt(this.recordCount)*12; // scaling w square root of total records
        let roundcount = maxcount;
        if (maxcount > 1000) roundcount = Math.floor(maxcount/100)*100;
        if (maxcount > 10000) roundcount = Math.floor(maxcount/1000)*1000;
        const binCounts = [1000,100,10,1,1].map(c => Math.floor(roundcount/c)); //scale down w maxcount
        const binColours= ["4Cffc557","72fcad54","99f99650","BFf57e4d","FFf26649"]
        // NB these colours are AARRGGBB, need to transform to be CSS hex
        return binCounts.map((c,i) => { return {col: binColours[i], csscol: '#'+ binColours[i].substring(2,8)+binColours[i].substring(0,2), count:c}})
      },
      radiusMeters(){
        return this.radius*1000;
      },
      filterRadiusMeters(){
        return this.localRadius*1000;
      },

      dragHandlePos(){
        let pos = this.destinationFromPoint(this.localCenter,90,this.filterRadiusMeters);
        return pos;
      }
    },


    methods: {
          mapReady (){
            this.$emit('mapready')
            this.bounds = this.$refs.map.leafletObject.getBounds();
          },

          doubleClick(e){
            let r = this.getViewRadius();
            this.$emit("setGeoFocus", {lat: e.latlng.lat, lon: e.latlng.lng, radius: r })
          },

          clickMarker(id){
            if (this.focusMarkerId == id){
              this.focusMarkerId = "";
            } else {
              this.focusMarkerId = id;
            }
            if (this.bounceMarkerId) this.bounceMarkerId = ""
            this.$forceUpdate();
          },

          bounceMarker(id){
            this.bounceMarkerId = id;
            if (this.focusMarkerId) this.focusMarkerId = ""
            this.$forceUpdate();
          },

          passModal(obs){ // pass modal click up to App.vue
              this.$emit('showModal',obs)
          },

          centerUpdated (center) {
            this.mapCenter = center;
            this.radius = this.getViewRadius();
            this.checkRecenterButton()
          },

          boundsUpdated (bounds) {
            this.bounds = bounds;
            this.radius = this.getViewRadius();
            this.checkRecenterButton()
          },

          checkRecenterButton(){
            // calculate radius of the 20px recenter button in map meters
            let buttonRadius = this.$refs.map.leafletObject.distance(
              this.$refs.map.leafletObject.containerPointToLatLng([0, 0]),
              this.$refs.map.leafletObject.containerPointToLatLng([0, 20])
              );

            let mapCenterToFilterCenter = this.getDistanceFromLatLonInKm(this.mapCenter.lat,this.mapCenter.lng, this.filterCenter.lat ,this.filterCenter.lng)*1000;
            if (mapCenterToFilterCenter > this.filterRadiusMeters + buttonRadius) {
              this.$emit('updateRecenterButton',true)
            } else {
              this.$emit('updateRecenterButton',false)
            }
          },

          getViewRadius(){
            // generate a radius based on the current map extent
            let halfh = this.getDistanceFromLatLonInKm(this.mapCenter.lat,this.mapCenter.lng, this.bounds._northEast.lat ,this.mapCenter.lng);
            let halfw = this.getDistanceFromLatLonInKm(this.mapCenter.lat,this.mapCenter.lng, this.mapCenter.lat ,this.bounds._northEast.lng)
            let mindist = Math.min(halfh,halfw)
            return mindist * 0.8;
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
          },

          radiusHandleDragStart(){
            this.$refs.map.leafletObject.dragging.disable();
            this.$refs.map.leafletObject.on("mousemove", this.radiusHandleDragging) 
          },

          radiusHandleDragEnd(){
            this.$refs.map.leafletObject.dragging.enable();
            this.$refs.map.leafletObject.off("mousemove", this.radiusHandleDragging) 
            this.$emit("setGeoFocus", {lat: this.localCenter.lat, lon: this.localCenter.lng, radius: this.localRadius })
          },

          radiusHandleDragging(evt){
            this.localRadius = this.getDistanceFromLatLonInKm(this.localCenter.lat,this.localCenter.lng,this.localCenter.lat,evt.latlng.lng)
          },



          destinationFromPoint(latlng, heading, distance) {
              heading = (heading + 360) % 360;
              var rad = Math.PI / 180,
                  radInv = 180 / Math.PI,
                  R = 6378137, // approximation of Earth's radius
                  lon1 = latlng.lng * rad,
                  lat1 = latlng.lat * rad,
                  rheading = heading * rad,
                  sinLat1 = Math.sin(lat1),
                  cosLat1 = Math.cos(lat1),
                  cosDistR = Math.cos(distance / R),
                  sinDistR = Math.sin(distance / R),
                  lat2 = Math.asin(sinLat1 * cosDistR + cosLat1 *
                      sinDistR * Math.cos(rheading)),
                  lon2 = lon1 + Math.atan2(Math.sin(rheading) * sinDistR *
                      cosLat1, cosDistR - sinLat1 * Math.sin(lat2));
              lon2 = lon2 * radInv;
              lon2 = lon2 > 180 ? lon2 - 360 : lon2 < -180 ? lon2 + 360 : lon2;
              //return this.$refs.map.leafletObject.latLng([lat2 * radInv, lon2]);
              return {lat:lat2 * radInv,lng:lon2}
          }
    },

    watch: {
      // update counts for the map bins; pass to App.vue
      hexBaseUrl(){
        this.$emit('updateBins',this.mapBins)
      },

      localRadius(){
        //console.log("filter radius changed, checking")
        this.checkRecenterButton();
      },

      'localCenter.lng'(){
        console.log("center changed, checking")
        this.checkRecenterButton();
      },





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

  .leaflet-marker-icon.focus{
    z-index:99999999;
    animation: marker-bounce;
    animation-duration: 0.5s;
    animation-iteration-count: 1;
  }

  @keyframes marker-bounce{
    0% {top:0px}
    30% {top:-12px}
    45% {top:-15px}
    50% {top:-16px}
    55% {top:-15px}
    70% {top:-12px}
    100% {top:0px}
  }
  
</style>
