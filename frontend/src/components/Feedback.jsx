export function Carregando({ texto = "Carregando…" }) {
  return (
    <p className="estado" role="status">
      {texto}
    </p>
  );
}

export function Erro({ mensagem, aoTentarDeNovo }) {
  return (
    <div className="aviso aviso--erro" role="alert">
      <span>{mensagem}</span>
      {aoTentarDeNovo && (
        <button type="button" className="btn btn--pequeno" onClick={aoTentarDeNovo}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

export function Vazio({ children }) {
  return <p className="estado estado--vazio">{children}</p>;
}
