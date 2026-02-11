import { useState, useEffect } from 'react'
import axios from 'axios'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personService from './services/persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addName = (event) => {  
    event.preventDefault()
    const existingPerson = persons.find(person => person.name === newName)
    if (existingPerson) {
      const ok = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )
      if (ok) {
        const updatedPerson = { ...existingPerson, number: newNumber }
        personService
          .update(existingPerson.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => (p.id !== existingPerson.id ? p : returnedPerson)))
            showNotification(`Changed number for ${returnedPerson.name}`, 'success')
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            showNotification(error.response.data.error, 'error')
            setPersons(persons.filter(p => p.id !== existingPerson.id))
          })
      }
      return
    }
    if (persons.some(person => person.number === newNumber)){
      alert(`${newNumber} is already added to phonebook`)
      return
    }
    const nameObject = {
      name: newName,
      number: newNumber,
    }
    personService
      .create(nameObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        showNotification(`Added ${returnedPerson.name}`, 'success')
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        showNotification(error.response.data.error, 'error')
      })
  }

  const handleNameChange = (event) => {
    console.log(event.target.value)
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    console.log(event.target.value)
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    console.log(event.target.value)
    setFilter(event.target.value)
  }

  const handleDelete = (id, name) => {
    const ok = window.confirm(`Delete ${name}?`)
    if (!ok) return

    personService
      .remove(id)
      .then(() => {
        setPersons(persons.filter(p => p.id !== id))
      })
      .catch(error => {
        showNotification(
          `Information of ${name} has already been removed from server`,
          'error'
        )
        setPersons(persons.filter(p => p.id !== id))
      })
  }

  const showNotification = (text, type = 'success') => {
    setMessageType(type)
    setMessage(text)
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} type={messageType} />
      <Filter 
        filter={filter} 
        handleFilterChange={handleFilterChange} 
      />
      <h3>Add a new</h3>
      <PersonForm 
        addName={addName} 
        newName={newName} 
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <Persons persons={personsToShow} handleDelete={handleDelete} />
    </div>
  )
}

export default App
