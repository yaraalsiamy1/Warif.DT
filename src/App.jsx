import { useState } from 'react'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [screen, setScreen] = useState('login')

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {screen === 'login' && (
        <SignIn onLogin={() => setScreen('dashboard')} />
      )}
      {screen === 'dashboard' && (
        <Dashboard />
      )}
    </div>
  )
}