<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-glow"></div>
      <div class="header-content">
        <h1 class="page-title animate-in">审批</h1>
        <div class="pending-badge animate-in delay-1" v-if="pendingUsers.length > 0">
          <span class="badge-dot"></span>
          {{ pendingUsers.length }} 待审核
        </div>
      </div>
    </div>

    <div class="tabs-area animate-in delay-2">
      <div class="tab-bar">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'pending' }"
          @click="activeTab = 'pending'"
        >
          待审核
          <span class="tab-count" v-if="pendingUsers.length">{{ pendingUsers.length }}</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'approved' }"
          @click="activeTab = 'approved'"
        >
          已通过
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'rejected' }"
          @click="activeTab = 'rejected'"
        >
          已拒绝
        </div>
      </div>

      <div class="user-list">
        <!-- Pending -->
        <div v-if="activeTab === 'pending'">
          <div
            class="user-card animate-in"
            v-for="(u, i) in pendingUsers"
            :key="u.id || u._id"
            :style="{ animationDelay: `${0.1 + i * 0.05}s` }"
          >
            <div class="user-avatar">{{ u.name?.charAt(0) || '?' }}</div>
            <div class="user-info">
              <div class="user-name-row">
                <span class="user-name">{{ u.name }}</span>
                <span class="user-position">{{ u.position || '通用' }}</span>
              </div>
              <div class="user-meta">📱 {{ u.phone }}</div>
              <div class="user-meta" v-if="u.referrer">推荐人：{{ u.referrer }}</div>
              <div class="user-date">申请时间：{{ u.created_at?.split('T')[0] || '未知' }}</div>
            </div>
            <div class="user-actions">
              <button class="btn-approve" @click="showApproveDialog(u)">通过</button>
              <button class="btn-reject" @click="handleReject(u)">拒绝</button>
            </div>
          </div>
          <div v-if="pendingUsers.length === 0" class="empty-state">
            <span class="empty-icon">✅</span>
            <span class="empty-text">暂无待审核申请</span>
          </div>
        </div>

        <!-- Approved -->
        <div v-if="activeTab === 'approved'">
          <div
            class="user-card approved animate-in"
            v-for="(u, i) in approvedUsers"
            :key="u.id || u._id"
            :style="{ animationDelay: `${0.1 + i * 0.05}s` }"
          >
            <div class="user-avatar">{{ u.name?.charAt(0) || '?' }}</div>
            <div class="user-info">
              <div class="user-name-row">
                <span class="user-name">{{ u.name }}</span>
                <span class="role-badge" :class="u.role">{{ roleName(u.role) }}</span>
              </div>
              <div class="user-meta">📱 {{ u.phone }}</div>
              <div class="user-date" v-if="u.approved_at">通过时间：{{ u.approved_at?.split('T')[0] }}</div>
            </div>
          </div>
          <div v-if="approvedUsers.length === 0" class="empty-state">
            <span class="empty-icon">👥</span>
            <span class="empty-text">暂无已通过用户</span>
          </div>
        </div>

        <!-- Rejected -->
        <div v-if="activeTab === 'rejected'">
          <div
            class="user-card rejected animate-in"
            v-for="(u, i) in rejectedUsers"
            :key="u.id || u._id"
            :style="{ animationDelay: `${0.1 + i * 0.05}s` }"
          >
            <div class="user-avatar muted">{{ u.name?.charAt(0) || '?' }}</div>
            <div class="user-info">
              <div class="user-name">{{ u.name }}</div>
              <div class="user-meta">📱 {{ u.phone }}</div>
            </div>
          </div>
          <div v-if="rejectedUsers.length === 0" class="empty-state">
            <span class="empty-icon">🚫</span>
            <span class="empty-text">暂无已拒绝用户</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Approve dialog -->
    <van-dialog
      v-model:show="showApprove"
      title="分配角色"
      show-cancel-button
      confirm-button-text="确认通过"
      @confirm="handleApprove"
      class="custom-dialog"
    >
      <div style="padding: 8px 16px 24px">
        <div class="selected-user" v-if="selectedUser">
          <span class="user-avatar-sm">{{ selectedUser.name?.charAt(0) }}</span>
          <span>{{ selectedUser.name }}</span>
        </div>
        <div class="role-grid">
          <div
            class="role-btn"
            :class="{ active: selectedRole === 'member' }"
            @click="selectedRole = 'member'"
          >正式队员</div>
          <div
            class="role-btn"
            :class="{ active: selectedRole === 'trial_member' }"
            @click="selectedRole = 'trial_member'"
          >试训队员</div>
          <div
            class="role-btn"
            :class="{ active: selectedRole === 'training_admin' }"
            @click="selectedRole = 'training_admin'"
          >训练管理员</div>
          <div
            class="role-btn"
            :class="{ active: selectedRole === 'match_admin' }"
            @click="selectedRole = 'match_admin'"
          >比赛管理员</div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPendingUsers, approveUser, rejectUser } from '../api/db'
