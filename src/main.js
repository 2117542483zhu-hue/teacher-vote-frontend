import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 👈 1. 引入你刚才建好的路由文件

// 导入 Element Plus 组件库和样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/global.css'

const app = createApp(App)

app.use(router)      // 👈 2. 注册路由
app.use(ElementPlus) // 注册组件库

app.mount('#app')