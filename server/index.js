const mongoose = require('./connection/connection')
const handleSignup = require('./auth/signup')
const handleSignin = require('./auth/signin')
const manualSignup = require('./auth/manualSignup')
const manualSignin = require('./auth/manualSignin')
const getDashboard = require('./pages/getDashboard')
const forgotPassword = require('./auth/forgotPassword')
const resetPassword = require('./auth/resetPassword')

const uploadImage = require('./pages/createEventDP/uploadImage')
const createDraft = require('./pages/createEventDP/createDraft')
const autosaveDraft = require('./pages/createEventDP/autosaveDraft')
const getDraft = require('./pages/createEventDP/getDraft')
const authUser = require('./middleware/authUser')

const express = require('express')
require('dotenv').config()

const app = express()
const cors = require('cors')

require('./config/cloudinary')

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

const PORT = process.env.port || 7687;

app.post('/handle-signup', handleSignup)
app.post('/handle-signin', handleSignin)
app.post('/manual-signup', manualSignup)
app.post('/manual-signin', manualSignin)
app.post('/forgot-password', forgotPassword)
app.post('/reset-password', resetPassword)
app.get('/getDashboard', getDashboard)

app.post('/createEventDP/upload-signature', authUser, uploadImage)
app.post('/createEventDP/drafts', authUser, createDraft)
app.patch('/createEventDP/drafts/:draftId/autosave', authUser, autosaveDraft)
app.get('/createEventDP/drafts/:draftId', authUser, getDraft)

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})
