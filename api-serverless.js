import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'MONGODB_URI 未配置，请联系管理员' })
  }

  try {
    if (mongoose.connections[0].readyState !== 1) {
      await mongoose.connect(MONGODB_URI)
    }

    const { method, body, query } = req
    const { collection, action } = query
    const db = mongoose.connection.db

    if (method === 'GET' && action === 'notes') {
      const notes = await db.collection('notes').find().sort({ date: -1 }).limit(50).toArray()
      return res.json({ documents: notes })
    }

    if (method === 'POST' && action === 'insertOne') {
      const result = await db.collection(collection).insertOne(body.document)
      return res.json({ insertedId: result.insertedId })
    }

    if (method === 'POST' && action === 'find') {
      const { filter = {}, sort = {} } = body
      const docs = await db.collection(collection).find(filter).sort(sort).limit(50).toArray()
      return res.json({ documents: docs })
    }

    if (method === 'POST' && action === 'findOne') {
      const doc = await db.collection(collection).findOne(body.filter)
      return res.json({ document: doc })
    }

    if (method === 'POST' && action === 'updateOne') {
      const result = await db.collection(collection).updateOne(body.filter, body.update)
      return res.json({ modifiedCount: result.modifiedCount })
    }

    res.status(400).json({ error: '未知操作' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
