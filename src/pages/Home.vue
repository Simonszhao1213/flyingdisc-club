<template>
  <div class="home-page">
    <!-- Hero Header with Bold Brand Identity -->
    <div class="hero-header">
      <div class="hero-stripes"></div>
      <div class="hero-brand animate-in">
        <img src="/logo.png" alt="Black Tigers" class="hero-logo" />
        <div class="hero-brand-text">
          <span class="hero-brand-name">BLACK TIGERS</span>
          <span class="hero-brand-sub">Ultimate Frisbee Club</span>
        </div>
        <div class="hero-emoji">🥏</div>
      </div>
      <div class="greeting animate-in delay-1">
        <div class="greeting-text">
          <span class="time-wish">{{ timeWish }}，</span>
          <span class="user-name">{{ user?.name }}</span>
        </div>
        <div class="role-badge" :class="user?.role">
          <span class="badge-dot"></span>
          {{ roleName }}
        </div>
      </div>
    </div>

    <div class="page-content">
      <!-- Pending notice for admins -->
      <div v-if="isAdmin && pendingCount > 0" class="notice-card animate-in delay-2" @click="$router.push('/admin')">
        <div class="notice-icon">⚡</div>
        <div class="notice-info">
          <div class="notice-title">待审批</div>
          <div class="notice-desc">{{ pendingCount }} 个注册申请</div>
        </div>
        <div class="notice-arrow">→</div>
      </div>

      <!-- Quick actions -->
      <div class="section animate-in delay-2">
        <div class="section-label">今日</div>
        <div class="action-grid">
          <div class="action-card primary animate-in delay-3" @click="$router.push('/notes/new')">
            <div class="card-inner">
              <div class="card-icon">✍️</div>
              <div class="card-content">
                <div class="card-title">写笔记</div>
                <div class="card-desc">记录训练与比赛</div>
              </div>
            </div>
          </div>
          <div class="action-card animate-in delay-3" @click="$router.push('/events')">
            <div class="card-inner">
              <div class="card-icon">🏃</div>
              <div class="card-content">
                <div class="card-title">训练报名</div>
                <div class="card-desc">查看并报名活动</div>
              </div>
            </div>
          </div>
          <div class="action-card animate-in delay-4" @click="showPayDialog = true">
            <div class="card-inner">
              <div class="card-icon">💰</div>
              <div class="card-content">
                <div class="card-title">缴费</div>
                <div class="card-desc">会费与活动费用</div>
              </div>
            </div>
          </div>
          <div class="action-card accent animate-in delay-4" v-if="canPostTraining" @click="showEventForm = true">
            <div class="card-inner">
              <div class="card-icon">⚡</div>
              <div class="card-content">
                <div class="card-title">发布活动</div>
                <div class="card-desc">创建训练或比赛</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="section animate-in delay-5">
        <div class="section-label">我的数据</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.attendRate || 85 }}<span class="stat-unit">%</span></div>
            <div class="stat-label">出勤率</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.matchCount || 5 }}</div>
            <div class="stat-label">本月比赛</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.avgRating || 4.2 }}</div>
            <div class="stat-label">平均评分</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.noteCount || 3 }}</div>
            <div class="stat-label">笔记数</div>
          </div>
        </div>
      </div>

      <!-- Recent notes -->
      <div class="section animate-in delay-6">
        <div class="section-header">
          <div class="section-label">最近笔记</div>
          <span class="section-more" @click="$router.push('/notes')">查看全部 →</span>
        </div>
        <div class="notes-list">
          <div class="note-card" v-for="(note, i) in recentNotes" :key="note._id?.$oid || note._id" :class="['animate-in', `delay-${i + 1}`]" @click="$router.push('/notes')">
            <div class="note-header">
              <van-tag :type="note.type === 'training' ? 'primary' : 'warning'" size="small">
                {{ note.type === 'training' ? '训练' : '比赛' }}
              </van-tag>
              <span class="note-date">{{ note.date }}</span>
            </div>
            <div class="note-rating">
              <span v-for="n in (note.rating || 3)" :key="n" class="star filled">★</span>
            </div>
            <p class="note-text" v-if="note.goodText">{{ note.goodText }}</p>
          </div>
          <div v-if="recentNotes.length === 0" class="empty-state">
            <span class="empty-icon">📝</span>
            <span class="empty-text">还没有笔记，开始记录吧</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Publish event dialog -->
    <van-dialog v-model:show="showEventForm" title="发布活动" show-cancel-button confirm-button-text="发布" @confirm="createEvent">
      <div style="padding: 8px 16px 24px">
        <van-field v-model="eventForm.title" label="标题" placeholder="如：周三晚训练" class="dialog-field" />
        <van-field v-model="eventForm.date" label="日期" @click="showDatePicker = true" readonly class="dialog-field" />
        <van-field v-model="eventForm.time" label="时间" placeholder="如：19:00-21:00" class="dialog-field" />
        <van-field v-model="eventForm.location" label="地点" placeholder="如：KCC足球场" class="dialog-field" />
        <van-field v-model="eventForm.fee" label="费用" type="number" placeholder="0表示免费" class="dialog-field" />
        <div class="type-selector">
          <div class="type-btn" :class="{ active: eventForm.type === 'training' }" @click="eventForm.type = 'training'">🏃 训练</div>
          <div class="type-btn" :class="{ active: eventForm.type === 'match' }" @click="eventForm.type = 'match'">🔥 比赛</div>
        </div>
      </div>
    </van-dialog>

    <van-action-sheet v-model:show="showDatePicker" position="bottom">
      <van-date-picker v-model="eventForm.dateVal" @confirm="eventForm.date = eventForm.dateVal.join('-'); showDatePicker = false" @cancel="showDatePicker = false" />
    </van-action-sheet>

    <van-dialog v-model:show="showPayDialog" title="待缴费" :show-cancel-button="false" :show-confirm-button="false">
      <div style="padding: 24px; text-align: center">
        <div style="font-size: 48px; margin-bottom: 12px">💰</div>
        <div style="color: var(--color-text-secondary); font-size: 14px">暂无待缴费项目</div>
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
const showDatePicker = ref(false)
const showPayDialog = ref(false)
const eventForm = ref({ type: 'training', title: '', date: '', time: '', location: '', fee: 0, dateVal: [] })

