// =============================================================================
// 文件: vite.config.js — Vite 构建工具配置
// 负责人: 人一 (用户认证与权限体系)
// 讲解要点:
//   1. Vite 是什么 — 新一代前端构建工具，开发时秒级启动
//   2. @vitejs/plugin-vue — 让 Vite 能够编译 .vue 单文件组件
//   3. proxy 代理配置 — 解决开发时的跨域问题
//      前端在 localhost:5173 请求 /api/xxx
//      Vite 自动把请求转发到 localhost:8000（后端）
//      浏览器以为是同源请求，实际由 Vite 做了"中间人"
//   4. resolve.alias — @ 符号映射到 src 目录，方便 import 路径
// =============================================================================

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),           // 人一讲解：让 Vite 支持 .vue 文件的编译
    vueDevTools(),   // 人一讲解：Vue 开发者工具插件
  ],
  // 人一讲解：开发服务器配置 — 核心是 proxy 代理
  server: {
    proxy: {
      // 人一讲解：所有以 /api 开头的请求都会被转发到后端 8000 端口
      // 前端写 http.post('/api/login') → Vite 转发 → http://127.0.0.1:8000/api/login
      '/api': {
        target: 'http://127.0.0.1:8000',  // 后端地址
        changeOrigin: true                  // 修改请求头中的 Origin 为目标地址
      },
      // 人一讲解：上传的图片也走代理，/uploads/xxx.jpg → 后端静态文件
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  },
  // 人一讲解：路径别名 — import xxx from '@/api' 等价于 import xxx from './src/api'
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
