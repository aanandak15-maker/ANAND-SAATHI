/**
 * Google Maps Script Loader
 * Centralized script loading to prevent conflicts from multiple components
 */

interface GoogleMapsLoader {
  loadPromise: Promise<void> | null;
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
}

class GoogleMapsScriptLoader {
  private static instance: GoogleMapsScriptLoader;
  private loader: GoogleMapsLoader = {
    loadPromise: null,
    isLoading: false,
    isLoaded: false,
    error: null
  };

  private constructor() {
    this.checkIfAlreadyLoaded();
  }

  static getInstance(): GoogleMapsScriptLoader {
    if (!GoogleMapsScriptLoader.instance) {
      GoogleMapsScriptLoader.instance = new GoogleMapsScriptLoader();
    }
    return GoogleMapsScriptLoader.instance;
  }

  private checkIfAlreadyLoaded() {
    // Check if Google Maps is already loaded globally
    if (typeof window === 'undefined') {
      console.log('Not in browser environment, skipping Google Maps check');
      return;
    }

    if (window.google && window.google.maps) {
      this.loader.isLoaded = true;
      console.log('✅ Google Maps already loaded globally');
      console.log('Google Maps version:', window.google.maps.version);
    } else {
      console.log('ℹ️ Google Maps not loaded yet');
    }
  }

  async load(): Promise<void> {
    // If already loaded, return immediately
    if (this.loader.isLoaded) {
      return Promise.resolve();
    }

    // If already loading, wait for the existing promise
    if (this.loader.isLoading && this.loader.loadPromise) {
      return this.loader.loadPromise;
    }

    // Start loading
    this.loader.isLoading = true;
    this.loader.error = null;

    console.log('Loading Google Maps script...');

    this.loader.loadPromise = new Promise((resolve, reject) => {
      // Get API key from environment variables directly
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
                    import.meta.env.VITE_GOOGLE_MAPS_API_KEY_DEVELOPMENT;

      if (!apiKey || apiKey.includes('YOUR_')) {
        const error = new Error('Google Maps API key not properly configured');
        this.loader.error = error;
        this.loader.isLoading = false;
        console.error('❌ Google Maps API key not properly configured');
        console.error('Please check your .env file and ensure VITE_GOOGLE_MAPS_API_KEY is set');
        console.error('Current environment variables:', {
          VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '***' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY.slice(-4) : 'Not set',
          VITE_GOOGLE_MAPS_API_KEY_DEVELOPMENT: import.meta.env.VITE_GOOGLE_MAPS_API_KEY_DEVELOPMENT ? '***' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY_DEVELOPMENT.slice(-4) : 'Not set'
        });
        reject(error);
        return;
      }

      console.log('✅ Google Maps API Key loaded:', apiKey.substring(0, 20) + '...');
      console.log('🔍 Loading Google Maps script...');

      // Check if script is already in DOM
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        console.log('Google Maps script already exists in DOM, waiting for load...');

        // Wait for existing script to load
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            this.loader.isLoaded = true;
            this.loader.isLoading = false;
            console.log('Google Maps script loaded successfully');
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Create a unique callback name for this instance
      const callbackName = `googleMapsCallback_${Date.now()}`;
      
      // Add the callback to the global scope
      (window as any)[callbackName] = () => {
        console.log('✅ Google Maps API loaded successfully');
        this.loader.isLoaded = true;
        this.loader.isLoading = false;
        delete (window as any)[callbackName]; // Clean up
        resolve();
      };

      // Create the script element
      const script = document.createElement('script');
      const url = new URL('https://maps.googleapis.com/maps/api/js');
      url.searchParams.append('key', apiKey);
      url.searchParams.append('libraries', 'geometry,places,visualization,drawing');
      url.searchParams.append('loading', 'async');
      url.searchParams.append('callback', callbackName);
      url.searchParams.append('v', 'quarterly'); // Use latest Google Maps version with drawing support
      
      script.src = url.toString();
      script.async = true;
      script.defer = true;
      script.onerror = (error) => {
        console.error('❌ Failed to load Google Maps script:', error);
        this.loader.error = new Error('Failed to load Google Maps script');
        this.loader.isLoading = false;
        delete (window as any)[callbackName]; // Clean up
        reject(this.loader.error);
      };

      console.log('📡 Loading Google Maps script from:', url.toString().replace(apiKey, '***'));

      // This is now handled by the dynamic callback above

      script.onload = () => {
        console.log('📡 Google Maps script loaded, waiting for callback...');
        // The callback will be called by Google Maps API when it's ready
      };

      // Error handling is now done in the script.onerror above

      console.log('📜 Adding Google Maps script to DOM...');
      document.head.appendChild(script);

      // Add timeout to prevent infinite loading
      setTimeout(() => {
        if (!this.loader.isLoaded && !this.loader.error) {
          this.loader.isLoading = false;
          const error = new Error('Google Maps script loading timeout');
          this.loader.error = error;
          console.error('⏰ Google Maps script loading timeout after 10 seconds');
          reject(error);
        }
      }, 10000);
    });

    return this.loader.loadPromise;
  }

  getStatus() {
    return {
      isLoading: this.loader.isLoading,
      isLoaded: this.loader.isLoaded,
      error: this.loader.error
    };
  }

  isLoaded(): boolean {
    return this.loader.isLoaded;
  }

  isLoading(): boolean {
    return this.loader.isLoading;
  }

  hasError(): boolean {
    return this.loader.error !== null;
  }
}

// Export singleton instance
export const googleMapsLoader = GoogleMapsScriptLoader.getInstance();

// Helper function for React components
export const loadGoogleMaps = () => googleMapsLoader.load();

// Export for direct usage
export default googleMapsLoader;
