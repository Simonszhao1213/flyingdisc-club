<template>
  <div class="note-form-page">
    <div class="page-header">
      <div class="back-btn" @click="$router.back()">←</div>
      <h1 class="page-title animate-in">写笔记</h1>
    </div>

    <div class="form-content animate-in delay-1">
      <!-- Type selector -->
      <div class="type-selector">
        <div class="type-btn" :class="{ active: form.type === 'training' }" @click="form.type = 'training'">
          🏋️ 训练
        </div>
        <div class="type-btn" :class="{ active: form.type === 'match' }" @click="form.type = 'match'">
          🏆 比赛
        </div>
      </div>

      <!-- Date -->
      <div class="input-group">
        <div class="input-label">日期</div>
        <div class="date-btn" @click="showDatePicker = true">
          <span class="date-icon">📅</span>
          <span class="date-text">{{ form.date }}</span>
        </div>
      </div>

      <!-- Rating -->
      <div class="input-group">
        <div class="input-label">自我评分</div>
        <div class="rating-area">
          <van-rate v-model="form.rating" allow-half color="#FF6B35" :count="5" size="28" />
          <span class="rating-text">{{ form.rating }} / 5</span>
        </div>
      </div>

      <!-- Position -->
      <div class="input-group">
        <div class="input-label">场上位置</div>
        <div class="option-row">
          <div class="option-btn" :class="{ active: form.position === 'handler' }" @click="form.position = 'handler'">
            🎯 Handler
          </div>
          <div class="option-btn" :class="{ active: form.position === 'cutter' }" @click="form.position = 'cutter'">
            🏃 Cutter
          </div>
          <div class="option-btn" :class="{ active: form.position === 'mixed' }" @click="form.position = 'mixed'">
            🔄 通用
          </div>
        </div>
      </div>

      <!-- Fitness -->
      <div class="input-group">
        <div class="input-label">体能状态</div>
        <div class="option-row">
          <div class="option-btn" :class="{ active: form.fitnessStatus === 'good' }" @click="form.fitnessStatus = 'good'">
            💪 良好
          </div>
          <div class="option-btn" :class="{ active: form.fitnessStatus === 'normal' }" @click="form.fitnessStatus = 'normal'">
            😊 一般
          </div>
          <div class="option-btn" :class="{ active: form.fitnessStatus === 'tired' }" @click="form.fitnessStatus = 'tired'">
            😓 疲惫
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="input-group">
        <div class="input-label">✅ 做得好</div>
        <div class="textarea-wrapper">
          <textarea
            v-model="form.goodText"
            placeholder="记录本次训练/比赛中表现好的地方..."
            rows="3"
            maxlength="200"
          ></textarea>
          <div class="char-count">{{ form.goodText.length }}/200</div>
        </div>
      </div>

      <div class="input-group">
        <div class="input-label">📝 待改进</div>
        <div class="textarea-wrapper">
          <textarea
            v-model="form.improveText"
            placeholder="记录需要改进的地方..."
            rows="3"
            maxlength="200"
          ></textarea>
          <div class="char-count">{{ form.improveText.length }}/200</div>
        </div>
      </div>

      <van-button round block type="primary" :loading="loading" @click="handleSubmit" class="submit-btn animate-in delay-4">
        保存笔记
      </van-button>
    </div>

    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="form.dateVal"
        @confirm="form.date = form.dateVal.join('-'); showDatePicker = false"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { createNote } from '../api/db'
import { showSuccessToast, showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const { user } = userStore
const loading = ref(false)
const showDatePicker = ref(false)

const today = new Date().toISOString().split('T')[0]
const form = ref({
  type: 'training',
  date: today,
  dateVal: today.split('-').map(Number),
  rating: 3,
  position: user?.position || 'mixed',
  fitnessStatus: 'good',
  goodText: '',
  improveText: '',
})

async function handleSubmit() {
  loading.value = true
  try {
    await createNote({
      playerId: user?.id,
      playerName: user?.name,
      type: form.value.type,
      date: form.value.date,
      rating: form.value.rating,
      position: form.value.position,
      fitnessStatus: form.value.fitnessStatus,
      goodText: form.value.goodText,
      improveText: form.value.improveText,
    })
    showSuccessToast('笔记已保存')
    router.back()
  } catch (e) {
    showToast('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.note-form-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 48px 20px 24px;
}

.back-btn {
  font-size: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.page-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
}

.form-content {
  max-width: 440px;
  margin: 0 auto;
  padding: 0 20px;
}

.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}

.type-btn {
  text-align: center;
  padding: 14px;
  border-radius: var(--radius-lg);
  font-size: 15px;
  font-weight: 700;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn.active {
  background: rgba(255, 107, 53, 0.12);
  border-color: var(--color-orange);
  color: var(--color-orange);
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
  padding-left: 4px;
}

.date-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.date-btn:active {
  border-color: var(--color-orange);
}

.date-icon {
  font-size: 18px;
}

.date-text {
  font-size: 15px;
  color: var(--color-text);
  font-weight: 500;
}

.rating-area {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.rating-text {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  color: var(--color-orange);
}

.option-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.option-btn {
  text-align: center;
  padding: 10px 4px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn.active {
  background: rgba(255, 107, 53, 0.12);
  border-color: var(--color-orange);
  color: var(--color-orange);
}

.textarea-wrapper {
  position: relative;
}

.textarea-wrapper textarea {
  width: 100%;
  padding: 14px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.textarea-wrapper textarea:focus {
  border-color: var(--color-orange);
}

.textarea-wrapper textarea::placeholder {
  color: var(--color-text-muted);
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 4px;
  padding-right: 4px;
}

.submit-btn {
  height: 50px !important;
  font-size: 16px !important;
  letter-spacing: 1px;
  box-shadow: var(--shadow-orange) !important;
  margin-top: 8px;
}
</style>
