// src/services/liveAtcService.ts
class LiveAtcService {
    private audio: HTMLAudioElement | null = null;
    private currentIcao: string | null = null;
    private currentFrequencyType: string | null = null;
    private isPlaying: boolean = false;
  
    // Base URL for LiveATC feeds
    private readonly baseUrl = 'https://liveatc.net/feeds';
  
    // Available frequency types
    private readonly frequencyTypes = ['tower', 'ground', 'approach', 'departure'] as const;
  
    /**
     * Constructs the feed URL for a given airport and frequency type
     */
    private constructFeedUrl(icao: string, frequencyType: string): string {
      return `${this.baseUrl}/${icao.toLowerCase()}_${frequencyType}.mp3`;
    }
  
    /**
     * Initialize or update the audio element
     */
    private initAudio(url: string): void {
      if (!this.audio) {
        this.audio = new Audio();
        this.audio.addEventListener('error', (e) => {
          console.error('Audio stream error:', e);
        });
      }
      this.audio.src = url;
    }
  
    /**
     * Start streaming ATC audio for an airport
     */
    startStream(icao: string, frequencyType: string = 'tower'): void {
      if (this.currentIcao === icao && this.currentFrequencyType === frequencyType && this.isPlaying) {
        console.log('Already streaming this feed');
        return;
      }
  
      // For testing, use a direct LiveATC feed URL
      const url = `https://www.liveatc.net/play/${icao.toLowerCase()}.pls`;
      console.log('Attempting to play stream:', url);
  
      this.initAudio(url);
      this.currentIcao = icao;
      this.currentFrequencyType = frequencyType;
  
      if (this.audio) {
        // Add event listeners for debugging
        this.audio.addEventListener('playing', () => {
          console.log('Audio stream started playing');
          this.isPlaying = true;
        });
  
        this.audio.addEventListener('waiting', () => {
          console.log('Audio stream buffering...');
        });
  
        this.audio.addEventListener('error', (e) => {
          console.error('Audio stream error:', e);
          this.isPlaying = false;
        });
  
        // Attempt to play
        this.audio.play()
          .then(() => {
            console.log('Play command accepted');
          })
          .catch(error => {
            console.error('Failed to start stream:', error);
            this.isPlaying = false;
          });
      }
    }
  
    /**
     * Stop the current stream
     */
    stopStream(): void {
      if (this.audio) {
        this.audio.pause();
        this.audio.src = '';
        this.isPlaying = false;
      }
      this.currentIcao = null;
      this.currentFrequencyType = null;
    }
  
    /**
     * Change the frequency type for the current airport
     */
    changeFrequency(frequencyType: string): void {
      if (!this.currentIcao) return;
      this.startStream(this.currentIcao, frequencyType);
    }
  
    /**
     * Set the volume (0.0 to 1.0)
     */
    setVolume(volume: number): void {
      if (this.audio) {
        this.audio.volume = Math.max(0, Math.min(1, volume));
      }
    }
  
    /**
     * Get current stream status
     */
    getStatus(): {
      isPlaying: boolean;
      currentIcao: string | null;
      currentFrequencyType: string | null;
    } {
      return {
        isPlaying: this.isPlaying,
        currentIcao: this.currentIcao,
        currentFrequencyType: this.currentFrequencyType
      };
    }
  
    /**
     * Clean up resources
     */
    cleanup(): void {
      this.stopStream();
      this.audio = null;
    }
  }
  
  export default new LiveAtcService();