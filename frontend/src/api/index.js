import { realApi } from "./client.js";
import { mockApi } from "./mock.js";

export { ApiError } from "./client.js";
export { reiniciarDemonstracao } from "./mock.js";

// Modo demonstração: dados simulados no navegador. Ligado quando não há
// endereço de API configurado ou quando VITE_USE_MOCK=true.
export const modoDemonstracao =
  import.meta.env.VITE_USE_MOCK === "true" || !import.meta.env.VITE_API_URL;

export const api = modoDemonstracao ? mockApi : realApi;
