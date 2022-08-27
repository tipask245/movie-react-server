require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Router } = require('express')
const router = Router()
const { default: mongoose } = require('mongoose')
const path = require('path')

const movieRouter = require('./routes/movieRouter')
const authRouter = require('./routes/authRouter')

const PORT = process.env.PORT

const app = express()

// app.use(express.json())

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/movie', movieRouter)
app.use('/auth', authRouter)
// app.use('/image', imageRouter)
// app.use('/images_get', express.static(path.join('images')))

const start = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/movies-react')
    app.listen(PORT, () => console.log(`Started on port ${PORT}...`))
    
  } catch (e) {
    throw e
  }
}
start()