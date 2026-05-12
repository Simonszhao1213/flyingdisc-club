<template>
  <div class="login-page">
    <div class="logo-area">
      <div class="logo">🥏</div>
      <h1>飞盘俱乐部</h1>
      <p>记录每一次成长</p>
    </div>

    <van-form @submit="handleLogin">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          name="phone"
          label="+86"
          type="tel"
          placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-field
          v-model="code"
          name="code"
          center
          clearable
          label="验证码"
          placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <span class="send-code" @click="sendCode" :class="{ disabled: countdown > 0 }">
              {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
            </span>
          </template>
        </van-field>
      </van-cell-group>

      <div class="submit-area">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>
    </van-form>

    <div class="footer-links">
      <span @click="$router.push('/register')">还没有账号？立即注册</span>
    </div>

    <div class="wechat-login">
      <van-divider>其他登录方式</van-divider>
      <van-button block @click="wechatLogin" class="wechat-btn">
        微信一键登录
      </van-button>
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
const code = ref('')
const loading = ref(false)
const countdown = ref(0)

async function sendCode() {
  if (countdown.value > 0) return
  countdown.value = 60
  const t = setInterval(() => { countdown.value--; if (countdown.value <= 0) clearInterval(t) }, 1000)
  // 演示用：验证码固定为 666666
  showToast('演示模式：验证码为 666666')
}

async function handleLogin() {
  loading.value = true
  try {
    // 演示模式：验证码 666666 直接通过
    if (code.value !== '666666') {
      showToast('演示模式：请输入验证码 666666')
      return
    }
    const user = await loginUser(phone.value)
    if (!user) {
      showToast('用户不存在，请先注册')
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

function wechatLogin() {
  showToast('微信登录需配合微信开放平台')
}
</script>

<style  scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%);
  padding: 60px 24px 24px;
  .logo-area {
    text-align: center;
    color: white;
    margin-bottom: 48px;
    .logo { font-size: 72px; margin-bottom: 12px; }
    h1 { font-size: 28px; font-weight: 600; margin-bottom: 8px; }
    p { font-size: 14px; opacity: 0.85; }
  }
  .send-code { color: #FF6B35; font-size: 14px; &.disabled { color: #999; } }
  .submit-area { margin: 32px 16px; }
  .footer-links {
    text-align: center;
    color: white;
    font-size: 14px;
    opacity: 0.9;
  }
  .wechat-login {
    margin-top: 48px;
    .wechat-btn {
      border: 1px solid rgba(255,255,255,0.4);
      background: rgba(255,255,255,0.15);
      color: white;
    }
  }
  :deep(.van-cell-group--inset) { margin: 0 8px; }
  :deep(.van-field__label) { width: 40px; }
}
</style>
