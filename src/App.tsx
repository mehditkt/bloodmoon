import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Game from './pages/Game'

function App() {
  return (
    <BrowserRouter>
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
