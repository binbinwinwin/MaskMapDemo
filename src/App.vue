<template>
  <div class="home row no-gutters">
    <div class="sidebar col-sm-3">
      <div v-if="cityName.length" class="toolbox">
        <div class="lefttop sticky-top bg-white shadow-sm p-2">
          <div class="timecolor">當前時間 : {{time | formatDate}}</div>
          <div class="title">
            <img src="./image/mask.png" class="maskface">
            <span class="titlemask">口罩地圖 Mask Map</span>
          </div>
          <div class="form-group d-flex">
            <label for="cityName" class="cites mr-2 col-form-label text-right"></label>
            <div class="flex-fill">
              <select id="cityName" class="dropdown"
              v-model="select.city" @change="select.area = ''">
                <option :value="item.CityName" v-for="item in cityName" :key="item.CityName">
                  {{ item.CityName }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group d-flex">
            <label for="area" class="area mr-2 col-form-label text-right"></label>
            <div class="flex-fill">
              <select id="area" class="dropdown" v-if="select.city.length"
                v-model="select.area" @change="updateSelect">
                <option :value="null">
                  全部縣市
                </option>
                <option :value="item.AreaName"
                  v-for="item in cityName.find((city) => city.CityName === select.city).AreaList"
                  :key="item.AreaName">
                  {{ item.AreaName }}
                </option>
              </select>
            </div>
          </div>
          <div class="search">
            <input class="search-bar" v-model.trim="search"
            type="text" name="search" id="search"  placeholder="進階搜尋藥局">
            <button class="search-btn"><font-awesome-icon icon="search"/></button>
            <div class="number">
            <p v-if="!this.search">取得口罩數量的藥局有 <span class="numbers">{{ pharmacyNum }}</span> 家</p>
            <p v-if="this.search">已取得關於 <span class="numbers">{{ this.search }}</span> 的資料</p>
            </div>
            <ul class="list-group">
          <template v-for="(item, key) in searchData">
            <a class="list-group-item text-left" :key="key"
              v-if="item.properties.county === select.city
                && item.properties.town === select.area"
              :class="{ 'highlight': item.properties.mask_adult || item.properties.mask_child}"
              @click="penTo(item)">
              <h3>{{ item.properties.name }}</h3>
              <p class="mb-0">
                <font-awesome-icon icon="map-marker-alt"/>
                <a :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
                target="_blank" title="Google Map">
                &nbsp;{{ item.properties.address }}</a>
              </p>
              <p class="mb-0">
                <font-awesome-icon icon="mobile-alt"/>
                &nbsp;&nbsp;{{ item.properties.phone }}
              </p>
              <p class="mb-0">
                <font-awesome-icon icon="unlock-alt"/>
                &nbsp;{{ item.properties.note }}
              </p>
              <div class="maskcount">
              <span class="adultcount mb-0">
                成人口罩：{{ item.properties.mask_adult}}
              </span>
              <span class="childcount mb-0">
                兒童口罩：{{ item.properties.mask_child}}
              </span>
              </div>
            </a>
            <a class="list-group-item text-left" :key="key"
              v-if="!select.area && item.properties.county === select.city" @click="penTo(item)">
              <h3>{{ item.properties.name }}</h3>
              <p class="mb-0">
                <font-awesome-icon icon="map-marker-alt"/>
                <a :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
                target="_blank" title="Google Map">
                &nbsp;{{ item.properties.address }}</a>
              </p>
              <p class="mb-0">
                <font-awesome-icon icon="mobile-alt"/>
                &nbsp;&nbsp;{{ item.properties.phone }}
              </p>
              <p class="mb-0">
                <font-awesome-icon icon="unlock-alt"/>
                &nbsp;{{ item.properties.note }}
              </p>
              <div class="maskcount">
              <span class="adultcount mb-0">
                成人口罩：{{ item.properties.mask_adult}}
              </span>
              <span class="childcount mb-0">
                兒童口罩：{{ item.properties.mask_child}}
              </span>
              </div>
            </a>
          </template>
        </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="col-sm-9">
      <div id="map"></div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import L from 'leaflet';
import cityName from './assets/cityName.json';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

let osmMap = {};

const iconsConfig = {
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
};
const icons = {
  green: new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    ...iconsConfig,
  }),
  grey: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    ...iconsConfig,
  }),
};

const osm = {
  addMapMarker(x, y, item) {
    const icon = item.mask_adult || item.mask_child ? icons.green : icons.grey;
    L.marker([y, x], {
      icon,
    }).addTo(osmMap).bindPopup(`<strong>${item.name}</strong> <br>
    口罩剩餘：<strong><span class="adultcountdown">成人 - ${item.mask_adult ? `${item.mask_adult} 個` : '未取得資料'}</span>&nbsp; &nbsp; <span class="childcountdown">兒童 - ${item.mask_child ? `${item.mask_child} 個` : '未取得資料'}</span></strong><br>
    地址: <a href="https://www.google.com.tw/maps/place/${item.address}" target="_blank">${item.address}</a><br>
    電話: ${item.phone}<br>
    <small>最後更新時間: ${item.updated}</small>`);
  },
  removeMapMarker() {
    osmMap.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        osmMap.removeLayer(layer);
      }
    });
  },
  penTo(x, y, item) {
    const icon = item.mask_adult || item.mask_child ? icons.green : icons.grey;
    osmMap.panTo(new L.LatLng(y, x));
    L.marker([y, x], {
      icon,
    }).addTo(osmMap).bindPopup(`<strong>${item.name}</strong> <br>
    口罩剩餘：<strong><span class="adultcountdown">成人 - ${item.mask_adult ? `${item.mask_adult} 個` : '未取得資料'}</span>&nbsp; &nbsp; <span class="childcountdown">兒童 - ${item.mask_child ? `${item.mask_child} 個` : '未取得資料'}</span></strong><br>
    地址: <a href="https://www.google.com.tw/maps/place/${item.address}" target="_blank">${item.address}</a><br>
    電話: ${item.phone}<br>
    <small>最後更新時間: ${item.updated}</small>`).openPopup();
  },

};

