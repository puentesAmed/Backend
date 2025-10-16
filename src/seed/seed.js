const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Item = require('../models/Item');
const User = require('../models/User');

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");

    await Item.deleteMany({});
    await User.deleteMany({});
    console.log("🧹 Colecciones limpias");

    // Crear admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@demo.com',
      password: 'Admin123!',
      role: 'admin'
    });
    console.log("🌟 Admin creado:", admin.email);

    // Leer items de data.json
    const dataPath = path.join(__dirname, 'data.json');
    let items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Asignar owner
    items = items.map(item => ({ ...item, owner: admin._id }));

    await Item.insertMany(items);
    console.log(`🌱 Semilla de Items cargada (${items.length} items)`);

  } catch (err) {
    console.error("❌ Error en semilla:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Conexión cerrada");
  }
})();
