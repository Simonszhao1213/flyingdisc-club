<template>
  <div class="register-page">
    <div class="glow-orb glow-1"></div>
    <div class="glow-orb glow-2"></div>

    <div class="page-header">
      <div class="back-btn" @click="$router.back()">←</div>
      <h1 class="page-title animate-in">创建账号</h1>
      <p class="page-sub animate-in delay-1">加入 The Black Tigers</p>
    </div>

    <div class="form-area animate-in delay-2">
      <div class="input-group">
        <div class="input-label">姓名</div>
        <van-field
          v-model="form.name"
          placeholder="请输入真实姓名"
          :formatter="v => v.trim()"
        />
      </div>

      <div class="input-group">
        <div class="input-label">手机号</div>
        <van-field
          v-model="form.phone"
          type="tel"
          placeholder="用于登录"
          :formatter="v => v.replace(/\D/g, '').slice(0, 11)"
        />
      </div>

      <div class="input-group">
        <div class="input-label">密码</div>
        <van-field
          v-model="form.password"
          type="password"
          placeholder="设置登录密码"
        />
      </div>

      <div class="input-group">
        <div class="input-label">场上位置</div>
        <div class="position-grid">
          <div
            class="pos-btn"
            :class="{ active: form.position === 'handler' }"
            @click="form.position = 'handler'"
          >
            🎯 Handler
          </div>
          <div
            class="pos-btn"
            :class="{ active: form.position === 'cutter' }"
            @click="form.position = 'cutter'"
          >
            🏃 Cutter
          </div>
          <div
            class="pos-btn"
            :class="{ active: form.position === 'mixed' }"
            @click="form.position = 'mixed'"
          >
            🔄 通用
          </div>
        </div>
      </div>

      <div class="input-group">
        <div class="input-label">推荐人 <span class="optional">(选填)</span></div>
        <van-field v-model="form.referrer" placeholder="谁介绍你来的？" />
      </div>

      <div class="tips">
        <span class="tips-icon">💡</span>
        <span>注册后需要队长审批才能使用完整功能</span>
      </div>

      <van-button
        round
        block
        type="primary"
        :loading="loading"
        @click="handleRegister"
        class="submit-btn animate-in delay-4"
      >
        提交注册
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { registerUser } from '../api/db'

const router = useRouter()
const form = ref({
  name: '',
  phone: '',
  password: '',
  position: 'mixed',
  referrer: ''
})
const loading = ref(false)

async function handleRegister() {
  if (!form.value.name || !form.value.phone || !form.value.password) {
    showToast('请填写完整信息')
    return
  }
  if (form.value.password.length < 6) {
    showToast('密码至少6位')
    return
  }

  loading.value = true
  try {
    await registerUser(form.value)
    showSuccessToast('注册申请已提交')
    router.replace('/pending')
  } catch (err) {
    showToast(err.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 20px 20px 40px;
  position: relative;
  overflow: hidden;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.glow-1 {
  width: 250px; height: 250px;
  background: radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%);
  top: -80px; left: -60px;
}
.glow-2 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%);
  bottom: 0; right: -40px;
}

.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 32px;
  padding-top: 8px;
}

.back-btn {
  font-size: 24px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
  cursor: pointer;
  display: inline-block;
}

.page-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 6px;
}

.page-sub {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.form-area {
  position: relative;
  z-index: 1;
  max-width: 440px;
  margin: 0 auto;
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

.optional {
  color: var(--color-text-muted);
  font-weight: 400;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.pos-btn {
  text-align: center;
  padding: 12px 8px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pos-btn.active {
  background: rgba(255, 107, 53, 0.12);
  border-color: var(--color-orange);
  color: var(--color-orange);
}

.tips {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 107, 53, 0.06);
  border: 1px solid rgba(255, 107, 53, 0.12);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.submit-btn {
  height: 50px !important;
  font-size: 16px !important;
  letter-spacing: 1px;
  box-shadow: var(--shadow-orange) !important;
}
</style>
