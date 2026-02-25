const mongoose = require('mongoose')
require('dotenv').config()


const DB_URI = process.env.URI 

mongoose.connect(DB_URI)
.then(result => {
    console.log('DB connected to Mongoose')
})
.catch(err => {
    console.log('Error connecting to DB', err)
})

