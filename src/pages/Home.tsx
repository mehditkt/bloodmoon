import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Play, Users, ChevronRight, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useGameStore } from '../store/useGameStore'
import type { PlayerProfile } from '../store/useGameStore'
import Avatar from '../components/Avatar'
import type { AvatarOptions } from '../components/Avatar'

const skinOptions: AvatarOptions['skin'][] = ['light', 'tan', 'dark', 'zombie']
const hairOptions: AvatarOptions['hair'][] = ['short_brown', 'long_blonde', 'spiky_black', 'bald']
const clothesOptions: AvatarOptions['clothes'][] = ['rags', 'armor', 'suit', 'cloak']

export default function Home() {
  const navigate = useNavigate()
  const { profile, setProfile } = useGameStore()
  const [roomCode, setRoomCode] = useState('')
  const [username, setUsername] = useState('')
  
  const [avatarOpts, setAvatarOpts] = useState<AvatarOptions>({
    skin: 'light',
    hair: 'short_brown',
    clothes: 'rags'
  })
  
  const [isSaving, setIsSaving] = useState(false)

  // Load existing profile from session
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (data) {
          setProfile(data as PlayerProfile)
          setUsername(data.username)
          if (data.avatar_style) setAvatarOpts(data.avatar_style)
        }
      }
    }
    fetchProfile()
  }, [setProfile])

  const saveProfile = async () => {
    if (!username.trim()) return alert("Veuillez entrer un pseudo.")
    setIsSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert("Erreur d'authentification.")

    const newProfile = {
      id: session.user.id,
      username: username.trim(),
      avatar_style: avatarOpts
    }

    const { error } = await supabase.from('profiles').upsert(newProfile)
    
    if (error) {
      alert(error.message.includes('unique') ? "Ce pseudo est déjà pris." : "Erreur de sauvegarde.")
    } else {
      setProfile(newProfile as PlayerProfile)
    }
    setIsSaving(false)
  }

  const cycleOption = (type: keyof AvatarOptions, direction: 1 | -1) => {
    const opts = {
      skin: skinOptions,
      hair: hairOptions,
      clothes: clothesOptions
    }[type] as string[];
    
    setAvatarOpts(prev => {
      const currentIndex = opts.indexOf(prev[type])
      let nextIndex = currentIndex + direction
      if (nextIndex < 0) nextIndex = opts.length - 1
      if (nextIndex >= opts.length) nextIndex = 0
      return { ...prev, [type]: opts[nextIndex] }
    })
  }

  const handleCreateRoom = async () => {
    if (!profile) return alert("Veuillez d'abord sauvegarder votre profil.")
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data, error } = await supabase.from('rooms').insert({
      code: newCode,
      host_id: profile.id,
    }).select().single()

    if (!error && data) {
      // Add host to players table
      await supabase.from('players').insert({
        room_id: data.id,
        profile_id: profile.id
      })
      navigate(`/room/${newCode}`)
    }
  }

  const handleJoinRoom = async () => {
    if (!profile) return alert("Veuillez d'abord sauvegarder votre profil.")
    if (!roomCode) return
    
    // Check if room exists
    const { data: room } = await supabase.from('rooms').select('id').eq('code', roomCode.toUpperCase()).single()
    if (!room) return alert("Salon introuvable.")

    // Join
    const { error } = await supabase.from('players').insert({
      room_id: room.id,
      profile_id: profile.id
    })

    if (!error || error.code === '23505') { // 23505 = already exists (unique constraint)
      navigate(`/room/${roomCode.toUpperCase()}`)
    } else {
      alert("Erreur lors de la connexion au salon.")
    }
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-bloodmoon-dark flex flex-col items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-slate-200/10 rounded-full blur-3xl opacity-50 shadow-[0_0_100px_rgba(255,255,255,0.2)]"></div>
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-64 h-64 bg-slate-300 rounded-full shadow-[0_0_60px_rgba(255,255,255,0.8)] opacity-90"></div>
        <div className="absolute bottom-0 left-0 w-full h-[40vh] bg-gradient-to-t from-slate-900 to-transparent"></div>
      </div>

      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 text-white/90">
          <Moon className="w-8 h-8 text-white" fill="currentColor" />
          <span className="font-bold text-2xl tracking-wider">BLOODMOON</span>
        </div>
      </header>

      <main className="z-10 w-full max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
        
        {/* Left Column: Avatar Customization */}
        <div className="flex flex-col items-center justify-center bg-slate-900/40 p-8 rounded-3xl border border-slate-800 backdrop-blur">
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative mb-12"
          >
            {/* Floating Island */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 bg-slate-800 rounded-[100%] shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-t-4 border-green-900"></div>
            <Avatar options={avatarOpts} size={180} />
          </motion.div>

          <div className="w-full max-w-xs space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1 block">Pseudo</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-center focus:border-bloodmoon-purple outline-none"
                placeholder="Votre nom..."
              />
            </div>
            
            {(['skin', 'hair', 'clothes'] as const).map(attr => (
              <div key={attr} className="flex items-center justify-between bg-slate-950/50 rounded-xl p-1 border border-slate-800">
                <button onClick={() => cycleOption(attr, -1)} className="p-2 hover:bg-slate-800 rounded-lg"><ChevronLeft size={16}/></button>
                <span className="text-sm font-semibold capitalize">{avatarOpts[attr].replace('_', ' ')}</span>
                <button onClick={() => cycleOption(attr, 1)} className="p-2 hover:bg-slate-800 rounded-lg"><ChevronRight size={16}/></button>
              </div>
            ))}

            <button 
              onClick={saveProfile}
              disabled={isSaving}
              className="w-full mt-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white py-3 rounded-xl font-semibold transition shadow-lg disabled:opacity-50"
            >
              {isSaving ? "Sauvegarde..." : profile ? "Profil Sauvegardé ✓" : "Créer le Profil"}
            </button>
          </div>
        </div>

        {/* Right Column: Menu */}
        <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
          <div className={`transition-all ${!profile ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Play className="w-5 h-5 text-bloodmoon-purple" fill="currentColor"/> Rejoindre un Salon</h2>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="CODE (ex: AX79)" 
                  maxLength={6}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center uppercase tracking-widest focus:outline-none focus:border-bloodmoon-purple"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
                <button 
                  onClick={handleJoinRoom}
                  className="bg-bloodmoon-purple hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  Go
                </button>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-bloodmoon-sun" fill="currentColor" /> Créer un Salon</h2>
              <button 
                onClick={handleCreateRoom}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-4 rounded-xl font-semibold transition"
              >
                Nouveau Salon Privé
              </button>
            </div>
          </div>
          
          {!profile && (
            <p className="text-center text-red-400 text-sm font-semibold animate-pulse">
              * Veuillez créer votre profil pour jouer.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
