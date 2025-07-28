const { connectDB } = require('../config/db');
const { ObjectId } = require('mongodb');

async function seed() {
  const db = await connectDB();

  console.log('🧹 Borrando colecciones...');
  await db.collection('ingredientes').deleteMany({});
  await db.collection('pizzas').deleteMany({});
  await db.collection('repartidores').deleteMany({});
  await db.collection('clientes').deleteMany({});
  await db.collection('pedidos').deleteMany({});

  console.log('📦 Insertando ingredientes...');
  const ingredientes = await db.collection('ingredientes').insertMany([
    { nombre: 'Mozzarella', tipo: 'queso', stock: 100 },
    { nombre: 'Salsa de tomate', tipo: 'salsa', stock: 100 },
    { nombre: 'Pepperoni', tipo: 'topping', stock: 50 },
    { nombre: 'Champiñones', tipo: 'topping', stock: 50 },
    { nombre: 'Aceitunas', tipo: 'topping', stock: 50 },
  ]);

  const ids = ingredientes.insertedIds;

  console.log('🍕 Insertando pizzas...');
  const pizzas = await db.collection('pizzas').insertMany([
    {
      nombre: 'Pepperoni Lovers',
      categoria: 'tradicional',
      precio: 120,
      ingredientes: [ids[0], ids[1], ids[2]]
    },
    {
      nombre: 'Veggie Deluxe',
      categoria: 'vegana',
      precio: 110,
      ingredientes: [ids[0], ids[1], ids[3], ids[4]]
    },
    {
      nombre: 'Margarita',
      categoria: 'clásica',
      precio: 90,
      ingredientes: [ids[0], ids[1]]
    }
  ]);

  console.log('🧑‍💼 Insertando clientes...');
  const clientes = await db.collection('clientes').insertMany([
    { nombre: 'Juan Pérez', telefono: '123456789', direccion: 'Calle Falsa 123' },
    { nombre: 'Ana Gómez', telefono: '987654321', direccion: 'Av. Siempre Viva 742' }
  ]);

  console.log('🛵 Insertando repartidores...');
  await db.collection('repartidores').insertMany([
    { nombre: 'Carlos', zona: 'Norte', estado: 'disponible' },
    { nombre: 'Laura', zona: 'Sur', estado: 'disponible' }
  ]);

  // Asegura que estén disponibles (por si el seed se corre varias veces)
  await db.collection('repartidores').updateMany({}, { $set: { estado: 'disponible' } });

  console.log('📦 Generando pedidos de prueba...');

  const pizzasIds = Object.values(pizzas.insertedIds);
  const cliente1 = clientes.insertedIds[0];
  const cliente2 = clientes.insertedIds[1];

  const repartidores = await db.collection('repartidores')
    .find({ estado: 'disponible' })
    .limit(2)
    .toArray();

  if (repartidores.length < 2) {
    console.log('❌ No hay suficientes repartidores disponibles para los pedidos.');
    return process.exit(1);
  }

  await db.collection('repartidores').updateMany(
    { _id: { $in: [repartidores[0]._id, repartidores[1]._id] } },
    { $set: { estado: 'ocupado' } }
  );

  const pedido1 = {
    clienteId: cliente1,
    pizzas: [pizzasIds[0], pizzasIds[1]],
    total: 230,
    fecha: new Date(),
    repartidorAsignado: repartidores[0]._id
  };

  const pedido2 = {
    clienteId: cliente2,
    pizzas: [pizzasIds[2]],
    total: 90,
    fecha: new Date(),
    repartidorAsignado: repartidores[1]._id
  };

  await db.collection('pedidos').insertMany([pedido1, pedido2]);

  console.log('\n✅ Base de datos poblada exitosamente');
  console.log('🧑‍💼 Clientes:');
  Object.entries(clientes.insertedIds).forEach(([key, id]) => {
    console.log(`- ${id}`);
  });

  console.log('\n🍕 Pizzas:');
  Object.entries(pizzas.insertedIds).forEach(([key, id]) => {
    console.log(`- ${id}`);
  });

  process.exit(0);
}

seed();