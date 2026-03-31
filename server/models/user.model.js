const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    provider: { type: String, default: 'manual', enum: ['manual', 'google', 'facebook', 'github'] },
    phone: { type: String, default: '' },
    plan: { type: String, default: 'Pro', enum: ['Free', 'Pro', 'Enterprise'] },
    profileImage: { type: String, default: '' },
    country: { type: String, default: '' },
    company: { type: String, default: '' },
    bio: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)

module.exports = User