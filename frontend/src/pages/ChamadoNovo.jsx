import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/index.js";
import { useApp } from "../AppContext.jsx";
import { Erro } from "../components/Feedback.jsx";
import { PRIORIDADES } from "../constants.js";

export default function ChamadoNovo() {
  const navigate = useNavigate();
  const { locais, solicitantes, usuarioAtual } = useApp();

  const [form, setForm] = useState({
    local_id: "",
    solicitante_id: usuarioAtual?.tipo === "solicitante" ? String(usuarioAtual.id) : "",
    descricao: "",
    prioridade: "media",
  });
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const criado = await api.createChamado({
        local_id: form.local_id ? Number(form.local_id) : null,
        solicitante_id: form.solicitante_id ? Number(form.solicitante_id) : null,
        descricao: form.descricao,
        prioridade: form.prioridade,
      });
      navigate(`/chamados/${criado.id}`);
    } catch (e2) {
      setErro(e2.message);
      setEnviando(false);
    }
  }

  return (
    <section>
      <nav className="trilha" aria-label="Você está em">
        <Link to="/chamados">Chamados</Link> › Novo chamado
      </nav>
      <h1>Novo chamado</h1>

      <form className="formulario" onSubmit={enviar} noValidate>
        <div className="formulario__linha">
          <label>
            Local *
            <select value={form.local_id} onChange={mudar("local_id")}>
              <option value="">Selecione o local…</option>
              {locais.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Solicitante *
            <select value={form.solicitante_id} onChange={mudar("solicitante_id")}>
              <option value="">Selecione o usuário…</option>
              {solicitantes.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Descrição do problema *
          <textarea
            rows={5}
            maxLength={500}
            value={form.descricao}
            onChange={mudar("descricao")}
            placeholder="Descreva o que está acontecendo (mínimo de 10 caracteres)…"
          />
          <span className="contador">{form.descricao.length} / 500</span>
        </label>

        <fieldset>
          <legend>Prioridade *</legend>
          <div className="opcoes">
            {Object.entries(PRIORIDADES).map(([valor, rotulo]) => (
              <label key={valor} className="opcao">
                <input
                  type="radio"
                  name="prioridade"
                  value={valor}
                  checked={form.prioridade === valor}
                  onChange={mudar("prioridade")}
                />
                {rotulo}
              </label>
            ))}
          </div>
        </fieldset>

        {erro && <Erro mensagem={erro} />}

        <div className="acoes">
          <Link to="/chamados" className="btn">
            Cancelar
          </Link>
          <button type="submit" className="btn btn--primario" disabled={enviando}>
            {enviando ? "Enviando…" : "Abrir chamado"}
          </button>
        </div>
      </form>
    </section>
  );
}
