<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="avatar">🥏</div>
      <div class="name">{{ user?.name }}</div>
      <div class="role-tag" :class="user?.role">{{ roleName }}</div>
    </div>

    <van-cell-group inset>
      <van-cell title="场上位置" :value="positionLabel" is-link @click="showPositionPicker = true" />
      <van-cell title="手机号" :value="user?.phone" />
      <van-cell title="注册时间" :value="user?.createdAt?.split('T')[0]" />
    </van-cell-group>

    <van-cell-group inset title="模拟切换角色（演示用）" style="margin-top: 12px">
      <van-cell title="切换为：">
        <template #value>
          <van-radio-group v-model="simRole" direction="horizontal" @change="switchRole">
            <van-radio name="captain">队长</van-radio>
            <van-radio name="training_admin">训练管理</van-radio>
            <van-radio name="match_admin">比赛管理</van-radio>
            <van-radio name="member">队员</van-radio>
          </van-radio-group>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="其他" style="margin-top: 12px">
      <van-cell title="我的笔记" is-link to="/notes" />
      <van-cell title="缴费历史" is-link />
      <van-cell title="关于" is-link />
    </van-cell-group>

    <div class="logout-area">
      <van-button round block plain type="danger" @click="handleLogout">
        退出登录
      </van-button>
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

const roleName = computed(() => ({
  captain: '队长', training_admin: '训练管理员', match_admin: '比赛管理员',
  trial_admin: '试训管理员', member: '正式队员', trial_member: '试训队员',
})[user?.role] || '队员')

const positionLabel = computed(() => ({
  handler: 'Handler', cutter: 'Cutter', mixed: '通用',
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

<style  scoped>
.profile-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 24px; }
.profile-header {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%);
  padding: 32px 16px;
  text-align: center;
  color: white;
  .avatar { font-size: 64px; margin-bottom: 12px; }
  .name { font-size: 22px; font-weight: 600; margin-bottom: 8px; }
  .role-tag {
    display: inline-block;
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 13px;
    background: rgba(255,255,255,0.25);
  }
}
.logout-area { margin: 24px 16px; }
</style>
