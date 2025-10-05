import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore'

interface Task {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: Date;
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Task))
        setTasks(tasksData)
      })
      return unsubscribe
    }
  }, [user])

  const handleAuth = async () => {
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      setEmail('')
      setPassword('')
    } catch (error) {
      console.error('Auth error:', error)
      alert(`${isRegister ? 'Register' : 'Login'} failed`)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const addTask = async () => {
    if (!user) return
    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTask.title,
        description: newTask.description,
        userId: user.uid,
        createdAt: new Date()
      })
      setNewTask({ title: '', description: '' })
    } catch (error) {
      console.error('Add task error:', error)
    }
  }

  const editTask = (task: Task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDesc(task.description || '')
  }

  const saveTask = async () => {
    if (!editingId) return
    try {
      await updateDoc(doc(db, 'tasks', editingId), {
        title: editTitle,
        description: editDesc
      })
      setEditingId(null)
    } catch (error) {
      console.error('Update task error:', error)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id))
    } catch (error) {
      console.error('Delete task error:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md">
          <h1 className="text-2xl mb-4">{isRegister ? 'Register' : 'Login'}</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border mb-4"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border mb-4"
          />
          <button onClick={handleAuth} className="w-full bg-blue-500 text-white p-2 mb-2">{isRegister ? 'Register' : 'Login'}</button>
          <button onClick={() => setIsRegister(!isRegister)} className="w-full text-blue-500">{isRegister ? 'Already have an account? Login' : 'Need an account? Register'}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl">Todo App</h1>
        <button onClick={logout} className="bg-red-500 text-white p-2">Logout</button>
      </div>
      <div className="mb-8">
        <input
          placeholder="Title"
          value={newTask.title}
          onChange={e => setNewTask({...newTask, title: e.target.value})}
          className="p-2 border mr-2"
        />
        <input
          placeholder="Description"
          value={newTask.description}
          onChange={e => setNewTask({...newTask, description: e.target.value})}
          className="p-2 border mr-2"
        />
        <button onClick={addTask} className="bg-green-500 text-white p-2">Add Task</button>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="bg-white p-4 mb-2 rounded shadow">
            {editingId === task.id ? (
              <div>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-2 border mb-2"
                  placeholder="Title"
                />
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full p-2 border mb-2"
                  placeholder="Description"
                />
                <button onClick={saveTask} className="bg-blue-500 text-white p-2 mr-2">Save</button>
                <button onClick={cancelEdit} className="bg-gray-500 text-white p-2">Cancel</button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl">{task.title}</h2>
                <p>{task.description}</p>
                <small>{task.createdAt?.toLocaleString() || new Date(task.createdAt).toLocaleString()}</small>
                <div className="mt-2">
                  <button onClick={() => editTask(task)} className="bg-yellow-500 text-white p-1 mr-2">Edit</button>
                  <button onClick={() => deleteTask(task.id)} className="bg-red-500 text-white p-1">Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App;
