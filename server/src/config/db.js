const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mem

async function connectDB(uri) {
  try {
    if (!uri) {
      console.warn(
        '[DB] MONGODB_URI not set. Starting in-memory MongoDB for development...'
      )
      mem = await MongoMemoryServer.create()
      uri = mem.getUri()
    }

    mongoose.set('strictQuery', true)
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DBNAME || 'expense_tracker',
    })

    mongoose.connection.on('connected', () => console.log('[DB] Connected'))
    mongoose.connection.on('error', (err) => console.error('[DB] Error', err))
    mongoose.connection.on('disconnected', () =>
      console.warn('[DB] Disconnected')
    )

    return mongoose.connection
  } catch (err) {
    console.error('[DB] Connection error:', err)
    throw err
  }
}

async function disconnectDB() {
  await mongoose.disconnect()
  if (mem) {
    await mem.stop()
  }
}

module.exports = { connectDB, disconnectDB }
