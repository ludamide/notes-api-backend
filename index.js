require('dotenv').config()
require('./mongo')

const express = require('express')
const cors = require('cors')

const usersRouter = require('./controllers/users')
const notesRouter = require('./controllers/notes')
const logger = require('./middleware/logger')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')

const app = express()
app.use(cors())
app.use(express.json())
app.use(logger)

app.use('/api/notes', notesRouter)
app.use('/api/users', usersRouter)

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.use(notFound)
app.use(handleErrors)

const PORT = process.env.PORT
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }
