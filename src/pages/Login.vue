<template>
  <div class="login-page">
    <!-- Background glow effects -->
    <div class="glow-orb glow-1"></div>
    <div class="glow-orb glow-2"></div>

    <div class="login-container animate-in">
      <!-- Logo area -->
      <div class="logo-area">
        <div class="logo-wrapper">
          <img src="/logo.png" alt="The Black Tigers" class="logo-img" />
        </div>
        <div class="brand-text">
          <h1 class="brand-name">THE BLACK TIGERS</h1>
          <p class="brand-sub">飞盘俱乐部 · 记录每一次成长</p>
        </div>
      </div>

      <!-- Login form -->
      <div class="form-area animate-in delay-2">
        <van-form @submit="handleLogin">
          <div class="input-group">
            <div class="input-wrapper">
              <span class="input-prefix">+86</span>
              <van-field
                v-model="phone"
                name="phone"
                type="tel"
                placeholder="请输入手机号"
                :formatter="formatterPhone"
              />
            </div>
          </div>

          <div class="input-group animate-in delay-3">
            <div class="input-wrapper">
              <span class="input-prefix">🔒</span>
              <van-field
                v-model="password"
                type="password"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <div class="submit-area animate-in delay-4">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
              class="submit-btn"
            >
              登录
            </van-button>
          </div>
        </van-form>

        <div class="footer-links animate-in delay-5">
          <span @click="$router.push('/register')" class="link-text">
            还没有账号？<span class="link-highlight">立即注册</span>
          </span>
        </div>
      </div>

      <!-- Demo hint -->
      <div class="demo-hint animate-in delay-6">
        <span>演示账号：13900000001 / 666666</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { showToast } from 'vant'
import { loginUser } from '../api/db'

const router = useRouter()
const userStore = useUserStore()

const phone = ref('')
const password = ref('')
const loading = ref(false)

function formatterPhone(value) {
  return value.replace(/\D/g, '').slice(0, 11)
}

async function handleLogin() {
  if (!phone.value || !password.value) {
    showToast('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const user = await loginUser(phone.value)
    if (!user) {
      showToast('用户不存在，请先注册')
      return
    }
    if (password.value !== '666666') {
      showToast('密码错误')
      return
    }
    userStore.login(user)
    if (user.status === 'pending') {
      router.push('/pending')
    } else {
      router.push('/home')
    }
  } catch (err) {
    showToast(err.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  position: relative;
  overflow: hidden;
}

/* Glow orbs */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.glow-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, transparent 70%);
  top: -100px;
  right: -80px;
  animation: float 8s ease-in-out infinite;
}
.glow-2 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 70%);
  bottom: -50px;
  left: -60px;
  animation: float 10s ease-in-out infinite reverse;
}

.login-container {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

/* Logo area */
.logo-area {
  text-align: center;
  margin-bottom: 56px;
}

.logo-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-orange);
  animation: pulse-glow 3s ease-in-out infinite;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.brand-sub {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 400;
}

/* Form area */
.form-area {
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  padding: 32px 24px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-wrapper {
  position: relative;
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  transition: border-color 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: var(--color-orange);
  box-shadow: 0 0 0 3px var(--color-orange-glow);
}

.input-prefix {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--color-text-secondary);
  z-index: 1;
  pointer-events: none;
}

.input-wrapper :deep(.van-field) {
  padding-left: 56px !important;
  background: transparent !important;
  border: none !important;
  margin: 0 !important;
}

.input-wrapper :deep(.van-field__control) {
  font-size: 15px !important;
  height: 48px !important;
}

.submit-area {
  margin-top: 24px;
}

.submit-btn {
  height: 50px !important;
  font-size: 16px !important;
  letter-spacing: 1px;
  box-shadow: var(--shadow-orange) !important;
  transition: transform 0.2s var(--ease-spring), box-shadow 0.2s ease !important;
}

.submit-btn:active {
  transform: scale(0.97) !important;
}

/* Footer links */
.footer-links {
  text-align: center;
  margin-top: 24px;
}

.link-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.link-highlight {
  color: var(--color-orange);
  font-weight: 600;
}

/* Demo hint */
.demo-hint {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.3); }
  50% { box-shadow: 0 0 40px rgba(255, 107, 53, 0.5); }
}
</style>
