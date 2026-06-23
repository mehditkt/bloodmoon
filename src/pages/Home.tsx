import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Play, Users, User, Trophy, Settings } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-bloodmoon-dark flex flex-col items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-slate-200/10 rounded-full blur-3xl opacity-50 shadow-[0_0_100px_rgba(255,255,255,0.2)]"></div>
        {/* Moon placeholder */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-64 h-64 bg-slate-300 rounded-full shadow-[0_0_60px_rgba(255,255,255,0.8)] opacity-90"></div>
        {/* Mountains/Forest placeholder */}
        <div className="absolute bottom-0 left-0 w-full h-[40vh] bg-gradient-to-t from-slate-900 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 text-white/90">
          <Moon className="w-8 h-8 text-white" fill="currentColor" />
          <span className="font-bold text-2xl tracking-wider">BLOODMOON</span>
        </div>
        <div className="flex gap-4">
          <button className="text-white/70 hover:text-white transition"><Trophy className="w-6 h-6" /></button>
          <button className="text-white/70 hover:text-white transition"><Settings className="w-6 h-6" /></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="z-10 w-full max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
        
        {/* Left Column: Avatar Customization */}
        <div className="flex flex-col items-center justify-center">
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Floating Island */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 bg-slate-800 rounded-[100%] shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-t-4 border-green-900"></div>
            {/* Avatar Placeholder */}
            <div className="relative w-32 h-64 bg-slate-700 rounded-t-full border-4 border-slate-600 flex flex-col items-center justify-start pt-8">
              <div className="w-16 h-16 bg-bloodmoon-day rounded-full"></div>
              <div className="mt-4 text-xs text-white/50">Avatar</div>
            </div>
          </motion.div>
          <button className="mt-12 px-6 py-2 bg-slate-800/80 backdrop-blur rounded-full text-sm flex items-center gap-2 border border-slate-700 hover:bg-slate-700 transition">
            <User className="w-4 h-4" /> Personnaliser
          </button>
        </div>

        {/* Right Column: Menu Panels */}
        <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
          
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Play className="w-5 h-5 text-bloodmoon-purple" fill="currentColor"/> Rejoindre un Salon</h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Code (ex: AX79-LK)" 
                maxLength={7}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center uppercase tracking-widest focus:outline-none focus:border-bloodmoon-purple focus:ring-1 focus:ring-bloodmoon-purple transition"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <button 
                onClick={() => roomCode && navigate(`/room/${roomCode}`)}
                className="bg-bloodmoon-purple hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]"
              >
                Go
              </button>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-bloodmoon-sun" fill="currentColor" /> Créer un Salon</h2>
            <button 
              onClick={() => navigate('/room/new')}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              Nouveau Salon Privé
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
