<template>
  <div class="notes-page">
    <div class="tab-header">
      <van-tabs v-model:active="activeTab" shrink>
        <van-tab title="训练笔记" name="training" />
        <van-tab title="比赛笔记" name="match" />
      </van-tabs>
    </div>

    <div class="note-list">
      <div class="note-card" v-for="note in filteredNotes" :key="note._id.$oid || note._id">
        <div class="note-meta">
          <van-tag :type="note.type === 'training' ? 'primary' : 'warning'" size="small">
            {{ note.type === 'training' ? '🏋️训练' : '🏆比赛' }}
          </van-tag>
          <span class="note-date">{{ note.date }}</span>
          <span class="note-position">{{ note.position }}</span>
        </div>
        <div class="note-rating">⭐ {{ note.rating || 3 }} / 5</div>
        <div class="note-section" v-if="note.goodText">
          <div class="section-label">✅ 做得好</div>
          <div class="section-text">{{ note.goodText }}</div>
        </div>
        <div class="note-section" v-if="note.improveText">
          <div class="section-label">📝 待改进</div>
          <div class="section-text">{{ note.improveText }}</div>
        </div>
        <div class="note-fitness">
          体能状态：<span :class="note.fitnessStatus">{{ fitnessLabel(note.fitnessStatus) }}</span>
        </div>
      </div>

      <van-empty v-if="filteredNotes.length === 0" :description="activeTab === 'training' ? '暂无训练笔记' : '暂无比赛笔记'" />
    </div>

    <van-button round type="primary" class="fab" @click="$router.push('/notes/new')">
      ✍️ 写笔记
    </van-button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { getTeamNotes } from '../api/db'

const userStore = useUserStore()
const { user } = userStore
const activeTab = ref('training')
const notes = ref([])

const filteredNotes = computed(() => notes.value.filter(n => n.type === activeTab.value))

function fitnessLabel(s) {
  return { good: '💪 良好', normal: '😊 一般', tired: '😓 疲惫' }[s] || s
}

onMounted(async () => {
  try {
    notes.value = await getTeamNotes(user?.role, user?._id?.$oid || user?.id)
  } catch (e) {
    console.error(e)
  }
})
</script>

<style  scoped>
.notes-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
  .tab-header { background: white; padding-top: 12px; }
  .note-list { padding: 12px; }
  .note-card {
    background: white;
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 10px;
    .note-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      .note-date { font-size: 13px; color: #999; margin-left: auto; }
      .note-position { font-size: 12px; color: #888; background: #f5f5f5; padding: 2px 8px; border-radius: 4px; }
    }
    .note-rating { font-size: 15px; color: #FF6B35; font-weight: 600; margin-bottom: 8px; }
    .note-section { margin-bottom: 8px; }
    .section-label { font-size: 13px; font-weight: 500; color: #333; margin-bottom: 2px; }
    .section-text { font-size: 13px; color: #666; line-height: 1.5; }
    .note-fitness { font-size: 12px; color: #999; margin-top: 8px; }
    .note-fitness .good { color: #07c160; }
    .note-fitness .normal { color: #FF976A; }
    .note-fitness .tired { color: #999; }
  }
  .fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background: #FF6B35;
    border: none;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(255,107,53,0.4);
  }
}
</style>
