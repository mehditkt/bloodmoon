-- Bloodmoon Supabase Schema

-- Profiles table (stores avatar customization and stats)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  avatar_style jsonb DEFAULT '{"skin": "light", "hair": "short_brown", "clothes": "rags", "eyes": "normal", "mouth": "smile"}',
  games_played integer DEFAULT 0,
  wins integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Rooms table (lobbies)
CREATE TABLE public.rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  host_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'finished')),
  phase text DEFAULT 'setup' CHECK (phase IN ('setup', 'day', 'night')),
  settings jsonb DEFAULT '{"max_players": 12, "day_time_sec": 120, "night_time_sec": 60, "active_roles": ["werewolf", "werewolf", "seer", "witch", "zoubir"]}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Players table (users in a room)
CREATE TABLE public.players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text,
  is_alive boolean DEFAULT true,
  zoubir_target_id uuid, -- If Zoubir copied this player
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id, profile_id)
);

-- Game Logs table
CREATE TABLE public.game_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  content text NOT NULL,
  type text DEFAULT 'info', -- 'info', 'kill', 'vote', 'phase_change'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chats table
CREATE TABLE public.chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id uuid REFERENCES public.players(id) ON DELETE CASCADE,
  message text NOT NULL,
  channel text DEFAULT 'global' CHECK (channel IN ('global', 'wolves', 'ghosts')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rooms, players, game_logs, chats;

-- Basic RLS Policies (Draft)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Rooms are viewable by everyone." ON rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms." ON rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update their room." ON rooms FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Players can be seen by everyone." ON players FOR SELECT USING (true);
CREATE POLICY "Users can join rooms." ON players FOR INSERT WITH CHECK (auth.uid() = profile_id);
-- In a real app, only host or server edge function should update roles to prevent cheating.

CREATE POLICY "Game logs are viewable by everyone." ON game_logs FOR SELECT USING (true);
CREATE POLICY "Chats viewable based on rules." ON chats FOR SELECT USING (
  channel = 'global' OR 
  (channel = 'wolves' AND EXISTS (SELECT 1 FROM players WHERE id = chats.player_id AND role = 'werewolf')) OR
  (channel = 'ghosts' AND EXISTS (SELECT 1 FROM players WHERE id = chats.player_id AND is_alive = false))
);
CREATE POLICY "Players can insert chats." ON chats FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM players WHERE id = player_id AND profile_id = auth.uid())
);
