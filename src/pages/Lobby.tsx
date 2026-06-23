import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useGameStore } from '../store/useGameStore'
import { Users, User, Play, Crown } from 'lucide-react'

export default function Lobby() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { profile, currentRoom, isHost, setRoom } = useGameStore()
  
  const [players, setPlayers] = useState<any[]>([])
  const [roomData, setRoomData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) return;

    // Fetch initial room data
    const fetchRoom = async () => {
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*, host:profiles!rooms_host_id_fkey(username)')
        .eq('code', code)
        .single()

      if (error || !room) {
        alert("Salon introuvable !")
        navigate('/')
        return
      }
      
      setRoomData(room)
      // Check if user is host
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user.id === room.host_id) {
        setRoom(code, true)
      } else {
        setRoom(code, false)
      }

      // Fetch players
      const { data: pData } = await supabase
        .from('players')
        .select('*, profile:profiles(*)')
        .eq('room_id', room.id)
      
      if (pData) setPlayers(pData)
      setLoading(false)
    }

    fetchRoom()

    // Realtime subscriptions
    const channel = supabase.channel(`room_${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, payload => {
        // Simple reload for now, optimize later
        fetchRoom() 
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms' }, payload => {
        if (payload.new.status === 'playing') {
          navigate(`/game/${code}`)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [code, navigate, setRoom])

  const startGame = async () => {
    if (!isHost || !roomData) return;
    await supabase.from('rooms').update({ status: 'playing', phase: 'night' }).eq('id', roomData.id)
    navigate(`/game/${code}`)
  }

  if (loading) return <div className="min-h-[100dvh] flex items-center justify-center bg-bloodmoon-dark">Chargement...</div>

  return (
    <div className="min-h-[100dvh] flex flex-col items-center p-6 bg-bloodmoon-dark">
      {/* Header */}
      <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 mb-8 flex justify-between items-center shadow-xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Salon <span className="text-bloodmoon-purple tracking-widest">{code}</span>
          </h1>
          <p className="text-white/60 mt-1 flex items-center gap-2">
            Hôte: {roomData.host?.username || 'Inconnu'} {isHost && <Crown className="w-4 h-4 text-bloodmoon-sun" />}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <Users className="w-5 h-5 text-bloodmoon-villager" />
            {players.length} / {roomData.settings.max_players} Joueurs
          </div>
        </div>
      </div>
      
      {/* Grille des joueurs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-4xl mb-auto">
        {players.map((p, i) => (
          <div key={p.id} className="bg-slate-800/80 backdrop-blur p-4 rounded-2xl flex flex-col items-center border border-slate-700 shadow-lg relative">
            {roomData.host_id === p.profile_id && (
              <Crown className="absolute -top-3 -right-3 w-6 h-6 text-bloodmoon-sun bg-slate-900 rounded-full p-1" />
            )}
            <div className="w-16 h-16 bg-slate-700 rounded-full mb-3 border-2 border-slate-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white/30" />
            </div>
            <span className="font-semibold truncate w-full text-center">{p.profile?.username || `Joueur ${i+1}`}</span>
          </div>
        ))}
        {/* Empty slots placeholders */}
        {Array.from({ length: Math.max(0, roomData.settings.max_players - players.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-slate-900/40 border border-slate-800 border-dashed p-4 rounded-2xl flex flex-col items-center justify-center opacity-50">
             <div className="w-16 h-16 rounded-full mb-3 border-2 border-slate-700 border-dashed"></div>
             <span className="text-sm text-slate-500">Vide</span>
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="w-full max-w-4xl mt-8 pt-8 border-t border-slate-800 flex justify-center">
        {isHost ? (
          <button 
            onClick={startGame}
            disabled={players.length < 3}
            className="bg-bloodmoon-purple hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-bloodmoon-purple text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition flex items-center gap-3"
          >
            <Play className="w-6 h-6" fill="currentColor" />
            Lancer la Partie
          </button>
        ) : (
          <div className="text-xl font-semibold text-white/60 animate-pulse">
            En attente de l'hôte...
          </div>
        )}
      </div>
    </div>
  )
}
