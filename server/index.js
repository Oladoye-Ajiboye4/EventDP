const mongoose = require('./connection/connection')
const handleSignup = require('./auth/signup')
const handleSignin = require('./auth/signin')
const manualSignup = require('./auth/manualSignup')
const express = require('express')
require('dotenv').config()

const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())

const PORT = process.env.port || 7890;

app.post('/handle-signup', handleSignup)
app.post('/handle-signin', handleSignin)
app.post('/manual-signup', manualSignup)

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})
