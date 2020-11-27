import { useState, useEffect } from 'react';
// import './App.css';
import { withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';

function App() {

  // state values
  const [notes, setNotes] = useState([])
  const [note, setNote] = useState("")
  const [id, setId] = useState("")

  // onmount
  useEffect(() => {
    fetchNotes();
  }, [])

  // Class Functions

  const hasExistingNote = () => {
    if(id) {
      const isNote = notes.findIndex(note => note.id === id) > -1
      return isNote;
    }
    return false
  }
  const fetchNotes = async () => {
    const result = await API.graphql(graphqlOperation(listNotes));
    setNotes(result.data.listNotes.items);
  }
  const handleSetNote = (item) => {
    setNote(item.note);
    setId(item.id);
  }
  const handleDeleteNote = async (noteId) => {
    const input = {
      id: noteId
    }
    const result = await API.graphql(graphqlOperation(deleteNote, { input }))
    const deletedNoteId = result.data.deleteNote.id;
    setNotes( notes.filter((item) => item.id !== deletedNoteId) )
  }
  const handleChangeNote = event => {
    setNote(event.target.value)
  }
  const handleAddNote = async event => {
    event.preventDefault();
    if(hasExistingNote()) {
      handleUpdateNote()
    }
    else {
      const input = {
        note
      }
      const result = await API.graphql(graphqlOperation(createNote, { input }))
      const newNote = result.data.createNote;
      setNotes([
        ...notes,
        newNote
      ])
      setNote("");
    }
  }

  const handleUpdateNote = async () => {
    const input = {
      note,
      id
    }
    const result = await API.graphql(graphqlOperation(updateNote, { input }))
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex(note => note.id === id) 
    setNotes([
      ...notes.slice(0, index),
      updatedNote,
      ...notes.slice(index+1)
    ])
    setNote("");
    setId("");

    
  }
  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      <h1 className="code f2-1">Amplify NoteTaker</h1>

      {/* Note Form */}
      <form onSubmit={handleAddNote} className="mb3">
        <input type="text" className="pa2 f4" placeholder="Write your note" onChange={handleChangeNote} value={note}/>
        <button className="pa2 f4" type="submit">
          {id ? "Update Note" : "Add Note"}
        </button>
      </form>

      {/* Notes List */}
      {notes.map(item => (
        <div key={item.id} className="flex items-center">
          <li onClick={() => handleSetNote(item)} className="list pa1 f3">
            {item.note}
          </li>
          <button onClick={() => handleDeleteNote(item.id)} className="bg-transparent bn f4">
            <span>&times;</span>
          </button>
        </div>
      ))}
    </div>
  );
}

export default withAuthenticator(App, {
  includeGreetings: true
});
