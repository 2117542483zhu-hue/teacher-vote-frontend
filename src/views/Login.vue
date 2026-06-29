<!--
=============================================================================
文件: src/views/Login.vue — 登录页面
负责人: 人一 (用户认证与权限体系)
讲解要点:
  1. Vue 3 Composition API — <script setup> 语法糖，ref/reactive 响应式数据
  2. el-form / el-input — Element Plus 表单组件
  3. api.login() — 调用后端登录接口
  4. localStorage.setItem('user', ...) — 登录状态持久化
  5. router.push() — 根据 role 跳转到管理员或学生页面
  6. loading 状态 — 防止重复提交
  7. CSS 毛玻璃效果 — backdrop-filter: blur()
=============================================================================
-->
<template>
  <div class="login-page">
    <div class="login-box fade-in">
      <div class="login-brand">
        <div class="login-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 class="login-brand__title">我最喜爱的教师</h1>
        <p class="login-brand__sub">评选投票系统</p>
      </div>

      <!-- 人一讲解：登录表单 — el-form 是 Element Plus 表单容器 -->
      <el-form :model="loginForm" @submit.prevent class="login-form">
        <div class="input-group">
          <label class="input-label">账号</label>
          <!-- 人一讲解：v-model 双向绑定 — 输入框的值自动同步到 loginForm.username -->
          <el-input
            v-model="loginForm.username"
            placeholder="请输入学工号"
            size="large"
            @keyup.enter="handleLogin"
          />
        </div>
        <div class="input-group">
          <label class="input-label">密码</label>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </div>
        <!-- 人一讲解：:loading="loading" — 按钮加载状态，防止用户重复点击 -->
        <el-button
          type="primary"
          size="large"
          class="login-submit"
          :loading="loading"
          @click="handleLogin"
          round
        >
          登 录
        </el-button>
      </el-form>

      <p class="login-foot">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
// ===== 人一讲解：Vue 3 Composition API =====
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const router = useRouter()    // 人一讲解：获取路由实例，用于编程式导航
const loading = ref(false)    // 人一讲解：ref 创建响应式变量，loading.value 读写

// 人一讲解：ref 包装对象使其变为响应式 — 表单数据变化时视图自动更新
const loginForm = ref({ username: '', password: '' })

// 人一讲解：登录处理函数 — async/await 处理异步请求
const handleLogin = async () => {
  // 人一讲解：前端表单校验 — 空值检查
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  loading.value = true  // 人一讲解：开始加载，按钮显示转圈
  try {
    // 人一讲解：调用 API 登录 — 后端返回 { code, message, data: { id, username, role, vote_status } }
    const res = await api.login(loginForm.value.username, loginForm.value.password)
    ElMessage.success('登录成功')
    // 人一讲解：将用户信息存入 localStorage — 持久化存储，刷新页面不丢失
    // 后续路由守卫和页面都从这里读取用户身份
    localStorage.setItem('user', JSON.stringify(res.data))
    // 人一讲解：根据角色跳转 — admin 进管理后台，student 进投票页面
    router.push(res.data.role === 'admin' ? '/admin' : '/student')
  } catch { /* 拦截器已处理 — 不需要额外操作 */ }
  finally { loading.value = false }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* 人一讲解：CSS 装饰元素 — ::before/::after 伪元素创建背景光晕动画 */
.login-page::before {
  content: '';
  position: absolute;
  width: 600px; height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,.06) 0%, transparent 70%);
  top: -200px;
  right: -150px;
  animation: float 8s ease-in-out infinite;
  pointer-events: none;
}
.login-page::after {
  content: '';
  position: absolute;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139,92,246,.05) 0%, transparent 70%);
  bottom: -180px;
  left: -120px;
  animation: float 10s ease-in-out infinite reverse;
  pointer-events: none;
}

/* 人一讲解：毛玻璃卡片 — backdrop-filter: blur() + 半透明背景 */
.login-box {
  width: 420px;
  position: relative;
  z-index: 1;
  background: rgba(255,255,255,.7);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: var(--r-xl);
  box-shadow:
    0 20px 60px rgba(99,102,241,.08),
    0 8px 24px rgba(0,0,0,.04),
    inset 0 1px 0 rgba(255,255,255,.6);
  padding: 52px 44px 40px;
  border: 1px solid rgba(255,255,255,.5);
  animation: fadeInScale .6s var(--ease-out-back) both;
  transition: transform .4s var(--ease-out-expo), box-shadow .4s var(--ease-out-expo);
}
.login-box:hover {
  transform: translateY(-2px);
  box-shadow:
    0 24px 80px rgba(99,102,241,.1),
    0 12px 32px rgba(0,0,0,.06),
    inset 0 1px 0 rgba(255,255,255,.6);
}

.login-brand { text-align: center; margin-bottom: 40px; }
.login-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, var(--c-primary), #8B5CF6);
  color: #fff;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px var(--c-primary-glow);
  animation: float 4s ease-in-out infinite;
}
.login-brand__title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  letter-spacing: .02em;
  background: linear-gradient(135deg, var(--c-primary), #8B5CF6, var(--c-primary-dark));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 4s ease infinite;
}
.login-brand__sub {
  font-size: 15px;
  color: var(--c-text-secondary);
  margin: 8px 0 0;
  font-weight: 500;
}
.login-form { display: flex; flex-direction: column; gap: 22px; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.login-submit {
  width: 100%;
  height: 50px;
  font-size: 17px;
  font-weight: 700;
  margin-top: 8px;
  border-radius: 14px !important;
  letter-spacing: .06em;
}
.login-foot { text-align: center; margin-top: 28px; font-size: 14px; color: var(--c-text-secondary); }
.login-foot a {
  color: var(--c-primary);
  font-weight: 700;
  text-decoration: none;
  transition: all .2s var(--ease-out-expo);
}
.login-foot a:hover {
  color: var(--c-primary-dark);
  text-decoration: underline;
}
</style>
