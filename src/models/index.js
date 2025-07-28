module.exports = {
  getIngredientesCollection: require('./ingrediente.model').getIngredientesCollection,
  getPizzasCollection: require('./pizza.model').getPizzasCollection,
  getPedidosCollection: require('./pedido.model').getPedidosCollection,
  getRepartidoresCollection: require('./repartidor.model').getRepartidoresCollection,
  getClientesCollection: require('./cliente.model').getClientesCollection
};