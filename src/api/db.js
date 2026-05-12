/**
 * 前端 API 调用层
 * 通过 Vercel API 路由连接 MongoDB
 * 
 * 环境变量：
 * MONGODB_URI - MongoDB Atlas 连接字符串（在 Vercel 环境变量中设置）
 */

// Vercel 部署后的地址（部署完成后在这里填入）
const API_BASE = 'https://flyingdisc-h5.vercel.app/api'

async function api(action, collection, body = {}) {
  try {
    const res = await fetch(`${API_BASE}/db?collection=${collection}&action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await res.json()
  } catch (err) {
    console.error('API Error:', err)
    throw err
  }
}

// ============ 用户相关 ============

export async function loginUser(phone, code) {
  const result = await api('findOne', 'users', { filter: { phone } })
  return result.document
}

export async function registerUser(data) {
  const existing = await api('findOne', 'users', { filter: { phone: data.phone } })
  if (existing.document) throw new Error('该手机号已注册')
  await api('insertOne', 'users', {
    document: {
      ...data,
      status: 'pending',
      role: 'member',
      createdAt: new Date().toISOString(),
    }
  })
  return { success: true }
}

export async function getPendingUsers() {
  const result = await api('find', 'users', { filter: { status: 'pending' }, sort: { createdAt: -1 } })
  return result.documents || []
}

export async function approveUser(userId, role) {
  await api('updateOne', 'users', {
    filter: { _id: { $oid: userId } },
    update: { $set: { status: 'approved', role, approvedAt: new Date().toISOString() } }
  })
}

export async function rejectUser(userId) {
  await api('updateOne', 'users', {
    filter: { _id: { $oid: userId } },
    update: { $set: { status: 'rejected' } }
  })
}

// ============ 笔记相关 ============

export async function getNotes(playerId) {
  const result = await api('find', 'notes', { filter: { playerId }, sort: { date: -1 } })
  return result.documents || []
}

export async function getTeamNotes(role, playerId) {
  let filter = {}
  if (role === 'captain') {
    // 队长看所有人
  } else if (role === 'training_admin') {
    filter = { type: 'training' }
  } else if (role === 'match_admin') {
    filter = { type: 'match' }
  } else {
    filter = { playerId }
  }
  const result = await api('find', 'notes', { filter, sort: { date: -1 } })
  return result.documents || []
}

export async function createNote(data) {
  await api('insertOne', 'notes', {
    document: {
      ...data,
      createdAt: new Date().toISOString(),
    }
  })
}

// ============ 活动相关 ============

export async function getEvents(type) {
  let filter = {}
  if (type === 'training') filter = { type: 'training' }
  else if (type === 'match') filter = { type: 'match' }
  const result = await api('find', 'events', { filter, sort: { date: -1 } })
  return result.documents || []
}

export async function getEvent(id) {
  const result = await api('findOne', 'events', { filter: { _id: { $oid: id } } })
  return result.document
}

export async function createEvent(data) {
  await api('insertOne', 'events', {
    document: {
      ...data,
      attendees: [],
      status: 'open',
      createdAt: new Date().toISOString(),
    }
  })
}

export async function signUpEvent(eventId, playerId, playerName) {
  await api('updateOne', 'events', {
    filter: { _id: { $oid: eventId } },
    update: { $push: { attendees: { playerId, playerName } } }
  })
}

export async function cancelSignUp(eventId, playerId) {
  await api('updateOne', 'events', {
    filter: { _id: { $oid: eventId } },
    update: { $pull: { attendees: { playerId } } }
  })
}

export default { loginUser, registerUser, getPendingUsers, approveUser, rejectUser, getNotes, getTeamNotes, createNote, getEvents, getEvent, createEvent, signUpEvent, cancelSignUp }
