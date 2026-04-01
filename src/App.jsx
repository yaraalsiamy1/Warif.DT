import { useState } from 'react'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [screen, setScreen] = useState('login')

  return (
    <>
      {screen === 'login' && (
        <SignIn onLogin={() => setScreen('dashboard')} />
      )}
      {screen === 'dashboard' && (
        <Dashboard />
      )}
    </>
  )
}