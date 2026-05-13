<template>
  <div class="home-page">
    <!-- Bold Hero with Tiger Stripe -->
    <div class="hero-header">
      <!-- Tiger stripe background - aggressive diagonal -->
      <div class="stripe-bg"></div>
      <div class="stripe-accent"></div>

      <!-- Brand mark -->
      <div class="hero-brand animate-in">
        <img src="/logo.png" alt="Black Tigers" class="hero-logo" />
        <div class="brand-text">
          <span class="brand-name">BLACK TIGERS</span>
          <span class="brand-sub">Ultimate Frisbee Club</span>
        </div>
      </div>

      <!-- Greeting -->
      <div class="hero-greeting animate-in delay-1">
        <div class="greeting-left">
          <span class="greeting-salutation">{{ timeWish }}</span>
          <span class="greeting-name">{{ user?.name }}</span>
        </div>
        <div class="role-badge" :class="user?.role">
          <span class="badge-dot"></span>
          {{ roleName }}
        </div>
      </div>
    </div>

    <!-- Page content -->
    <div class="page-content">

      <!-- Pending notice -->
      <div v-if="isAdmin && pendingCount > 0" class="notice-strip animate-in delay-2" @click="$router.push('/admin')">
        <span class="notice-icon">⚡</span>
        <span class="notice-text">{{ pendingCount }} 个注册申请待审批</span>
        <span class="notice-arrow">→</span>
      </div>

      <!-- Quick actions - tight grid -->
      <div class="section animate-in delay-2">
        <div class="section-label">快捷操作</div>
        <div class="action-grid">
          <div class="action-card" @click="$router.push('/notes/new')">
            <span class="action-icon">✍️</span>
            <span class="action-title">写笔记</span>
          </div>
          <div class="action-card" @click="$router.push('/events')">
            <span class="action-icon">🏃</span>
            <span class="action-title">训练报名</span>
          </div>
          <div class="action-card" @click="showPayDialog = true">
            <span class="action-icon">💰</span>
            <span class="action-title">缴费</span>
          </div>
          <div class="action-card" v-if="canPostTraining" @click="showEventForm = true">
            <span class="action-icon">⚡</span>
            <span class="action-title">发布活动</span>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="section animate-in delay-3">
        <div class="section-label">数据概览</div>
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-val">{{ stats.attendRate || 85 }}%</span>
            <span class="stat-key">出勤率</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-val">{{ stats.matchCount || 5 }}</span>
            <span class="stat-key">比赛</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-val">{{ stats.avgRating || 4.2 }}</span>
            <span class="stat-key">评分</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-val">{{ stats.noteCount || 3 }}</span>
            <span class="stat-key">笔记</span>
          </div>
        </div>
      </div>

      <!-- Recent notes -->
      <div class="section animate-in delay-4">
        <div class="section-label-row">
          <span class="section-label">最近笔记</span>
          <span class="section-more" @click="$router.push('/notes')">查看全部 →</span>
        </div>
        <div class="notes-feed">
          <div class="note-item" v-for="(note, i) in recentNotes" :key="note._id?.$oid || note._id" :class="['animate-in', `delay-${i+1}`]" @click="$router.push('/notes')">
            <div class="note-type-dot" :class="note.type"></div>
            <div class="note-body">
              <div class="note-top">
                <span class="note-tag" :class="note.type">{{ note.type === 'training' ? '训练' : '比赛' }}</span>
                <span class="note-date">{{ note.date }}</span>
              </div>
              <div class="note-rating">
                <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= (note.rating || 3) }">★</span>
              </div>
              <p class="note-preview" v-if="note.goodText">{{ note.goodText }}</p>
            </div>
          </div>
          <div v-if="recentNotes.length === 0" class="notes-empty">
            <span class="notes-empty-icon">📝</span>
            <span class="notes-empty-text">还没有笔记，开始记录吧</span>
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
  padding-bottom: 70px;
}

/* ============================================
   HERO - Bold Tiger Identity
   ============================================ */
.hero-header {
  position: relative;
  padding: 72px 20px 24px;
  overflow: hidden;
}

