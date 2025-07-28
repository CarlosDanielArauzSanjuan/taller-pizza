const { client } = require('../config/db');
const { ObjectId } = require('mongodb');

// Validar si un ID tiene el formato de ObjectId
function esObjectIdValido(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

async function realizarPedido(clienteId, pizzaIds) {
  // Validar cliente y pizzas
  if (!esObjectIdValido(clienteId)) {
    throw new Error('ID de cliente inválido');
  }

  for (const pizzaId of pizzaIds) {
    if (!esObjectIdValido(pizzaId)) {
      throw new Error(`ID de pizza inválido: ${pizzaId}`);
    }
  }

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const db = client.db();
      const pizzasCol = db.collection('pizzas');
      const ingredientesCol = db.collection('ingredientes');
      const pedidosCol = db.collection('pedidos');
      const repartidoresCol = db.collection('repartidores');

      // Obtener pizzas pedidas
      const pizzas = await pizzasCol.find({
        _id: { $in: pizzaIds.map(id => new ObjectId(id)) }
      }).toArray();

      if (pizzas.length !== pizzaIds.length) {
        throw new Error('Una o más pizzas no existen');
      }

      const total = pizzas.reduce((sum, pizza) => sum + pizza.precio, 0);

      // Verificar stock
      const ingredientesNecesarios = {};
      pizzas.forEach(pizza => {
        pizza.ingredientes.forEach(ingId => {
          const key = ingId.toString();
          ingredientesNecesarios[key] = (ingredientesNecesarios[key] || 0) + 1;
        });
      });

      for (let ingId in ingredientesNecesarios) {
        const ing = await ingredientesCol.findOne({ _id: new ObjectId(ingId) }, { session });
        if (!ing || ing.stock < ingredientesNecesarios[ingId]) {
          throw new Error(`Stock insuficiente de ingrediente: ${ing?.nombre || ingId}`);
        }
      }

      // Descontar ingredientes del inventario
      for (let ingId in ingredientesNecesarios) {
        await ingredientesCol.updateOne(
          { _id: new ObjectId(ingId) },
          { $inc: { stock: -ingredientesNecesarios[ingId] } },
          { session }
        );
      }

      // Buscar repartidor disponible
      const repartidor = await repartidoresCol.findOneAndUpdate(
        { estado: 'disponible' },
        { $set: { estado: 'ocupado' } },
        { session, returnDocument: 'after' }
      );

      if (!repartidor || !repartidor.value) {
        throw new Error('❌ No hay repartidores disponibles para asignar el pedido.');
      }

      // Registrar pedido
      await pedidosCol.insertOne({
        clienteId: new ObjectId(clienteId),
        pizzas: pizzaIds.map(id => new ObjectId(id)),
        total,
        fecha: new Date(),
        repartidorAsignado: repartidor.value._id
      }, { session });

    }); // Fin de la transacción

    console.log('✅ Pedido realizado exitosamente');
  } catch (err) {
    console.error('❌ Pedido fallido:', err.message);
  } finally {
    await session.endSession();
  }
}

module.exports = { realizarPedido };