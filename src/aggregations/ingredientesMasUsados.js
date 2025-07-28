// aggregations/ingredientesMasUsados.js
const { connectDB } = require('../config/db');
const { ObjectId } = require('mongodb');

async function ingredientesMasUsados() {
  const db = await connectDB();

  const result = await db.collection('pedidos').aggregate([
    {
      $match: {
        fecha: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
      }
    },
    {
      $lookup: {
        from: 'pizzas',
        localField: 'pizzas',
        foreignField: '_id',
        as: 'pizzasDetalle'
      }
    },
    { $unwind: '$pizzasDetalle' },
    { $unwind: '$pizzasDetalle.ingredientes' },
    {
      $group: {
        _id: '$pizzasDetalle.ingredientes',
        totalUsado: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'ingredientes',
        localField: '_id',
        foreignField: '_id',
        as: 'detalleIngrediente'
      }
    },
    { $unwind: '$detalleIngrediente' },
    { $sort: { totalUsado: -1 } },
    {
      $project: {
        nombre: '$detalleIngrediente.nombre',
        totalUsado: 1
      }
    }
  ]).toArray();

  console.log('🥇 Ingredientes más usados:\n', result);
}

module.exports = { ingredientesMasUsados };