// Configuração da URL da API dinâmica para permitir acesso via IP Local (Celular)
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Se estiver no navegador, usa o hostname atual (localhost ou IP da rede)
    const hostname = window.location.hostname;
    return `http://${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export const API_URL = getApiUrl();