const isAdmin = computed(() => ['captain', 'training_admin', 'match_admin', 'trial_admin'].includes(user?.role))
const canPostTraining = computed(() => ['captain', 'training_admin'].includes(user?.role))
const roleName = computed(() => ({
  captain: '队长', training_admin: '训练负责人', match_admin: '比赛负责人',
  trial_admin: '试训负责人', member: '正式队员', trial_member: '试训队员'
})[user?.role] || '队员')

const timeWish = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

onMounted(async () => {
  try {
    const notes = await getTeamNotes(user?.role, user?.id)
    recentNotes.value = notes.slice(0, 3)
    if (notes.length > 0) {
      stats.value.avgRating = (notes.reduce((s, n) => s + (n.rating || 0), 0) / notes.length).toFixed(1)
      stats.value.noteCount = notes.length
    }
  } catch (e) { console.error(e) }
})

async function createEvent() {
  try {
    await apiCreateEvent(eventForm.value)
    showToast('活动发布成功')
    eventForm.value = { type: 'training', title: '', date: '', time: '', location: '', fee: 0, dateVal: [] }
  } catch (e) { showToast('发布失败') }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 100px;
}

/* Hero Header */
.hero-header {
  position: relative;
  padding: 80px 20px 36px;
  background: linear-gradient(
    180deg,
    rgba(255, 107, 53, 0.16) 0%,
    rgba(255, 107, 53, 0.05) 45%,
    transparent 100%
  );
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
}

