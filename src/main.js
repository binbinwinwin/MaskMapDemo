/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core';

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { fas } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
// import moment from 'moment';
import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
// Vue.filter('datrfmt', (input, fmtstring) => moment(input).format(fmtstring));

Vue.use(require('vue-moment'));

/* add icons to the library */
library.add(fas, faTwitter);

/* add font awesome icon component */
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
