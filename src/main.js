import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入路由
import router from "./router/index"

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.mount('#app')
