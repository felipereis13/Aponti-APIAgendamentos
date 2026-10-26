/// <reference types="vite/client" />

interface Window {
  __APP_CONFIG__?: { apiUrl?: string };
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
