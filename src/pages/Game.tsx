import { useParams } from 'react-router-dom'

export default function Game() {
  const { code } = useParams()

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header compact (Mobile-first) */}
      <header className="p-4 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex justify-between items-center z-10">
        <div>
          <h2 className="font-bold text-lg">Salon {code}</h2>
          <span className="text-sm text-bloodmoon-sun">Jour 1 • 01:20</span>
        </div>
        <button className="bg-slate-800 p-2 rounded-lg">⚙️</button>
      </header>

      {/* Zone centrale : Grille des joueurs */}
      <main className="flex-1 overflow-y-auto p-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 content-start">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-slate-800 aspect-square rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Flip Card Effect Placeholder */}
            <div className="w-12 h-12 bg-slate-700 rounded-full mb-1"></div>
            <span className="text-xs font-semibold truncate w-full text-center px-1">Joueur {i + 1}</span>
          </div>
        ))}
      </main>

      {/* Zone basse : Actions et Chat */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2 z-10">
        <input 
          type="text" 
          placeholder="Envoyer un message..." 
          className="flex-1 bg-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-bloodmoon-day"
        />
        <button className="bg-bloodmoon-purple px-6 py-2 rounded-xl font-bold">Voter</button>
      </footer>
    </div>
  )
}
