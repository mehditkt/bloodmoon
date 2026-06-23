import { create } from 'zustand'

export interface PlayerProfile {
  id: string
  username: string
  avatar_style: any
}

interface GameState {
  profile: PlayerProfile | null
  currentRoom: string | null
  isHost: boolean
  setProfile: (profile: PlayerProfile) => void
  setRoom: (roomCode: string, isHost?: boolean) => void
  leaveRoom: () => void
}

export const useGameStore = create<GameState>((set) => ({
  profile: null,
  currentRoom: null,
  isHost: false,
  setProfile: (profile) => set({ profile }),
  setRoom: (roomCode, isHost = false) => set({ currentRoom: roomCode, isHost }),
  leaveRoom: () => set({ currentRoom: null, isHost: false }),
}))
