// =============================================================================
// 文件: src/main.js — Vue 应用入口文件
// 负责人: 人一 (用户认证与权限体系)
// 讲解要点:
//   1. createApp — Vue 3 创建应用实例的入口函数
//   2. app.use(router) — 注册路由插件，让整个应用拥有页面跳转能力
//   3. app.use(ElementPlus) — 注册 UI 组件库，全局可用 el-button 等组件
//   4. app.mount('#app') — 将 Vue 实例挂载到 index.html 的 <div id="app">
//   5. 全局 CSS 引入顺序：组件库样式 → 自定义样式
// =============================================================================

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'  // 人一讲解：引入路由配置

// 人一讲解：Element Plus — 基于 Vue 3 的桌面端 UI 组件库
// 提供 el-button、el-table、el-dialog、el-form 等现成组件
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'   // 人一讲解：Element Plus 默认样式
import './assets/global.css'            // 人一讲解：项目自定义全局样式

const app = createApp(App)  // 人一讲解：以 App.vue 为根组件创建 Vue 应用

app.use(router)       // 人一讲解：注册路由插件 — 响应 URL 变化，切换页面组件
app.use(ElementPlus)  // 人一讲解：注册 Element Plus — 所有页面可直接使用其组件

app.mount('#app')     // 人一讲解：挂载到 DOM — Vue 接管 <div id="app"> 的内容渲染
