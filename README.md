# 🍕 Taller Pizza - Sistema de Gestión para Pizzería

Sistema de consola en **Node.js** que permite a una cadena de pizzerías controlar sus pedidos, inventario, repartidores y reportes de ventas. El sistema utiliza **MongoDB** como base de datos, y todo se opera desde una interfaz de línea de comandos amigable.

---

## 🧠 Funcionalidades

- 📦 Registrar pedidos con manejo de stock y repartidores.
- 🛒 Control de inventario de ingredientes.
- 🛵 Asignación automática de repartidores disponibles.
- 📊 Reportes de ventas y tendencias usando **Aggregation Framework**.
- 🔐 Uso de transacciones MongoDB para garantizar integridad de datos.

---

## 🛠️ Tecnologías

- Node.js
- MongoDB (driver oficial)
- Inquirer.js (interfaz CLI)
- dotenv

---

🚀 Uso

Inicia la aplicación desde la terminal:

npm install
npm start        # Inicia el menú interactivo
npm run seed     # Población inicial de datos

Aparecerá un menú interactivo con opciones como:
	•	📦 Realizar pedido
	•	📊 Ver ingredientes más usados
	•	💰 Promedio por categoría
	•	🔥 Categoría más vendida

---

### 🔄 Transacciones MongoDB

La función realizarPedido(clienteId, pizzaIds) realiza una transacción que:
	1.	Valida existencia de ingredientes y pizzas.
	2.	Descuenta stock necesario de ingredientes.
	3.	Asigna un repartidor automáticamente.
	4.	Registra el pedido completo.

Si algo falla (ej: sin stock o sin repartidor), todo se revierte automáticamente.

---

### 📊 Reportes (Aggregation)
	•	Ingredientes más usados: muestra los ingredientes más frecuentes en los pedidos del último mes.
	•	Promedio por categoría: precio promedio por tipo de pizza.
	•	Categoría más vendida: muestra qué categoría de pizza ha tenido más ventas históricas.
