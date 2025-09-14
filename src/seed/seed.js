require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Item = require('../models/Item');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
    await Item.deleteMany({});
    await Item.insertMany(data);
    console.log('Semilla cargada');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
