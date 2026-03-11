const mongoose = require('./connection/connection')
const handleSignup = require('./auth/signup')
const handleSignin = require('./auth/signin')
const manualSignup = require('./auth/manualSignup')
const manualSignin = require('./auth/manualSignin')
const getDashboard = require('./auth/getDashboard')
const forgotPassword = require('./auth/forgotPassword')
const resetPassword = require('./auth/resetPassword')
const express = require('express')
require('dotenv').config()

const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())

const PORT = process.env.port || 7687;

app.post('/handle-signup', handleSignup)
app.post('/handle-signin', handleSignin)
app.post('/manual-signup', manualSignup)
app.post('/manual-signin', manualSignin)
app.post('/forgot-password', forgotPassword)
app.post('/reset-password', resetPassword)
app.get('/getDashboard', getDashboard)

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})
