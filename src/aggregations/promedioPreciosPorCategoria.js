// aggregations/promedioPreciosPorCategoria.js
async function promedioPreciosPorCategoria() {
  const db = await connectDB();

  const result = await db.collection('pizzas').aggregate([
    {
      $group: {
        _id: '$categoria',
        promedioPrecio: { $avg: '$precio' }
      }
    },
    { $sort: { promedioPrecio: -1 } }
  ]).toArray();

  console.log('💰 Promedio de precios por categoría:\n', result);
}