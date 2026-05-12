<template>
  <div class="event-detail">
    <van-nav-bar :title="event?.title || '活动详情'" left-arrow @click-left="$router.back()" />

    <div v-if="event" class="detail-content">
      <div class="event-hero">
        <van-tag :type="event.type === 'training' ? 'primary' : 'warning'" size="large">
          {{ event.type === 'training' ? '🏋️ 训练' : '🏆 比赛' }}
        </van-tag>
        <h1>{{ event.title }}</h1>
        <div class="hero-info">
          <div class="info-item">📅 {{ event.date }}</div>
          <div class="info-item">🕐 {{ event.time || '时间待定' }}</div>
          <div class="info-item">📍 {{ event.location || '地点待定' }}</div>
          <div class="info-item">💰 {{ event.fee > 0 ? `¥${event.fee}/人` : '免费' }}</div>
        </div>
      </div>

      <van-cell-group inset title="已报名成员">
        <van-cell v-for="a in event.attendees" :key="a.playerId" :title="a.playerName" />
        <van-empty v-if="!event.attendees?.length" description="暂无报名" />
      </van-cell-group>

      <div class="action-area">
        <van-button v-if="!isSignedUp" round block type="primary" @click="signUp" :loading="loading">
          立即报名
        </van-button>
        <van-button v-else round block plain type="primary" @click="cancelSignUp" :loading="loading">
          取消报名
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getEvent, signUpEvent as apiSignUp, cancelSignUp as apiCancel } from '../api/db'
import { showSuccessToast, showToast } from 'vant'

const route = useRoute()
const userStore = useUserStore()
const { user } = userStore
const event = ref(null)
const loading = ref(false)
const isSignedUp = computed(() => event.value?.attendees?.some(a => a.playerId === (user?._id?.$oid || user?.id)))

onMounted(async () => {
  try {
    event.value = await getEvent(route.params.id)
  } catch (e) { console.error(e) }
})

async function signUp() {
  loading.value = true
  try {
    await apiSignUp(route.params.id, user?._id?.$oid || user?.id, user?.name)
    showSuccessToast('报名成功')
    event.value.attendees.push({ playerId: user?.id, playerName: user?.name })
  } catch (e) { showToast('报名失败') }
  finally { loading.value = false }
}

async function cancelSignUp() {
  loading.value = true
  try {
    await apiCancel(route.params.id, user?._id?.$oid || user?.id)
    showSuccessToast('已取消报名')
    event.value.attendees = event.value.attendees.filter(a => a.playerId !== (user?._id?.$oid || user?.id))
  } catch (e) { showToast('操作失败') }
  finally { loading.value = false }
}
</script>

<style  scoped>
.event-detail { min-height: 100vh; background: #f5f5f5; }
.event-hero { background: linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%); padding: 24px 16px; color: white; h1 { font-size: 24px; margin: 12px 0; } }
.hero-info { display: flex; flex-direction: column; gap: 8px; .info-item { font-size: 15px; opacity: 0.9; } }
.action-area { padding: 24px 16px; }
</style>
