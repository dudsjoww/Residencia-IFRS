// Cliente da API real (FastAPI). O contrato esperado está em frontend/README.md.

const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// O FastAPI devolve { detail: "texto" } ou { detail: [{ loc, msg }, ...] } (erro 422).
function mensagemDeErro(corpo) {
  if (!corpo) return null;
  const detalhe = corpo.detail ?? corpo.message;
  if (typeof detalhe === "string") return detalhe;
  if (Array.isArray(detalhe)) return detalhe.map((e) => e.msg).join("; ");
  return null;
}

async function request(path, { method = "GET", body, params } = {}) {
  const url = new URL(BASE + path);
  if (params) {
    Object.entries(params).forEach(([chave, valor]) => {
      if (valor !== "" && valor != null) url.searchParams.set(chave, valor);
    });
  }

  let resposta;
  try {
    resposta = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Não foi possível falar com a API. Se ela está no plano gratuito, pode estar acordando: tente de novo em instantes.",
    );
  }

  if (resposta.status === 204) return null;
  const corpo = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new ApiError(mensagemDeErro(corpo) || `Erro ${resposta.status} na API.`, resposta.status);
  }
  return corpo;
}

export const realApi = {
  listChamados: (filtros) => request("/chamados", { params: filtros }),
  getChamado: (id) => request(`/chamados/${id}`),
  createChamado: (dados) => request("/chamados", { method: "POST", body: dados }),
  updateChamado: (id, dados) => request(`/chamados/${id}`, { method: "PATCH", body: dados }),
  cancelChamado: (id) => request(`/chamados/${id}`, { method: "DELETE" }),

  listTarefasDoChamado: (chamadoId) => request(`/chamados/${chamadoId}/tarefas`),
  createTarefa: (chamadoId, dados) =>
    request(`/chamados/${chamadoId}/tarefas`, { method: "POST", body: dados }),
  listTarefas: (filtros) => request("/tarefas", { params: filtros }),
  updateTarefa: (id, dados) => request(`/tarefas/${id}`, { method: "PATCH", body: dados }),

  listLocais: () => request("/locais"),
  listUsuarios: () => request("/usuarios"),
};
