<template>
  <div class="student-container">
    <el-container>
      <el-header class="student-header">
        <span class="header-title">学生投票端 —— 我最喜爱的教师评选</span>
        <div class="header-user">
          <span style="margin-right: 15px;">欢迎你，{{ userInfo.username }}</span>
          <el-button type="info" size="small" @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <el-main>
        <el-tabs v-model="activeTab" type="border-card" @tab-change="handleTabChange">
          <el-tab-pane label="第二阶段：参与投票" name="vote">
            <div v-if="userInfo.vote_status !== 0" class="voted-tip">
              <el-result
                icon="warning"
                title="无法投票"
                :sub-title="userInfo.vote_status === 1 ? '你已经参与过投票，无法更改。' : '你的选票因超过3项已作废！'"
              />
            </div>

            <div v-else>
              <div class="vote-hint">
                <el-alert
                  title="投票规则：请在下方初选出的教师中勾选。每人最多投 3 票，超过 3 票提交后整张选票将直接作废！"
                  type="warning" show-icon :closable="false"
                />
                <p style="margin-top: 10px; font-weight: bold;">
                  当前已勾选：{{ selectedTeacherIds.length }} / 3 票
                </p>
              </div>

              <div class="teacher-grid">
                <el-card v-for="teacher in candidateTeachers" :key="teacher.id" class="teacher-card" :body-style="{ padding: '15px' }">
                  <div class="card-content">
                    <h3 class="teacher-name">{{ teacher.name }}</h3>
                    <p class="teacher-info">学院: {{ teacher.college }}</p>
                    <p class="teacher-info">职称: {{ teacher.title }}</p>
                    <div class="card-footer">
                      <el-checkbox :label="teacher.id" v-model="selectedTeacherIds" @change="handleCheckboxChange">
                        投他一票
                      </el-checkbox>
                    </div>
                  </div>
                </el-card>
              </div>

              <div class="submit-bar">
                <el-button type="primary" size="large" :loading="submitting" @click="submitVote" :disabled="selectedTeacherIds.length === 0">
                  提交选票
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="第三阶段：公示与统计" name="result">
            <div class="result-actions">
              <el-button type="primary" @click="loadResults(false)">默认排序</el-button>
              <el-button type="success" @click="loadResults(true)">按票数高低排序</el-button>
            </div>

            <div class="top3-box" v-if="top3.length > 0">
              <div class="podium medal-2" v-if="top3[1]">
                <div class="medal-title">🥈 第二名</div>
                <div class="medal-name">{{ top3[1].name }}</div>
                <div class="medal-votes">{{ top3[1].vote_count }} 票</div>
              </div>
              <div class="podium medal-1" v-if="top3[0]">
                <div class="medal-title">🥇 第一名</div>
                <div class="medal-name">{{ top3[0].name }}</div>
                <div class="medal-votes">{{ top3[0].vote_count }} 票</div>
              </div>
              <div class="podium medal-3" v-if="top3[2]">
                <div class="medal-title">🥉 第三名</div>
                <div class="medal-name">{{ top3[2].name }}</div>
                <div class="medal-votes">{{ top3[2].vote_count }} 票</div>
              </div>
            </div>

            <el-table :data="resultTeachers" style="width: 100%; margin-top: 20px;" v-loading="resultLoading">
              <el-table-column type="index" label="排名" width="80" />
              <el-table-column prop="name" label="教师姓名" />
              <el-table-column prop="college" label="所属学院" />
              <el-table-column prop="vote_count" label="当前总得票数">
                <template #default="scope">
                  <span style="font-weight: bold; color: #f56c6c;">{{ scope.row.vote_count }} 票</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const router = useRouter()
const activeTab = ref('vote')
const userInfo = ref({})
const candidateTeachers = ref([])
const selectedTeacherIds = ref([])
const resultTeachers = ref([])
const top3 = ref([])
const submitting = ref(false)
const resultLoading = ref(false)

const loadCandidates = async () => {
  try {
    const res = await api.getResults(false)
    candidateTeachers.value = res.data
  } catch { /* 错误已由拦截器处理 */ }
}

const handleCheckboxChange = () => {
  if (selectedTeacherIds.value.length > 3) {
    ElMessage.error('注意：你已勾选超过 3 项！此时提交选票将会被系统直接作废！')
  }
}

const submitVote = () => {
  ElMessageBox.confirm('投票提交后不可更改，确定提交吗？', '提示', { type: 'info' }).then(async () => {
    submitting.value = true
    try {
      const res = await api.submitVote(userInfo.value.id, selectedTeacherIds.value)
      ElMessage.success(res.message)
      userInfo.value.vote_status = selectedTeacherIds.value.length > 3 ? 2 : 1
      localStorage.setItem('user', JSON.stringify(userInfo.value))
    } catch { /* 错误已由拦截器处理 */ }
    finally { submitting.value = false }
  }).catch(() => {})
}

const loadResults = async (isSort = false) => {
  resultLoading.value = true
  try {
    const res = await api.getResults(isSort)
    resultTeachers.value = res.data
    const sorted = [...res.data].sort((a, b) => b.vote_count - a.vote_count)
    top3.value = sorted.slice(0, 3)
  } catch { /* 错误已由拦截器处理 */ }
  finally { resultLoading.value = false }
}

const handleTabChange = (tabName) => {
  if (tabName === 'result') loadResults(false)
}

const handleLogout = () => {
  localStorage.clear()
  router.push('/')
}

onMounted(() => {
  userInfo.value = JSON.parse(localStorage.getItem('user'))
  loadCandidates()
})
</script>

<style scoped>
.student-container { min-height: 100vh; background-color: #f5f7fa; }
.student-header { background-color: #67C23A; color: white; display: flex; justify-content: space-between; align-items: center; }
.header-title { font-size: 18px; font-weight: bold; }
.vote-hint { margin-bottom: 20px; }
.teacher-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
.teacher-card { border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1); }
.teacher-name { margin: 0 0 10px 0; color: #303133; }
.teacher-info { font-size: 14px; color: #606266; margin: 5px 0; }
.card-footer { margin-top: 15px; border-top: 1px solid #f2f6fc; padding-top: 10px; text-align: right; }
.submit-bar { text-align: center; }
.result-actions { margin-bottom: 20px; }
.top3-box { display: flex; justify-content: center; align-items: flex-end; gap: 20px; margin: 30px 0; padding: 20px; background-color: #fafafa; border-radius: 8px; }
.podium { width: 120px; text-align: center; padding: 15px; border-radius: 8px 8px 0 0; color: white; }
.medal-1 { height: 140px; background-color: #e6a23c; font-weight: bold; }
.medal-2 { height: 110px; background-color: #909399; }
.medal-3 { height: 90px; background-color: #cd7f32; }
.medal-title { font-size: 14px; margin-bottom: 5px; }
.medal-name { font-size: 18px; font-weight: bold; }
.voted-tip { padding: 40px 0; }
</style>
