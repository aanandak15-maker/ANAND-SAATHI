// Audio Service for Text-to-Speech using ElevenLabs
// Provides multi-language voice support for agricultural insights

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// ElevenLabs API Key - from environment variables
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '9a83e904680b112aaf0ff75fbf7fa6eece288a06cefabe11669ef75eb6b76896';

// Voice IDs for different languages
const VOICE_IDS = {
  english: 'JBFqnCBsd6RMkjVDRZzb', // Default English voice
  hindi: 'JBFqnCBsd6RMkjVDRZzb',   // Can be changed to Hindi-specific voice
  punjabi: 'JBFqnCBsd6RMkjVDRZzb', // Can be changed to Punjabi-specific voice
  // Add short language codes
  en: 'JBFqnCBsd6RMkjVDRZzb',
  hi: 'JBFqnCBsd6RMkjVDRZzb',
  pa: 'JBFqnCBsd6RMkjVDRZzb'
};

// Model configurations for different languages
const MODEL_CONFIGS = {
  english: {
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128'
  },
  hindi: {
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128'
  },
  punjabi: {
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128'
  },
  // Add short language codes
  en: {
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128'
  },
  hi: {
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128'
  },
  pa: {
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128'
  }
};

export interface AudioConfig {
  language: 'english' | 'hindi' | 'punjabi' | 'en' | 'hi' | 'pa';
  voiceId?: string;
  modelId?: string;
  outputFormat?: string;
}

export interface AudioResult {
  success: boolean;
  audioUrl?: string;
  error?: string;
  duration?: number;
}

class AudioService {
  private client: ElevenLabsClient;
  private isInitialized = false;

  constructor() {
    try {
      this.client = new ElevenLabsClient({
        apiKey: ELEVENLABS_API_KEY
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize ElevenLabs client:', error);
      this.isInitialized = false;
    }
  }

  // Convert text to speech
  async textToSpeech(text: string, config: AudioConfig | string): Promise<AudioResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Audio service not initialized'
      };
    }