import { showSuccessToast, showToast, showConfirmDialog } from 'vant'

const activeTab = ref('pending')
const allUsers = ref([])
const showApprove = ref(false)
const selectedUser = ref(null)
const selectedRole = ref('member')

const pendingUsers = computed(() => allUsers.value.filter(u => u.status === 'pending'))
const approvedUsers = computed(() => allUsers.value.filter(u => u.status === 'approved'))
const rejectedUsers = computed(() => allUsers.value.filter(u => u.status === 'rejected'))

function roleName(r) {
  return {
    captain: '队长', training_admin: '训练管理', match_admin: '比赛管理',
    trial_admin: '试训管理', member: '正式队员', trial_member: '试训队员'
  }[r] || r
}

function showApproveDialog(user) {
  selectedUser.value = user
  selectedRole.value = 'member'
  showApprove.value = true
}

async function handleApprove() {
  try {
    await approveUser(selectedUser.value.id || selectedUser.value._id, selectedRole.value)
    showSuccessToast('已审批通过')
    loadUsers()
  } catch (e) { showToast('操作失败') }
}

async function handleReject(user) {
  try {
    await showConfirmDialog({ title: '确认拒绝', message: `确定要拒绝 ${user.name} 的注册申请吗？` })
    await rejectUser(user.id || user._id)
    showSuccessToast('已拒绝')
    loadUsers()
  } catch (e) { if (e !== 'cancel') showToast('操作失败') }
}

async function loadUsers() {
  try {
    allUsers.value = await getPendingUsers()
  } catch (e) { console.error(e) }
}

onMounted(() => loadUsers())
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 100px;
}

.page-header {
  position: relative;
  padding: 48px 20px 24px;
  overflow: hidden;
}

.header-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.header-content {
  position: relative;
  z-index: 1;
}

.page-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 12px;
}

.pending-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 100px;
  font-size: 13px;
  color: var(--color-orange);
  font-weight: 600;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--color-orange);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.tabs-area {
  padding: 0 20px;
}

.tab-bar {
  display: flex;
  gap: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 4px;
  margin-bottom: 20px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab-item.active {
  background: rgba(255, 107, 53, 0.12);
  color: var(--color-orange);
}

.tab-count {
  background: var(--color-orange);
  color: white;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 100px;
  min-width: 18px;
  text-align: center;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  transition: border-color 0.2s ease;
}

.user-card.approved {
  border-left: 3px solid #34d399;
}

.user-card.rejected {
  opacity: 0.5;
  border-left: 3px solid var(--color-text-muted);
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background: linear-gradient(135deg, var(--color-orange) 0%, var(--color-orange-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
}

.user-avatar.muted {
  background: var(--color-surface-3);
  color: var(--color-text-muted);
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--color-orange) 0%, var(--color-orange-dark) 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 800;
  color: white;
  margin-right: 8px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.user-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.user-position {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--color-surface-3);
  border-radius: 4px;
  color: var(--color-text-muted);
}

.user-meta {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.user-date {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.role-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.2);
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.btn-approve {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  background: var(--color-orange);
  color: white;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-reject {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  background: var(--color-surface-3);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-approve:active, .btn-reject:active {
  opacity: 0.8;
}

/* Role dialog */
.selected-user {
  display: flex;
  align-items: center;
  padding: 8px 0 16px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.role-btn {
  text-align: center;
  padding: 12px 8px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-btn.active {
  background: rgba(255, 107, 53, 0.12);
  border-color: var(--color-orange);
  color: var(--color-orange);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
}

.empty-icon { font-size: 48px; opacity: 0.4; }
.empty-text { font-size: 14px; color: var(--color-text-muted); }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
