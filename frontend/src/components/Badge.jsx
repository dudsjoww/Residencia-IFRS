import { PRIORIDADES, STATUS_CHAMADO, STATUS_TAREFA } from "../constants.js";

function Badge({ tipo, children }) {
  return <span className={`badge badge--${tipo}`}>{children}</span>;
}

export function StatusChamado({ status }) {
  return <Badge tipo={status}>{STATUS_CHAMADO[status] ?? status}</Badge>;
}

export function StatusTarefa({ status }) {
  return <Badge tipo={status}>{STATUS_TAREFA[status] ?? status}</Badge>;
}

export function Prioridade({ valor }) {
  return <Badge tipo={valor}>{PRIORIDADES[valor] ?? valor}</Badge>;
}

export function Atrasada() {
  return <Badge tipo="atrasada">Atrasada</Badge>;
}
