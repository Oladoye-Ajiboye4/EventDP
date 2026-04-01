const mongoose = require('./connection/connection')
const handleSignup = require('./auth/signup')
const handleSignin = require('./auth/signin')
const manualSignup = require('./auth/manualSignup')
const manualSignin = require('./auth/manualSignin')
const getDashboard = require('./pages/getDashboard')
const getSettings = require('./pages/getSettings')
const updateSettings = require('./pages/updateSettings')
const updatePassword = require('./pages/updatePassword')
const deleteAccount = require('./pages/deleteAccount')
const forgotPassword = require('./auth/forgotPassword')
const resetPassword = require('./auth/resetPassword')

const uploadImage = require('./pages/createEventDP/uploadImage')
const createDraft = require('./pages/createEventDP/createDraft')
const autosaveDraft = require('./pages/createEventDP/autosaveDraft')
const deleteDraft = require('./pages/createEventDP/deleteDraft')
const unpublishEventDP = require('./pages/createEventDP/unpublishEventDP')
const getDraft = require('./pages/createEventDP/getDraft')
const publishDraft = require('./pages/createEventDP/publishDraft')
const getPublicEventDP = require('./pages/createEventDP/getPublicEventDP')
const incrementPublicDownload = require('./pages/createEventDP/incrementPublicDownload')
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
app.get('/getSettings', getSettings)
app.patch('/updateSettings', updateSettings)
app.patch('/updatePassword', updatePassword)
app.delete('/deleteAccount', deleteAccount)

app.post('/createEventDP/upload-signature', authUser, uploadImage)
app.post('/createEventDP/drafts', authUser, createDraft)
app.patch('/createEventDP/drafts/:draftId/autosave', authUser, autosaveDraft)
app.delete('/createEventDP/drafts/:draftId', authUser, deleteDraft)
app.put('/createEventDP/:draftId/unpublish', authUser, unpublishEventDP)
app.post('/createEventDP/drafts/:draftId/publish', authUser, publishDraft)
app.get('/createEventDP/drafts/:draftId', authUser, getDraft)
app.post('/createEventDP/public/:projectSlug/:accessKey/download', incrementPublicDownload)
app.post('/createEventDP/public/:slug/download', incrementPublicDownload)
app.get('/createEventDP/public/:projectSlug/:accessKey', getPublicEventDP)
app.get('/createEventDP/public/:slug', getPublicEventDP)

const getClientBaseUrl = (req) => {
    const origin = req.headers.origin
    const fallbackClientUrl = process.env.NODE_ENV === 'production'
        ? `${req.protocol}://${req.get('host')}`
        : 'http://localhost:5173'

   return (process.env.PUBLIC_WEB_BASE_URL || process.env.CLIENT_BASE_URL || process.env.APP_URL || origin || fallbackClientUrl).replace(/\/$/, '')
}

app.get('/eventdp/:projectSlug/:accessKey', (req, res) => {
    const { projectSlug, accessKey } = req.params
    return res.redirect(302, `${getClientBaseUrl(req)}/eventdp/${encodeURIComponent(projectSlug)}/${encodeURIComponent(accessKey)}`)
})

app.get('/eventdp/:slug', (req, res) => {
    const { slug } = req.params
    return res.redirect(302, `${getClientBaseUrl(req)}/eventdp/${encodeURIComponent(slug)}`)
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})
