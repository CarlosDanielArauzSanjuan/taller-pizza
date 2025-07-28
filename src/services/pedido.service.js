const { client } = require('../config/db');
const { ObjectId } = require('mongodb');

async function realizarPedido(clienteId, pizzaIds) {
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const db = client.db();
      const pizzasCol = db.collection('pizzas');
      const ingredientesCol = db.collection('ingredientes');
      const pedidosCol = db.collection('pedidos');
      const repartidoresCol = db.collection('repartidores');

      // Obtener pizzas
      const pizzas = await pizzasCol.find({ _id: { $in: pizzaIds.map(id => new ObjectId(id)) } }).toArray();
      const total = pizzas.reduce((sum, pizza) => sum + pizza.precio, 0);

      // Verificar stock
      const ingredientesNecesarios = {};
      pizzas.forEach(pizza => {
        pizza.ingredientes.forEach(ingId => {
          ingredientesNecesarios[ingId] = (ingredientesNecesarios[ingId] || 0) + 1;
        });
      });

      for (let ingId in ingredientesNecesarios) {
        const ing = await ingredientesCol.findOne({ _id: new ObjectId(ingId) }, { session });
        if (!ing || ing.stock < ingredientesNecesarios[ingId]) {
          throw new Error(`Stock insuficiente de ingrediente: ${ing?.nombre || ingId}`);
        }
      }

      // Restar ingredientes
      for (let ingId in ingredientesNecesarios) {
        await ingredientesCol.updateOne(
          { _id: new ObjectId(ingId) },
          { $inc: { stock: -ingredientesNecesarios[ingId] } },
          { session }
        );
      }

      // Asignar repartidor
      const repartidor = await repartidoresCol.findOneAndUpdate(
        { estado: 'disponible' },
        { $set: { estado: 'ocupado' } },
        { session, returnDocument: 'after' }
      );

      if (!repartidor.value) throw new Error('No hay repartidores disponibles');

      // Crear pedido
      await pedidosCol.insertOne({
        clienteId: new ObjectId(clienteId),
        pizzas: pizzaIds.map(id => new ObjectId(id)),
        total,
        fecha: new Date(),
        repartidorAsignado: repartidor.value._id
      }, { session });

    });
    console.log('✅ Pedido realizado exitosamente');
  } catch (err) {
    console.error('❌ Pedido fallido:', err.message);
  } finally {
    await session.endSession();
  }
}

module.exports = { realizarPedido };