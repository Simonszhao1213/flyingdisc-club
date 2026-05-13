<template>
  <div class="notes-page">
    <div class="page-header">
      <div class="header-glow"></div>
      <h1 class="page-title animate-in">笔记</h1>
    </div>

    <div class="tab-header animate-in delay-1">
      <div class="tab-btn" :class="{ active: activeTab === 'training' }" @click="activeTab = 'training'">
        🏋️ 训练
      </div>
      <div class="tab-btn" :class="{ active: activeTab === 'match' }" @click="activeTab = 'match'">
        🏆 比赛
      </div>
    </div>

    <div class="note-list">
      <div
        class="note-card animate-in"
        v-for="(note, i) in filteredNotes"
        :key="note._id?.$oid || note._id"
        :style="{ animationDelay: `${0.1 + i * 0.05}s` }"
      >
        <div class="note-header">
          <van-tag :type="note.type === 'training' ? 'primary' : 'warning'" size="small" class="note-tag">
            {{ note.type === 'training' ? '🏋️训练' : '🏆比赛' }}
          </van-tag>
          <span class="note-date">{{ note.date }}</span>
        </div>

        <div class="note-rating">
          <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= (note.rating || 3) }">★</span>
          <span class="rating-text">{{ note.rating || 3 }}/5</span>
        </div>

        <div class="note-sections" v-if="note.goodText || note.improveText">
          <div class="note-section good" v-if="note.goodText">
            <div class="section-label">✅ 做得好</div>
            <div class="section-text">{{ note.goodText }}</div>
          </div>
          <div class="note-section improve" v-if="note.improveText">
            <div class="section-label">📝 待改进</div>
            <div class="section-text">{{ note.improveText }}</div>
          </div>
        </div>

        <div class="note-footer" v-if="note.fitnessStatus">
          体能：<span class="fitness-tag">{{ fitnessLabel(note.fitnessStatus) }}</span>
        </div>
      </div>

      <div v-if="filteredNotes.length === 0" class="empty-state">
        <span class="empty-icon">📝</span>
        <span class="empty-text">还没有{{ activeTab === 'training' ? '训练' : '比赛' }}笔记</span>
      </div>
    </div>

    <div class="fab" @click="$router.push('/notes/new')">✍️</div>
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
    notes.value = await getTeamNotes(user?.role, user?.id)
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.notes-page {
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

.note-list {
  padding: 0 20px;
}

.note-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px;
  margin-bottom: 12px;
  transition: border-color 0.2s ease;
}

.note-card:hover {
  border-color: var(--color-border-hover);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.note-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.note-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 14px;
}

.star {
  font-size: 16px;
  color: var(--color-border);
  transition: color 0.2s ease;
}

.star.filled {
  color: var(--color-orange);
}

.rating-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-left: 6px;
  font-weight: 600;
}

.note-sections {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.note-section {
  padding: 12px;
  border-radius: var(--radius-md);
}

.note-section.good {
  background: rgba(52, 211, 153, 0.06);
  border: 1px solid rgba(52, 211, 153, 0.1);
}

.note-section.improve {
  background: rgba(251, 191, 36, 0.06);
  border: 1px solid rgba(251, 191, 36, 0.1);
}

.section-label {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
}

.good .section-label { color: #34d399; }
.improve .section-label { color: #fbbf24; }

.section-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.note-footer {
  margin-top: 12px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.fitness-tag {
  color: var(--color-text-secondary);
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
