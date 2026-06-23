import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useGameStore } from '../store/useGameStore'
import { rolesCatalog } from '../rolesConfig'
import { motion } from 'framer-motion'
import { Settings, MessageCircle, Send } from 'lucide-react'

export default function Game() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { profile, isHost } = useGameStore()
  
  const [room, setRoom] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [me, setMe] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [cardRevealed, setCardRevealed] = useState(false)

  useEffect(() => {
    if (!profile) {
      navigate('/')
      return
    }

    const fetchData = async () => {
      const { data: rData } = await supabase.from('rooms').select('*').eq('code', code).single()
      if (rData) setRoom(rData)

      const { data: pData } = await supabase.from('players').select('*, profile:profiles(username)').eq('room_id', rData?.id)
      if (pData) {
        setPlayers(pData)
        setMe(pData.find((p: any) => p.profile_id === profile.id))
      }

      const { data: mData } = await supabase.from('chats').select('*, player:players(profile:profiles(username))').eq('room_id', rData?.id).order('created_at', { ascending: true })
      if (mData) setMessages(mData)
    }

    fetchData()

    const channel = supabase.channel(`game_${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, payload => {
        setRoom(payload.new)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        fetchData() // Simple reload
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, () => {
        fetchData() // Reload chats
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [code, profile, navigate])

  const distributeRoles = async () => {
    if (!isHost || !room) return
    const rolesPool = [...room.settings.active_roles]
    // Fill or trim pool to match players count
    while (rolesPool.length < players.length) rolesPool.push('villager')
    rolesPool.sort(() => Math.random() - 0.5)

    const updates = players.map((p, i) => ({
      id: p.id,
      room_id: p.room_id,
      profile_id: p.profile_id,
      role: rolesPool[i],
    }))
    
    await supabase.from('players').upsert(updates)
    await supabase.from('rooms').update({ phase: 'night' }).eq('id', room.id)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !me) return
    await supabase.from('chats').insert({
      room_id: room.id,
      player_id: me.id,
      message: chatInput,
      channel: room.phase === 'night' && me.role === 'werewolf' ? 'wolves' : 'global'
    })
    setChatInput('')
  }

  if (!room || !me) return <div className="min-h-[100dvh] flex items-center justify-center bg-bloodmoon-dark">Chargement...</div>

  const myRoleDef = me.role ? rolesCatalog[me.role] : null

  return (
    <div className="min-h-[100dvh] h-[100dvh] flex flex-col bg-bloodmoon-dark overflow-hidden transition-colors duration-1000">
      {/* Background Theme Switch */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${room.phase === 'night' ? 'opacity-100' : 'opacity-0'}`}>
         {/* Night Theme Elements */}
         <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-64 h-64 bg-slate-200 rounded-full blur-[2px] shadow-[0_0_100px_rgba(139,92,246,0.3)]"></div>
      </div>
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${room.phase === 'day' ? 'opacity-100' : 'opacity-0'}`}>
         {/* Day Theme Elements */}
         <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120vw] h-[50vh] bg-gradient-to-b from-bloodmoon-sun/40 to-transparent blur-3xl"></div>
      </div>

      {/* Header compact */}
      <header className="p-4 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 flex justify-between items-center z-10">
        <div>
          <h2 className="font-bold text-lg">Village <span className="text-white/50 text-sm">({code})</span></h2>
          <span className={`text-sm font-bold ${room.phase === 'night' ? 'text-bloodmoon-purple' : 'text-bloodmoon-sun'}`}>
            {room.phase === 'setup' ? 'Préparation' : room.phase === 'night' ? 'La nuit tombe...' : 'Le jour se lève'}
          </span>
        </div>
        <button className="text-white/70 hover:text-white transition"><Settings className="w-5 h-5" /></button>
      </header>

      {/* Zone centrale : Grille des joueurs */}
      <main className="flex-1 overflow-y-auto p-4 z-10 no-scrollbar">
        {room.phase === 'setup' && isHost && !me.role && (
          <div className="w-full flex justify-center mb-8">
            <button onClick={distributeRoles} className="bg-bloodmoon-purple px-6 py-3 rounded-full font-bold shadow-lg hover:bg-purple-500 transition">
              Distribuer les Rôles
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {players.map((p) => {
            const isMe = p.id === me.id
            const showRole = isMe && cardRevealed && p.role
            
            return (
              <div key={p.id} className="flex flex-col items-center group relative cursor-pointer" onClick={() => isMe && setCardRevealed(true)}>
                {/* 3D Flip Card */}
                <div className="w-20 h-28 perspective-1000">
                  <motion.div 
                    className="w-full h-full relative preserve-3d"
                    animate={{ rotateY: showRole ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    {/* Back of Card */}
                    <div className="absolute inset-0 backface-hidden bg-slate-800 rounded-xl border-2 border-slate-700 shadow-lg flex items-center justify-center">
                      <Moon className="w-8 h-8 text-white/10" />
                    </div>
                    {/* Front of Card */}
                    <div className="absolute inset-0 backface-hidden bg-slate-900 rounded-xl border-2 shadow-[0_0_15px_rgba(139,92,246,0.6)] flex items-center justify-center rotate-y-180"
                         style={{ borderColor: p.role === 'werewolf' ? '#E11D48' : p.role === 'zoubir' ? '#8B5CF6' : '#10B981' }}>
                      <span className="text-xs font-bold text-center px-1">{rolesCatalog[p.role]?.name}</span>
                    </div>
                  </motion.div>
                </div>
                
                <span className="mt-2 text-xs font-semibold truncate w-full text-center bg-slate-900/50 px-2 py-1 rounded-full">
                  {p.profile?.username}
                </span>

                {!p.is_alive && (
                  <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex items-center justify-center backdrop-grayscale z-20">
                    <span className="text-red-500 font-bold text-sm transform -rotate-12">MORT</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Info Rôle Personnel */}
        {cardRevealed && myRoleDef && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-slate-900/80 border border-slate-700 rounded-2xl p-4 text-center">
            <h3 className="text-xl font-bold text-bloodmoon-purple">{myRoleDef.name}</h3>
            <p className="text-sm text-white/70 mt-2">{myRoleDef.description}</p>
          </motion.div>
        )}
      </main>

      {/* Zone basse : Chat superposé (Style Wolfy) */}
      <footer className="h-64 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex flex-col z-20">
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar flex flex-col-reverse">
           {/* Les messages sont inversés pour le flex-col-reverse ou on les map à l'envers */}
           {[...messages].reverse().map(msg => (
             <div key={msg.id} className={`text-sm ${msg.player_id === me.id ? 'text-right' : 'text-left'}`}>
               <span className="font-bold text-white/60 text-xs">{msg.player?.profile?.username}</span>
               <div className={`inline-block px-3 py-2 rounded-2xl max-w-[80%] mt-1 ${msg.channel === 'wolves' ? 'bg-red-900/50 border border-red-800 text-red-200' : 'bg-slate-800 text-white'}`}>
                 {msg.message}
               </div>
             </div>
           ))}
        </div>
        <form onSubmit={sendMessage} className="p-3 bg-slate-950 flex gap-2 items-center">
          <input 
            type="text" 
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder={room.phase === 'night' && me.role !== 'werewolf' ? "Vous dormez..." : "Discuter..."} 
            disabled={room.phase === 'night' && me.role !== 'werewolf'}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 focus:outline-none focus:border-bloodmoon-day disabled:opacity-50"
          />
          <button type="submit" disabled={room.phase === 'night' && me.role !== 'werewolf'} className="p-2 bg-bloodmoon-purple rounded-full hover:bg-purple-500 disabled:opacity-50 transition">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  )
}
