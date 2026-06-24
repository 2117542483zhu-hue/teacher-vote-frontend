<template>
  <div class="admin-container">
    <el-container>
      <el-header class="admin-header">
        <span class="header-title">管理后台 —— 我最喜爱的教师评选系统</span>
        <div class="header-user">
          <span style="margin-right: 15px;">管理员：{{ adminInfo.username }}</span>
          <el-button type="info" size="small" @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <el-main>
        <el-tabs v-model="activeTab" type="border-card" @tab-change="handleTabChange">

          <!-- ========== Tab 1: 教师管理 ========== -->
          <el-tab-pane label="教师管理" name="teachers">
            <div class="toolbar">
              <el-input v-model="teacherSearch" placeholder="搜索教师姓名..." clearable style="width: 260px;"
                @clear="loadTeachers" @keyup.enter="loadTeachers" />
              <el-button type="primary" style="margin-left: 10px;" @click="loadTeachers">搜索</el-button>
              <el-button type="success" @click="openTeacherDialog(null)">添加教师</el-button>
            </div>

            <el-table :data="teachers" border stripe style="width: 100%; margin-top: 15px;" v-loading="teacherLoading">
              <el-table-column prop="id" label="ID" width="60" />
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="college" label="所属学院" />
              <el-table-column prop="title" label="职称" width="120" />
              <el-table-column prop="age" label="年龄" width="80" />
              <el-table-column prop="vote_count" label="得票数" width="90" />
              <el-table-column label="照片" width="100">
                <template #default="s">
                  <el-avatar :src="s.row.photo_url" size="small" v-if="s.row.photo_url" />
                  <span v-else>无</span>
                </template>
              </el-table-column>
              <el-table-column label="候选人" width="90">
                <template #default="s">
                  <el-tag :type="s.row.is_candidate ? 'success' : 'info'" size="small">
                    {{ s.row.is_candidate ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="s">
                  <el-button type="primary" size="small" @click="openTeacherDialog(s.row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="deleteTeacher(s.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- ========== Tab 2: 学生管理 ========== -->
          <el-tab-pane label="学生管理" name="students">
            <div class="toolbar">
              <el-input v-model="studentSearch" placeholder="搜索学生用户名..." clearable style="width: 260px;"
                @clear="loadStudents" @keyup.enter="loadStudents" />
              <el-button type="primary" style="margin-left: 10px;" @click="loadStudents">搜索</el-button>
              <el-button type="success" @click="openStudentDialog(null)">添加学生</el-button>
            </div>

            <el-table :data="students" border stripe style="width: 100%; margin-top: 15px;" v-loading="studentLoading">
              <el-table-column prop="id" label="ID" width="60" />
              <el-table-column prop="username" label="用户名" width="150" />
              <el-table-column label="角色" width="100">
                <template #default="s">
                  <el-tag :type="s.row.role === 'admin' ? 'danger' : 'primary'" size="small">{{ s.row.role }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="投票状态" width="120">
                <template #default="s">
                  <template v-if="s.row.role === 'student'">
                    <el-tag v-if="s.row.vote_status === 0" type="info" size="small">未投票</el-tag>
                    <el-tag v-else-if="s.row.vote_status === 1" type="success" size="small">已投票</el-tag>
                    <el-tag v-else type="danger" size="small">已作废</el-tag>
                  </template>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="s">
                  <el-button type="primary" size="small" @click="openStudentDialog(s.row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="deleteStudent(s.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- ========== Tab 3: 第一阶段·推荐候选人 ========== -->
          <el-tab-pane label="第一阶段：推荐候选人" name="recommend">
            <el-alert title="规则：从下方教师列表中勾选候选人（最多 10 名），确认后生成初选名单供学生投票。"
              type="info" show-icon :closable="false" style="margin-bottom: 20px;" />

            <div class="toolbar">
              <span style="font-weight: bold; color: #409eff;">当前已勾选：{{ selectedCandidateIds.length }} / 10 人</span>
              <el-button type="primary" style="margin-left: 20px;" :disabled="selectedCandidateIds.length === 0"
                @click="confirmRecommend">
                确认生成初选名单
              </el-button>
              <el-button @click="loadCandidateTeachers">刷新列表</el-button>
            </div>

            <div class="candidate-grid" v-if="currentCandidates.length > 0">
              <el-card v-for="t in currentCandidates" :key="t.id" class="candidate-card" :body-style="{ padding: '12px' }">
                <div class="card-center">
                  <el-avatar :src="t.photo_url" size="default" style="margin-bottom: 8px;" />
                  <h4 style="margin: 0 0 5px;">{{ t.name }}</h4>
                  <p style="margin: 0; font-size: 13px; color: #606266;">{{ t.college }} · {{ t.title }}</p>
                  <el-tag type="success" size="small" style="margin-top: 6px;">当前候选人</el-tag>
                </div>
              </el-card>
            </div>

            <el-divider />

            <el-table :data="candidateTeacherList" border stripe style="width: 100%;"
              @selection-change="handleCandidateSelectionChange" ref="candidateTableRef" v-loading="candidateLoading">
              <el-table-column type="selection" width="50" />
              <el-table-column prop="id" label="ID" width="60" />
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="college" label="所属学院" />
              <el-table-column prop="title" label="职称" width="120" />
              <el-table-column label="当前是否候选人" width="130">
                <template #default="s">
                  <el-tag :type="s.row.is_candidate ? 'success' : 'info'" size="small">
                    {{ s.row.is_candidate ? '已是候选人' : '未推荐' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- ========== Tab 4: 第三阶段·投票统计 ========== -->
          <el-tab-pane label="第三阶段：投票统计" name="results">
            <div class="toolbar">
              <el-button type="primary" @click="loadAdminResults(false)">默认排序</el-button>
              <el-button type="success" @click="loadAdminResults(true)">按票数高低排序</el-button>
            </div>

            <div class="top3-box" v-if="adminTop3.length > 0">
              <div class="podium medal-2" v-if="adminTop3[1]">
                <div class="medal-title">🥈 第二名</div>
                <div class="medal-name">{{ adminTop3[1].name }}</div>
                <div class="medal-votes">{{ adminTop3[1].vote_count }} 票</div>
              </div>
              <div class="podium medal-1" v-if="adminTop3[0]">
                <div class="medal-title">🥇 第一名</div>
                <div class="medal-name">{{ adminTop3[0].name }}</div>
                <div class="medal-votes">{{ adminTop3[0].vote_count }} 票</div>
              </div>
              <div class="podium medal-3" v-if="adminTop3[2]">
                <div class="medal-title">🥉 第三名</div>
                <div class="medal-name">{{ adminTop3[2].name }}</div>
                <div class="medal-votes">{{ adminTop3[2].vote_count }} 票</div>
              </div>
            </div>

            <el-empty v-else description="暂无投票数据，请先完成候选人推荐和学生投票" />

            <el-table :data="adminResults" border stripe style="width: 100%; margin-top: 20px;" v-loading="resultLoading">
              <el-table-column type="index" label="排名" width="80" />
              <el-table-column prop="name" label="教师姓名" width="150" />
              <el-table-column prop="college" label="所属学院" />
              <el-table-column prop="title" label="职称" width="120" />
              <el-table-column prop="age" label="年龄" width="80" />
              <el-table-column prop="vote_count" label="当前总得票数" width="140">
                <template #default="s">
                  <span style="font-weight: bold; color: #f56c6c;">{{ s.row.vote_count }} 票</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

        </el-tabs>
      </el-main>
    </el-container>

    <!-- 教师弹窗 -->
    <el-dialog v-model="teacherDialogVisible" :title="isEditTeacher ? '编辑教师' : '添加教师'" width="520px">
      <el-form :model="teacherForm" label-width="80px">
        <el-form-item label="姓名" required>
          <el-input v-model="teacherForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="学院">
          <el-input v-model="teacherForm.college" placeholder="请输入所属学院" />
        </el-form-item>
        <el-form-item label="职称">
          <el-input v-model="teacherForm.title" placeholder="请输入职称" />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="teacherForm.age" :min="20" :max="100" />
        </el-form-item>
        <el-form-item label="照片">
          <div style="display: flex; align-items: center; gap: 12px;">
            <el-upload
              :show-file-list="false"
              :http-request="handlePhotoUpload"
              accept="image/*"
            >
              <el-button type="primary" size="small">选择本地照片</el-button>
            </el-upload>
            <el-avatar :src="teacherForm.photo_url || '/uploads/default.jpg'" :size="50" />
            <span v-if="teacherForm.photo_url" style="font-size: 12px; color: #909399; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ teacherForm.photo_url }}
            </span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="teacherDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="teacherSubmitting" @click="submitTeacherForm">确认</el-button>
      </template>
    </el-dialog>

    <!-- 学生弹窗 -->
    <el-dialog v-model="studentDialogVisible" :title="isEditStudent ? '编辑学生' : '添加学生'" width="500px">
      <el-form :model="studentForm" label-width="80px">
        <el-form-item label="用户名" required>
          <el-input v-model="studentForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" :required="!isEditStudent">
          <el-input v-model="studentForm.password" placeholder="请输入密码" show-password />
          <span v-if="isEditStudent" style="font-size: 12px; color: #909399;">留空则不修改密码</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="studentForm.role">
            <el-radio label="student">学生</el-radio>
            <el-radio label="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="studentDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="studentSubmitting" @click="submitStudentForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const router = useRouter()
const activeTab = ref('teachers')
const adminInfo = ref({})

// ---- 教师管理 ----
const teachers = ref([])
const teacherSearch = ref('')
const teacherLoading = ref(false)

// ---- 学生管理 ----
const students = ref([])
const studentSearch = ref('')
const studentLoading = ref(false)

// ---- 推荐候选人 ----
const candidateTeacherList = ref([])
const selectedCandidateIds = ref([])
const currentCandidates = ref([])
const candidateLoading = ref(false)
const candidateTableRef = ref(null)

// ---- 投票统计 ----
const adminResults = ref([])
const adminTop3 = ref([])
const resultLoading = ref(false)

// ---- 教师弹窗 ----
const teacherDialogVisible = ref(false)
const isEditTeacher = ref(false)
const editingTeacherId = ref(null)
const teacherSubmitting = ref(false)
const teacherFormDefault = { name: '', college: '', title: '', age: 30, photo_url: '' }
const teacherForm = reactive({ ...teacherFormDefault })

// 照片上传
const handlePhotoUpload = async ({ file }) => {
  try {
    const res = await api.uploadPhoto(file)
    teacherForm.photo_url = res.data
    ElMessage.success('照片上传成功')
  } catch { /* 拦截器已处理 */ }
}

// ---- 学生弹窗 ----
const studentDialogVisible = ref(false)
const isEditStudent = ref(false)
const editingStudentId = ref(null)
const studentSubmitting = ref(false)
const studentFormDefault = { username: '', password: '', role: 'student' }
const studentForm = reactive({ ...studentFormDefault })

// ==================== 教师 CRUD ====================
const loadTeachers = async () => {
  teacherLoading.value = true
  try {
    const res = await api.getTeachers(teacherSearch.value || undefined)
    teachers.value = res.data
  } catch { /* 拦截器已处理 */ }
  finally { teacherLoading.value = false }
}

const openTeacherDialog = (row) => {
  if (row) {
    isEditTeacher.value = true
    editingTeacherId.value = row.id
    Object.assign(teacherForm, {
      name: row.name,
      college: row.college || '',
      title: row.title || '',
      age: row.age || 30,
      photo_url: row.photo_url || ''
    })
  } else {
    isEditTeacher.value = false
    editingTeacherId.value = null
    Object.assign(teacherForm, teacherFormDefault)
  }
  teacherDialogVisible.value = true
}

const submitTeacherForm = async () => {
  if (!teacherForm.name.trim()) {
    ElMessage.warning('请输入教师姓名')
    return
  }
  teacherSubmitting.value = true
  try {
    const payload = {
      name: teacherForm.name.trim(),
      college: teacherForm.college.trim(),
      title: teacherForm.title.trim(),
      age: teacherForm.age,
      photo_url: teacherForm.photo_url.trim() || '/uploads/default.jpg'
    }
    if (isEditTeacher.value) {
      await api.updateTeacher(editingTeacherId.value, payload)
    } else {
      await api.addTeacher(payload)
    }
    ElMessage.success(isEditTeacher.value ? '修改成功' : '添加成功')
    teacherDialogVisible.value = false
    loadTeachers()
  } catch { /* 拦截器已处理 */ }
  finally { teacherSubmitting.value = false }
}

const deleteTeacher = (id) => {
  ElMessageBox.confirm('确定删除该教师吗？此操作不可恢复。', '警告', { type: 'warning' }).then(async () => {
    try {
      await api.deleteTeacher(id)
      ElMessage.success('删除成功')
      loadTeachers()
    } catch { /* 拦截器已处理 */ }
  }).catch(() => {})
}

// ==================== 学生 CRUD ====================
const loadStudents = async () => {
  studentLoading.value = true
  try {
    const res = await api.getStudents(studentSearch.value || undefined)
    students.value = res.data
  } catch { /* 拦截器已处理 */ }
  finally { studentLoading.value = false }
}

const openStudentDialog = (row) => {
  if (row) {
    isEditStudent.value = true
    editingStudentId.value = row.id
    Object.assign(studentForm, { username: row.username, password: '', role: row.role })
  } else {
    isEditStudent.value = false
    editingStudentId.value = null
    Object.assign(studentForm, studentFormDefault)
  }
  studentDialogVisible.value = true
}

const submitStudentForm = async () => {
  if (!studentForm.username.trim()) { ElMessage.warning('请输入用户名'); return }
  if (!isEditStudent.value && !studentForm.password) { ElMessage.warning('请输入密码'); return }
  studentSubmitting.value = true
  try {
    const payload = {
      username: studentForm.username.trim(),
      password: studentForm.password || '__KEEP_OLD__',
      role: studentForm.role
    }
    if (isEditStudent.value) {
      await api.updateStudent(editingStudentId.value, payload)
    } else {
      await api.addStudent(payload)
    }
    ElMessage.success(isEditStudent.value ? '修改成功' : '添加成功')
    studentDialogVisible.value = false
    loadStudents()
  } catch { /* 拦截器已处理 */ }
  finally { studentSubmitting.value = false }
}

const deleteStudent = (id) => {
  ElMessageBox.confirm('确定删除该学生吗？其投票记录也将一并删除。', '警告', { type: 'warning' }).then(async () => {
    try {
      await api.deleteStudent(id)
      ElMessage.success('删除成功')
      loadStudents()
    } catch { /* 拦截器已处理 */ }
  }).catch(() => {})
}

// ==================== 候选人推荐 ====================
const loadCandidateTeachers = async () => {
  candidateLoading.value = true
  try {
    const res = await api.getTeachers()
    candidateTeacherList.value = res.data
    selectedCandidateIds.value = res.data.filter(t => t.is_candidate === 1).map(t => t.id)
    loadCurrentCandidates()
    await nextTick()
    if (candidateTableRef.value) {
      candidateTeacherList.value.forEach(row => {
        if (row.is_candidate === 1) candidateTableRef.value.toggleRowSelection(row, true)
      })
    }
  } catch { /* 拦截器已处理 */ }
  finally { candidateLoading.value = false }
}

const loadCurrentCandidates = async () => {
  try {
    const res = await api.getResults(false)
    currentCandidates.value = res.data
  } catch { /* ignore */ }
}

const handleCandidateSelectionChange = (rows) => {
  if (rows.length > 10) {
    ElMessage.error('最多只能推荐 10 名候选人！')
    return
  }
  selectedCandidateIds.value = rows.map(r => r.id)
}

const confirmRecommend = () => {
  if (selectedCandidateIds.value.length === 0) { ElMessage.warning('请至少选择 1 名候选人'); return }
  ElMessageBox.confirm(
    `确定将当前勾选的 ${selectedCandidateIds.value.length} 名教师设为初选候选人吗？\n\n此操作将覆盖之前的初选名单。`,
    '确认推荐', { type: 'info' }
  ).then(async () => {
    try {
      await api.recommend(selectedCandidateIds.value)
      ElMessage.success('初选名单生成成功')
      loadCandidateTeachers()
    } catch { /* 拦截器已处理 */ }
  }).catch(() => {})
}

// ==================== 投票统计 ====================
const loadAdminResults = async (sortByVote = false) => {
  resultLoading.value = true
  try {
    const res = await api.getResults(sortByVote)
    adminResults.value = res.data
    const sorted = [...res.data].sort((a, b) => b.vote_count - a.vote_count)
    adminTop3.value = sorted.slice(0, 3)
  } catch { /* 拦截器已处理 */ }
  finally { resultLoading.value = false }
}

// ==================== Tab 切换 ====================
const handleTabChange = (tabName) => {
  const loaders = {
    teachers: loadTeachers,
    students: loadStudents,
    recommend: loadCandidateTeachers,
    results: () => loadAdminResults(false)
  }
  loaders[tabName]?.()
}

// ==================== 退出 ====================
const handleLogout = () => {
  localStorage.clear()
  router.push('/')
}

// ==================== 初始化 ====================
onMounted(() => {
  adminInfo.value = JSON.parse(localStorage.getItem('user'))
  loadTeachers()
})
</script>

<style scoped>
.admin-container { min-height: 100vh; background-color: #f5f7fa; }
.admin-header { background-color: #409eff; color: white; display: flex; justify-content: space-between; align-items: center; height: 56px !important; }
.header-title { font-size: 18px; font-weight: bold; }
.toolbar { display: flex; align-items: center; margin-bottom: 10px; }

.candidate-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; margin-bottom: 15px; }
.candidate-card { border-radius: 8px; border: 2px solid #67c23a; }
.card-center { display: flex; flex-direction: column; align-items: center; text-align: center; }

.top3-box { display: flex; justify-content: center; align-items: flex-end; gap: 20px; margin: 30px 0; padding: 20px; background-color: #fafafa; border-radius: 8px; }
.podium { width: 120px; text-align: center; padding: 15px; border-radius: 8px 8px 0 0; color: white; }
.medal-1 { height: 140px; background-color: #e6a23c; font-weight: bold; }
.medal-2 { height: 110px; background-color: #909399; }
.medal-3 { height: 90px; background-color: #cd7f32; }
.medal-title { font-size: 16px; margin-bottom: 6px; }
.medal-name { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
.medal-votes { font-size: 14px; }
</style>
