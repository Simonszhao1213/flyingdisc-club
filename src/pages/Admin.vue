<template>
  <div class="admin-page">
    <div class="header-bar">
      <span>注册审批</span>
      <van-tag type="danger">{{ pendingUsers.length }} 待审核</van-tag>
    </div>

    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="待审核" name="pending">
        <div class="user-list">
          <div class="user-card" v-for="u in pendingUsers" :key="u._id.$oid || u._id">
            <div class="user-info">
              <div class="user-name">{{ u.name }}</div>
              <div class="user-meta">
                <span>📱 {{ u.phone }}</span>
                <span v-if="u.position">｜{{ u.position }}</span>
                <span v-if="u.referrer">｜推荐人：{{ u.referrer }}</span>
              </div>
              <div class="user-date">申请时间：{{ u.createdAt?.split('T')[0] }}</div>
            </div>
            <div class="user-actions">
              <van-button size="small" type="primary" @click="showApproveDialog(u)">通过</van-button>
              <van-button size="small" plain type="default" @click="handleReject(u)">拒绝</van-button>
            </div>
          </div>
          <van-empty v-if="pendingUsers.length === 0" description="暂无待审核申请" />
        </div>
      </van-tab>

      <van-tab title="已通过" name="approved">
        <div class="user-list">
          <div class="user-card approved" v-for="u in approvedUsers" :key="u._id.$oid || u._id">
            <div class="user-info">
              <div class="user-name">{{ u.name }} <van-tag size="small" type="success">{{ roleName(u.role) }}</van-tag></div>
              <div class="user-meta">📱 {{ u.phone }}</div>
              <div class="user-date">通过时间：{{ u.approvedAt?.split('T')[0] }}</div>
            </div>
          </div>
          <van-empty v-if="approvedUsers.length === 0" description="暂无已通过用户" />
        </div>
      </van-tab>

      <van-tab title="已拒绝" name="rejected">
        <div class="user-list">
          <div class="user-card rejected" v-for="u in rejectedUsers" :key="u._id.$oid || u._id">
            <div class="user-info">
              <div class="user-name">{{ u.name }}</div>
              <div class="user-meta">📱 {{ u.phone }}</div>
            </div>
          </div>
          <van-empty v-if="rejectedUsers.length === 0" description="暂无已拒绝用户" />
        </div>
      </van-tab>
    </van-tabs>

    <van-dialog v-model:show="showApprove" title="分配角色" show-cancel-button @confirm="handleApprove">
      <div style="padding: 16px">
        <van-radio-group v-model="selectedRole">
          <van-cell-group>
            <van-radio name="member" style="margin: 8px 0">正式队员</van-radio>
            <van-radio name="trial_member" style="margin: 8px 0">试训队员</van-radio>
            <van-radio name="training_admin" style="margin: 8px 0">训练管理员</van-radio>
            <van-radio name="match_admin" style="margin: 8px 0">比赛管理员</van-radio>
            <van-radio name="trial_admin" style="margin: 8px 0">试训管理员</van-radio>
          </van-cell-group>
        </van-radio-group>
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
  return { captain: '队长', training_admin: '训练管理员', match_admin: '比赛管理员', trial_admin: '试训管理员', member: '正式队员', trial_member: '试训队员' }[r] || r
}

function showApproveDialog(user) {
  selectedUser.value = user
  selectedRole.value = 'member'
  showApprove.value = true
}

async function handleApprove() {
  try {
    await approveUser(selectedUser.value._id?.$oid || selectedUser.value._id, selectedRole.value)
    showSuccessToast('已审批通过')
    loadUsers()
  } catch (e) { showToast('操作失败') }
}

async function handleReject(user) {
  try {
    await showConfirmDialog({ title: '确认拒绝', message: `确定要拒绝 ${user.name} 的注册申请吗？` })
    await rejectUser(user._id?.$oid || user._id)
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

<style lang="scss" scoped>
.admin-page { min-height: 100vh; background: #f5f5f5; }
.header-bar { background: white; padding: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 600; }
.user-list { padding: 12px; }
.user-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  .user-info { margin-bottom: 10px; }
  .user-name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
  .user-meta { font-size: 13px; color: #666; }
  .user-date { font-size: 12px; color: #999; margin-top: 4px; }
  .user-actions { display: flex; gap: 8px; }
  &.approved { border-left: 3px solid #07c160; }
  &.rejected { opacity: 0.6; border-left: 3px solid #999; }
}
</style>
