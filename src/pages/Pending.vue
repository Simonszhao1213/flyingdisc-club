<template>
  <div class="pending-page">
    <div class="icon">⏳</div>
    <h2>注册申请已提交</h2>
    <p>您的账号正在审核中<br/>请耐心等待队长审批</p>
    <div class="status-card">
      <div class="status-item">
        <span class="label">手机号</span>
        <span class="value">{{ user?.phone }}</span>
      </div>
      <div class="status-item">
        <span class="label">申请时间</span>
        <span class="value">{{ user?.createdAt?.split('T')[0] }}</span>
      </div>
      <div class="status-item">
        <span class="label">当前状态</span>
        <span class="value status pending">待审核</span>
      </div>
    </div>
    <van-button plain block @click="userStore.logout(); $router.push('/login')">
      切换账号
    </van-button>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user'
const userStore = useUserStore()
const { user } = userStore
</script>

<style lang="scss" scoped>
.pending-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: white;
  .icon { font-size: 80px; margin-bottom: 24px; }
  h2 { font-size: 24px; margin-bottom: 12px; }
  p { font-size: 15px; opacity: 0.85; text-align: center; line-height: 1.6; margin-bottom: 32px; }
  .status-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    width: 100%;
    margin-bottom: 24px;
    .status-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      &:last-child { border-bottom: none; }
      .label { color: #888; font-size: 14px; }
      .value { color: #333; font-size: 14px; font-weight: 500; }
      .status.pending { color: #FF6B35; }
    }
  }
  :deep(.van-button--plain) {
    background: rgba(255,255,255,0.2);
    color: white;
    border-color: rgba(255,255,255,0.5);
  }
}
</style>
