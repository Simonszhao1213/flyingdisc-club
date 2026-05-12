/**
 * MongoDB Atlas Data API 封装
 * 
 * 使用说明：
 * 1. 在 MongoDB Atlas 创建免费集群 (M0 Sandbox)
 * 2. 在 Data API 设置里开启 Data API，记下 URL 和 API Key
 * 3. 在下面填入你的配置
 * 
 * Data API URL 格式：https://data.mongodb-api.com/app/<APP_ID>/endpoint/data/v1
 */
const CONFIG = {
  // TODO: 替换为你的 MongoDB Atlas Data API URL
  API_URL: 'https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1',
  // TODO: 替换为你的 Data API Key
  API_KEY: 'YOUR_API_KEY',
  cluster: 'Cluster0',
  database: 'flyingdisc',
}

const headers = {
  'Content-Type': 'application/json',
  'api-key': CONFIG.API_KEY,
}

/**
 * 发送请求到 MongoDB Data API
 */
async function mongodb(action, collection, body = {}) {
  if (CONFIG.API_URL.includes('YOUR_APP_ID')) {
    console.warn('⚠️ 请先配置 MongoDB Atlas Data API')
    return mockData(action, collection, body)
  }

  try {
    const res = await fetch(`${CONFIG.API_URL}/action/${action}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        collection,
        database: CONFIG.database,
        ...body,
      }),
    })
    return await res.json()
  } catch (err) {
    console.error('MongoDB Error:', err)
    throw err
  }
}

// ============ 用户相关 ============

export async function loginUser(phone, code) {
  // 实际项目：验证码校验
  const result = await mongodb('findOne', 'users', {
    filter: { phone }
  })
  return result.document
}

export async function registerUser(data) {
  // 检查手机号是否已注册
  const existing = await mongodb('findOne', 'users', {
    filter: { phone: data.phone }
  })
  if (existing.document) {
    throw new Error('该手机号已注册')
  }
  
  await mongodb('insertOne', 'users', {
    document: {
      ...data,
      status: 'pending', // 待审核
      role: 'member',
      createdAt: new Date().toISOString(),
    }
  })
  return { success: true }
}

export async function getPendingUsers() {
  const result = await mongodb('find', 'users', {
    filter: { status: 'pending' },
    sort: { createdAt: -1 }
  })
  return result.documents || []
}

export async function approveUser(userId, role) {
  await mongodb('updateOne', 'users', {
    filter: { _id: { $oid: userId } },
    update: { $set: { status: 'approved', role, approvedAt: new Date().toISOString() } }
  })
}

export async function rejectUser(userId) {
  await mongodb('updateOne', 'users', {
    filter: { _id: { $oid: userId } },
    update: { $set: { status: 'rejected' } }
  })
}

// ============ 笔记相关 ============

export async function getNotes(playerId) {
  const result = await mongodb('find', 'notes', {
    filter: { playerId },
    sort: { date: -1 }
  })
  return result.documents || []
}

export async function getTeamNotes(role, playerId) {
  let filter = {}
  if (role === 'captain') {
    // 队长看所有人的笔记
  } else if (role === 'training_admin') {
    filter = { type: 'training' }
  } else if (role === 'match_admin') {
    filter = { type: 'match' }
  } else {
    filter = { playerId }
  }
  const result = await mongodb('find', 'notes', { filter, sort: { date: -1 } })
  return result.documents || []
}

export async function createNote(data) {
  await mongodb('insertOne', 'notes', {
    document: {
      ...data,
      createdAt: new Date().toISOString(),
    }
  })
}

export async function getNoteStats(playerId) {
  const result = await mongodb('aggregate', 'notes', {
    pipeline: [
      { $match: { playerId } },
      { $group: {
        _id: null,
        totalNotes: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        trainingCount: { $sum: { $cond: [{ $eq: ['$type', 'training'] }, 1, 0] } },
        matchCount: { $sum: { $cond: [{ $eq: ['$type', 'match'] }, 1, 0] } },
      }}
    ]
  })
  return result.documents?.[0] || { totalNotes: 0, avgRating: 0, trainingCount: 0, matchCount: 0 }
}

// ============ 活动相关 ============

export async function getEvents(type) {
  let filter = {}
  if (type === 'training') filter = { type: 'training' }
  else if (type === 'match') filter = { type: 'match' }
  
  const result = await mongodb('find', 'events', {
    filter,
    sort: { date: -1 }
  })
  return result.documents || []
}

export async function getEvent(id) {
  const result = await mongodb('findOne', 'events', { filter: { _id: { $oid: id } } })
  return result.document
}

export async function createEvent(data) {
  await mongodb('insertOne', 'events', {
    document: {
      ...data,
      attendees: [],
      status: 'open',
      createdAt: new Date().toISOString(),
    }
  })
}

export async function signUpEvent(eventId, playerId, playerName) {
  await mongodb('updateOne', 'events', {
    filter: { _id: { $oid: eventId } },
    update: { $push: { attendees: { playerId, playerName } } }
  })
}

export async function cancelSignUp(eventId, playerId) {
  await mongodb('updateOne', 'events', {
    filter: { _id: { $oid: eventId } },
    update: { $pull: { attendees: { playerId } } }
  })
}

// ============ Mock 数据（未配置 MongoDB 时使用）============

function mockData(action, collection, body) {
  console.warn(`[MOCK] ${action} on ${collection}`)
  if (action === 'find') {
    return { documents: getMockCollection(collection) }
  }
  if (action === 'findOne') {
    return { document: getMockCollection(collection)[0] || null }
  }
  return { insertedId: 'mock_id' }
}

function getMockCollection(name) {
  const mockDB = {
    users: [
      { _id: { $oid: 'u1' }, name: '赵仁可聃', phone: '13800138000', role: 'captain', status: 'approved', position: 'handler', createdAt: '2026-01-01' },
    ],
    notes: [
      { _id: { $oid: 'n1' }, playerId: 'u1', playerName: '赵仁可聃', type: 'training', date: '2026-05-10', rating: 4, position: 'handler', goodText: '反手传盘稳定性提升明显', improveText: 'cut 时加速时机还需要练习', fitnessStatus: 'good' },
      { _id: { $oid: 'n2' }, playerId: 'u1', playerName: '赵仁可聃', type: 'match', date: '2026-05-05', rating: 5, position: 'handler', goodText: '对阵王牌队拿下关键分', improveText: '防守转换进攻速度要更快', fitnessStatus: 'good' },
    ],
    events: [
      { _id: { $oid: 'e1' }, type: 'training', title: '周三晚训练', date: '2026-05-14', time: '19:00-21:00', location: 'KCC足球场', fee: 10, maxAttendees: 30, attendees: [{ playerId: 'u1', playerName: '赵仁可聃' }], status: 'open' },
      { _id: { $oid: 'e2' }, type: 'match', title: '王牌杯小组赛', date: '2026-05-20', time: '14:00-17:00', location: '市体育中心', fee: 30, maxAttendees: 0, attendees: [], status: 'open' },
    ],
  }
  return mockDB[name] || []
}

export default { loginUser, registerUser, getPendingUsers, approveUser, rejectUser, getNotes, getTeamNotes, createNote, getNoteStats, getEvents, getEvent, createEvent, signUpEvent, cancelSignUp }
