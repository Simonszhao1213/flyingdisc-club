<template>
  <div id="app">
    <!-- Persistent Brand Bar -->
    <div class="brand-bar">
      <div class="brand-logo">
        <img src="/logo.png" alt="The Black Tigers" class="brand-logo-img" />
        <div class="brand-logo-text">
          <span class="brand-logo-name">Black Tigers</span>
          <span class="brand-logo-sub">Ultimate Frisbee Club</span>
        </div>
      </div>
      <div class="brand-divider"></div>
      <span class="brand-badge">🥏</span>
    </div>

    <!-- Decorative logo watermark (top-right) -->
    <div class="logo-watermark">
      <img src="/logo.png" alt="" />
    </div>

    <!-- Page content -->
    <div class="app-container">
      <router-view v-slot="{ Component }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- Tab bar -->
    <van-tabbar v-if="showTabbar" route fixed placeholder safe-area-inset-bottom class="tabbar">
      <van-tabbar-item to="/home" icon-prefix="icon" class="tab-item">
        <template #icon><span class="icon-emoji">🏠</span></template>
        首页
      </van-tabbar-item>
      <van-tabbar-item to="/notes" icon-prefix="icon" v-if="canSeeNotes" class="tab-item">
        <template #icon><span class="icon-emoji">📝</span></template>
        笔记
      </van-tabbar-item>
      <van-tabbar-item to="/events" icon-prefix="icon" v-if="canSeeEvents" class="tab-item">
        <template #icon><span class="icon-emoji">📅</span></template>
        活动
      </van-tabbar-item>
      <van-tabbar-item to="/admin" icon-prefix="icon" v-if="isAdmin" class="tab-item">
        <template #icon><span class="icon-emoji">⚡</span></template>
        审批
      </van-tabbar-item>
      <van-tabbar-item to="/profile" icon-prefix="icon" class="tab-item">
        <template #icon><span class="icon-emoji">👤</span></template>
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/user'

const route = useRoute()
const userStore = useUserStore()

const showTabbar = computed(() => userStore.isLoggedIn && userStore.user?.status === 'approved')
const isAdmin = computed(() => ['captain', 'training_admin', 'match_admin', 'trial_admin'].includes(userStore.user?.role))
const canSeeNotes = computed(() => true)
const canSeeEvents = computed(() => userStore.user?.role !== 'guest')

const transitionName = computed(() => route.meta?.transition || 'slide')
</script>

<style>
/* ============================================
   BRAND BAR - Fixed top navigation bar
   ============================================ */
.brand-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  /* Gradient fade so it blends into content */
  background: linear-gradient(
    180deg,
    var(--color-bg) 0%,
    var(--color-bg) 55%,
    transparent 100%
  );
  pointer-events: none;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}

.brand-logo-img {
  width: 34px;
  height: 34px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(255, 107, 53, 0.5));
  border-radius: 8px;
}

.brand-logo-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.brand-logo-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--color-text);
  line-height: 1;
  text-transform: uppercase;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-logo-sub {
  font-size: 9px;
  color: var(--color-text-secondary);
  letter-spacing: 1.5px;
  font-weight: 400;
  text-transform: uppercase;
}

.brand-divider {
  width: 1px;
  height: 26px;
  background: var(--color-border);
  margin: 0 4px;
}

.brand-badge {
  font-size: 22px;
  opacity: 0.7;
}

/* ============================================
   LOGO WATERMARK - Top right decorative
   ============================================ */
.logo-watermark {
  position: fixed;
  top: 8px;
  right: 8px;
  z-index: 999;
  width: 56px;
  height: 56px;
  pointer-events: none;
  opacity: 0.85;
}

.logo-watermark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 14px rgba(255, 107, 53, 0.35));
}

/* ============================================
   TAB BAR
   ============================================ */
.tabbar {
  backdrop-filter: blur(24px) saturate(1.2) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.2) !important;
}

.tab-item {
  font-size: 11px !important;
}

.icon-emoji {
  font-size: 22px;
}

/* ============================================
   PAGE TRANSITIONS
   ============================================ */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s var(--ease-out);
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
