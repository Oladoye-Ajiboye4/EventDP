const mongoose = require('./connection/connection')
const express = require('express')
const app = express()
require('dotenv').config()

const PORT = process.env.port || 7890;

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})
