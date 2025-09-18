import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface RobustAudioPlayerProps {
  audioUrl: string;
  title?: string;
  autoPlay?: boolean;
  onError?: (error: string) => void;
  onPlay?: () => void;
  onPause?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RobustAudioPlayer: React.FC<RobustAudioPlayerProps> = ({
  audioUrl,
  title = 'Audio',
  autoPlay = false,
  onError,
  onPlay,
  onPause,
  size = 'md',
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const sizeConfigs = {
    sm: { buttonSize: 'sm' as const, iconSize: 'h-3 w-3', sliderSize: 'h-1' },
    md: { buttonSize: 'default' as const, iconSize: 'h-4 w-4', sliderSize: 'h-2' },
    lg: { buttonSize: 'lg' as const, iconSize: 'h-5 w-5', sliderSize: 'h-3' }
  };

  const config = sizeConfigs[size];

  // Initialize audio when URL changes
  useEffect(() => {
    if (!audioUrl || typeof audioUrl !== 'string' || audioUrl.trim() === '') return;

    const audio = audioRef.current;
    if (!audio) return;

    console.log('🎵 RobustAudioPlayer: Initializing with URL:', audioUrl);
    setIsLoading(true);
    setIsReady(false);
    setError(null);
    setCurrentTime(0);
    setTotalDuration(0);
    setRetryCount(0);

    // Create a completely new audio element approach
    const initializeAudio = async () => {
      try {
        // Reset audio element
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute('src');
        audio.load();

        // Set properties
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        audio.volume = volume;

        // Wait a bit for the blob URL to be fully ready
        await new Promise(resolve => setTimeout(resolve, 300));

        // Set source
        audio.src = audioUrl;
        console.log('🎵 RobustAudioPlayer: Source set, loading...');
        audio.load();

        // Wait for load to complete
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio load timeout'));
          }, 10000);

          const handleCanPlay = () => {
            clearTimeout(timeout);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            resolve(true);
          };

          const handleError = (e: Event) => {
            clearTimeout(timeout);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            reject(e);
          };

          audio.addEventListener('canplay', handleCanPlay);
          audio.addEventListener('error', handleError);
        });

        console.log('🎵 RobustAudioPlayer: Audio loaded successfully');
        setIsReady(true);
        setIsLoading(false);
        setTotalDuration(audio.duration || 0);

        if (autoPlay) {
          playAudio();
        }

      } catch (error) {
        console.error('🎵 RobustAudioPlayer: Initialization failed:', error);
        handleInitializationError(error);
      }
    };

    initializeAudio();
  }, [audioUrl, volume, autoPlay]);

  const handleInitializationError = (error: any) => {
    console.error('🎵 RobustAudioPlayer: Initialization error details:', {
      error: error.message || error,
      retryCount,
      audioUrl: typeof audioUrl === 'string' ? audioUrl.substring(0, 50) + '...' : String(audioUrl)
    });

    if (retryCount < maxRetries) {
      console.log(`🎵 RobustAudioPlayer: Retrying initialization (${retryCount + 1}/${maxRetries})`);
      setRetryCount(prev => prev + 1);
      
      // Retry with exponential backoff
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio && audioUrl) {
          audio.src = audioUrl;
          audio.load();
        }
      }, Math.pow(2, retryCount) * 1000);
    } else {
      setError('Audio failed to load after multiple attempts');
      setIsLoading(false);
      setIsReady(false);
      onError?.(error.message || 'Audio initialization failed');
    }
  };

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    try {
      console.log('🎵 RobustAudioPlayer: Attempting to play audio');
      await audio.play();
      setIsPlaying(true);
      onPlay?.();
    } catch (error) {
      console.error('🎵 RobustAudioPlayer: Play failed:', error);
      setError('Failed to play audio');
      onError?.(error instanceof Error ? error.message : 'Play failed');
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
    onPause?.();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && totalDuration > 0) {
      audio.currentTime = (value[0] / 100) * totalDuration;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isMuted) {
        audio.volume = volume;
        setIsMuted(false);
      } else {
        audio.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Add event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('error', (e) => {
      console.error('🎵 RobustAudioPlayer: Audio error:', e);
      setError('Audio playback error');
      setIsPlaying(false);
      setIsReady(false);
    });

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', () => setIsPlaying(false));
      audio.removeEventListener('error', (e) => {
        console.error('🎵 RobustAudioPlayer: Audio error:', e);
        setError('Audio playback error');
        setIsPlaying(false);
        setIsReady(false);
      });
    };
  }, [isReady]);

  // Don't render if no valid audio URL
  if (!audioUrl || typeof audioUrl !== 'string' || audioUrl.trim() === '') {
    return null;
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md ${className}`}>
        <VolumeX className={`${config.iconSize} text-red-500`} />
        <span className="text-sm text-red-600">{error}</span>
        <Button
          size={config.buttonSize}
          variant="outline"
          onClick={() => {
            setError(null);
            setRetryCount(0);
            // Trigger re-initialization
            const audio = audioRef.current;
            if (audio && audioUrl) {
              audio.src = audioUrl;
              audio.load();
            }
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-2 bg-gray-50 border rounded-md ${className}`}>
      <audio ref={audioRef} />
      
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

      {isReady && totalDuration > 0 && (
        <>
          <span className="text-xs text-gray-500 min-w-[35px]">
            {formatTime(currentTime)}
          </span>
          
          <div className="flex-1 min-w-0">
            <Slider
              value={[totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className={`w-full ${config.sliderSize}`}
            />
          </div>
          
          <span className="text-xs text-gray-500 min-w-[35px]">
            {formatTime(totalDuration)}
          </span>
        </>
      )}

      <Button
        onClick={toggleMute}
        size={config.buttonSize}
        variant="ghost"
        className="flex-shrink-0"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className={config.iconSize} />
        ) : (
          <Volume2 className={config.iconSize} />
        )}
      </Button>

      {isReady && (
        <div className="w-16">
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className={`w-full ${config.sliderSize}`}
          />
        </div>
      )}

      {title && (
        <span className="text-sm text-gray-600 truncate max-w-[100px]" title={title}>
          {title}
        </span>
      )}
    </div>
  );
};

export default RobustAudioPlayer;
