export const STATUS_CHAMADO = {
  aberto: "Aberto",
  em_atendimento: "Em atendimento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const STATUS_TAREFA = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

export const PRIORIDADES = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const TIPO_USUARIO = {
  solicitante: "solicitante",
  tecnico: "técnico",
};

// Data de hoje no formato AAAA-MM-DD, no fuso do navegador.
export function hojeISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Aceita "AAAA-MM-DD" ou uma data ISO completa e devolve "dd/mm/aaaa".
export function formatarData(valor) {
  if (!valor) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [a, m, d] = valor.split("-");
    return `${d}/${m}/${a}`;
  }
  return new Date(valor).toLocaleDateString("pt-BR");
}

export function tarefaAtrasada(tarefa) {
  return tarefa.status !== "concluida" && tarefa.prazo < hojeISO();
}
