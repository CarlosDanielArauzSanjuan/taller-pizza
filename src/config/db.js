const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  if (!client.isConnected && !client.topology?.isConnected()) {
    await client.connect();
  }
  return client.db(process.env.DB_NAME);
}

module.exports = { connectDB, client };
