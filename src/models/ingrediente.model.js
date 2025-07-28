const { connectDB } = require('../config/db');

async function getIngredientesCollection() {
  const db = await connectDB();
  return db.collection('ingredientes');
}

module.exports = { getIngredientesCollection };
