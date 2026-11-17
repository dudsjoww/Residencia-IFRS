import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/index.js";
import { useApp } from "../AppContext.jsx";
import { Atrasada, Prioridade, StatusChamado, StatusTarefa } from "../components/Badge.jsx";
import { Carregando, Erro, Vazio } from "../components/Feedback.jsx";
import { formatarData, tarefaAtrasada } from "../constants.js";
import { useAsync } from "../hooks.js";

export default function ChamadoDetalhe() {
  const { id } = useParams();
  const { nomeLocal, nomeUsuario, usuarioAtual, tecnicos } = useApp();

  const chamado = useAsync(() => api.getChamado(id), [id]);
  const tarefas = useAsync(() => api.listTarefasDoChamado(id), [id]);

  const [erroAcao, setErroAcao] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({ descricao: "", prazo: "", responsavel_id: "" });

  // Roda uma ação, mostra o erro da API (se houver) e recarrega os dados.
  async function executar(acao) {
    setErroAcao(null);
    setOcupado(true);
    try {
      await acao();
    } catch (e) {
      setErroAcao(e.message);
    } finally {
      setOcupado(false);
      chamado.recarregar();
      tarefas.recarregar();
    }
  }

  if (chamado.carregando && !chamado.dados) return <Carregando />;
  if (chamado.erro) return <Erro mensagem={chamado.erro} aoTentarDeNovo={chamado.recarregar} />;

  const c = chamado.dados;
  const lista = tarefas.dados ?? [];
  const ativo = c.status === "aberto" || c.status === "em_atendimento";
  const souTecnico = usuarioAtual?.tipo === "tecnico";
  const pendentes = lista.filter((t) => t.status !== "concluida").length;

  const assumir = () =>
    executar(() => api.updateChamado(c.id, { status: "em_atendimento", responsavel_id: usuarioAtual.id }));
  const concluir = () => executar(() => api.updateChamado(c.id, { status: "concluido" }));
  const cancelar = () => {
    if (window.confirm("Cancelar este chamado? Essa ação não pode ser desfeita.")) {
      executar(() => api.cancelChamado(c.id));
    }
  };
  const mudarTarefa = (tarefa, status) => executar(() => api.updateTarefa(tarefa.id, { status }));

  const criarTarefa = (e) => {
    e.preventDefault();
    executar(async () => {
      await api.createTarefa(c.id, {
        descricao: novaTarefa.descricao,
        prazo: novaTarefa.prazo,
        responsavel_id: novaTarefa.responsavel_id ? Number(novaTarefa.responsavel_id) : c.responsavel_id,
      });
      setNovaTarefa({ descricao: "", prazo: "", responsavel_id: "" });
    });
  };

  return (
    <section>
      <nav className="trilha" aria-label="Você está em">
        <Link to="/chamados">Chamados</Link> › #{c.id}
      </nav>

      <div className="cabecalho">
        <h1>
          {c.descricao}
          <span className="titulo-selos">
            <StatusChamado status={c.status} />
            <Prioridade valor={c.prioridade} />
          </span>
        </h1>
      </div>

      <div className="grade-detalhe">
        <div className="cartao">
          <dl className="info">
            <dt>Número</dt>
            <dd>#{c.id}</dd>
            <dt>Local</dt>
            <dd>{nomeLocal(c.local_id)}</dd>
            <dt>Solicitante</dt>
            <dd>{nomeUsuario(c.solicitante_id)}</dd>
            <dt>Responsável</dt>
            <dd>{c.responsavel_id ? nomeUsuario(c.responsavel_id) : "Ninguém assumiu ainda"}</dd>
            <dt>Aberto em</dt>
            <dd>{formatarData(c.data_abertura)}</dd>
          </dl>
        </div>

        <div className="cartao">
          <h2>Ações</h2>
          {!ativo && <p className="dica">Este chamado está {c.status === "concluido" ? "concluído" : "cancelado"} e não pode mais ser alterado.</p>}

          {c.status === "aberto" && (
            <>
              <button type="button" className="btn btn--bloco" disabled={!souTecnico || ocupado} onClick={assumir}>
                Assumir chamado
              </button>
              {!souTecnico && <p className="dica">Escolha um técnico no seletor do topo para assumir o chamado.</p>}
            </>
          )}

          {c.status === "em_atendimento" && (
            <>
              <button
                type="button"
                className="btn btn--primario btn--bloco"
                disabled={pendentes > 0 || ocupado}
                onClick={concluir}
              >
                Concluir chamado
              </button>
              {pendentes > 0 && (
                <p className="dica">
                  {pendentes} {pendentes === 1 ? "tarefa pendente" : "tarefas pendentes"}. Conclua todas para liberar.
                </p>
              )}
            </>
          )}

          {ativo && (
            <button type="button" className="btn btn--perigo btn--bloco" disabled={ocupado} onClick={cancelar}>
              Cancelar chamado
            </button>
          )}
        </div>
      </div>

      {erroAcao && <Erro mensagem={erroAcao} />}

      <h2 className="secao">Tarefas do chamado</h2>

      {tarefas.carregando && !tarefas.dados && <Carregando />}
      {tarefas.erro && <Erro mensagem={tarefas.erro} aoTentarDeNovo={tarefas.recarregar} />}
      {tarefas.dados && lista.length === 0 && <Vazio>Nenhuma tarefa criada ainda.</Vazio>}

      {lista.length > 0 && (
        <div className="tabela-rolagem">
          <table className="tabela">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Responsável</th>
                <th>Prazo</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((t) => (
                <tr key={t.id}>
                  <td>{t.descricao}</td>
                  <td>{t.responsavel_id ? nomeUsuario(t.responsavel_id) : "—"}</td>
                  <td>{formatarData(t.prazo)}</td>
                  <td>
                    <StatusTarefa status={t.status} /> {tarefaAtrasada(t) && <Atrasada />}
                  </td>
                  <td>
                    {t.status === "pendente" && (
                      <button type="button" className="btn btn--pequeno" disabled={ocupado} onClick={() => mudarTarefa(t, "em_andamento")}>
                        Iniciar
                      </button>
                    )}
                    {t.status === "em_andamento" && (
                      <button type="button" className="btn btn--pequeno btn--primario" disabled={ocupado} onClick={() => mudarTarefa(t, "concluida")}>
                        Concluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ativo && (
        <form className="formulario formulario--tarefa" onSubmit={criarTarefa}>
          <h3>Nova tarefa</h3>
          <div className="formulario__linha formulario__linha--tres">
            <label>
              Descrição *
              <input
                type="text"
                value={novaTarefa.descricao}
                onChange={(e) => setNovaTarefa((n) => ({ ...n, descricao: e.target.value }))}
                placeholder="Ex.: Comprar material"
              />
            </label>
            <label>
              Prazo *
              <input
                type="date"
                value={novaTarefa.prazo}
                onChange={(e) => setNovaTarefa((n) => ({ ...n, prazo: e.target.value }))}
              />
            </label>
            <label>
              Responsável
              <select
                value={novaTarefa.responsavel_id}
                onChange={(e) => setNovaTarefa((n) => ({ ...n, responsavel_id: e.target.value }))}
              >
                <option value="">{c.responsavel_id ? `Padrão: ${nomeUsuario(c.responsavel_id)}` : "Selecione…"}</option>
                {tecnicos.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="acoes">
            <button type="submit" className="btn btn--primario" disabled={ocupado}>
              + Adicionar tarefa
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
