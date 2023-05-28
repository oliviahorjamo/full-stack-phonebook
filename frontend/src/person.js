const Person = ({person, handle}) => {
    return (
      <div>
      {person.name} {person.number} <button value = {person.id} onClick = { event => {handle(event)}}>delete</button>
      </div>
    )
  }

export default Person