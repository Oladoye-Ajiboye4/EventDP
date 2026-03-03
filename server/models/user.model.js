const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    googleId: {type: String, unique: true, sparse: true, required: false},
    createdAt: {type: Date, default: Date.now}
})

const User = mongoose.model('User', userSchema)

module.exports = User