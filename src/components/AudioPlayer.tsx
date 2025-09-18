// Audio Player Component for Text-to-Speech Playback
// Provides controls for playing agricultural insights in multiple languages

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Download,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  language?: 'english' | 'hindi' | 'punjabi';
  duration?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showDownload?: boolean;
  autoPlay?: boolean;
}

const AudioPlayer = ({
  audioUrl,
  title = 'Audio',
  language = 'english',
  duration,
  onPlay,
  onPause,
  onEnd,
  onError,
  className = '',
  size = 'md',
  showProgress = true,
  showDownload = true,
  autoPlay = false
}: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Language display names
  const languageNames = {
    english: 'English',
    hindi: 'हिंदी',
    punjabi: 'ਪੰਜਾਬੀ'
  };

  // Size configurations
  const sizeConfigs = {
    sm: {
      buttonSize: 'sm' as const,
      iconSize: 'h-3 w-3',
      textSize: 'text-xs',
      padding: 'p-2'
    },
    md: {
      buttonSize: 'default' as const,
      iconSize: 'h-4 w-4',
      textSize: 'text-sm',
      padding: 'p-3'
    },
    lg: {
      buttonSize: 'lg' as const,
      iconSize: 'h-5 w-5',
      textSize: 'text-base',
      padding: 'p-4'
    }
  };

  const config = sizeConfigs[size];

  // Initialize audio when URL changes
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      setIsLoading(true);
      setError(null);
      
      const audio = audioRef.current;
      console.log('🎵 AudioPlayer initializing with URL:', audioUrl);
      console.log('🎵 AudioPlayer can play types:', {
        mp3: audio.canPlayType('audio/mpeg'),
        mp4: audio.canPlayType('audio/mp4'),
        wav: audio.canPlayType('audio/wav'),
        ogg: audio.canPlayType('audio/ogg')
      });
      
      // Reset audio element completely
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
      audio.load();
      
      // Set audio properties for better compatibility
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Set the new source with a delay to ensure blob URL is ready
      setTimeout(() => {
        console.log('🎵 AudioPlayer: Setting audio source:', audioUrl);
        audio.src = audioUrl;
        audio.load();
      }, 200);

      const handleCanPlay = () => {
        console.log('🎵 AudioPlayer: Audio can play');
        setIsReady(true);
        setIsLoading(false);
        setTotalDuration(audio.duration || 0);
        
        if (autoPlay) {
          playAudio();
        }
      };

      const handleLoadedData = () => {
        console.log('🎵 AudioPlayer: Audio data loaded');
        console.log('🎵 AudioPlayer: Duration:', audio.duration);
        console.log('🎵 AudioPlayer: Ready state:', audio.readyState);
        console.log('🎵 AudioPlayer: Network state:', audio.networkState);
      };

      const handleLoadedMetadata = () => {
        console.log('🎵 AudioPlayer: Audio metadata loaded');
        console.log('🎵 AudioPlayer: Duration from metadata:', audio.duration);
      };

      const handleError = (event: Event) => {
        const audio = event.target as HTMLAudioElement;
        
        // Log detailed error information
        console.error('🎵 AudioPlayer error details:');
        console.error('  - Error code:', audio.error?.code);
        console.error('  - Error message:', audio.error?.message);
        console.error('  - Network state:', audio.networkState);
        console.error('  - Ready state:', audio.readyState);
        console.error('  - Source URL:', audio.src);
        console.error('  - Can play MP3:', audio.canPlayType('audio/mpeg'));
        console.error('  - Can play MP4:', audio.canPlayType('audio/mp4'));
        console.error('  - Can play WAV:', audio.canPlayType('audio/wav'));
        console.error('  - Can play OGG:', audio.canPlayType('audio/ogg'));
        
        let errorMessage = 'Failed to load audio';
        let userFriendlyMessage = 'Audio source not supported';
        
        if (audio.error) {
          switch (audio.error.code) {
            case audio.error.MEDIA_ERR_ABORTED:
              errorMessage = 'Audio loading was aborted';
              userFriendlyMessage = 'Audio loading was interrupted';
              break;
            case audio.error.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error while loading audio';
              userFriendlyMessage = 'Network error - please check your connection';
              break;
            case audio.error.MEDIA_ERR_DECODE:
              errorMessage = 'Audio format not supported by browser';
              userFriendlyMessage = 'Audio format not supported - try refreshing the page';
              break;
            case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Audio source not supported';
              userFriendlyMessage = 'Audio source not supported - please try again';
              break;
            default:
              errorMessage = 'Unknown audio error';
              userFriendlyMessage = 'Audio playback error - please try again';
          }
        }
        
        setError(userFriendlyMessage);
        setIsLoading(false);
        setIsReady(false);
        onError?.(errorMessage);
        
        // Try multiple recovery strategies
        setTimeout(() => {
          if (audioRef.current && audioUrl) {
            console.log('🎵 AudioPlayer: Attempting recovery strategy 1 - reload');
            audioRef.current.load();
          }
        }, 1000);
        
        setTimeout(() => {
          if (audioRef.current && audioUrl) {
            console.log('🎵 AudioPlayer: Attempting recovery strategy 2 - reset and reload');
            audioRef.current.removeAttribute('src');
            audioRef.current.load();
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.load();
              }
            }, 100);
          }
        }, 3000);
        
        // Final recovery attempt - try to recreate the blob URL
        setTimeout(() => {
          if (audioRef.current && audioUrl && audioUrl.startsWith('blob:')) {
            console.log('🎵 AudioPlayer: Attempting recovery strategy 3 - blob URL recreation');
            // This would require access to the original blob data
            // For now, just try one more reload
            audioRef.current.load();
          }
        }, 5000);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onEnd?.();
      };

      const handlePlay = () => {
        setIsPlaying(true);
        onPlay?.();
      };

      const handlePause = () => {
        setIsPlaying(false);
        onPause?.();
      };

      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('error', handleError);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, [audioUrl, autoPlay, onPlay, onPause, onEnd, onError]);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playAudio = () => {
    if (audioRef.current && isReady) {
      audioRef.current.play().catch((err) => {
        setError('Failed to play audio');
        onError?.('Failed to play audio');
      });
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        playAudio();
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && totalDuration > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * totalDuration;
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `${title}_${language}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  if (!audioUrl) {
    return (
      <div className={`flex items-center gap-2 ${config.padding} ${className}`}>
        <Button disabled size={config.buttonSize}>
          <VolumeX className={config.iconSize} />
        </Button>
        <span className={`${config.textSize} text-gray-500`}>No audio available</span>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg ${config.padding} ${className}`}>
      {/* Audio element */}
      <audio ref={audioRef} preload="metadata" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {languageNames[language]}
          </Badge>
          <span className={`${config.textSize} font-medium`}>{title}</span>
        </div>
        
        {showDownload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadAudio}
            className="h-6 w-6 p-0"
          >
            <Download className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600">Loading audio...</span>
        </div>
      )}

      {/* Ready state */}
      {isReady && !error && (
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-700">Audio ready</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <Button
          onClick={togglePlayPause}
          disabled={!isReady || isLoading}
          size={config.buttonSize}
          className="flex-shrink-0"
          title={isLoading ? 'Loading audio...' : isPlaying ? 'Pause audio' : 'Click to play audio'}
        >
          {isLoading ? (
            <Loader2 className={`${config.iconSize} animate-spin`} />
          ) : isPlaying ? (
            <Pause className={config.iconSize} />
          ) : (
            <Play className={config.iconSize} />
          )}
        </Button>

        {/* Restart button */}
        <Button
          onClick={restartAudio}
          disabled={!isReady || isLoading}
          variant="outline"
          size={config.buttonSize}
          className="flex-shrink-0"
        >
          <RotateCcw className={config.iconSize} />
        </Button>

        {/* Volume control */}
        <div className="flex items-center gap-2 flex-1">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            {isMuted ? (
              <VolumeX className="h-3 w-3" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
          </Button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && totalDuration > 0 && (
        <div className="mt-3">
          <div
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-2 bg-blue-500 rounded-lg transition-all duration-200"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      )}

      {/* Duration info */}
      {duration && (
        <div className="mt-2 text-xs text-gray-500">
          Estimated duration: {formatTime(duration)}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
