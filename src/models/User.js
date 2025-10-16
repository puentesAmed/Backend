const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: false },
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
        public_id: {type: String, required: false},
        url: {type: String, required: false}
    },
    related: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }]
}, {timestamps: true});

// Hasheo antes de guardar
UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Método de comparación
UserSchema.methods.comparePassword = function(candidate){
    return bcrypt.compare(candidate, this.password);
}

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
