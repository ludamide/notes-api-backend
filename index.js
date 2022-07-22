require('dotenv').config()
require('./mongo')

const express = require('express')
const cors = require('cors')
const logger = require('./middleware/logger')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')
const Note = require('./models/Note')

const app = express()
app.use(cors())
app.use(express.json())
app.use(logger)

// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'application/json' })
//     response.end(JSON.stringify(notes))
// })

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', async (request, response) => {
  // Note.find({}).then(notes => {
  //   response.json(notes)
  // })

  const notes = await Note.find({})
  response.json(notes)
})

app.get('/api/notes/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    const note = await Note.findById(id)
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  } catch (err) {
    next(err)
  }
})

app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true }).then(result => {
    response.json(result)
  }).catch(error => next(error))
})

app.delete('/api/notes/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    await Note.findByIdAndDelete(id)
    response.status(204).end()
  } catch (err) {
    next(err)
  }
})

app.post('/api/notes', async (request, response, next) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({
      error: "required 'content' field is missing"
    })
  }

  const newNote = new Note({
    content: note.content,
    important: typeof note.important !== 'undefined' ? note.important : false,
    date: new Date().toISOString()
  })

  // newNote.save().then(savedNote => {
  //   response.status(201).json(savedNote)
  // }).catch(err => next(err))

  try {
    const savedNote = await newNote.save()
    response.status(201).json(savedNote)
  } catch (err) {
    next(err)
  }
})

app.use(notFound)
app.use(handleErrors)

const PORT = process.env.PORT
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }
