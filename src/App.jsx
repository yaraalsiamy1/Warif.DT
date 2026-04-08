import { useState } from 'react'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [screen, setScreen] = useState('login')
  const [lang, setLang] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    return saved.language || 'ar';
  });

  function handleLangChange(newLang) {
    setLang(newLang);
    const saved = JSON.parse(localStorage.getItem('warif_user') || '{}');
    localStorage.setItem('warif_user', JSON.stringify({ ...saved, language: newLang }));
  }

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {screen === 'login' && (
        <SignIn onLogin={() => setScreen('dashboard')} lang={lang} onLangChange={handleLangChange} />
      )}
      {screen === 'dashboard' && (
        <Dashboard onLogout={() => setScreen('login')} lang={lang} onLangChange={handleLangChange} />
      )}
    </div>
  )
}
