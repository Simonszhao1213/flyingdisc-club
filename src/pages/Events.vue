<template>
  <div class="events-page">
    <div class="tab-header">
      <van-tabs v-model:active="activeTab" shrink>
        <van-tab title="🏋️ 训练" name="training" />
        <van-tab title="🏆 比赛" name="match" />
      </van-tabs>
    </div>

    <div class="event-list">
      <div class="event-card" v-for="event in filteredEvents" :key="event._id.$oid || event._id" @click="$router.push(`/events/${event._id.$oid || event._id}`)">
        <div class="event-top">
          <van-tag :type="event.type === 'training' ? 'primary' : 'warning'" size="medium">
            {{ event.type === 'training' ? '🏋️ 训练' : '🏆 比赛' }}
          </van-tag>
          <span class="event-date">{{ event.date }}</span>
        </div>
        <div class="event-title">{{ event.title }}</div>
        <div class="event-info">
          <span>🕐 {{ event.time || '时间待定' }}</span>
          <span>📍 {{ event.location || '地点待定' }}</span>
        </div>
        <div class="event-footer">
          <span class="event-fee" :class="{ free: !event.fee }">
            {{ event.fee > 0 ? `💰 ¥${event.fee}` : '✅ 免费' }}
          </span>
          <span class="event-attendees">
            {{ event.attendees?.length || 0 }} {{ event.maxAttendees ? `/ ${event.maxAttendees}人` : '人已报名' }}
          </span>
        </div>
      </div>

      <van-empty v-if="filteredEvents.length === 0" :description="activeTab === 'training' ? '暂无训练活动' : '暂无比赛活动'" />
    </div>

    <van-button round type="primary" class="fab" @click="$router.push('/home')" v-if="canPost">
      ➕ 发布活动
    </van-button>
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

<style lang="scss" scoped>
.events-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 80px; }
.tab-header { background: white; padding-top: 12px; }
.event-list { padding: 12px; }
.event-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  .event-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .event-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 8px; }
  .event-info { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #666; margin-bottom: 8px; }
  .event-footer { display: flex; justify-content: space-between; align-items: center; }
  .event-fee { font-size: 15px; font-weight: 600; color: #FF6B35; &.free { color: #07c160; } }
  .event-attendees { font-size: 13px; color: #999; }
}
.fab {
  position: fixed; bottom: 24px; right: 24px;
  width: 56px; height: 56px; border-radius: 28px;
  background: #FF6B35; border: none;
  font-size: 16px; box-shadow: 0 4px 12px rgba(255,107,53,0.4);
}
</style>
