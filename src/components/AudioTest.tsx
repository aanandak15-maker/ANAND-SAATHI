// Audio Test Component to verify ElevenLabs integration
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Play, Pause, Loader2 } from 'lucide-react';
import { audioService } from '@/lib/audioService';
import AudioPlayer from '@/components/AudioPlayer';

const AudioTest = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testText, setTestText] = useState('Your rice field is in good condition with NDVI of 0.68. The crop is healthy but could benefit from some targeted improvements.');

  const testAudioGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🎵 Testing audio generation...');
      
      const result = await audioService.textToSpeech(testText, 'english');
      
      if (result.success && result.audioUrl) {
        setAudioUrl(result.audioUrl);
        setSuccess('✅ Audio generated successfully! You can now play it using the audio player below.');
        console.log('✅ Audio generated successfully:', result.audioUrl);
      } else {
        setError(result.error || 'Failed to generate audio');
        console.error('❌ Audio generation failed:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Audio test failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const testDirectPlay = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🎵 Testing direct audio play...');
      
      const result = await audioService.playAudio(testText, 'english');
      
      if (result.success) {
        setSuccess('✅ Audio played successfully! Check your speakers/headphones.');
        console.log('✅ Audio played successfully');
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(result.error || 'Failed to play audio');
        console.error('❌ Audio play failed:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Direct play failed: ${errorMessage}`);
      console.error('❌ Audio play test failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Audio Integration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Test Text:
          </label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={3}
            placeholder="Enter text to convert to speech..."
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={testAudioGeneration}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                Generate Audio
              </>
            )}
          </Button>

          <Button
            onClick={testDirectPlay}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Playing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play Direct
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">
              {success}
            </p>
          </div>
        )}

        {audioUrl && (
          <div className="space-y-2">
            <h4 className="font-medium">Generated Audio:</h4>
            <AudioPlayer
              audioUrl={audioUrl}
              title="Test Audio"
              language="english"
              size="md"
              showProgress={true}
              showDownload={true}
            />
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>API Key:</strong> {audioService.isAvailable() ? '✅ Available' : '❌ Not Available'}</p>
          <p><strong>Available Languages:</strong> {audioService.getAvailableLanguages().join(', ')}</p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-xs">
              <strong>💡 Audio Tips:</strong> The "Generate Audio" button works perfectly! 
              Direct play may fail due to browser audio policies or format compatibility. 
              Always use the Audio Player below for reliable playback.
            </p>
          </div>
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-xs">
              <strong>✅ Working Method:</strong> Click "Generate Audio" → Wait for success → Use Audio Player below
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioTest;
