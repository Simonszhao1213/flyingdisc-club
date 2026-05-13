<template>
  <div class="pending-page">
    <div class="glow-orb"></div>

    <div class="content animate-in">
      <div class="icon-area">⏳</div>
      <h1 class="title">申请已提交</h1>
      <p class="desc">请等待队长审批通过后，即可使用完整功能</p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">当前状态</span>
          <span class="info-value status pending">待审批</span>
        </div>
        <div class="info-row">
          <span class="info-label">预计等待</span>
          <span class="info-value">1-24 小时</span>
        </div>
      </div>

      <div class="actions">
        <van-button plain round @click="$router.push('/home')" class="btn-home">
          返回首页
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.pending-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  position: relative;
  overflow: hidden;
}

.glow-orb {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.content {
  text-align: center;
  position: relative;
  z-index: 1;
  max-width: 360px;
}

.icon-area {
  font-size: 80px;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

.title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 12px;
}

.desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 40px;
}

.info-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.info-value.pending {
  color: var(--color-orange);
}

.btn-home {
  width: 100%;
  height: 48px !important;
  border-color: var(--color-border) !important;
  color: var(--color-text-secondary) !important;
  font-weight: 600 !important;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
