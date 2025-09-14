const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8    
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    image: {
        public_id: String,
        url: String
    },
    related: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }]
    }, {timestamps: true});

UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = function(candidate){
    return bcrypt.compare(candidate, this.password);
}


// 🔹 Definición del esquema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String }, // URL de Cloudinary
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);