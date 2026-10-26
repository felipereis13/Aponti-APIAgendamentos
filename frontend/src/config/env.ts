/**
 * Ponto único de leitura das variáveis de ambiente.
 * Local: VITE_API_URL no .env. Docker/Render: API_URL ao iniciar o container.
 */
const rawApiUrl = window.__APP_CONFIG__?.apiUrl || import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  console.warn('[config] URL da API não definida — usando http://localhost:3000');
}

export const env = {
  apiUrl: (rawApiUrl || 'http://localhost:3000').replace(/\/+$/, ''),
};
