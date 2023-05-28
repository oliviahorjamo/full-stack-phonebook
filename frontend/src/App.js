
import { useEffect, useState } from 'react'
import Filter from './filter_form'
import FilteredList from './filtered_list'
import phoneService from './services/phonebook'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState("")
  const [newFilter, setNewFilter] = useState("")
  const [changeMade, setChangeMade] = useState(null)
  const [errorHappened, setError] = useState(null)

  useEffect(() => {
    phoneService
    .getAll()
    .then(responseData => {
      setPersons(responseData)
    })
  }, [changeMade])


  const handleNewName = (event) => {
    const name = event.target.value
    setNewName(name)
  }

  const handleNewNumber = (event) => {
    const number = event.target.value
    setNewNumber(number)
  }


  const makeChange = (message) => {
    setChangeMade(message)
    setTimeout(() => {
      setChangeMade(null)
    }, 3000)
  }

  const addNewName = (event) => {
    event.preventDefault()
    const person_names = persons.map(person => person.name)
    if (person_names.indexOf(newName) === -1) {
      const newPerson = {
        name: newName,
        number: newNumber
      }

      phoneService
      .create(newPerson)
      .then(createdPerson => {
        setPersons(persons.concat(createdPerson))
        setNewName("")
        setNewNumber("")
        makeChange(`Added ${createdPerson.name}`)
      })
      .catch(error => {
        setError(error.response.data.error)
        setTimeout(() => {
          setError(null)
        }, 3000)
      })

    } else {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const newPerson = {
          name: newName,
          number: newNumber
        }
        const id = persons.filter(person => person.name === newName)[0].id
        console.log(id)
        phoneService.update(id, newPerson)
        .then(makeChange(`Changed the number of ${newName}`))
        .catch(error => {
          //setError(`Information of ${newName} has already been removed from server`)
          setError(error.response.data.error)
          setChangeMade(null)
          setTimeout(() => {
            setError(null)
          }, 4000)
        })
        setNewName("")
        setNewNumber("")
      }
    }
  }

  const handleFilterChange = (event) => {
    const filter = event.target.value
    setNewFilter(filter)
  }

  const handleDelete = (event) => {
    const id = event.target.value
    console.log(id)
    const toDelete = persons.filter(person => person.id === id)[0].name
    if (window.confirm(`do you really want to delete ${toDelete}`)) {
      phoneService.remove(id)
      const newData = persons.filter(person => person.id !== id)
      setPersons(newData)
      makeChange(`Deleted ${toDelete} from the phonebook`)
    }
  }

  return (
    <div>
      <h1>Phonebook</h1>
      <Notification message={changeMade} />
      <Error message = {errorHappened}/>
      <Filter filter_str = {newFilter} handle = {handleFilterChange}/>
      <h3>add a new name</h3>
      <form>
        <div>
          name: <input 
          value={newName}
          onChange={handleNewName}/>
        </div>
        <div>
          number: <input
          value={newNumber}
          onChange={handleNewNumber}/>
        </div>
        <div>
          <button type = "submit" onClick={addNewName}>add</button>
        </div>
        </form>
      <h2>Numbers</h2>
      <FilteredList persons={persons} newFilter = {newFilter} handle = {handleDelete}/>
    </div>
  )

}

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className="notification">
      {message}
    </div>
  )
}

const Error = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className="error">
      {message}
    </div>
  )
}

export default App
