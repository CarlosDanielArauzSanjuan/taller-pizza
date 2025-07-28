const inquirer = require('inquirer');
const { realizarPedido } = require('../services/pedido.service');
const { ingredientesMasUsados } = require('../aggregations/ingredientesMasUsados');
const { promedioPreciosPorCategoria } = require('../aggregations/promedioPreciosPorCategoria');
const { categoriaMasVendida } = require('../aggregations/categoriaMasVendida');

async function mainMenu() {
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
    case '📦 Realizar pedido':
      // Aquí se pueden pedir clienteId y pizzas con prompts
      break;
    case '📊 Ver ingredientes más usados':
      await ingredientesMasUsados();
      break;
    case '💰 Promedio por categoría':
      await promedioPreciosPorCategoria();
      break;
    case '🔥 Categoría más vendida':
      await categoriaMasVendida();
      break;
    default:
      process.exit(0);
  }

  await mainMenu();
}

mainMenu();