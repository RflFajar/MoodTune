export type Mood = 
  | 'Bosan' 
  | 'Sedang Belajar' 
  | 'Sedang Bermain Game' 
  | 'Sedang diperjalanan' 
  | 'Sedih' 
  | 'Sedang Jogging' 
  | 'Bersemangat' 
  | 'Kangen';

export interface Song {
  id: string;
  title: string;
  artist: string;
  moods: Mood[];
  explanation: string;
  addedAt: number;
}

export interface Playlist {
  id: Mood;
  name: string;
  icon: string;
  description: string;
}

export const MOOD_PLAYLISTS: Playlist[] = [
  { id: 'Bosan', name: 'Anti Bosan', icon: 'Coffee', description: 'Lagu untuk menemani waktu luangmu.' },
  { id: 'Sedang Belajar', name: 'Fokus Belajar', icon: 'BookOpen', description: 'Lagu tenang untuk konsentrasi maksimal.' },
  { id: 'Sedang Bermain Game', name: 'Gaming Mode', icon: 'Gamepad2', description: 'Energi tambahan untuk sesi gaming-mu.' },
  { id: 'Sedang diperjalanan', name: 'On The Road', icon: 'Car', description: 'Teman setia di setiap kilometer.' },
  { id: 'Sedih', name: 'Melow Vibes', icon: 'CloudRain', description: 'Ruang untuk merenung dan merasakan.' },
  { id: 'Sedang Jogging', name: 'Jogging Track', icon: 'Run', description: 'Pacu langkahmu dengan beat yang pas.' },
  { id: 'Bersemangat', name: 'High Energy', icon: 'Zap', description: 'Mood booster untuk hari yang produktif.' },
  { id: 'Kangen', name: 'Nostalgia Kangen', icon: 'Heart', description: 'Lagu yang membawa kembali kenangan manis.' },
];
