import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'flyingdisc_user'

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'))

  const isLoggedIn = computed(() => !!user.value)
  const isPending = computed(() => user.value?.status === 'pending')
  const isApproved = computed(() => user.value?.status === 'approved')

  const isAdmin = computed(() => ['captain', 'training_admin', 'match_admin', 'trial_admin'].includes(user.value?.role))
  const canPostTraining = computed(() => ['captain', 'training_admin'].includes(user.value?.role))
  const canPostMatch = computed(() => ['captain', 'match_admin'].includes(user.value?.role))

  function login(data) {
    user.value = data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function logout() {
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function updateUser(data) {
    user.value = { ...user.value, ...data }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
  }

  return { user, isLoggedIn, isPending, isApproved, isAdmin, canPostTraining, canPostMatch, login, logout, updateUser }
})