    try {
      // Handle both AudioConfig object and string (language) parameter
      let language: 'english' | 'hindi' | 'punjabi' | 'en' | 'hi' | 'pa';
      let voiceId: string;
      let modelConfig: any;

      if (typeof config === 'string') {
        language = config as 'english' | 'hindi' | 'punjabi' | 'en' | 'hi' | 'pa';
        voiceId = VOICE_IDS[language];
        modelConfig = MODEL_CONFIGS[language];
      } else {
        language = config.language;
        voiceId = config.voiceId || VOICE_IDS[language];
        modelConfig = {
          modelId: config.modelId || MODEL_CONFIGS[language]?.modelId || 'eleven_multilingual_v2',
          outputFormat: config.outputFormat || MODEL_CONFIGS[language]?.outputFormat || 'mp3_44100_128'
        };
      }

      // Ensure modelConfig is properly set
      if (!modelConfig || !modelConfig.modelId) {
        console.error('Model configuration is missing:', modelConfig);
        return {
          success: false,
          error: 'Model configuration is missing'
        };
      }

      console.log(`🎵 Converting text to speech in ${language}...`);
      console.log(`📝 Text length: ${text.length} characters`);
      console.log(`🔧 Model config:`, modelConfig);

      const audio = await this.client.textToSpeech.convert(voiceId, {
        text: text,
        modelId: modelConfig.modelId,
        outputFormat: modelConfig.outputFormat
      });

      // Debug the actual audio data structure
      console.log('🎵 Raw audio data:', audio);
      console.log('🎵 Audio data type:', typeof audio);
      console.log('🎵 Audio constructor:', audio?.constructor?.name);
      console.log('🎵 Audio properties:', Object.getOwnPropertyNames(audio));
      
      // Create audio URL from the audio data
      // Handle different audio data formats from ElevenLabs
      let audioBlob: Blob;
      
      try {
        if (audio instanceof ArrayBuffer) {
          audioBlob = new Blob([audio], { type: 'audio/mpeg' });
          console.log('🎵 Created MP3 blob from ArrayBuffer for textToSpeech');
        } else if (audio instanceof Uint8Array) {
          audioBlob = new Blob([audio], { type: 'audio/mpeg' });
          console.log('🎵 Created MP3 blob from Uint8Array for textToSpeech');
        } else if (audio instanceof Blob) {
          audioBlob = audio;
          console.log('🎵 Using existing blob for textToSpeech');
        } else if (audio && typeof audio.arrayBuffer === 'function') {
          // Handle ReadableStream or similar
          const arrayBuffer = await audio.arrayBuffer();
          
          // Try different audio formats for better browser compatibility
          const audioFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
          let blobCreated = false;
          
          for (const format of audioFormats) {
            try {
              audioBlob = new Blob([arrayBuffer], { type: format });
              console.log(`🎵 Converted stream to ArrayBuffer then created ${format} blob for textToSpeech`);
              blobCreated = true;
              break;
            } catch (error) {
              console.log(`🎵 Failed to create ${format} blob, trying next format`);
            }
          }
          
          if (!blobCreated) {
            // Fallback to generic audio type
            audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
            console.log('🎵 Fallback: Created generic audio/mpeg blob for textToSpeech');
          }
        } else if (audio && typeof audio.getReader === 'function') {
          // Handle ReadableStream
          const reader = audio.getReader();
          const chunks: Uint8Array[] = [];
          let done = false;
          
          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              chunks.push(value);
            }
          }
          
          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const combinedArray = new Uint8Array(totalLength);
          let offset = 0;
          
          for (const chunk of chunks) {
            combinedArray.set(chunk, offset);
            offset += chunk.length;
          }
          
          // Try different audio formats for better browser compatibility
          const audioFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
          let blobCreated = false;
          
          for (const format of audioFormats) {
            try {
              audioBlob = new Blob([combinedArray], { type: format });
              console.log(`🎵 Converted ReadableStream to ${format} blob for textToSpeech`);
              blobCreated = true;
              break;
            } catch (error) {
              console.log(`🎵 Failed to create ${format} blob, trying next format`);
            }
          }
          
          if (!blobCreated) {
            // Fallback to generic audio type
            audioBlob = new Blob([combinedArray], { type: 'audio/mpeg' });
            console.log('🎵 Fallback: Created generic audio/mpeg blob for textToSpeech');
          }
        } else {
          // Try to convert to ArrayBuffer first
          try {
            const arrayBuffer = await audio.arrayBuffer();
            audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
            console.log('🎵 Converted to ArrayBuffer then created MP3 blob for textToSpeech');
          } catch (conversionError) {
            console.error('🎵 Failed to convert audio data in textToSpeech:', conversionError);
            // Try different MIME types
            const mimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav'];
            let success = false;
            
            for (const mimeType of mimeTypes) {
              try {
                audioBlob = new Blob([audio], { type: mimeType });
                console.log(`🎵 Created ${mimeType} blob for textToSpeech`);
                success = true;
                break;
              } catch (mimeError) {
                console.log(`🎵 Failed to create ${mimeType} blob:`, mimeError);
              }
            }
            
            if (!success) {
              throw new Error('Unable to process audio data from ElevenLabs');
            }
          }
        }
        
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('🎵 Audio blob size for textToSpeech:', audioBlob.size, 'bytes');
        console.log('🎵 Audio blob type for textToSpeech:', audioBlob.type);
        console.log('🎵 Audio URL created for textToSpeech:', audioUrl);
        
        // Test if the blob is valid
        if (audioBlob.size === 0) {
          throw new Error('Generated audio blob is empty');
        }
        
