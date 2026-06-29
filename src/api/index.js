// =============================================================================
// 文件: src/api/index.js — Axios 封装与 API 接口定义
// 负责人: 人一 (Axios 实例化 + 拦截器)
//        人二 (教师/学生/上传相关 API 方法)
//        人三 (推荐/投票/结果/重置相关 API 方法)
// 讲解要点:
//   1. axios.create — 创建独立实例，配置全局超时
//   2. 响应拦截器 — 统一解包 { code, message, data } 格式
//      - code=200 → 自动返回 body（业务数据）
//      - 其他 → 弹出错误提示
//   3. 错误拦截器 — 网络异常统一处理
//   4. 各 API 方法 — 每个方法对应后端一个路由
// =============================================================================

import axios from 'axios'
import { ElMessage } from 'element-plus'

// ---------------------------------------------------------------------------
// 人一讲解：创建 Axios 实例
// ---------------------------------------------------------------------------
// axios.create() 创建一个独立的 HTTP 客户端实例，可以配置全局默认参数
// timeout: 10000 表示 10 秒超时 — 超时未响应则触发错误拦截器
const http = axios.create({
  timeout: 10000
})

// ---------------------------------------------------------------------------
// 人一讲解：响应拦截器（核心机制）
// ---------------------------------------------------------------------------
// 作用：后端返回的每个响应都会先经过这里，统一处理后再交给业务代码
// 好处：业务代码只需要关心成功情况，错误统一在拦截器中弹窗提示
http.interceptors.response.use(
  // 人一讲解：成功回调 — HTTP 状态码 2xx 时触发
  (res) => {
    const body = res.data  // 取响应体
    // 人一讲解：后端统一格式 { code: 200, message: "...", data: {...} }
    // code=200 表示业务成功，直接返回整个 body
    // 业务代码用 const res = await api.login(...) 拿到 { code, message, data }
    if (body.code === 200) return body
    // 人一讲解：code 不是 200，弹出错误消息
    // detail 是 FastAPI HTTPException 的错误详情，message 是自定义错误信息
    ElMessage.error(body.detail || body.message || '请求失败')
    return Promise.reject(new Error(body.detail || body.message))
  },
  // 人一讲解：失败回调 — 网络错误、超时、500 等 HTTP 异常时触发
  (err) => {
    const msg = err.response?.data?.detail || '网络异常，请稍后重试'
    ElMessage.error(msg)
    return Promise.reject(err)
  }
)

// =============================================================================
// API 方法集合
// 人一讲解: login, register
// 人二讲解: getTeachers, addTeacher, updateTeacher, deleteTeacher,
//           getStudents, addStudent, updateStudent, deleteStudent, uploadPhoto
// 人三讲解: recommend, submitVote, getResults, resetSystem
// =============================================================================

const api = {
  // ===== 人一讲解：登录 & 注册 =====

  // POST /api/login — 传入用户名密码，返回用户信息（id/role/vote_status）
  login: (username, password) => http.post('/api/login', { username, password }),

  // POST /api/register — 传入用户名密码，注册学生账号
  register: (username, password) => http.post('/api/register', { username, password }),

  // ===== 人二讲解：教师 CRUD =====

  // GET /api/teachers — 获取教师列表，可选 ?name=关键词 模糊搜索
  getTeachers: (name) => http.get('/api/teachers', { params: name ? { name } : {} }),

  // POST /api/teachers — 添加教师，data 包含 name/college/title/age/photo_url
  addTeacher: (data) => http.post('/api/teachers', data),

  // PUT /api/teachers/:id — 编辑教师信息
  updateTeacher: (id, data) => http.put(`/api/teachers/${id}`, data),

  // DELETE /api/teachers/:id — 删除教师
  deleteTeacher: (id) => http.delete(`/api/teachers/${id}`),

  // ===== 人二讲解：学生 CRUD =====

  // GET /api/students — 获取学生列表，可选 ?username=关键词
  getStudents: (username) => http.get('/api/students', { params: username ? { username } : {} }),

  // POST /api/students — 管理员手动添加学生
  addStudent: (data) => http.post('/api/students', data),

  // PUT /api/students/:id — 编辑学生信息（密码留空则不修改）
  updateStudent: (id, data) => http.put(`/api/students/${id}`, data),

  // DELETE /api/students/:id — 删除学生（含投票记录回退）
  deleteStudent: (id) => http.delete(`/api/students/${id}`),

  // ===== 人三讲解：候选人推荐 =====

  // POST /api/admin/recommend — 管理员设置候选人名单（最多 10 人）
  recommend: (teacher_ids) => http.post('/api/admin/recommend', { teacher_ids }),

  // ===== 人三讲解：学生投票 =====

  // POST /api/student/vote — 学生提交投票（最多 3 人，超 3 票作废）
  submitVote: (student_id, teacher_ids) =>
    http.post('/api/student/vote', { student_id, teacher_ids }),

  // ===== 人三讲解：投票结果 =====

  // GET /api/vote/result — 获取候选人投票结果，sortByVote 控制排序
  getResults: (sortByVote = false) =>
    http.get('/api/vote/result', { params: { sort_by_vote: sortByVote } }),

  // ===== 人二讲解：照片上传 =====

  // POST /api/upload — 上传照片，FormData 格式
  uploadPhoto: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }  // 文件上传必须用 multipart
    })
  },

  // ===== 人三讲解：系统重置 =====

  // POST /api/admin/reset — 一键重置投票系统（不可逆）
  resetSystem: () => http.post('/api/admin/reset'),
}

export default api
