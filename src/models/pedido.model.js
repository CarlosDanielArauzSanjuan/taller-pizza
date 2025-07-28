const { connectDB } = require('../config/db');

async function getPedidosCollection() {
  const db = await connectDB();
  return db.collection('pedidos');
}

module.exports = { getPedidosCollection };