require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');


// Verificar que la variable de entorno esté definida
if (!process.env.MONGO_URI) {
  console.error("❌ Error: MONGO_URI no está definido en .env");
  process.exit(1);
}

// Conectar a la base de datos
connectDB(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err);
    process.exit(1);
  });