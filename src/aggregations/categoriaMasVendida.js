// aggregations/categoriaMasVendida.js
async function categoriaMasVendida() {
  const db = await connectDB();

  const result = await db.collection('pedidos').aggregate([
    {
      $lookup: {
        from: 'pizzas',
        localField: 'pizzas',
        foreignField: '_id',
        as: 'pizzasDetalle'
      }
    },
    { $unwind: '$pizzasDetalle' },
    {
      $group: {
        _id: '$pizzasDetalle.categoria',
        totalVentas: { $sum: 1 }
      }
    },
    { $sort: { totalVentas: -1 } }
  ]).toArray();

  console.log('📊 Categoría más vendida:\n', result);
}