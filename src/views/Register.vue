<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h2 class="register-title">学生注册</h2>
      </template>
      <el-form :model="registerForm" label-width="70px" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" @keyup.enter="handleRegister" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password @keyup.enter="handleRegister" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password @keyup.enter="handleRegister" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="register-btn" :loading="loading" @click="handleRegister">注 册</el-button>
        </el-form-item>
        <el-form-item>
          <span class="login-link">已有账号？<router-link to="/">立即登录</router-link></span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const router = useRouter()
const loading = ref(false)
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  const { username, password, confirmPassword } = registerForm.value
  if (!username || !password) {
    ElMessage.warning('用户名和密码不能为空')
    return
  }
  if (password !== confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    await api.register(username, password)
    ElMessage.success('注册成功，即将跳转到登录页...')
    setTimeout(() => router.push('/'), 1000)
  } catch { /* 拦截器已处理 */ }
  finally { loading.value = false }
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}
.register-card {
  width: 420px;
}
.register-title {
  text-align: center;
  margin: 0;
  color: #67c23a;
}
.register-btn {
  width: 100%;
}
.login-link {
  font-size: 13px;
  color: #909399;
}
.login-link a {
  color: #409eff;
  text-decoration: none;
}
</style>
