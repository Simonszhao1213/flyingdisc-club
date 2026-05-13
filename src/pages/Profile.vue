<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="header-glow"></div>
      <div class="avatar-ring animate-in">
        <img src="/logo.png" alt="logo" class="avatar-img" />
      </div>
      <div class="user-name animate-in delay-1">{{ user?.name }}</div>
      <div class="role-badge animate-in delay-2" :class="user?.role">
        {{ roleName }}
      </div>
    </div>

    <div class="profile-content animate-in delay-2">
      <!-- Stats bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-val">{{ stats.attendRate || 85 }}%</span>
          <span class="stat-label">出勤率</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-val">{{ stats.noteCount || 0 }}</span>
          <span class="stat-label">笔记数</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-val">{{ stats.matchCount || 0 }}</span>
          <span class="stat-label">比赛数</span>
        </div>
      </div>

      <!-- Info section -->
      <div class="info-section">
        <div class="section-title">基本信息</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">场上位置</span>
            <span class="info-value clickable" @click="showPositionPicker = true">
              {{ positionLabel }} →
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ user?.phone }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">注册时间</span>
            <span class="info-value">{{ user?.created_at?.split('T')[0] || '未知' }}</span>
          </div>
        </div>
      </div>

      <!-- Role switcher (demo) -->
      <div class="info-section">
        <div class="section-title">🧪 角色切换（演示用）</div>
        <div class="role-switcher">
          <div
            class="role-option"
            :class="{ active: simRole === 'captain' }"
            @click="simRole = 'captain'; switchRole()"
          >队长</div>
          <div
            class="role-option"
            :class="{ active: simRole === 'training_admin' }"
            @click="simRole = 'training_admin'; switchRole()"
          >训练管理</div>
          <div
            class="role-option"
            :class="{ active: simRole === 'match_admin' }"
            @click="simRole = 'match_admin'; switchRole()"
          >比赛管理</div>
          <div
            class="role-option"
            :class="{ active: simRole === 'member' }"
            @click="simRole = 'member'; switchRole()"
          >队员</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="info-section">
        <div class="section-title">更多</div>
        <div class="action-list">
          <div class="action-item" @click="$router.push('/notes')">
            <span class="action-icon">📝</span>
            <span class="action-text">我的笔记</span>
            <span class="action-arrow">→</span>
          </div>
          <div class="action-item">
            <span class="action-icon">💰</span>
            <span class="action-text">缴费历史</span>
            <span class="action-arrow">→</span>
          </div>
          <div class="action-item">
            <span class="action-icon">ℹ️</span>
            <span class="action-text">关于球队</span>
            <span class="action-arrow">→</span>
          </div>
        </div>
      </div>

      <!-- Logout -->
      <button class="logout-btn animate-in delay-5" @click="handleLogout">
        退出登录
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { showSuccessToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const { user } = userStore

const showPositionPicker = ref(false)
const simRole = ref(user?.role || 'member')
const stats = ref({ attendRate: 85, noteCount: 3, matchCount: 5 })

const roleName = computed(() => ({
  captain: '队长', training_admin: '训练管理员', match_admin: '比赛管理员',
  trial_admin: '试训管理员', member: '正式队员', trial_member: '试训队员',
})[user?.role] || '队员')

const positionLabel = computed(() => ({
  handler: '🎯 Handler', cutter: '🏃 Cutter', mixed: '🔄 通用',
})[user?.position] || '未设置')

function switchRole() {
  userStore.updateUser({ role: simRole.value })
  showSuccessToast('角色已切换')
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 100px;
}

.profile-header {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(255, 107, 53, 0.05) 100%);
  padding: 56px 20px 40px;
  text-align: center;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
}

.header-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 200px;
  background: radial-gradient(ellipse, rgba(255, 107, 53, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.avatar-ring {
  width: 90px;
  height: 90px;
  border-radius: 24px;
  overflow: hidden;
  margin: 0 auto 16px;
  border: 2px solid rgba(255, 107, 53, 0.3);
  box-shadow: 0 0 30px rgba(255, 107, 53, 0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 10px;
}

.role-badge {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(255, 107, 53, 0.12);
  color: var(--color-orange);
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.profile-content {
  max-width: 440px;
  margin: 0 auto;
  padding: 20px;
}

/* Stats bar */
.stats-bar {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 20px;
  margin-bottom: 28px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-val {
  display: block;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--color-orange);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: var(--color-border);
}

/* Info section */
.info-section {
  margin-bottom: 24px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 10px;
  padding-left: 4px;
}

.info-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
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
  color: var(--color-text);
  font-weight: 500;
}

.info-value.clickable {
  color: var(--color-orange);
  cursor: pointer;
}

/* Role switcher */
.role-switcher {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.role-option {
  text-align: center;
  padding: 10px 4px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-option.active {
  background: rgba(255, 107, 53, 0.12);
  border-color: var(--color-orange);
  color: var(--color-orange);
}

/* Action list */
.action-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.2s ease;
}

.action-item:last-child {
  border-bottom: none;
}

.action-item:active {
  background: var(--color-surface-2);
}

.action-icon {
  font-size: 18px;
}

.action-text {
  flex: 1;
  font-size: 14px;
  color: var(--color-text);
}

.action-arrow {
  font-size: 14px;
  color: var(--color-text-muted);
}

/* Logout */
.logout-btn {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-lg);
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.logout-btn:active {
  background: rgba(239, 68, 68, 0.06);
}
</style>
