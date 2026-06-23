import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Game from './pages/Game'

function App() {
  useEffect(() => {
    // Authentification anonyme automatique
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        const { error } = await supabase.auth.signInAnonymously()
        if (error) {
          console.error("Erreur d'authentification anonyme:", error.message)
        }
      }
    }
    initAuth()
  }, [])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-bloodmoon-dark text-white font-sans selection:bg-bloodmoon-purple selection:text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:code" element={<Lobby />} />
          <Route path="/game/:code" element={<Game />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
