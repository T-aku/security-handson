import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import ProductList from './views/ProductList.vue'
import ProductDetail from './views/ProductDetail.vue'
import AdminLogin from './views/AdminLogin.vue'

const routes = [
  { path: '/', component: ProductList },
  { path: '/product/:id', component: ProductDetail },
  { path: '/admin', component: AdminLogin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')