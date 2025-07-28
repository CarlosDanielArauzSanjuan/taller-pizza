const { connectDB } = require('../config/db');

async function getClientesCollection() {
  const db = await connectDB();
  return db.collection('clientes');
}

module.exports = { getClientesCollection };