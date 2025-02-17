import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import UserPanel from './Components/UserPanel'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <UserPanel/>
    </>
  )
}

export default App
