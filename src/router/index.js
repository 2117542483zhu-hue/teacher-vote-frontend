import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Admin from '../views/Admin.vue'
import Student from '../views/Student.vue'

const routes = [
  { path: '/', name: 'login', component: Login, meta: { guest: true } },
  { path: '/register', name: 'register', component: Register, meta: { guest: true } },
  { path: '/admin', name: 'admin', component: Admin, meta: { role: 'admin' } },
  { path: '/student', name: 'student', component: Student, meta: { role: 'student' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫：统一鉴权
router.beforeEach((to) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // 已登录用户访问登录页 → 跳到对应页面
  if (to.meta.guest && user) {
    return user.role === 'admin' ? '/admin' : '/student'
  }

  // 需要特定角色才能访问的页面
  if (to.meta.role) {
    if (!user) {
      ElMessage.warning('请先登录')
      return '/'
    }
    if (to.meta.role !== user.role) {
      ElMessage.error('无权访问此页面')
      return user.role === 'admin' ? '/admin' : '/student'
    }
  }
})

export default router
