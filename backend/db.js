const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || '';

let client;
let dbInstance;

async function connectDB() {
  if (dbInstance) return dbInstance;
  if (!uri) {
    console.warn('MONGODB_URI not set. MongoDB features disabled.');
    return null;
  }
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  dbInstance = client.db(process.env.MONGODB_DB || 'surf_ai');
  console.log('Connected to MongoDB', process.env.MONGODB_DB || 'surf_ai');
  return dbInstance;
}

function getDb() {
  if (!dbInstance) throw new Error('Call connectDB first');
  return dbInstance;
}

module.exports = { connectDB, getDb };
