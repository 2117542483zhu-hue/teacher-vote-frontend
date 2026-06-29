<!--
=============================================================================
文件: src/views/Student.vue — 学生端页面（投票 + 公示）
负责人: 人三 (投票核心流程模块)
讲解要点:
  1. 投票 tab — 学生参与投票的核心页面
     - 投票状态判断: 未投票(vote_status=0) 可投 / 已投票(1) 不可投 / 已作废(2) 不可投
     - 候选人卡片墙 — el-card 网格布局 + el-checkbox 多选
     - 投票规则: 每人最多 3 票，超 3 票提交后选票作废
     - submitVote — 调用后端投票接口，成功后更新本地状态
  2. 公示统计 tab — 查看投票结果
     - 排序切换 — 默认排序 / 按票数排序
     - 领奖台展示前三名 🥇🥈🥉
     - 完整排名表格
=============================================================================
-->
<template>
  <div class="student-page">
    <!-- 人三讲解：顶部栏 — 显示用户名 + 退出按钮 -->
    <header class="app-header">
      <div class="app-header__title">🎓 我最喜爱的教师评选</div>
      <div class="app-header__right">
        <span>{{ userInfo.username }}</span>
        <el-button size="small" round @click="handleLogout">退出</el-button>
      </div>
    </header>

    <div class="app-main">
      <el-tabs v-model="activeTab" type="border-card" @tab-change="handleTabChange">

        <!-- ================================================================= -->
        <!-- 人三讲解：Tab 1 — 参与投票（第二阶段）                              -->
        <!-- ================================================================= -->
        <el-tab-pane label="参与投票" name="vote">

          <!-- 人三讲解：已投票状态卡片 — vote_status=1 时展示，用户不可再投票 -->
          <div v-if="userInfo.vote_status === 1" class="state-card fade-in">
            <div class="state-icon state-icon--done">✓</div>
            <h3>你已完成投票</h3>
            <p>投票结果将在公示阶段揭晓</p>
          </div>

          <!-- 人三讲解：选票作废状态卡片 — vote_status=2 时展示（超 3 票） -->
          <div v-else-if="userInfo.vote_status === 2" class="state-card fade-in">
            <div class="state-icon state-icon--void">!</div>
            <h3>选票已作废</h3>
            <p>因勾选超过 3 项，你的选票被系统作废</p>
          </div>

          <!-- 人三讲解：未投票状态 — vote_status=0 时展示投票界面 -->
          <template v-else>
            <!-- 人三讲解：投票规则横幅 — 显示当前已选数量和上限 3 -->
            <div class="vote-banner fade-in">
              <div class="vote-banner__icon">⚡</div>
              <div>
                <strong>投票规则</strong>
                <p>每人最多投 3 票，超过 3 票整张选票将直接作废，请谨慎勾选</p>
              </div>
              <div class="vote-count-badge">
                {{ selectedTeacherIds.length }} <small>/ 3</small>
              </div>
            </div>

            <!-- 人三讲解：候选人卡片网格 — el-card 组件展示候选人信息 -->
            <div class="teacher-card-grid">
              <el-card
                v-for="(t, i) in candidateTeachers" :key="t.id"
                class="vote-teacher-card fade-in"
                :class="'fade-in-' + (i % 3 + 1)"
                shadow="never"
              >
                <div class="vote-card-body">
                  <!-- 人三讲解：el-avatar 头像 — 显示教师照片 -->
                  <el-avatar :src="t.photo_url" :size="48" style="margin-bottom: 12px;" />
                  <h3 class="vote-card-name">{{ t.name }}</h3>
                  <p class="vote-card-info">{{ t.college }}</p>
                  <p class="vote-card-info">{{ t.title }}</p>
                  <div class="vote-card-ft">
                    <!-- 人三讲解：el-checkbox 多选框 — label 绑定教师 ID
                         v-model 数组: 选中时 id 加入数组，取消时移除 -->
                    <el-checkbox
                      :label="t.id"
                      v-model="selectedTeacherIds"
                      @change="handleCheckboxChange"
                      size="large"
                    >
                      <span style="font-weight: 600;">投他一票</span>
                    </el-checkbox>
                  </div>
                </div>
              </el-card>
            </div>

            <!-- 人三讲解：提交投票按钮 — :disabled 禁止空投 -->
            <div class="submit-area fade-in">
              <el-button
                type="primary" size="large" round
                :loading="submitting"
                :disabled="selectedTeacherIds.length === 0"
                @click="submitVote"
              >
                确认提交选票
              </el-button>
            </div>
          </template>
        </el-tab-pane>

        <!-- ================================================================= -->
        <!-- 人三讲解：Tab 2 — 公示与统计（第三阶段）                            -->
        <!-- ================================================================= -->
        <el-tab-pane label="公示与统计" name="result">
          <div class="toolbar">
            <!-- 人三讲解：排序切换按钮 — :type 控制高亮 -->
            <el-button :type="sortMode === false ? 'primary' : 'default'" round @click="loadResults(false)">默认排序</el-button>
            <el-button :type="sortMode === true ? 'primary' : 'default'" round @click="loadResults(true)">按票数排序</el-button>
          </div>

          <!-- 人三讲解：领奖台 — 与管理员端相同，展示得票前三名 -->
          <div class="podium-stage fade-in" v-if="top3.length > 0">
            <div class="podium-block podium-silver" v-if="top3[1]">
              <div class="podium-rank">🥈</div>
              <div class="podium-name">{{ top3[1].name }}</div>
              <div class="podium-votes">{{ top3[1].vote_count }} 票</div>
            </div>
            <div class="podium-block podium-gold" v-if="top3[0]">
              <div class="podium-rank">🥇</div>
              <div class="podium-name">{{ top3[0].name }}</div>
              <div class="podium-votes">{{ top3[0].vote_count }} 票</div>
            </div>
            <div class="podium-block podium-bronze" v-if="top3[2]">
              <div class="podium-rank">🥉</div>
              <div class="podium-name">{{ top3[2].name }}</div>
              <div class="podium-votes">{{ top3[2].vote_count }} 票</div>
            </div>
          </div>
          <el-empty v-else description="暂无投票数据" />

          <!-- 人三讲解：投票结果详细表格 -->
          <el-table :data="resultTeachers" v-loading="resultLoading" stripe>
            <el-table-column type="index" label="#" width="56" />
            <el-table-column prop="name" label="姓名" min-width="120" />
            <el-table-column prop="college" label="学院" min-width="160" />
            <el-table-column prop="vote_count" label="得票数" width="120" align="center">
              <template #default="s">
                <span class="table-votes">{{ s.row.vote_count }} <small>票</small></span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

      </el-tabs>
    </div>
  </div>
