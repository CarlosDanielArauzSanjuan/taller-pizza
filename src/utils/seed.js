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
    { _id: new ObjectId(), nombre: 'Mozzarella', tipo: 'queso', stock: 100 },
    { _id: new ObjectId(), nombre: 'Salsa de tomate', tipo: 'salsa', stock: 100 },
    { _id: new ObjectId(), nombre: 'Pepperoni', tipo: 'topping', stock: 50 },
    { _id: new ObjectId(), nombre: 'Champiñones', tipo: 'topping', stock: 50 },
    { _id: new ObjectId(), nombre: 'Aceitunas', tipo: 'topping', stock: 50 },
  ]);

  const ing = Object.values(ingredientes.insertedIds);

  console.log('🍕 Insertando pizzas...');
  const pizzas = await db.collection('pizzas').insertMany([
    {
      _id: new ObjectId(),
      nombre: 'Pepperoni Lovers',
      categoria: 'tradicional',
      precio: 120,
      ingredientes: [ing[0], ing[1], ing[2]]
    },
    {
      _id: new ObjectId(),
      nombre: 'Veggie Deluxe',
      categoria: 'vegana',
      precio: 110,
      ingredientes: [ing[0], ing[1], ing[3], ing[4]]
    },
    {
      _id: new ObjectId(),
      nombre: 'Margarita',
      categoria: 'clásica',
      precio: 90,
      ingredientes: [ing[0], ing[1]]
    }
  ]);

  console.log('🧑‍💼 Insertando clientes...');
  const clientes = await db.collection('clientes').insertMany([
    {
      _id: new ObjectId(),
      nombre: 'Juan Pérez',
      telefono: '123456789',
      direccion: 'Calle Falsa 123'
    },
    {
      _id: new ObjectId(),
      nombre: 'Ana Gómez',
      telefono: '987654321',
      direccion: 'Av. Siempre Viva 742'
    }
  ]);

  console.log('🛵 Insertando repartidores...');
  await db.collection('repartidores').insertMany([
    { _id: new ObjectId(), nombre: 'Carlos', zona: 'Norte', estado: 'disponible' },
    { _id: new ObjectId(), nombre: 'Laura', zona: 'Sur', estado: 'disponible' }
  ]);

  console.log('\n✅ Base de datos poblada exitosamente');
  console.log('🧑‍💼 Clientes:');
  Object.values(clientes.insertedIds).forEach(id => console.log(`- ${id}`));

  console.log('\n🍕 Pizzas:');
  Object.values(pizzas.insertedIds).forEach(id => console.log(`- ${id}`));

  process.exit(0);
}

seed();