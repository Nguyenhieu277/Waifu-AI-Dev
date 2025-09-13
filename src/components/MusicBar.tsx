"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  QueueListIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid';

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover?: string;
  duration?: string;
}

interface MusicBarProps {
  className?: string;
  defaultTracks?: Track[];
  autoPlay?: boolean;
  showPlaylist?: boolean;
}

// Playlist mẫu - bạn có thể thay thế bằng nhạc thật
const DEFAULT_PLAYLIST: Track[] = [
  {
    id: '1',
    title: 'Rainy Lofi Music',
    artist: 'lofidreams99',
    src: '/music/rainy-lofi-city-lofi-music.mp3',
    cover: '/music/covers/lofi.jpg',
    duration: '4:00'
  },
  {
    id: '2',
    title: 'Lofi Background Music',
    artist: 'Free Music for video',
    src: '/music/lofi-background-music-401916.mp3',
    cover: '/music/covers/lofi.jpg',
    duration: '2:27'
  }
 
];

const MusicBar: React.FC<MusicBarProps> = ({
  className = '',
  defaultTracks = DEFAULT_PLAYLIST,
  autoPlay = false,
  showPlaylist = true
}) => {
  const [tracks] = useState<Track[]>(defaultTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlaylistVisible, setIsPlaylistVisible] = useState(false);
  const [volume, setVolume] = useState(() => {
    const defaultVolume = 0.7;
    return isFinite(defaultVolume) ? defaultVolume : 0.5;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const audioPlayerRef = useRef<AudioPlayer>(null);
  
  const currentTrack = tracks[currentTrackIndex];
  
  if (!currentTrack) {
    return null;
  }

  // Chuyển bài tiếp theo
  const handleNext = useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    
    // Reset playing state khi chuyển bài
    setIsPlaying(false);
    
    // Pause current audio before switching
    if (audioPlayerRef.current?.audio.current) {
      audioPlayerRef.current.audio.current.pause();
    }
    
    setCurrentTrackIndex(nextIndex);
  }, [currentTrackIndex, tracks.length]);

  // Chuyển bài trước
  const handlePrevious = useCallback(() => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    
    // Reset playing state khi chuyển bài
    setIsPlaying(false);
    
    // Pause current audio before switching
    if (audioPlayerRef.current?.audio.current) {
      audioPlayerRef.current.audio.current.pause();
    }
    
    setCurrentTrackIndex(prevIndex);
  }, [currentTrackIndex, tracks.length]);

  // Chọn bài từ playlist
  const handleTrackSelect = useCallback((index: number) => {
    // Reset playing state khi chuyển bài
    setIsPlaying(false);
    
    // Pause current audio before switching
    if (audioPlayerRef.current?.audio.current) {
      audioPlayerRef.current.audio.current.pause();
    }
    
    setCurrentTrackIndex(index);
    setIsPlaylistVisible(false);
  }, []);

  // Xử lý khi bài hát kết thúc
  const handleEnded = useCallback(() => {
    handleNext();
  }, [handleNext]);

  // Xử lý play/pause
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Xử lý lỗi audio
  const handleError = useCallback((error: any) => {
    console.error('Audio playback error:', error);
    setIsPlaying(false);
    // Có thể thêm thông báo lỗi cho user ở đây
  }, []);

  // Xử lý play/pause với error handling
  const togglePlayPause = useCallback(async () => {
    try {
      if (audioPlayerRef.current?.audio.current) {
        const audio = audioPlayerRef.current.audio.current;
        
        if (isPlaying) {
          audio.pause();
        } else {
          // Kiểm tra xem audio có sẵn sàng không
          if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
            await audio.play();
          } else {
            // Nếu chưa load xong, đợi load xong rồi play
            const playWhenReady = () => {
              audio.play().catch(error => {
                console.error('Error playing after load:', error);
                setIsPlaying(false);
              });
              audio.removeEventListener('canplay', playWhenReady);
            };
            
            audio.addEventListener('canplay', playWhenReady);
            
            // Timeout để tránh đợi mãi mãi
            setTimeout(() => {
              audio.removeEventListener('canplay', playWhenReady);
              console.warn('Audio load timeout');
              setIsPlaying(false);
            }, 5000);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      setIsPlaying(false);
      
      // Thông báo lỗi cho user
      if (error instanceof Error) {
        alert(`Không thể phát nhạc: ${error.message}`);
      }
    }
  }, [isPlaying]);

  // Xử lý volume với validation
  const handleVolumeChange = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    const newVolume = parseFloat(target.value);
    
    // Validate volume value
    if (isNaN(newVolume) || !isFinite(newVolume)) {
      console.warn('Invalid volume value:', target.value);
      return;
    }
    
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    setIsMuted(clampedVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Cập nhật volume cho audio element
    if (audioPlayerRef.current?.audio.current) {
      if (newMutedState) {
        audioPlayerRef.current.audio.current.volume = 0;
      } else {
        audioPlayerRef.current.audio.current.volume = volume;
      }
    }
  }, [isMuted, volume]);

  // Đồng bộ volume với audio element khi state thay đổi
  useEffect(() => {
    if (audioPlayerRef.current?.audio.current) {
      const audio = audioPlayerRef.current.audio.current;
      
      // Validate volume before setting
      const finalVolume = isMuted ? 0 : volume;
      if (isFinite(finalVolume) && finalVolume >= 0 && finalVolume <= 1) {
        audio.volume = finalVolume;
      } else {
        console.warn('Invalid volume value, skipping:', finalVolume);
      }
    }
  }, [volume, isMuted]);

  // Xử lý khi chuyển bài hát
  useEffect(() => {
    if (audioPlayerRef.current?.audio.current) {
      const audio = audioPlayerRef.current.audio.current;
      
      // Load bài mới
      audio.load();
      
      // Reset thời gian về 0
      audio.currentTime = 0;
      
      console.log('Track changed to:', currentTrack.title);
    }
  }, [currentTrackIndex, currentTrack.src, currentTrack.title]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => {
            const newVolume = Math.min(1, prev + 0.1);
            return isFinite(newVolume) ? newVolume : prev;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => {
            const newVolume = Math.max(0, prev - 0.1);
            return isFinite(newVolume) ? newVolume : prev;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayPause, handleNext, handlePrevious]);

  return (
    <div className={`fixed top-4 left-4 z-30 ${className}`}>
      {/* Playlist Overlay */}
      {isPlaylistVisible && showPlaylist && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-md shadow-xl border border-gray-200 rounded-lg max-h-64 overflow-y-auto playlist-scroll">
          <div className="p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
              <QueueListIcon className="w-4 h-4" />
              Playlist ({tracks.length} bài)
            </h3>
            <div className="space-y-1">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackSelect(index)}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors text-xs ${
                    index === currentTrackIndex 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {track.duration}
                  </div>
                  {index === currentTrackIndex && isPlaying && (
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-3 bg-blue-500 animate-pulse"></div>
                      <div className="w-0.5 h-3 bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-0.5 h-3 bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mini Music Player */}
      <div className={`mini-player bg-black/90 backdrop-blur-md shadow-xl border border-gray-700 rounded-lg transition-all duration-300 ${
        isMinimized ? 'w-16 h-16' : 'w-96 h-20'
      } overflow-hidden group hover:shadow-2xl`}>
        {isMinimized ? (
          // Minimized view - just play button and track indicator
          <div className="w-full h-full flex items-center justify-center relative">
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5 text-black ml-0.5" />
              ) : (
                <PlayIcon className="w-5 h-5 text-black ml-0.5" />
              )}
            </button>
            {/* Expand button */}
            <button
              onClick={() => setIsMinimized(false)}
              className="absolute -top-1 -right-1 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronUpIcon className="w-3 h-3 text-white" />
            </button>
            {/* Playing indicator */}
            {isPlaying && (
              <div className="absolute bottom-1 left-1 flex gap-0.5">
                <div className="w-1 h-2 bg-green-500 animate-pulse"></div>
                <div className="w-1 h-2 bg-green-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-2 bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>
        ) : (
          // Full view
          <div className="p-3 h-full">
            <div className="flex items-center gap-3 h-full">
              {/* Track Info */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-md flex items-center justify-center">
                  {currentTrack.cover ? (
                    <img 
                      src={currentTrack.cover} 
                      alt={currentTrack.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="text-white font-bold text-sm">♪</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-white text-sm truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-gray-300 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                  onClick={handlePrevious}
                  className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                  title="Bài trước"
                >
                  <BackwardIcon className="w-4 h-4 text-gray-300" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-4 h-4 text-black" />
                  ) : (
                    <PlayIcon className="w-4 h-4 text-black ml-0.5" />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                  title="Bài tiếp"
                >
                  <ForwardIcon className="w-4 h-4 text-gray-300" />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                    title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                  >
                    {isMuted ? (
                      <SpeakerXMarkIcon className="w-4 h-4 text-gray-300" />
                    ) : (
                      <SpeakerWaveIcon className="w-4 h-4 text-gray-300" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : (isFinite(volume) ? volume : 0.5)}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      
                      // Validate volume value
                      if (isNaN(newVolume) || !isFinite(newVolume)) {
                        console.warn('Invalid volume value from slider:', e.target.value);
                        return;
                      }
                      
                      const clampedVolume = Math.max(0, Math.min(1, newVolume));
                      setVolume(clampedVolume);
                      setIsMuted(clampedVolume === 0);
                      
                      // Cập nhật volume trực tiếp cho audio element
                      if (audioPlayerRef.current?.audio.current) {
                        audioPlayerRef.current.audio.current.volume = clampedVolume;
                      }
                    }}
                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    title="Âm lượng (↑↓)"
                  />
                </div>

                {/* Playlist Toggle */}
                {showPlaylist && (
                  <button
                    onClick={() => setIsPlaylistVisible(!isPlaylistVisible)}
                    className={`p-1.5 rounded-full transition-colors ${
                      isPlaylistVisible ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                    }`}
                    title="Playlist"
                  >
                    <QueueListIcon className="w-4 h-4" />
                  </button>
                )}

                {/* Minimize */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                  title="Thu gọn"
                >
                  <ChevronDownIcon className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-100" style={{width: '30%'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Audio Player for functionality */}
      <div className="hidden">
        <AudioPlayer
          ref={audioPlayerRef}
          src={currentTrack.src}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={handleError}
          onVolumeChange={handleVolumeChange}
          onLoadStart={() => console.log('Loading started:', currentTrack.title)}
          onCanPlay={() => console.log('Can play:', currentTrack.title)}
          onLoadedData={() => console.log('Data loaded:', currentTrack.title)}
          volume={isMuted ? 0 : volume}
          autoPlay={false}
          showJumpControls={false}
          showDownloadProgress={false}
          customAdditionalControls={[]}
          customVolumeControls={[]}
          className="music-player-hidden"
          preload="metadata"
        />
      </div>

      {/* Custom Styles for hidden audio player */}
      <style jsx global>{`
        .music-player-hidden {
          display: none !important;
        }
        
        /* Mini player hover effects */
        .mini-player:hover {
          transform: translateY(-2px);
        }
        
        /* Smooth transitions for all interactive elements */
        .mini-player button {
          transition: all 0.2s ease;
        }
        
        .mini-player button:hover {
          transform: scale(1.05);
        }
        
        /* Custom scrollbar for playlist */
        .playlist-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .playlist-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        
        .playlist-scroll::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }
        
        .playlist-scroll::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Custom volume slider styling */
        .slider::-webkit-slider-track {
          background: #4b5563;
          border-radius: 4px;
          height: 4px;
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 2px solid #3b82f6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          background: #f0f9ff;
        }
        
        /* Firefox */
        .slider {
          outline: none;
        }
        
        .slider::-moz-range-track {
          background: #4b5563;
          border-radius: 4px;
          height: 4px;
          border: none;
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 2px solid #3b82f6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default MusicBar;
