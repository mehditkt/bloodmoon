import { useParams } from 'react-router-dom'

export default function Lobby() {
  const { code } = useParams()

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Salon: {code}</h1>
      <p className="text-white/70 mb-8">En attente de joueurs...</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
        {/* Grille des joueurs (Placeholders) */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-800 p-4 rounded-xl flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full mb-2 border-2 border-bloodmoon-purple"></div>
            <span className="font-semibold">Joueur {i + 1}</span>
          </div>
        ))}
      </div>
      
      <button className="mt-12 bg-bloodmoon-wolf hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-[0_0_15px_rgba(225,29,72,0.4)] transition">
        Démarrer la Partie
      </button>
    </div>
  )
}
