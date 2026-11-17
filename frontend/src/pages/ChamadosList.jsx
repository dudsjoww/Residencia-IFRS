import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/index.js";
import { useApp } from "../AppContext.jsx";
import { Prioridade, StatusChamado } from "../components/Badge.jsx";
import { Carregando, Erro, Vazio } from "../components/Feedback.jsx";
import { PRIORIDADES, STATUS_CHAMADO, formatarData } from "../constants.js";
import { useAsync } from "../hooks.js";

export default function ChamadosList() {
  const { locais, nomeLocal, nomeUsuario } = useApp();
  const [filtros, setFiltros] = useState({ status: "", prioridade: "", local_id: "" });
  const [busca, setBusca] = useState("");

  const { dados, carregando, erro, recarregar } = useAsync(
    () => api.listChamados(filtros),
    [filtros.status, filtros.prioridade, filtros.local_id],
  );

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (dados ?? []).filter((c) => c.descricao.toLowerCase().includes(termo));
  }, [dados, busca]);

  const mudar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  return (
    <section>
      <div className="cabecalho">
        <h1>Chamados</h1>
        <Link to="/chamados/novo" className="btn btn--primario">
          + Novo chamado
        </Link>
      </div>

      <form className="filtros" onSubmit={(e) => e.preventDefault()} aria-label="Filtros">
        <label>
          Status
          <select value={filtros.status} onChange={mudar("status")}>
            <option value="">Todos</option>
            {Object.entries(STATUS_CHAMADO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>
        <label>
          Prioridade
          <select value={filtros.prioridade} onChange={mudar("prioridade")}>
            <option value="">Todas</option>
            {Object.entries(PRIORIDADES).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>
        <label>
          Local
          <select value={filtros.local_id} onChange={mudar("local_id")}>
            <option value="">Todos</option>
            {locais.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="filtros__busca">
          Buscar na descrição
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Ex.: lâmpada" />
        </label>
      </form>

      {carregando && <Carregando />}
      {erro && <Erro mensagem={erro} aoTentarDeNovo={recarregar} />}

      {!carregando && !erro && lista.length === 0 && <Vazio>Nenhum chamado encontrado com esses filtros.</Vazio>}

      {!carregando && !erro && lista.length > 0 && (
        <>
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Descrição</th>
                  <th>Local</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Responsável</th>
                  <th>Aberto em</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((c) => (
                  <tr key={c.id}>
                    <td className="num">{c.id}</td>
                    <td>
                      <Link to={`/chamados/${c.id}`}>{c.descricao}</Link>
                    </td>
                    <td>{nomeLocal(c.local_id)}</td>
                    <td>
                      <Prioridade valor={c.prioridade} />
                    </td>
                    <td>
                      <StatusChamado status={c.status} />
                    </td>
                    <td>{c.responsavel_id ? nomeUsuario(c.responsavel_id) : "—"}</td>
                    <td>{formatarData(c.data_abertura)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="rodape-tabela">
            {lista.length} {lista.length === 1 ? "chamado" : "chamados"}
          </p>
        </>
      )}
    </section>
  );
}
