const { client } = require('../config/db');
const { ObjectId } = require('mongodb');

// Verifica si un string es un ObjectId válido
function esObjectIdValido(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

async function realizarPedido(clienteId, pizzaIds) {
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

      // Convertir IDs a ObjectId
      const pizzaObjectIds = pizzaIds.map(id => new ObjectId(id));

      // Buscar las pizzas solicitadas
      const pizzas = await pizzasCol.find({
        _id: { $in: pizzaObjectIds }
      }).toArray();

      if (pizzas.length !== pizzaObjectIds.length) {
        throw new Error('Una o más pizzas no existen en la base de datos.');
      }

      // Calcular el total
      const total = pizzas.reduce((sum, pizza) => sum + pizza.precio, 0);

      // Verificar stock de ingredientes
      const ingredientesNecesarios = {};
      pizzas.forEach(pizza => {
        pizza.ingredientes.forEach(ingId => {
          const key = ingId.toString();
          ingredientesNecesarios[key] = (ingredientesNecesarios[key] || 0) + 1;
        });
      });

      for (const ingId in ingredientesNecesarios) {
        const ing = await ingredientesCol.findOne(
          { _id: new ObjectId(ingId) },
          { session }
        );
        if (!ing || ing.stock < ingredientesNecesarios[ingId]) {
          throw new Error(`Stock insuficiente de ingrediente: ${ing?.nombre || ingId}`);
        }
      }

      // Descontar ingredientes del inventario
      for (const ingId in ingredientesNecesarios) {
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

      if (!repartidor?.value) {
        throw new Error('❌ No hay repartidores disponibles para asignar el pedido.');
      }

      // Insertar el pedido
      await pedidosCol.insertOne(
        {
          clienteId: new ObjectId(clienteId),
          pizzas: pizzaObjectIds,
          total,
          fecha: new Date(),
          repartidorAsignado: repartidor.value._id
        },
        { session }
      );
    });

    console.log('✅ Pedido realizado exitosamente');
  } catch (err) {
    console.error('❌ Pedido fallido:', err.message);
  } finally {
    await session.endSession();
  }
}

module.exports = { realizarPedido };