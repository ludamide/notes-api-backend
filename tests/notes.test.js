const mongoose = require('mongoose')
const { server } = require('../index')

const Note = require('../models/Note')
const {
  api,
  initialNotes,
  getAllContentFromNotes
} = require('./helpers')

beforeEach(async () => {
  await Note.deleteMany({})

  // PARALLEL
  // const notesObjects = initialNotes.map(note => new Note(note))
  // const promises = notesObjects.map(note => note.save())
  // await Promise.all(promises)

  // SEQUENTIAL
  for (const note of initialNotes) {
    const noteObject = new Note(note)
    await noteObject.save()
  }
})

describe('GET all notes', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are all the initial notes', async () => {
    const { response } = await getAllContentFromNotes()
    expect(response.body).toHaveLength(initialNotes.length)
  })

  test('the first note is about midudev', async () => {
    const { contents } = await getAllContentFromNotes()

    expect(contents).toContain('Aprendiendo FullStack JS con midudev')
  })
})

describe('GET a single note', () => {
  test('is possible with a valid id', async () => {
    const { response: firstResponse } = await getAllContentFromNotes()
    const { body: notes } = firstResponse
    const noteToGet = notes[0]

    await api
      .get(`/api/notes/${noteToGet.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const { contents } = await getAllContentFromNotes()

    expect(contents).toContain(noteToGet.content)
  })

  test('is not possible with an invalid id', async () => {
    await api
      .get('/api/notes/1234')
      .expect(400)
  })
})

describe('POST: create a note', () => {
  test('is possible with a valid note', async () => {
    const newNote = {
      content: 'Próximamente async/await',
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const { contents, response } = await getAllContentFromNotes()

    expect(response.body).toHaveLength(initialNotes.length + 1)
    expect(contents).toContain(newNote.content)
  })

  test('is not possible with an invalid note', async () => {
    const newNote = {
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    const { response } = await getAllContentFromNotes()

    expect(response.body).toHaveLength(initialNotes.length)
  })
})

describe('PUT: update a note', () => {
  test('is possible with a valid id', async () => {
    const { response } = await getAllContentFromNotes()
    const { body: notes } = response
    const noteToUpdate = notes[0]

    const newNote = {
      content: 'Ya hemos visto async/await',
      important: false
    }

    await api
      .put(`/api/notes/${noteToUpdate.id}`)
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const { contents } = await getAllContentFromNotes()

    expect(contents).toContain(newNote.content)
  })

  test('is not possible with an invalid id', async () => {
    const newNote = {
      content: 'Ya hemos visto async/await',
      important: false
    }

    await api
      .put('/api/notes/1234')
      .send(newNote)
      .expect(400)
  })
})

describe('DELETE a note', () => {
  test('is possible with a valid id', async () => {
    const { response: firstResponse } = await getAllContentFromNotes()
    const { body: notes } = firstResponse
    const noteToDelete = notes[0]

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)

    const { contents, response: secondResponse } = await getAllContentFromNotes()

    expect(secondResponse.body).toHaveLength(initialNotes.length - 1)
    expect(contents).not.toContain(noteToDelete.content)
  })

  test('is not possible if it does not exist', async () => {
    await api
      .delete('/api/notes/1234')
      .expect(400)

    const { response } = await getAllContentFromNotes()

    expect(response.body).toHaveLength(initialNotes.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
