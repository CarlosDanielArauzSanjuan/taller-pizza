const inquirer = require('inquirer');
const { realizarPedido } = require('../services/pedido.service');
const { ingredientesMasUsados } = require('../aggregations/ingredientesMasUsados');
const { promedioPreciosPorCategoria } = require('../aggregations/promedioPreciosPorCategoria');
const { categoriaMasVendida } = require('../aggregations/categoriaMasVendida');
const db = require('../config/db');

async function mainMenu() {
  console.clear();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '¿Qué deseas hacer?',
      choices: [
        '📦 Realizar pedido',
        '📊 Ver ingredientes más usados',
        '💰 Promedio por categoría',
        '🔥 Categoría más vendida',
        'Salir'
      ]
    }
  ]);

  switch (action) {
    case '📦 Realizar pedido': {
      try {
        const dbConn = await db.connectDB();

        const clientes = await dbConn.collection('clientes').find({}).toArray();
        const pizzas = await dbConn.collection('pizzas').find({}).toArray();

        if (clientes.length === 0 || pizzas.length === 0) {
          console.log('❌ No hay clientes o pizzas registradas.');
          break;
        }

        const { clienteSeleccionado } = await inquirer.prompt([
          {
            type: 'list',
            name: 'clienteSeleccionado',
            message: 'Selecciona el cliente:',
            choices: clientes.map(c => ({
              name: `${c.nombre} (${c._id})`,
              value: c._id.toString()
            }))
          }
        ]);

        const { pizzasSeleccionadas } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'pizzasSeleccionadas',
            message: 'Selecciona las pizzas:',
            choices: pizzas.map(p => ({
              name: `${p.nombre} - $${p.precio}`,
              value: p._id.toString()
            })),
            validate: value => value.length > 0 ? true : 'Debes seleccionar al menos una pizza.'
          }
        ]);

        await realizarPedido(clienteSeleccionado, pizzasSeleccionadas);
      } catch (err) {
        console.error('❌ Error al procesar el pedido:', err.message);
      }
      break;
    }

    case '📊 Ver ingredientes más usados':
      await ingredientesMasUsados();
      break;

    case '💰 Promedio por categoría':
      await promedioPreciosPorCategoria();
      break;

    case '🔥 Categoría más vendida':
      await categoriaMasVendida();
      break;

    case 'Salir':
    default:
      console.log('👋 ¡Hasta luego!');
      process.exit(0);
  }

  await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para volver al menú...' }]);
  await mainMenu();
}

mainMenu();