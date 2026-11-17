// API simulada: guarda os dados no navegador (localStorage) e aplica as mesmas
// regras de negócio previstas para o back-end. Serve para desenvolver e
// apresentar o front enquanto a API real não está pronta.

import { ApiError } from "./client.js";

const CHAVE = "chamados-mock-v1";
const ATRASO_MS = 250;

const PRIORIDADES = ["baixa", "media", "alta", "urgente"];

function hojeMaisDias(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function agoraMenosDias(dias) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString();
}

function dadosIniciais() {
  return {
    locais: [
      { id: 1, nome: "Bloco A – corredor 2" },
      { id: 2, nome: "Bloco B – banheiro" },
      { id: 3, nome: "Sala 204" },
      { id: 4, nome: "Auditório" },
      { id: 5, nome: "Cozinha" },
    ],
    usuarios: [
      { id: 1, nome: "Maria Souza", tipo: "solicitante" },
      { id: 2, nome: "Carlos Lima", tipo: "solicitante" },
      { id: 3, nome: "João Pereira", tipo: "tecnico" },
      { id: 4, nome: "Rita Alves", tipo: "tecnico" },
    ],
    chamados: [
      { id: 1, descricao: "Lâmpada do corredor queimada", local_id: 1, solicitante_id: 1, responsavel_id: 3, prioridade: "media", status: "em_atendimento", data_abertura: agoraMenosDias(2) },
      { id: 2, descricao: "Vazamento no banheiro do bloco B", local_id: 2, solicitante_id: 2, responsavel_id: null, prioridade: "urgente", status: "aberto", data_abertura: agoraMenosDias(2) },
      { id: 3, descricao: "Porta da sala emperrada", local_id: 3, solicitante_id: 1, responsavel_id: null, prioridade: "baixa", status: "aberto", data_abertura: agoraMenosDias(3) },
      { id: 4, descricao: "Ar-condicionado sem gelar", local_id: 4, solicitante_id: 2, responsavel_id: 4, prioridade: "alta", status: "em_atendimento", data_abertura: agoraMenosDias(4) },
      { id: 5, descricao: "Torneira da cozinha pingando", local_id: 5, solicitante_id: 1, responsavel_id: 3, prioridade: "baixa", status: "concluido", data_abertura: agoraMenosDias(8) },
      { id: 6, descricao: "Interruptor solto na parede", local_id: 1, solicitante_id: 2, responsavel_id: null, prioridade: "media", status: "cancelado", data_abertura: agoraMenosDias(9) },
    ],
    tarefas: [
      { id: 1, chamado_id: 1, descricao: "Comprar lâmpada LED", responsavel_id: 3, prazo: hojeMaisDias(-1), status: "concluida" },
      { id: 2, chamado_id: 1, descricao: "Trocar a lâmpada", responsavel_id: 3, prazo: hojeMaisDias(1), status: "em_andamento" },
      { id: 3, chamado_id: 1, descricao: "Testar o interruptor", responsavel_id: 3, prazo: hojeMaisDias(1), status: "pendente" },
      { id: 4, chamado_id: 4, descricao: "Verificar o gás do ar-condicionado", responsavel_id: 4, prazo: hojeMaisDias(-2), status: "pendente" },
      { id: 5, chamado_id: 4, descricao: "Limpar os filtros", responsavel_id: 4, prazo: hojeMaisDias(2), status: "pendente" },
      { id: 6, chamado_id: 5, descricao: "Trocar o vedante", responsavel_id: 3, prazo: hojeMaisDias(-6), status: "concluida" },
    ],
    proximoChamado: 7,
    proximaTarefa: 7,
  };
}

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) return JSON.parse(bruto);
  } catch {
    /* sem armazenamento: usa dados em memória */
  }
  return dadosIniciais();
}

let banco = carregar();

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(banco));
  } catch {
    /* ignora */
  }
}

// Zera os dados de demonstração (usado pelo botão no topo da página).
export function reiniciarDemonstracao() {
  banco = dadosIniciais();
  salvar();
}

const copia = (x) => JSON.parse(JSON.stringify(x));
const esperar = (valor) => new Promise((ok) => setTimeout(() => ok(copia(valor)), ATRASO_MS));
const falhar = (mensagem, status) =>
  new Promise((_, erro) => setTimeout(() => erro(new ApiError(mensagem, status)), ATRASO_MS));

function achar(lista, id) {
  return lista.find((x) => x.id === Number(id));
}