/* Tiger stripe layers */
.stripe-bg {
  position: absolute;
  inset: 0;
  background:
    /* Top-left tiger stripes - aggressive diagonal */
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-10 0 L70 80' stroke='%23FF6B35' stroke-width='18' stroke-opacity='0.12' fill='none'/%3E%3Cpath d='M-10 20 L70 100' stroke='%23FF6B35' stroke-width='12' stroke-opacity='0.09' fill='none'/%3E%3Cpath d='M-10 40 L70 120' stroke='%23FF6B35' stroke-width='10' stroke-opacity='0.07' fill='none'/%3E%3C/svg%3E"),
    /* Radial glow from top */
    radial-gradient(ellipse 100% 60% at 50% -10%, rgba(255,107,53,0.18) 0%, transparent 70%);
  background-size: 60px, 100% 100%;
  background-position: -10px 0, center;
}

.stripe-accent {
  position: absolute;
  top: 0;
  right: -20px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 70%);
  border-radius: 50%;
}

/* Brand */
.hero-brand {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.hero-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 8px;
  filter: drop-shadow(0 0 10px rgba(255,107,53,0.6));
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.brand-sub {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  font-weight: 400;
}

/* Greeting */
.hero-greeting {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.greeting-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.greeting-salutation {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.greeting-name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1;
}

.role-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(255,107,53,0.14);
  border: 1px solid rgba(255,107,53,0.22);
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-orange);
}

.badge-dot {
  width: 5px;
  height: 5px;
  background: var(--color-orange);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ============================================
   CONTENT
   ============================================ */
.page-content {
  padding: 0 16px;
}

/* Notice strip */
.notice-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--color-orange) 0%, var(--color-orange-dark) 100%);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-bottom: 16px;
  cursor: pointer;
  box-shadow: var(--shadow-orange);
}

.notice-icon { font-size: 18px; }
.notice-text { flex: 1; font-size: 13px; font-weight: 700; color: white; }
.notice-arrow { font-size: 14px; color: rgba(255,255,255,0.8); }

/* Section */
.section { margin-bottom: 20px; }

.section-label {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.section-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-more {
  font-size: 12px;
  color: var(--color-orange);
  font-weight: 600;
}

/* ============================================
   ACTION GRID - Tight 4-column
   ============================================ */
.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
}

.action-card:active {
  transform: scale(0.95);
  border-color: rgba(255,107,53,0.3);
  background: rgba(255,107,53,0.06);
}

.action-icon {
  font-size: 22px;
  line-height: 1;
}

.action-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
}

/* ============================================
   STATS ROW - horizontal bar
   ============================================ */
.stats-row {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 8px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-val {
  display: block;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  color: var(--color-orange);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-key {
  font-size: 10px;
  color: var(--color-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: var(--color-border);
}

/* ============================================
   NOTES FEED - Timeline style
   ============================================ */
.notes-feed {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-item {
  display: flex;
  gap: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.note-item:active {
  border-color: var(--color-border-hover);
}

.note-type-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  background: var(--color-orange);
}

.note-type-dot.match {
  background: #fbbf24;
}

.note-body { flex: 1; min-width: 0; }

.note-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.note-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255,107,53,0.12);
  color: var(--color-orange);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.note-tag.match {
  background: rgba(251,191,36,0.12);
  color: #fbbf24;
}

.note-date {
  font-size: 11px;
  color: var(--color-text-muted);
}

.note-rating {
  display: flex;
  gap: 1px;
  margin-bottom: 4px;
}

.star {
  font-size: 12px;
  color: var(--color-border-hover);
}

.star.filled {
  color: var(--color-orange);
}

.note-preview {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notes-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}

.notes-empty-icon { font-size: 20px; }
.notes-empty-text { font-size: 13px; color: var(--color-text-muted); }

/* Dialog */
:deep(.dialog-field) {
  background: var(--color-surface-2) !important;
  border-radius: var(--radius-md) !important;
  margin-bottom: 10px !important;
}

.type-selector { display: flex; gap: 10px; margin-top: 6px; }
.type-btn {
  flex: 1; text-align: center; padding: 10px;
  border-radius: var(--radius-md); font-size: 13px; font-weight: 700;
  background: var(--color-surface-2); border: 1px solid var(--color-border);
  color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s ease;
}
.type-btn.active {
  background: rgba(255,107,53,0.12); border-color: var(--color-orange); color: var(--color-orange);
}
</style>
