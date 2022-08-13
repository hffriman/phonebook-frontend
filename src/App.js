import { useEffect, useState } from "react";
import personService from "./services/persons";


const Notification = ({message}) => {

  if (message === '') {
    return null
  }

  return(
    <div className="notification">
      {message}
    </div>
  )
}

const Error = ({error}) => {

  if (error === '') {
    return null
  }

  return(
    <div className="error">
      {error}
    </div>
  )
}

const Filter = (props) => {
  return(
    <div>
        filter shown with 
          <input
            value={props.searchName}
            onChange={props.handleSearchChange}
          />
      </div>
  )
}

const PersonForm = (props) => {
  return(
    <>
      <form onSubmit={props.addName}>
          <div>
            name: 
            <input 
              value={props.newName}
              onChange={props.handleNameChange}
            />
          </div>
          <div>
            number:
            <input
              value={props.newNumber}
              onChange={props.handleNumberChange}
            />
          </div>
          <div>
            <button type="submit">add</button>
          </div>
      </form>
    </>
  )
}

const Persons = (props) => {
  return(
    props.showResults.map((person) =>
      <Person 
        key={person.id} 
        name={person.name} 
        number={person.number} 
        id={person.id}
        deletionClick={props.deletionClick}
      />)
  )
}

const Person = (props) => {
  return(
    <div> 
      <p key={props.id}>{props.name} {props.number}
        <button onClick={() => props.deletionClick(props.id, props.name)}>delete</button>
      </p>
    </div>
  )
}

const App = () => {

  const [persons, setPersons] = useState([])

  const [searchName, setSearchName] = useState('')

  const [newName, setNewName] = useState('')

  const [newNumber, setNewNumber] = useState('')

  const [message, setMessage] = useState('')

  const [error, setError] = useState('')

  useEffect(() => {
    personService
      .getAll()
        .then(persons => {
          setPersons(persons)
      })
  }, [])

  const showResults = searchName === ''
    ? persons
    : persons.filter(person => person.name.toLowerCase().includes(searchName.toLowerCase()))

  const handleSearchChange = (event) => {
    setSearchName(event.target.value)
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const addName = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber
  }
    const namesLowerCase = persons.map(person => {
      return person.name.toLowerCase()
    })
    
    const newNameLowerCase = personObject.name.toLowerCase()
    
    if (namesLowerCase.includes(newNameLowerCase)) {
      if(window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        
        let selectedPersonId;

        persons.filter((mp) => {
            if (mp.name.toLowerCase() === newNameLowerCase) {
              selectedPersonId = mp.id
            }
            
            return selectedPersonId
        })

        const person = persons.find(p => p.id === selectedPersonId)
        const changedPerson = { ...person, name: newName, number: newNumber}

        personService
          .update(selectedPersonId, changedPerson)
            .then(returnedPerson => {
              setPersons(persons.map(person => person.id !== selectedPersonId ? person : returnedPerson))
              setMessage(`Updated ${newName}`)
              setTimeout(() => {
                setMessage('')
              }, 5000)
            })
          .catch(error => {
            setError(`Information of ${newName} has already been removed from server`)
            setTimeout(() => {
              setError('')
            }, 8000)
          })
      } 
    } else {    
          personService
            .create(personObject)
              .then(returnedPerson => {
                setPersons(persons.concat(returnedPerson))
                setNewName('')
                setNewNumber('')
                setMessage(`Added ${newName}`)
                setTimeout(() => {
                  setMessage('')
                }, 5000)
              })
      }
    }

  const prepareDeletion = (id, name) => {

    if (window.confirm(`Delete ${name}?`)) {
      personService.remove(id)
        .then(returnedPerson => {
          setPersons(persons.filter(p => p.id !== id))
          setMessage(`Deleted ${name}`)
          setTimeout(() => {
            setMessage('')
          }, 5000)
        })
    }
  }
    
  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message}/>
      <Error error={error}/>
      <Filter 
        searchName={searchName}
        handleSearchChange={handleSearchChange}
      />
      <h3>Add a new</h3>
      <PersonForm 
        addName={addName}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h3>Numbers</h3>
      <Persons 
        showResults={showResults}
        deletionClick={prepareDeletion}
      />
    </div>
  );
}

export default App;