export const mockApi = {
  listChamados(filtros = {}) {
    let lista = banco.chamados;
    if (filtros.status) lista = lista.filter((c) => c.status === filtros.status);
    if (filtros.prioridade) lista = lista.filter((c) => c.prioridade === filtros.prioridade);
    if (filtros.local_id) lista = lista.filter((c) => c.local_id === Number(filtros.local_id));
    return esperar([...lista].sort((a, b) => b.id - a.id));
  },

  getChamado(id) {
    const c = achar(banco.chamados, id);
    return c ? esperar(c) : falhar("Chamado não encontrado.", 404);
  },

  createChamado(dados) {
    const { local_id, solicitante_id, descricao, prioridade } = dados;
    if (!local_id) return falhar("Informe o local do chamado.", 422);
    if (!solicitante_id) return falhar("Informe quem está solicitando.", 422);
    if (!descricao || descricao.trim().length < 10) {
      return falhar("A descrição precisa ter pelo menos 10 caracteres.", 422);
    }
    if (!PRIORIDADES.includes(prioridade)) return falhar("Prioridade inválida.", 422);

    const novo = {
      id: banco.proximoChamado++,
      descricao: descricao.trim(),
      local_id: Number(local_id),
      solicitante_id: Number(solicitante_id),
      responsavel_id: null,
      prioridade,
      status: "aberto",
      data_abertura: new Date().toISOString(),
    };
    banco.chamados.push(novo);
    salvar();
    return esperar(novo);
  },

  updateChamado(id, dados) {
    const c = achar(banco.chamados, id);
    if (!c) return falhar("Chamado não encontrado.", 404);
    if (c.status === "concluido" || c.status === "cancelado") {
      return falhar("Chamados concluídos ou cancelados não podem ser alterados.", 409);
    }

    if (dados.status && dados.status !== c.status) {
      const de = c.status;
      const para = dados.status;
      const permitido =
        (de === "aberto" && (para === "em_atendimento" || para === "cancelado")) ||
        (de === "em_atendimento" && (para === "concluido" || para === "cancelado"));
      if (!permitido) return falhar(`Transição de status inválida: ${de} → ${para}.`, 409);

      if (para === "em_atendimento") {
        if (c.responsavel_id && dados.responsavel_id && c.responsavel_id !== dados.responsavel_id) {
          return falhar("Este chamado já foi assumido por outro técnico.", 409);
        }
        const responsavel = achar(banco.usuarios, dados.responsavel_id ?? c.responsavel_id);
        if (!responsavel || responsavel.tipo !== "tecnico") {
          return falhar("Para entrar em atendimento é preciso definir um técnico responsável.", 400);
        }
        c.responsavel_id = responsavel.id;
      }

      if (para === "concluido") {
        const pendentes = banco.tarefas.filter((t) => t.chamado_id === c.id && t.status !== "concluida");
        if (pendentes.length > 0) {
          return falhar("Existem tarefas pendentes. Conclua todas antes de concluir o chamado.", 409);
        }
      }
      c.status = para;
    }

    if (dados.descricao !== undefined) c.descricao = dados.descricao;
    if (dados.prioridade && PRIORIDADES.includes(dados.prioridade)) c.prioridade = dados.prioridade;
    salvar();
    return esperar(c);
  },

  cancelChamado(id) {
    return mockApi.updateChamado(id, { status: "cancelado" }).then(() => null);
  },

  listTarefasDoChamado(chamadoId) {
    return esperar(banco.tarefas.filter((t) => t.chamado_id === Number(chamadoId)));
  },

  createTarefa(chamadoId, dados) {
    const c = achar(banco.chamados, chamadoId);
    if (!c) return falhar("Chamado não encontrado.", 404);
    if (c.status === "concluido" || c.status === "cancelado") {
      return falhar("Não é possível criar tarefas em chamado concluído ou cancelado.", 409);
    }
    if (!dados.descricao || dados.descricao.trim().length < 3) {
      return falhar("Descreva a tarefa (mínimo de 3 caracteres).", 422);
    }
    if (!dados.prazo) return falhar("Informe o prazo da tarefa.", 422);
    const nova = {
      id: banco.proximaTarefa++,
      chamado_id: c.id,
      descricao: dados.descricao.trim(),
      responsavel_id: dados.responsavel_id ? Number(dados.responsavel_id) : c.responsavel_id,
      prazo: dados.prazo,
      status: "pendente",
    };
    banco.tarefas.push(nova);
    salvar();
    return esperar(nova);
  },

  listTarefas(filtros = {}) {
    let lista = banco.tarefas;
    if (filtros.responsavel_id) lista = lista.filter((t) => t.responsavel_id === Number(filtros.responsavel_id));
    if (filtros.status) lista = lista.filter((t) => t.status === filtros.status);
    return esperar(lista);
  },

  updateTarefa(id, dados) {
    const t = achar(banco.tarefas, id);
    if (!t) return falhar("Tarefa não encontrada.", 404);
    if (dados.status && dados.status !== t.status) {
      const permitido =
        (t.status === "pendente" && dados.status === "em_andamento") ||
        (t.status === "em_andamento" && dados.status === "concluida");
      if (!permitido) return falhar(`Transição de status inválida: ${t.status} → ${dados.status}.`, 409);
      if (dados.status === "em_andamento" && !t.responsavel_id) {
        return falhar("Defina um responsável antes de iniciar a tarefa.", 400);
      }
      t.status = dados.status;
    }
    salvar();
    return esperar(t);
  },

  listLocais() {
    return esperar(banco.locais);
  },

  listUsuarios() {
    return esperar(banco.usuarios);
  },
};
