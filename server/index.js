const mongoose = require('./connection/connection')
const handleSignup = require('./auth/signup')
const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')

app.use(cors())
app.use(express.json())

const PORT = process.env.port || 7890;

app.post('/handle-signup', handleSignup)

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})
