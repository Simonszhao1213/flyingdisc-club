<template>
  <div class="register-page">
    <van-nav-bar title="注册账号" left-arrow @click-left="$router.back()" />

    <van-form @submit="handleRegister">
      <van-cell-group inset>
        <van-field v-model="form.name" label="姓名" placeholder="请输入真实姓名" :rules="[{ required: true, message: '请输入姓名' }]" />
        <van-field v-model="form.phone" type="tel" label="手机号" placeholder="用于登录" :rules="[{ required: true, message: '请输入手机号' }]" />
        <van-field v-model="form.password" type="password" label="密码" placeholder="设置登录密码" :rules="[{ required: true, message: '请设置密码' }]" />
        <van-field name="position" label="场上位置">
          <template #input>
            <van-radio-group v-model="form.position" direction="horizontal">
              <van-radio name="handler">Handler</van-radio>
              <van-radio name="cutter">Cutter</van-radio>
              <van-radio name="mixed">通用</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field v-model="form.referrer" label="推荐人" placeholder="选填" />
      </van-cell-group>

      <div class="tips">
        <van-icon name="info-o" /> 注册后需要队长审批才能使用完整功能
      </div>

      <div class="submit-area">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          提交注册
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { registerUser } from '../api/db'

const router = useRouter()
const form = ref({ name: '', phone: '', password: '', position: 'mixed', referrer: '' })
const loading = ref(false)

async function handleRegister() {
  loading.value = true
  try {
    await registerUser(form.value)
    showSuccessToast('注册申请已提交，请等待队长审批')
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
  background: #f5f5f5;
  .tips {
    margin: 16px;
    padding: 12px;
    background: #FFF7E6;
    border-radius: 8px;
    font-size: 13px;
    color: #B97708;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .submit-area { margin: 24px 16px; }
}
</style>
