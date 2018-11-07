import Vue from 'vue';
import App from './App';
import router from './router';
import firebase from 'firebase'
Vue.config.productionTip = false;

var config = {
  apiKey: "AIzaSyBuKK7PR3RR0eheOHnIVBhWkzCDZSNfyJg",
  authDomain: "swift-capsule-221215.firebaseapp.com",
  databaseURL: "https://swift-capsule-221215.firebaseio.com/",
  projectId: "swift-capsule-221215",
  storageBucket: "",
};

firebase.initializeApp(config);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
