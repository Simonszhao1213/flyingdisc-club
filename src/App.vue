<template>
  <div id="app">
    <router-view />
    <van-tabbar v-if="showTabbar" route fixed placeholder safe-area-inset-bottom>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/notes" icon="notes-o" v-if="canSeeNotes">笔记</van-tabbar-item>
      <van-tabbar-item to="/events" icon="calendar-o" v-if="canSeeEvents">活动</van-tabbar-item>
      <van-tabbar-item to="/admin" icon="shield-o" v-if="isAdmin">审批</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

const showTabbar = computed(() => userStore.isLoggedIn && userStore.user?.status === 'approved')
const isAdmin = computed(() => ['captain', 'training_admin', 'match_admin', 'trial_admin'].includes(userStore.user?.role))
const canSeeNotes = computed(() => true)
const canSeeEvents = computed(() => userStore.user?.role !== 'trial_member' || userStore.user?.role !== 'guest')
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; background: #f5f5f5; }
#app { min-height: 100vh; }
</style>
