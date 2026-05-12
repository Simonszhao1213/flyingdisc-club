<template>
  <div class="home-page">
    <div class="page-container">
      <div class="header">
        <div class="greeting">
          <span class="time-wish">{{ timeWish }}，{{ user?.name }}</span>
          <span class="role-tag" :class="user?.role">{{ roleName }}</span>
        </div>
      </div>

      <!-- 队长待审核提示 -->
      <van-notice-bar v-if="isAdmin && pendingCount > 0" color="#fff" background="#FF6B35" @click="$router.push('/admin')" class="notice-bar">
        您有 {{ pendingCount }} 个新注册申请待审批 →
      </van-notice-bar>

      <!-- 今日快捷 -->
      <div class="quick-actions">
        <div class="section-title">今日</div>
        <div class="action-cards">
          <div class="action-card primary" @click="$router.push('/notes/new')">
            <div class="card-icon">✍️</div>
            <div class="card-label">写笔记</div>
          </div>
          <div class="action-card" @click="$router.push('/events')">
            <div class="card-icon">🏃</div>
            <div class="card-label">训练报名</div>
          </div>
          <div class="action-card" @click="showPayDialog = true">
            <div class="card-icon">💰</div>
            <div class="card-label">缴费</div>
          </div>
          <div class="action-card accent" v-if="canPostTraining" @click="showEventForm = true">
            <div class="card-icon">➕</div>
            <div class="card-label">发布活动</div>
          </div>
        </div>
      </div>

      <!-- 数据看板 -->
      <div class="stats-panel">
        <div class="section-title">我的数据</div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats.attendRate || 85 }}%</div>
            <div class="stat-label">出勤率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.matchCount || 5 }}</div>
            <div class="stat-label">本月比赛</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.avgRating || 4.2 }}</div>
            <div class="stat-label">平均评分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.noteCount || 3 }}</div>
            <div class="stat-label">笔记数</div>
          </div>
        </div>
      </div>

      <!-- 最近笔记 -->
      <div class="recent-notes">
        <div class="section-title">
          最近笔记
          <span class="more" @click="$router.push('/notes')">查看全部 →</span>
        </div>
        <div class="note-list">
          <div class="note-card" v-for="note in recentNotes" :key="note._id?.$oid || note._id" @click="$router.push('/notes')">
            <div class="note-header">
              <van-tag :type="note.type === 'training' ? 'primary' : 'warning'" size="small">
                {{ note.type === 'training' ? '训练' : '比赛' }}
              </van-tag>
              <span class="note-date">{{ note.date }}</span>
            </div>
            <div class="note-rating">评分：{{ '⭐'.repeat(note.rating || 3) }}</div>
            <div class="note-text" v-if="note.goodText">{{ note.goodText }}</div>
          </div>
          <van-empty v-if="recentNotes.length === 0" description="暂无笔记" />
        </div>
      </div>
    </div>

    <!-- 发布活动弹窗 -->
    <van-dialog v-model:show="showEventForm" title="发布活动" show-cancel-button @confirm="createEvent">
      <van-form style="padding: 16px">
        <van-field v-model="eventForm.type" label="类型" readonly @click="showTypePicker = true" />
        <van-field v-model="eventForm.title" label="标题" placeholder="如：周三晚训练" />
        <van-field v-model="eventForm.date" label="日期" @click="showDatePicker = true" />
        <van-field v-model="eventForm.time" label="时间" placeholder="如：19:00-21:00" />
        <van-field v-model="eventForm.location" label="地点" placeholder="如：KCC足球场" />
        <van-field v-model="eventForm.fee" label="费用" type="number" placeholder="0表示免费" />
      </van-form>
    </van-dialog>

    <van-action-sheet v-model:show="showTypePicker" :actions="[{ name: '训练', value: 'training' }, { name: '比赛', value: 'match' }]" @select="eventForm.type = $event.value; showTypePicker = false" />
    <van-popup v-model:show="showDatePicker" position="bottom"><van-date-picker v-model="eventForm.dateVal" @confirm="eventForm.date = eventForm.dateVal.join('-'); showDatePicker = false" /></van-popup>

    <van-dialog v-model:show="showPayDialog" title="待缴费项目" :show-cancel-button="false" :show-confirm-button="false">
      <div style="padding: 16px">
        <van-empty description="暂无待缴费项目" />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { getTeamNotes, createEvent as apiCreateEvent } from '../api/db'
import { showToast } from 'vant'

const userStore = useUserStore()
const { user } = userStore

const pendingCount = ref(0)
const recentNotes = ref([])
const stats = ref({})
const showEventForm = ref(false)
const showTypePicker = ref(false)
const showDatePicker = ref(false)
const showPayDialog = ref(false)
const eventForm = ref({ type: 'training', title: '', date: '', time: '', location: '', fee: 0, dateVal: [] })

const isAdmin = computed(() => ['captain', 'training_admin', 'match_admin', 'trial_admin'].includes(user?.role))
const canPostTraining = computed(() => ['captain', 'training_admin'].includes(user?.role))
const roleName = computed(() => ({ captain: '队长', training_admin: '训练负责人', match_admin: '比赛负责人', trial_admin: '试训负责人', member: '正式队员', trial_member: '试训队员' })[user?.role] || '队员')

const timeWish = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

onMounted(async () => {
  try {
    const notes = await getTeamNotes(user?.role, user?._id?.$oid || user?.id)
    recentNotes.value = notes.slice(0, 3)
    if (notes.length > 0) {
      stats.value.avgRating = (notes.reduce((s, n) => s + (n.rating || 0), 0) / notes.length).toFixed(1)
      stats.value.noteCount = notes.length
    }
  } catch (e) {
    console.error(e)
  }
})

async function createEvent() {
  try {
    await apiCreateEvent(eventForm.value)
    showToast('活动发布成功')
    eventForm.value = { type: 'training', title: '', date: '', time: '', location: '', fee: 0, dateVal: [] }
  } catch (e) {
    showToast('发布失败')
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}
.page-container {
  max-width: 480px;
  margin: 0 auto;
}
.header {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%);
  padding: 24px 16px 48px;
}
.greeting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 448px;
  margin: 0 auto;
}
.time-wish {
  color: white;
  font-size: 20px;
  font-weight: 600;
}
.role-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  background: rgba(255,255,255,0.25);
  color: white;
}
.notice-bar {
  max-width: 448px;
  margin: -32px auto 0;
  border-radius: 12px 12px 0 0;
}
.quick-actions,
.stats-panel,
.recent-notes {
  max-width: 448px;
  margin-left: auto;
  margin-right: auto;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 12px;
  padding: 0 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-title .more {
  font-size: 13px;
  color: #999;
  font-weight: 400;
}
.action-cards {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 12px;
  background: #FFF7F5;
  cursor: pointer;
  min-height: 80px;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.action-card:active {
  transform: scale(0.95);
}
.action-card.primary {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%);
}
.action-card.primary .card-label {
  color: white;
}
.action-card.accent {
  background: #E8F4FF;
}
.action-card.accent .card-label {
  color: #1989FA;
}
.card-icon {
  font-size: 28px;
}
.card-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}
.stats-panel .stats-grid {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  text-align: center;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #FF6B35;
}
.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.recent-notes .note-list {
  padding: 0 4px;
}
.note-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
}
.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.note-date {
  font-size: 13px;
  color: #999;
}
.note-rating {
  font-size: 13px;
  color: #FF6B35;
  margin-bottom: 4px;
}
.note-text {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
