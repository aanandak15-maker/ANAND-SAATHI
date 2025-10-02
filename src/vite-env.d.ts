/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY_DEVELOPMENT: string
  readonly VITE_GOOGLE_MAPS_API_KEY_PRODUCTION: string
  readonly VITE_GEE_PROJECT_ID: string
  readonly VITE_GEE_PRIVATE_KEY: string
  readonly VITE_GEE_CLIENT_EMAIL: string
  readonly VITE_TIMESFM_API_KEY: string
  readonly VITE_TIMESFM_ENDPOINT: string
  readonly VITE_OPENWEATHER_API_KEY: string
  readonly VITE_WEATHERAPI_KEY: string
  readonly VITE_WHATSAPP_PHONE_NUMBER_ID: string
  readonly VITE_WHATSAPP_ACCESS_TOKEN: string
  readonly VITE_WS_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_ERROR_REPORTING: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
