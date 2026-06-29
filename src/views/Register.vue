<template>
  <div class="register-page">
    <div class="register-box">
      <div class="register-brand">
        <div class="register-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <h1 class="register-brand__title">创建账号</h1>
        <p class="register-brand__sub">注册成为学生，参与教师评选</p>
      </div>

      <el-form :model="registerForm" @submit.prevent class="register-form">
        <div class="input-group">
          <label class="input-label">用户名</label>
          <el-input v-model="registerForm.username" placeholder="请输入用户名" size="large" @keyup.enter="handleRegister" />
        </div>
        <div class="input-group">
          <label class="input-label">密码</label>
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" size="large" show-password @keyup.enter="handleRegister" />
        </div>
        <div class="input-group">
          <label class="input-label">确认密码</label>
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" size="large" show-password @keyup.enter="handleRegister" />
        </div>
        <el-button type="primary" size="large" class="register-submit" :loading="loading" @click="handleRegister" round>
          注 册
        </el-button>
      </el-form>

      <p class="register-foot">
        已有账号？<router-link to="/">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const router = useRouter()
const loading = ref(false)
const registerForm = ref({ username: '', password: '', confirmPassword: '' })

const handleRegister = async () => {
  const { username, password, confirmPassword } = registerForm.value
  if (!username || !password) { ElMessage.warning('用户名和密码不能为空'); return }
  if (password !== confirmPassword) { ElMessage.warning('两次输入的密码不一致'); return }
  loading.value = true
  try {
    await api.register(username, password)
    ElMessage.success('注册成功，即将跳转登录...')
    setTimeout(() => router.push('/'), 1000)
  } catch { /* 拦截器已处理 */ }
  finally { loading.value = false }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.register-page::before {
  content: '';
  position: absolute;
  width: 550px; height: 550px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,.06) 0%, transparent 70%);
  top: -180px;
  left: -100px;
  animation: float 9s ease-in-out infinite;
  pointer-events: none;
}
.register-page::after {
  content: '';
  position: absolute;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,.05) 0%, transparent 70%);
  bottom: -160px;
  right: -100px;
  animation: float 10s ease-in-out infinite reverse;
  pointer-events: none;
}

.register-box {
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
.register-box:hover {
  transform: translateY(-2px);
  box-shadow:
    0 24px 80px rgba(99,102,241,.1),
    0 12px 32px rgba(0,0,0,.06),
    inset 0 1px 0 rgba(255,255,255,.6);
}

.register-brand { text-align: center; margin-bottom: 40px; }
.register-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #10B981, #34D399);
  color: #fff;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px var(--c-success-glow);
  animation: float 4s ease-in-out infinite;
}
.register-brand__title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  letter-spacing: .02em;
  background: linear-gradient(135deg, #10B981, var(--c-primary), #8B5CF6);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 4s ease infinite;
}
.register-brand__sub {
  font-size: 15px;
  color: var(--c-text-secondary);
  margin: 8px 0 0;
  font-weight: 500;
}
.register-form { display: flex; flex-direction: column; gap: 22px; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.register-submit {
  width: 100%;
  height: 50px;
  font-size: 17px;
  font-weight: 700;
  margin-top: 8px;
  border-radius: 14px !important;
  letter-spacing: .06em;
}
.register-foot { text-align: center; margin-top: 28px; font-size: 14px; color: var(--c-text-secondary); }
.register-foot a {
  color: var(--c-primary);
  font-weight: 700;
  text-decoration: none;
  transition: all .2s var(--ease-out-expo);
}
.register-foot a:hover {
  color: var(--c-primary-dark);
  text-decoration: underline;
}
</style>
