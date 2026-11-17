import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/index.js";
import { useApp } from "../AppContext.jsx";
import { Atrasada, StatusTarefa } from "../components/Badge.jsx";
import { Carregando, Erro, Vazio } from "../components/Feedback.jsx";
import { formatarData, tarefaAtrasada } from "../constants.js";
import { useAsync } from "../hooks.js";

const ABAS = [
  { id: "pendente", rotulo: "Pendentes" },
  { id: "em_andamento", rotulo: "Em andamento" },
  { id: "atrasada", rotulo: "Atrasadas" },
  { id: "concluida", rotulo: "Concluídas" },
];

// Cada tarefa cai em uma única aba: se está atrasada, vai para "Atrasadas".
function abaDaTarefa(t) {
  return tarefaAtrasada(t) ? "atrasada" : t.status;
}

export default function MinhasTarefas() {
  const { usuarioAtual, nomeLocal } = useApp();
  const [aba, setAba] = useState("pendente");
  const [erroAcao, setErroAcao] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const tarefas = useAsync(
    () => (usuarioAtual ? api.listTarefas({ responsavel_id: usuarioAtual.id }) : Promise.resolve([])),
    [usuarioAtual?.id],
  );
  const chamados = useAsync(() => api.listChamados({}), []);

  const chamadoPorId = Object.fromEntries((chamados.dados ?? []).map((c) => [c.id, c]));
  const minhas = tarefas.dados ?? [];
  const contagem = Object.fromEntries(ABAS.map((a) => [a.id, minhas.filter((t) => abaDaTarefa(t) === a.id).length]));
  const visiveis = minhas
    .filter((t) => abaDaTarefa(t) === aba)
    .sort((a, b) => a.prazo.localeCompare(b.prazo));

  async function mudar(tarefa, status) {
    setErroAcao(null);
    setOcupado(true);
    try {
      await api.updateTarefa(tarefa.id, { status });
    } catch (e) {
      setErroAcao(e.message);
    } finally {
      setOcupado(false);
      tarefas.recarregar();
    }
  }

  return (
    <section>
      <div className="cabecalho">
        <h1>Minhas tarefas</h1>
        {usuarioAtual && <span className="dica">Mostrando as tarefas de {usuarioAtual.nome}</span>}
      </div>

      {usuarioAtual?.tipo !== "tecnico" && (
        <p className="aviso">Tarefas são atribuídas a técnicos. Escolha um técnico no seletor do topo para ver as dele.</p>
      )}

      <div className="abas" role="tablist" aria-label="Situação das tarefas">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            className={`aba ${aba === a.id ? "aba--ativa" : ""}`}
            onClick={() => setAba(a.id)}
          >
            {a.rotulo} ({contagem[a.id]})
          </button>
        ))}
      </div>

      {erroAcao && <Erro mensagem={erroAcao} />}
      {tarefas.carregando && !tarefas.dados && <Carregando />}
      {tarefas.erro && <Erro mensagem={tarefas.erro} aoTentarDeNovo={tarefas.recarregar} />}
      {tarefas.dados && visiveis.length === 0 && <Vazio>Nenhuma tarefa nesta aba.</Vazio>}

      <ul className="lista-cartoes">
        {visiveis.map((t) => {
          const atrasada = tarefaAtrasada(t);
          const ch = chamadoPorId[t.chamado_id];
          return (
            <li key={t.id} className={`cartao tarefa ${atrasada ? "tarefa--atrasada" : ""}`}>
              <div className="tarefa__texto">
                <strong>{t.descricao}</strong>
                <span className="dica">
                  <Link to={`/chamados/${t.chamado_id}`}>Chamado #{t.chamado_id}</Link>
                  {ch ? ` · ${nomeLocal(ch.local_id)}` : ""}
                </span>
                <span className={atrasada ? "prazo prazo--atrasado" : "prazo"}>Prazo: {formatarData(t.prazo)}</span>
              </div>
              <div className="tarefa__lado">
                <span>
                  <StatusTarefa status={t.status} /> {atrasada && <Atrasada />}
                </span>
                {t.status === "pendente" && (
                  <button type="button" className="btn" disabled={ocupado} onClick={() => mudar(t, "em_andamento")}>
                    Iniciar
                  </button>
                )}
                {t.status === "em_andamento" && (
                  <button type="button" className="btn btn--primario" disabled={ocupado} onClick={() => mudar(t, "concluida")}>
                    Concluir
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
