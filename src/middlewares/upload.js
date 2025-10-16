const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");

// 🔹 Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 Configuración de Multer: almacenamiento temporal en /tmp
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tmpDir = path.join(__dirname, "../../tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ej: 1694692384000.jpg
  },
});

const upload = multer({ storage });

// 🔹 Middleware para subir archivo a Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Subimos a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "users", // Carpeta en Cloudinary
    });

    // Guardamos en req.file.cloudinary el objeto completo
    req.file.cloudinary = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    // Borrar archivo temporal
    fs.unlinkSync(req.file.path);

    next();
  } catch (err) {
    console.error("Error subiendo a Cloudinary:", err);
    next(err);
  }
};

module.exports = { upload, uploadToCloudinary };
