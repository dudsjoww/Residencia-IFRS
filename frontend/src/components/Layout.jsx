import { NavLink, Outlet } from "react-router-dom";
import { useApp } from "../AppContext.jsx";
import { modoDemonstracao, reiniciarDemonstracao } from "../api/index.js";
import { TIPO_USUARIO } from "../constants.js";
import { Carregando, Erro } from "./Feedback.jsx";

export default function Layout() {
  const { usuarios, usuarioAtual, trocarUsuario, carregando, erro, recarregar } = useApp();

  return (
    <>
      {modoDemonstracao && (
        <div className="demo">
          Modo demonstração: os dados são simulados neste navegador.{" "}
          <button
            type="button"
            className="link"
            onClick={() => {
              reiniciarDemonstracao();
              window.location.reload();
            }}
          >
            Reiniciar dados
          </button>
        </div>
      )}

      <header className="topo">
        <div className="topo__conteudo">
          <span className="marca">
            <span className="marca__logo" aria-hidden="true" />
            Manutenção
          </span>

          <nav className="menu" aria-label="Principal">
            <NavLink to="/chamados">Chamados</NavLink>
            <NavLink to="/tarefas">Tarefas</NavLink>
          </nav>

          <label className="usuario">
            <span>Você é</span>
            <select
              value={usuarioAtual?.id ?? ""}
              onChange={(e) => trocarUsuario(Number(e.target.value))}
              disabled={usuarios.length === 0}
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({TIPO_USUARIO[u.tipo] ?? u.tipo})
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main className="pagina">
        {carregando && <Carregando texto="Conectando à API…" />}
        {erro && <Erro mensagem={erro} aoTentarDeNovo={recarregar} />}
        {!carregando && !erro && <Outlet />}
      </main>
    </>
  );
}
