<template>
  <div class="note-form-page">
    <van-nav-bar title="写笔记" left-arrow @click-left="$router.back()" />

    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field label="类型" model-value="训练" v-if="form.type === 'training'" readonly />
        <van-field label="类型" model-value="比赛" v-if="form.type === 'match'" readonly />
        <van-field v-model="form.date" label="日期" readonly @click="showDatePicker = true" />
        <van-field name="rating" label="自我评分">
          <template #input>
            <van-rate v-model="form.rating" allow-half color="#FF6B35" />
          </template>
        </van-field>
        <van-field name="position" label="场上位置">
          <template #input>
            <van-radio-group v-model="form.position" direction="horizontal">
              <van-radio name="handler">Handler</van-radio>
              <van-radio name="cutter">Cutter</van-radio>
              <van-radio name="mixed">通用</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="fitnessStatus" label="体能状态">
          <template #input>
            <van-radio-group v-model="form.fitnessStatus" direction="horizontal">
              <van-radio name="good">💪 良好</van-radio>
              <van-radio name="normal">😊 一般</van-radio>
              <van-radio name="tired">😓 疲惫</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>

      <van-cell-group inset title="记录" style="margin-top: 12px">
        <van-field
          v-model="form.goodText"
          type="textarea"
          placeholder="✅ 本次做得好的地方（选填）"
          rows="3"
          autosize
          maxlength="200"
          show-word-limit
        />
        <van-field
          v-model="form.improveText"
          type="textarea"
          placeholder="📝 本次需要改进的地方（选填）"
          rows="3"
          autosize
          maxlength="200"
          show-word-limit
        />
      </van-cell-group>

      <div class="submit-area">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          提交笔记
        </van-button>
      </div>
    </van-form>

    <van-action-sheet v-model:show="showTypeSheet" :actions="[{ name: '🏋️ 训练', value: 'training' }, { name: '🏆 比赛', value: 'match' }]" @select="form.type = $event.value; showTypeSheet = false" />
    <van-popup v-model:show="showDatePicker" position="bottom"><van-date-picker v-model="form.dateVal" @confirm="form.date = form.dateVal.join('-'); showDatePicker = false" /></van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { createNote } from '../api/db'
import { showSuccessToast, showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const { user } = userStore
const loading = ref(false)
const showTypeSheet = ref(false)
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
      playerId: user?._id?.$oid || user?.id,
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

<style lang="scss" scoped>
.note-form-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 24px; }
.submit-area { margin: 24px 16px; }
:deep(.van-radio-group) { flex-wrap: wrap; gap: 8px; }
</style>
