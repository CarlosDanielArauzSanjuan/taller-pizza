const { connectDB } = require('../config/db');

async function getPizzasCollection() {
  const db = await connectDB();
  return db.collection('pizzas');
}

module.exports = { getPizzasCollection };