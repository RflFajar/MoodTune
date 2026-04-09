import React, { useState, useEffect, useMemo } from 'react';
import { 
  Music, 
  Plus, 
  Search, 
  Trash2, 
  Coffee, 
  BookOpen, 
  Gamepad2, 
  Car, 
  CloudRain, 
  Zap, 
  Heart,
  Play,
  ChevronRight,
  Loader2,
  Activity,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Song, Mood, MOOD_PLAYLISTS } from './types';
import { categorizeSong } from './services/geminiService';

const ICON_MAP: Record<string, any> = {
  Coffee,
  BookOpen,
  Gamepad2,
  Car,
  CloudRain,
  Zap,
  Heart,
  Run: Activity
};

interface SongCardProps {
  song: Song;
  onRemove: (id: string) => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onRemove }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card overflow-hidden group hover:bg-white/10 transition-colors"
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors shrink-0">
            <Play size={20} className="text-white/40 group-hover:text-orange-500 transition-colors" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg leading-tight truncate">{song.title}</h3>
            <p className="text-white/60 text-sm truncate">{song.artist}</p>
            {song.explanation && (
              <p className="text-white/40 text-[11px] mt-1 italic line-clamp-2 max-w-md">
                "{song.explanation}"
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {song.moods.map(m => (
                <span key={m} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/40 uppercase tracking-wider border border-white/5">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button 
            onClick={() => onRemove(song.id)}
            className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [songs, setSongs] = useState<Song[]>(() => {
    const savedSongs = localStorage.getItem('moodtune_songs');
    if (savedSongs) {
      try {
        return JSON.parse(savedSongs);
      } catch (e) {
        console.error('Failed to parse saved songs', e);
        return [];
      }
    }
    return [];
  });
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMood, searchQuery]);

  // Save songs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('moodtune_songs', JSON.stringify(songs));
  }, [songs]);

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist) return;
    setError(null);

    // Check for duplicates
    const isDuplicate = songs.some(
      s => s.title.toLowerCase() === title.toLowerCase() && 
           s.artist.toLowerCase() === artist.toLowerCase()
    );

    if (isDuplicate) {
      setError(`Lagu "${title}" oleh ${artist} sudah ada di daftar!`);
      return;
    }

    setIsLoading(true);
    try {
      const { moods, explanation, isValid } = await categorizeSong(title, artist);
      
      if (!isValid) {
        setError(`Lagu "${title}" oleh ${artist} tidak dapat ditemukan. Pastikan judul dan penyanyi benar!`);
        setIsLoading(false);
        return;
      }

      const newSong: Song = {
        id: Math.random().toString(36).substring(7),
        title,
        artist,
        moods,
        explanation,
        addedAt: Date.now(),
      };
      setSongs(prev => [newSong, ...prev]);
      setTitle('');
      setArtist('');
    } catch (error) {
      console.error('Error adding song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeSong = (id: string) => {
    setSongs(prev => prev.filter(s => s.id !== id));
  };

  const filteredSongs = useMemo(() => {
    let result = songs;
    if (selectedMood) {
      result = result.filter(s => s.moods.includes(selectedMood));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.artist.toLowerCase().includes(q)
      );
    }
    return result;
  }, [songs, selectedMood, searchQuery]);

  const totalPages = Math.ceil(filteredSongs.length / ITEMS_PER_PAGE);
  const paginatedSongs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSongs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSongs, currentPage]);

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 md:px-8 lg:px-12">
      <div className="atmosphere" />
      
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar / Input Section */}
        <div className="lg:col-span-4 space-y-8">
          <header className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Music className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-serif font-bold tracking-tight">MoodTune</h1>
            </motion.div>
            <p className="text-white/60 text-sm font-medium">AI-Powered Playlist Decider</p>
          </header>

          <section className="glass-card p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Plus size={20} className="text-orange-500" />
              Tambah Lagu Baru
            </h2>
            <form onSubmit={handleAddSong} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Judul Lagu</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Hati-Hati di Jalan"
                  className="glass-input w-full"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Penyanyi</label>
                <input 
                  type="text" 
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Contoh: Tulus"
                  className="glass-input w-full"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Menganalisis Mood...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Tentukan Playlist
                  </>
                )}
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-white/40 font-bold px-2">Kategori Mood</h2>
            <div className="grid grid-cols-2 gap-3">
              {MOOD_PLAYLISTS.map((playlist) => {
                const Icon = ICON_MAP[playlist.icon] || Music;
                const isActive = selectedMood === playlist.id;
                const count = songs.filter(s => s.moods.includes(playlist.id)).length;

                return (
                  <button
                    key={playlist.id}
                    onClick={() => setSelectedMood(isActive ? null : playlist.id)}
                    className={cn(
                      "glass-card p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]",
                      isActive && "ring-2 ring-orange-500 bg-orange-500/10"
                    )}
                  >
                    <Icon size={20} className={cn("mb-2", isActive ? "text-orange-500" : "text-white/60")} />
                    <div className="font-semibold text-sm leading-tight">{playlist.name}</div>
                    <div className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{count} Lagu</div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Content Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-serif font-bold">
                {selectedMood ? MOOD_PLAYLISTS.find(p => p.id === selectedMood)?.name : "Semua Lagu"}
              </h2>
              <p className="text-white/60 text-sm">
                {selectedMood 
                  ? MOOD_PLAYLISTS.find(p => p.id === selectedMood)?.description 
                  : "Daftar semua lagu yang telah kamu tambahkan."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari lagu..."
                  className="glass-input pl-12 w-full md:w-48 text-sm"
                />
              </div>
              {songs.length > 0 && !selectedMood && (
                <button 
                  onClick={() => {
                    if (confirm('Hapus semua lagu dari daftar?')) {
                      setSongs([]);
                    }
                  }}
                  className="p-3 glass-card hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all"
                  title="Hapus Semua"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {paginatedSongs.length > 0 ? (
                paginatedSongs.map((song) => (
                  <SongCard 
                    key={song.id} 
                    song={song} 
                    onRemove={removeSong} 
                  />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                    <Music size={32} className="text-white/20" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Belum ada lagu</h3>
                    <p className="text-white/40 max-w-xs mx-auto">
                      {selectedMood 
                        ? `Belum ada lagu di kategori ${selectedMood}.` 
                        : "Mulai tambahkan lagu favoritmu dan biarkan AI menentukan moodnya."}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 glass-card disabled:opacity-20 hover:bg-white/5 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-bold text-sm transition-all",
                      currentPage === page 
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                        : "glass-card hover:bg-white/5 text-white/40"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 glass-card disabled:opacity-20 hover:bg-white/5 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-xs uppercase tracking-widest">
        <p>© 2026 MoodTune AI. Dibuat dengan Gemini.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
