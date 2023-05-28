require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

const Person = require('./models/person')

app.use(cors())

app.use(express.json())

app.use(express.static('build'))

morgan.token('data', function(req) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] :response-time ms :data'))

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    const number = persons.length
    const now = new Date()

    res.send(`<p>Phonebook has info for ${number} people
        <br>${now}<p>`)
  })
})

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then(persons => {
      res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  console.log('deletessä')
  Person.findByIdAndRemove(req.params.id)
    .then(
      res.status(204).end()
    )
    .catch(error => next(error))
})


app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query ' }
  )
    .then(updatedNumber => {
      res.json(updatedNumber)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  Person.find({}).then(persons => {
    const names = persons.map(p => p.name)

    if (names.includes(body.name)) {
      return res.status(400).json({
        error: 'name already in the phonebook'
      })
    } else {
      const newPerson = Person({
        name: body.name,
        number: body.number
      })

      newPerson.save().then(savedPerson => {
        res.json(savedPerson)
      })
        .catch(error => next(error))
    }
  })

})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(Error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// build a CI/CD pipeline for this app to deploy the app to Fly
// steps:

// 1. create a new pipeline in the remote repo
// runs on ubuntu 20.04
// triggered by a push to master or a pull request
// checks out the repo
// installs the dependencies
// makes a build of the frontend
// would run the tests if existed
// deploy to fly
// make a healthcheck to fly

// if you feel like it, write another pipeline for other branches than master
// this pipeline should run eslint and tests but not deploy
// the idea is to have a pipeline to run on every push, not only on pull requests