export default {
  name: 'home',
  data: () => ({
    cityName,
    data: [],
    osmMap: {},
    select: {
      city: '桃園市',
      area: '中壢區',
    },
    time: new Date(),
    search: '',
    pharmacyNum: 0,
  }),
  filters: {
    formatDate(value) {
      const date = new Date(value);
      const y = date.getFullYear();
      const MM = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
      const d = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
      const h = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
      const m = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
      const s = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
      return `${y}-${MM}-${d} ${h}:${m}:${s}`;
    },
  },

  methods: {
    updateMarker() {
      const pharmacies = this.data.filter((pharmacy) => {
        if (!this.select.area) {
          return pharmacy.properties.county === this.select.city;
        }
        return pharmacy.properties.town === this.select.area
        && pharmacy.properties.county === this.select.city;
      });
      this.pharmacyNum = pharmacies.length;
      pharmacies.forEach((pharmacy) => {
        const { properties, geometry } = pharmacy;
        osm.addMapMarker(
          geometry.coordinates[0],
          geometry.coordinates[1],
          properties,
        );
      });
      this.penTo(pharmacies[0]);
    },
    removeMarker() {
      osm.removeMapMarker();
    },
    penTo(pharmacy) {
      const { properties, geometry } = pharmacy;
      osm.penTo(geometry.coordinates[0], geometry.coordinates[1], properties);
    },
    updateSelect() {
      this.removeMarker();
      this.updateMarker();
      const pharmacy = this.data.find((item) => item.properties.town === this.select.area);
      const { geometry, properties } = pharmacy;
      osm.penTo(geometry.coordinates[0], geometry.coordinates[1], properties);
    },
    timer() {
      // const vm = this;
      this.timer = setInterval(() => {
        this.time = new Date();
      }, 1000);
    },
  },

  computed: {
    searchData() {
      if (this.search) {
        return this.data.filter((item) => item.properties.name.indexOf(this.search) !== -1
        || item.properties.address.indexOf(this.search) !== -1);
      }
      return this.data;
    },
  },

  mounted() {
    // OSM
    osmMap = L.map('map', {
      center: [25.03, 121.55],
      zoom: 14,
    });

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      maxZoom: 16,
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy;<a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(osmMap);

    this.$http.get('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json')
      .then((res) => {
        this.data = res.data.features;
        this.updateMarker();
      });

    this.timer();
  },
};
</script>

<style lang="scss">
@import 'bootstrap/scss/bootstrap';

#map {
  height: 100vh;
}

.home {
  max-width: 100%;
  position: relative;
}

.toolbox {
  height: 100vh;
  overflow-y: auto;

a {
  cursor: pointer;
  text-decoration:none;
}
}

.cites,.area{
  margin: 5px;
}

.title{
  text-align: center;
}

.maskface{
  height: 50px;
  width: 50px;
}

.titlemask{
  margin: 10px;
  font-weight: bold;
  color:#EA0000;
}

// .sidebar{
//   width: 600px;
// }

.dropdown{
  width: 93%;
  margin-top: 10px;
  margin-bottom: 10px;
  height: 40px;
}

a:hover{
  color:black;
  background-color:#9de498;
}

.maskcount{
  text-align: center;
  margin-top: 10px;
  margin-bottom: 5px;
}

.adultcount{
  padding: 5px;
  margin-right: 10px;
  background-color: #46A3FF;
  border-radius: 10px;
  color:white;
}

.adultcountdown{
  padding: 2px;
  background-color: #46A3FF;
  border-radius: 10px;
  color:white;
}

.childcount{
  padding: 5px;
  margin-left: 10px;
  background-color: #FF8000;
  border-radius: 10px;
  color:white;
}

.childcountdown{
  padding: 2px;
  background-color: #FF8000;
  border-radius: 10px;
  color:white;
}

.timecolor{
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: bold;
  text-align: center;
  font-size: 20px;
}

.search-bar{
  width: 85%;
  height: 31px;
  font-size: 20px;
  border: 3px solid #0066CC;
  padding-bottom: 5px;
  margin-left: 10px;
  margin-top: 10px;
}

.search-btn{
  width: 36px;
  height: 32px;
  background-color:#0066CC;
  color:#efe9e7;
  cursor: pointer;
}

.number{
  font-size: 24px;
  margin: 10px;
  text-align: center;
}

.numbers{
  color:red;
}
</style>