        return {
          success: true,
          audioUrl: audioUrl,
          duration: this.estimateDuration(text)
        };
        
      } catch (processingError) {
        console.error('🎵 Audio processing failed:', processingError);
        throw new Error(`Unable to process audio data: ${processingError.message}`);
      }

    } catch (error) {
      console.error('Text-to-speech conversion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Play audio directly (for immediate playback)
  async playAudio(text: string, config: AudioConfig | string): Promise<AudioResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Audio service not initialized'
      };
    }

    try {
      // Handle both AudioConfig object and string (language) parameter
      let language: 'english' | 'hindi' | 'punjabi' | 'en' | 'hi' | 'pa';
      let voiceId: string;
      let modelConfig: any;

      if (typeof config === 'string') {
        language = config as 'english' | 'hindi' | 'punjabi';
        voiceId = VOICE_IDS[language];
        modelConfig = MODEL_CONFIGS[language];
      } else {
        language = config.language;
        voiceId = config.voiceId || VOICE_IDS[language];
        modelConfig = {
          modelId: config.modelId || MODEL_CONFIGS[language].modelId,
          outputFormat: config.outputFormat || MODEL_CONFIGS[language].outputFormat
        };
      }

      console.log(`🎵 Playing audio in ${language}...`);

      const audio = await this.client.textToSpeech.convert(voiceId, {
        text: text,
        modelId: modelConfig.modelId,
        outputFormat: modelConfig.outputFormat
      });

      // Play the audio directly in browser
      // Use the same ReadableStream processing logic as textToSpeech
      console.log('🎵 Audio data type:', typeof audio);
      console.log('🎵 Audio data constructor:', audio?.constructor?.name);
      console.log('🎵 Audio data length:', audio?.length || audio?.byteLength || 'unknown');
      
      // Convert audio data to proper format using the same logic as textToSpeech
      let audioBlob: Blob;
      
      try {
        if (audio instanceof ArrayBuffer) {
          audioBlob = new Blob([audio], { type: 'audio/mpeg' });
          console.log('🎵 Created MP3 blob from ArrayBuffer for playAudio');
        } else if (audio instanceof Uint8Array) {
          audioBlob = new Blob([audio], { type: 'audio/mpeg' });
          console.log('🎵 Created MP3 blob from Uint8Array for playAudio');
        } else if (audio instanceof Blob) {
          audioBlob = audio;
          console.log('🎵 Using existing blob for playAudio');
        } else if (audio && typeof audio.getReader === 'function') {
          // Handle ReadableStream - same logic as textToSpeech
          const reader = audio.getReader();
          const chunks: Uint8Array[] = [];
          let done = false;
          
          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              chunks.push(value);
            }
          }
          
          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const combinedArray = new Uint8Array(totalLength);
          let offset = 0;
          
          for (const chunk of chunks) {
            combinedArray.set(chunk, offset);
            offset += chunk.length;
          }
          
          audioBlob = new Blob([combinedArray], { type: 'audio/mpeg' });
          console.log('🎵 Converted ReadableStream to MP3 blob for playAudio');
        } else if (audio && typeof audio.arrayBuffer === 'function') {
          // Handle ReadableStream or similar
          const arrayBuffer = await audio.arrayBuffer();
          audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
          console.log('🎵 Converted stream to ArrayBuffer then created MP3 blob for playAudio');
        } else {
          // Try to convert to ArrayBuffer first
          try {
            const arrayBuffer = await audio.arrayBuffer();
            audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
            console.log('🎵 Converted to ArrayBuffer then created MP3 blob for playAudio');
          } catch (conversionError) {
            console.error('🎵 Failed to convert audio data in playAudio:', conversionError);
            // Try different MIME types
            const mimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav'];
            let success = false;
            
            for (const mimeType of mimeTypes) {
              try {
                audioBlob = new Blob([audio], { type: mimeType });
                console.log(`🎵 Created ${mimeType} blob for playAudio`);
                success = true;
                break;
              } catch (mimeError) {
                console.log(`🎵 Failed to create ${mimeType} blob:`, mimeError);
              }
            }
            
            if (!success) {
              throw new Error('Unable to process audio data from ElevenLabs');
            }
          }
        }
        
        // Test if the blob is valid
        if (audioBlob.size === 0) {
          throw new Error('Generated audio blob is empty');
        }
        
        console.log('🎵 Audio blob size for playAudio:', audioBlob.size, 'bytes');
        console.log('🎵 Audio blob type for playAudio:', audioBlob.type);
        
      } catch (processingError) {
        console.error('🎵 Audio processing failed in playAudio:', processingError);
        throw new Error(`Unable to process audio data: ${processingError.message}`);
      }
      
      // Create audio URL and element
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);
      
      // Set audio properties for better compatibility
      audioElement.preload = 'auto';
      audioElement.volume = 0.8;
      audioElement.crossOrigin = 'anonymous';
      
      console.log('🎵 Audio blob size:', audioBlob.size, 'bytes');
      console.log('🎵 Audio blob type:', audioBlob.type);
      console.log('🎵 Audio URL created:', audioUrl);
      
      await new Promise((resolve, reject) => {
        const cleanup = () => {
          if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
        
        audioElement!.onended = () => {
          cleanup();
          resolve(true);
        };
        
        audioElement!.onerror = (error) => {
          console.error('Audio element error:', error);
          console.error('Audio element error details:', {
            error: error,
            networkState: audioElement!.networkState,
            readyState: audioElement!.readyState,
            src: audioElement!.src,
            blobSize: audioBlob.size,
            blobType: audioBlob.type,
            canPlayMP3: audioElement!.canPlayType('audio/mpeg'),
            canPlayMP4: audioElement!.canPlayType('audio/mp4'),
            canPlayWAV: audioElement!.canPlayType('audio/wav'),
            canPlayOGG: audioElement!.canPlayType('audio/ogg')
          });
          cleanup();
          reject(new Error(`Audio playback failed: ${error.type || 'Unknown error'}. Please use the Audio Player instead.`));
        };
        
        audioElement!.oncanplaythrough = () => {
          console.log('🎵 Audio ready to play');
        };
        
        audioElement!.onloadstart = () => {
          console.log('🎵 Audio loading started');
        };
        
        audioElement!.onloadeddata = () => {
          console.log('🎵 Audio data loaded');
        };
        
        // Handle play promise with better error reporting
        audioElement!.play()
          .then(() => {
            console.log('🎵 Audio started playing');
          })
          .catch((playError) => {
            console.error('Audio play error:', playError);
            cleanup();
            reject(new Error(`Audio play failed: ${playError.message || 'Unknown play error'}. Please use the Audio Player instead.`));
          });
      });

      console.log(`✅ Audio played successfully in ${language}`);

      return {
        success: true,
        duration: this.estimateDuration(text)
      };

    } catch (error) {
      console.error('Audio playback failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generate audio for diagnosis sections
  async generateDiagnosisAudio(
    diagnosis: {
      title: string;
      summary: string;
      detailedAnalysis: string;
      specificRecommendations: string[];
      immediateActions: string[];
      timeline: string;
      economicImpact: string;
      riskAssessment: string;
    },
    language: 'english' | 'hindi' | 'punjabi'
  ): Promise<{
    titleAudio?: string;
    summaryAudio?: string;
    analysisAudio?: string;
    recommendationsAudio?: string;
    actionsAudio?: string;
    timelineAudio?: string;
    economicAudio?: string;
    riskAudio?: string;
    fullAudio?: string;
  }> {
    const audioResults: any = {};

    try {
      // Generate individual section audios
      const sections = [
        { key: 'titleAudio', text: diagnosis.title },
        { key: 'summaryAudio', text: diagnosis.summary },
        { key: 'analysisAudio', text: diagnosis.detailedAnalysis },
        { key: 'recommendationsAudio', text: diagnosis.specificRecommendations.join('. ') },
        { key: 'actionsAudio', text: diagnosis.immediateActions.join('. ') },
        { key: 'timelineAudio', text: diagnosis.timeline },
        { key: 'economicAudio', text: diagnosis.economicImpact },
        { key: 'riskAudio', text: diagnosis.riskAssessment }
      ];

      for (const section of sections) {
        const result = await this.textToSpeech(section.text, language);
        if (result.success && result.audioUrl) {
          audioResults[section.key] = result.audioUrl;
        }
      }

      // Generate full diagnosis audio
      const fullText = [
        diagnosis.title,
        diagnosis.summary,
        diagnosis.detailedAnalysis,
        'Specific Recommendations: ' + diagnosis.specificRecommendations.join('. '),
        'Immediate Actions: ' + diagnosis.immediateActions.join('. '),
        'Timeline: ' + diagnosis.timeline,
        'Economic Impact: ' + diagnosis.economicImpact,
        'Risk Assessment: ' + diagnosis.riskAssessment
      ].join('. ');

      const fullResult = await this.textToSpeech(fullText, language);
      if (fullResult.success && fullResult.audioUrl) {
        audioResults.fullAudio = fullResult.audioUrl;
      }

      console.log(`🎵 Generated ${Object.keys(audioResults).length} audio files for ${language} diagnosis`);

    } catch (error) {
      console.error('Failed to generate diagnosis audio:', error);
    }

    return audioResults;
  }

  // Generate audio for specific recommendations
  async generateRecommendationsAudio(
    recommendations: string[],
    language: 'english' | 'hindi' | 'punjabi'
  ): Promise<string[]> {
    const audioUrls: string[] = [];

    try {
      for (let i = 0; i < recommendations.length; i++) {
        const recommendation = `${i + 1}. ${recommendations[i]}`;
        const result = await this.textToSpeech(recommendation, language);
        
        if (result.success && result.audioUrl) {
          audioUrls.push(result.audioUrl);
        }
      }

      console.log(`🎵 Generated ${audioUrls.length} recommendation audios for ${language}`);

    } catch (error) {
      console.error('Failed to generate recommendations audio:', error);
    }

    return audioUrls;
  }

  // Generate audio for immediate actions
  async generateActionsAudio(
    actions: string[],
    language: 'english' | 'hindi' | 'punjabi'
  ): Promise<string[]> {
    const audioUrls: string[] = [];

    try {
      for (let i = 0; i < actions.length; i++) {
        const action = `${i + 1}. ${actions[i]}`;
        const result = await this.textToSpeech(action, language);
        
        if (result.success && result.audioUrl) {
          audioUrls.push(result.audioUrl);
        }
      }

      console.log(`🎵 Generated ${audioUrls.length} action audios for ${language}`);

    } catch (error) {
      console.error('Failed to generate actions audio:', error);
    }

    return audioUrls;
  }

  // Estimate audio duration based on text length
  private estimateDuration(text: string): number {
    // Rough estimate: 150 words per minute for speech
    const wordsPerMinute = 150;
    const wordCount = text.split(' ').length;
    const durationInMinutes = wordCount / wordsPerMinute;
    return Math.ceil(durationInMinutes * 60); // Return duration in seconds
  }

  // Check if audio service is available
  isAvailable(): boolean {
    return this.isInitialized;
  }

  // Get available languages
  getAvailableLanguages(): string[] {
    return ['english', 'hindi', 'punjabi'];
  }

  // Clean up audio URLs to prevent memory leaks
  cleanupAudioUrl(audioUrl: string): void {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
  }
}

// Export singleton instance
export const audioService = new AudioService();

// Export utility functions
export const generateAudioForDiagnosis = audioService.generateDiagnosisAudio.bind(audioService);
export const generateAudioForRecommendations = audioService.generateRecommendationsAudio.bind(audioService);
export const generateAudioForActions = audioService.generateActionsAudio.bind(audioService);
export const playTextAsAudio = audioService.playAudio.bind(audioService);
export const convertTextToAudio = audioService.textToSpeech.bind(audioService);
