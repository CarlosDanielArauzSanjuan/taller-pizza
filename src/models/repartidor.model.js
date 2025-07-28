const { connectDB } = require('../config/db');

async function getRepartidoresCollection() {
  const db = await connectDB();
  return db.collection('repartidores');
}

module.exports = { getRepartidoresCollection };