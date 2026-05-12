/**
 * Supabase REST API 封装
 * 前端直接调用，无需服务端函数
 */
const SUPABASE_URL = 'https://qtjsyfslvwzrtqvweswe.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0anN5ZnNsdnd6cnRxdndlc3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTYxNDYsImV4cCI6MjA5NDE3MjE0Nn0.FKFK1-zgnrunY7kVz6R8TZD5IE2UMpinX1aSWMVydd0'

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
}

async function api(endpoint, options = {}) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      method: options.method || 'GET',
      headers: { ...headers, ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
    const text = await res.text()
    if (!res.ok) {
      try {
        const data = JSON.parse(text)
        throw new Error(data.message || `HTTP ${res.status}`)
      } catch {
        throw new Error(`HTTP ${res.status}: ${text}`)
      }
    }
    return text ? JSON.parse(text) : null
  } catch (err) {
    console.error('API Error:', err)
    throw err
  }
}

// ============ 用户相关 ============

export async function loginUser(phone) {
  const result = await api(`users?phone=eq.${phone}&limit=1`)
  return result && result.length > 0 ? result[0] : null
}

export async function registerUser(data) {
  // 检查手机号是否已注册
  const existing = await api(`users?phone=eq.${data.phone}&limit=1`)
  if (existing && existing.length > 0) {
    throw new Error('该手机号已注册')
  }
  await api('users', {
    method: 'POST',
    body: { ...data, status: 'pending', role: 'member', created_at: new Date().toISOString() }
  })
  return { success: true }
}

export async function getPendingUsers() {
  return await api('users?status=eq.pending&order=created_at.desc') || []
}

export async function approveUser(userId, role) {
  await api(`users?id=eq.${userId}`, {
    method: 'PATCH',
    body: { status: 'approved', role, approved_at: new Date().toISOString() }
  })
}

export async function rejectUser(userId) {
  await api(`users?id=eq.${userId}`, {
    method: 'PATCH',
    body: { status: 'rejected' }
  })
}

// ============ 笔记相关 ============

export async function getNotes(playerId) {
  return await api(`notes?player_id=eq.${playerId}&order=date.desc`) || []
}

export async function getTeamNotes(role, playerId) {
  if (role === 'captain' || role === 'trial_admin') {
    return await api('notes?order=date.desc') || []
  } else if (role === 'training_admin') {
    return await api('notes?type=eq.training&order=date.desc') || []
  } else if (role === 'match_admin') {
    return await api('notes?type=eq.match&order=date.desc') || []
  } else {
    return await api(`notes?player_id=eq.${playerId}&order=date.desc`) || []
  }
}

export async function createNote(data) {
  await api('notes', {
    method: 'POST',
    body: { ...data, created_at: new Date().toISOString() }
  })
}

// ============ 活动相关 ============

export async function getEvents(type) {
  if (type) {
    return await api(`events?type=eq.${type}&order=date.desc`) || []
  }
  return await api('events?order=date.desc') || []
}

export async function getEvent(id) {
  const result = await api(`events?id=eq.${id}&limit=1`)
  return result && result.length > 0 ? result[0] : null
}

export async function createEvent(data) {
  await api('events', {
    method: 'POST',
    body: { ...data, attendees: [], status: 'open', created_at: new Date().toISOString() }
  })
}

export async function signUpEvent(eventId, playerId, playerName) {
  const event = await getEvent(eventId)
  if (!event) throw new Error('活动不存在')
  const attendees = event.attendees || []
  attendees.push({ playerId, playerName })
  await api(`events?id=eq.${eventId}`, {
    method: 'PATCH',
    body: { attendees }
  })
}

export async function cancelSignUp(eventId, playerId) {
  const event = await getEvent(eventId)
  if (!event) throw new Error('活动不存在')
  const attendees = (event.attendees || []).filter(a => a.playerId !== playerId)
  await api(`events?id=eq.${eventId}`, {
    method: 'PATCH',
    body: { attendees }
  })
}

export default { loginUser, registerUser, getPendingUsers, approveUser, rejectUser, getNotes, getTeamNotes, createNote, getEvents, getEvent, createEvent, signUpEvent, cancelSignUp }
