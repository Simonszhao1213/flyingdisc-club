<template>
  <div class="events-page">
    <div class="page-header">
      <div class="header-glow"></div>
      <h1 class="page-title animate-in">活动</h1>
    </div>

    <div class="tab-header animate-in delay-1">
      <div class="tab-btn" :class="{ active: activeTab === 'training' }" @click="activeTab = 'training'">
        🏋️ 训练
      </div>
      <div class="tab-btn" :class="{ active: activeTab === 'match' }" @click="activeTab = 'match'">
        🏆 比赛
      </div>
    </div>

    <div class="event-list">
      <div
        class="event-card animate-in"
        v-for="(event, i) in filteredEvents"
        :key="event._id?.$oid || event._id"
        :style="{ animationDelay: `${0.1 + i * 0.05}s` }"
        @click="$router.push(`/events/${event.id || event._id}`)"
      >
        <div class="event-card-inner">
          <div class="event-top">
            <div class="event-type" :class="event.type">
              {{ event.type === 'training' ? '🏋️训练' : '🔥比赛' }}
            </div>
            <span class="event-date">{{ event.date }}</span>
          </div>

          <div class="event-title">{{ event.title }}</div>

          <div class="event-details">
            <div class="detail-row" v-if="event.time">
              <span class="detail-icon">🕐</span>
              <span>{{ event.time }}</span>
            </div>
            <div class="detail-row" v-if="event.location">
              <span class="detail-icon">📍</span>
              <span>{{ event.location }}</span>
            </div>
          </div>

          <div class="event-footer">
            <div class="event-fee" :class="{ free: !event.fee }">
              {{ event.fee > 0 ? `💰 ¥${event.fee}` : '✅ 免费报名' }}
            </div>
            <div class="event-attendees">
              <span class="attendee-count">{{ event.attendees?.length || 0 }}</span>
              <span class="attendee-text">人已报名</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredEvents.length === 0" class="empty-state">
        <span class="empty-icon">🏃</span>
        <span class="empty-text">暂无{{ activeTab === 'training' ? '训练' : '比赛' }}活动</span>
      </div>
    </div>

    <div class="fab" v-if="canPost" @click="$router.push('/home')">
      ⚡
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { getEvents } from '../api/db'

const userStore = useUserStore()
const { user } = userStore
const activeTab = ref('training')
const events = ref([])
const canPost = computed(() => ['captain', 'training_admin', 'match_admin'].includes(user?.role))
const filteredEvents = computed(() => events.value.filter(e => e.type === activeTab.value))

onMounted(async () => {
  try {
    events.value = await getEvents()
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.events-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 100px;
}

.page-header {
  position: relative;
  padding: 48px 20px 20px;
  overflow: hidden;
}

.header-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%);
  border-radius: 50%;
}

.page-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  position: relative;
  z-index: 1;
}

.tab-header {
  display: flex;
  gap: 10px;
  padding: 0 20px;
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: rgba(255, 107, 53, 0.12);
  border-color: var(--color-orange);
  color: var(--color-orange);
}

.event-list {
  padding: 0 20px;
}

.event-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.event-card:active {
  transform: scale(0.99);
  border-color: var(--color-border-hover);
}

.event-card-inner {
  padding: 18px;
}

.event-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.event-type {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  background: rgba(255, 107, 53, 0.1);
  color: var(--color-orange);
  border: 1px solid rgba(255, 107, 53, 0.15);
}

.event-type.match {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.15);
}

.event-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.event-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 12px;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.detail-icon {
  font-size: 14px;
}

.event-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.event-fee {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-orange);
}

.event-fee.free {
  color: #34d399;
}

.event-attendees {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.attendee-count {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text);
}

.attendee-text {
  font-size: 12px;
  color: var(--color-text-muted);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
}

.empty-icon { font-size: 48px; opacity: 0.4; }
.empty-text { font-size: 14px; color: var(--color-text-muted); }

.fab {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background: linear-gradient(135deg, var(--color-orange) 0%, var(--color-orange-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: var(--shadow-orange);
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s var(--ease-spring);
}

.fab:active {
  transform: scale(0.93);
}
</style>
