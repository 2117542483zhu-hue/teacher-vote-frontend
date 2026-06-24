<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">我最喜爱的教师评选系统</h2>
      </template>
      <el-form :model="loginForm" label-width="70px" @submit.prevent>
        <el-form-item label="账号">
          <el-input v-model="loginForm.username" placeholder="请输入学工号/账号" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">登 录</el-button>
        </el-form-item>
        <el-form-item>
          <span class="register-link">没有账号？<router-link to="/register">立即注册</router-link></span>
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

const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码！')
    return
  }
  loading.value = true
  try {
    const res = await api.login(loginForm.value.username, loginForm.value.password)
    ElMessage.success('登录成功！')
    localStorage.setItem('user', JSON.stringify(res.data))
    if (res.data.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/student')
    }
  } catch {
    // 错误已由拦截器统一处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}
.login-card {
  width: 400px;
}
.login-title {
  text-align: center;
  margin: 0;
  color: #409eff;
}
.login-btn {
  width: 100%;
}
.register-link {
  font-size: 13px;
  color: #909399;
}
.register-link a {
  color: #409eff;
  text-decoration: none;
}
</style>
