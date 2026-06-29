// =============================================================================
// 文件: src/router/index.js — Vue Router 路由配置与权限守卫
// 负责人: 人一 (用户认证与权限体系)
// 讲解要点:
//   1. Vue Router — 前端路由，根据 URL 切换页面组件（不刷新整页）
//   2. createWebHistory — HTML5 History 模式，URL 干净无 # 号
//   3. 路由表配置 — path/component/meta 三元组
//   4. meta 元信息 — guest 表示游客页面，role 表示需要的角色
//   5. beforeEach 全局路由守卫 — 每次跳转前执行，实现权限控制
//      - 已登录用户访问登录页 → 自动跳到对应主页
//      - 未登录用户访问需要权限的页面 → 拦截回登录页
//      - 学生访问管理员页面 / 管理员访问学生页面 → 拒绝并跳回
// =============================================================================

import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Admin from '../views/Admin.vue'
import Student from '../views/Student.vue'

// 人一讲解：路由表 — 定义所有页面的 URL 路径与组件的对应关系
const routes = [
  // meta.guest: true — 游客页面，登录后不应再访问
  { path: '/',          name: 'login',    component: Login,    meta: { guest: true } },
  { path: '/register',  name: 'register', component: Register, meta: { guest: true } },
  // meta.role — 需要特定角色才能访问，未登录或无权限会被路由守卫拦截
  { path: '/admin',    name: 'admin',    component: Admin,    meta: { role: 'admin' } },
  { path: '/student',  name: 'student',  component: Student,  meta: { role: 'student' } }
]

// 人一讲解：创建路由实例 — createWebHistory() 使 URL 没有 # 号，更美观
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 人一讲解：全局路由守卫 beforeEach — 每次导航前触发
// to: 目标路由对象  from: 来源路由对象
// 返回值: 返回路径表示重定向，返回 undefined/true 表示放行
router.beforeEach((to) => {
  // 人一讲解：从 localStorage 读取登录时存储的用户信息
  // 如果没有登录则 user 为 null
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // 人一讲解：规则 1 — 已登录用户访问登录/注册页时，自动跳到对应主页
  // 管理员跳到 /admin，学生跳到 /student
  if (to.meta.guest && user) {
    return user.role === 'admin' ? '/admin' : '/student'
  }

  // 人一讲解：规则 2 — 需要特定角色才能访问的页面
  if (to.meta.role) {
    // 人一讲解：规则 2a — 未登录用户，拦截并提示
    if (!user) {
      ElMessage.warning('请先登录')
      return '/'  // 重定向到登录页
    }
    // 人一讲解：规则 2b — 角色不匹配（如学生访问 /admin），拒绝并跳回
    if (to.meta.role !== user.role) {
      ElMessage.error('无权访问此页面')
      return user.role === 'admin' ? '/admin' : '/student'
    }
  }
  // 人一讲解：返回 undefined 表示放行，正常跳转
})

export default router