.hero-stripes {
  position: absolute;
  inset: 0;
  background:
    url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-10 0 L90 100' stroke='%23FF6B35' stroke-width='16' stroke-opacity='0.08' fill='none'/%3E%3Cpath d='M-10 30 L90 130' stroke='%23FF6B35' stroke-width='10' stroke-opacity='0.07' fill='none'/%3E%3Cpath d='M-10 60 L90 160' stroke='%23FF6B35' stroke-width='12' stroke-opacity='0.05' fill='none'/%3E%3C/svg%3E");
  background-size: 80px 80px;
  pointer-events: none;
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  position: relative;
  z-index: 1;
}

.hero-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 12px;
  filter: drop-shadow(0 0 14px rgba(255, 107, 53, 0.7));
}

.hero-brand-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hero-brand-name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.hero-brand-sub {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.hero-emoji {
  margin-left: auto;
  font-size: 30px;
  opacity: 0.5;
}

.greeting {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}

.greeting-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-wish {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.user-name {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.1;
}

.role-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(255, 107, 53, 0.12);
  border: 1px solid rgba(255, 107, 53, 0.22);
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-orange);
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--color-orange);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.page-content {
  max-width: 440px;
  margin: 0 auto;
  padding: 0 20px;
}

.section { margin-bottom: 28px; }

.section-label {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
  padding-left: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-more {
  font-size: 13px;
  color: var(--color-orange);
  font-weight: 600;
}

/* Notice card */
.notice-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, var(--color-orange) 0%, var(--color-orange-dark) 100%);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  margin-bottom: 20px;
  cursor: pointer;
  box-shadow: var(--shadow-orange);
  transition: transform 0.2s var(--ease-spring);
}
.notice-card:active { transform: scale(0.98); }
.notice-icon { font-size: 28px; }
.notice-info { flex: 1; }
.notice-title { font-family: var(--font-display); font-size: 15px; font-weight: 800; color: white; }
.notice-desc { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 2px; }
.notice-arrow { font-size: 18px; color: rgba(255,255,255,0.8); }

/* Action grid */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.action-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
}
.action-card:active { transform: scale(0.97); border-color: var(--color-border-hover); }
.action-card.primary {
  background: linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0.04) 100%);
  border-color: rgba(255,107,53,0.22);
}
.action-card.accent {
  background: rgba(255,107,53,0.07);
  border-color: rgba(255,107,53,0.12);
}

.card-inner { display: flex; align-items: flex-start; gap: 12px; }
.card-icon { font-size: 24px; line-height: 1; margin-top: 2px; }
.card-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--color-text); margin-bottom: 4px; }
.card-desc { font-size: 12px; color: var(--color-text-muted); }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px 6px;
  text-align: center;
  transition: border-color 0.2s ease;
}
.stat-card:hover { border-color: var(--color-border-hover); }
.stat-value { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--color-orange); line-height: 1; margin-bottom: 6px; }
.stat-unit { font-size: 14px; }
.stat-label { font-size: 11px; color: var(--color-text-muted); font-weight: 500; }

/* Notes */
.note-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.note-card:active { transform: scale(0.99); border-color: var(--color-border-hover); }
.note-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.note-date { font-size: 12px; color: var(--color-text-muted); }
.note-rating { display: flex; gap: 2px; margin-bottom: 8px; }
.star { font-size: 14px; }
.star.filled { color: var(--color-orange); }
.note-text { font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

/* Empty state */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 0; }
.empty-icon { font-size: 48px; opacity: 0.35; }
.empty-text { font-size: 14px; color: var(--color-text-muted); }

/* Dialog */
:deep(.dialog-field) { background: var(--color-surface-2) !important; border-radius: var(--radius-md) !important; margin-bottom: 12px !important; }
.type-selector { display: flex; gap: 12px; margin-top: 8px; }
.type-btn {
  flex: 1; text-align: center; padding: 12px; border-radius: var(--radius-md);
  font-size: 14px; font-weight: 700; background: var(--color-surface-2);
  border: 1px solid var(--color-border); color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s ease;
}
.type-btn.active { background: rgba(255,107,53,0.12); border-color: var(--color-orange); color: var(--color-orange); }
</style>