</template>

<script setup>
// ===== 导入依赖 =====
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const router = useRouter()
const activeTab = ref('vote')
const sortMode = ref(false)

// ===== 人三讲解：投票相关状态 =====
const userInfo = ref({})              // 用户信息（从 localStorage 读取）
const candidateTeachers = ref([])     // 候选人列表（用于展示投票卡片）
const selectedTeacherIds = ref([])    // 当前勾选的教师 ID 数组（v-model）
const submitting = ref(false)         // 提交中状态

// ===== 人三讲解：结果相关状态 =====
const resultTeachers = ref([])  // 候选人得票数据
const top3 = ref([])            // 得票前三名
const resultLoading = ref(false)

// 人三讲解：加载候选人列表 — 调用 getResults 获取 is_candidate=1 的教师
const loadCandidates = async () => {
  try {
    const res = await api.getResults(false)
    candidateTeachers.value = res.data
  } catch { /* 拦截器已处理 */ }
}

// 人三讲解：勾选变化处理 — 超过 3 项时弹出警告
// 注意：这里只警告，不阻止勾选。真正作废逻辑在后端提交时判断
const handleCheckboxChange = () => {
  if (selectedTeacherIds.value.length > 3) {
    ElMessage.error('已超过 3 项！提交后选票将作废！')
  }
}

// 人三讲解：提交投票 — 核心业务流程
// 1. 弹窗二次确认
// 2. 调用 submitVote 接口
// 3. 根据返回结果更新本地状态（已投票 or 已作废）
// 4. 同步更新 localStorage 中的用户信息
const submitVote = () => {
  ElMessageBox.confirm('投票提交后不可更改，确定提交吗？', '提示', { type: 'info' }).then(async () => {
    submitting.value = true
    try {
      const res = await api.submitVote(userInfo.value.id, selectedTeacherIds.value)
      ElMessage.success(res.message)
      // 人三讲解：根据投票数更新本地状态 — 超 3 票标为作废(2)，否则标为已投票(1)
      userInfo.value.vote_status = selectedTeacherIds.value.length > 3 ? 2 : 1
      // 人三讲解：同步更新 localStorage — 保证路由守卫和页面状态一致
      localStorage.setItem('user', JSON.stringify(userInfo.value))
    } catch { /* 拦截器已处理 */ }
    finally { submitting.value = false }
  }).catch(() => {})
}

// 人三讲解：加载投票结果 — isSort 控制排序方式
const loadResults = async (isSort = false) => {
  sortMode.value = isSort
  resultLoading.value = true
  try {
    const res = await api.getResults(isSort)
    resultTeachers.value = res.data
    // 人三讲解：前端排序取前三名 — 用展开运算符避免修改原数组
    const sorted = [...res.data].sort((a, b) => b.vote_count - a.vote_count)
    top3.value = sorted.slice(0, 3)
  } catch { /* 拦截器已处理 */ }
  finally { resultLoading.value = false }
}

// 人三讲解：Tab 切换 — 切换到公示 tab 时自动加载结果
const handleTabChange = (tabName) => {
  if (tabName === 'result') loadResults(false)
}

// 人三讲解：退出登录
const handleLogout = () => {
  localStorage.clear()
  router.push('/')
}

// 人三讲解：onMounted — 页面加载时读取用户信息并加载候选人列表
onMounted(() => {
  userInfo.value = JSON.parse(localStorage.getItem('user'))
  loadCandidates()
})
</script>

<style scoped>
.student-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 70% 40% at 30% 20%, rgba(99,102,241,.04) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 70% 80%, rgba(139,92,246,.03) 0%, transparent 60%),
    var(--c-bg);
}

/* 人三讲解：投票横幅光泽动画 */
.vote-banner {
  position: relative;
  overflow: hidden;
}
.vote-banner::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 120px;
  height: 200%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent);
  transform: rotate(15deg);
  animation: shimmer 3s ease-in-out infinite;
  pointer-events: none;
}

/* 人三讲解：教师卡片悬停效果 — ::before 渐变遮罩 */
.vote-teacher-card {
  position: relative;
  overflow: hidden;
}
.vote-teacher-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(99,102,241,.03) 0%, transparent 50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity .4s var(--ease-out-expo);
}
.vote-teacher-card:hover::before {
  opacity: 1;
}
.vote-card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 1;
}

/* 人三讲解：提交区域顶部分割线 */
.submit-area {
  position: relative;
}
.submit-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--c-primary-glow), transparent);
}

.state-card {
  position: relative;
  overflow: hidden;
}
.state-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(99,102,241,.02) 0%, transparent 70%);
  pointer-events: none;
}
</style>
