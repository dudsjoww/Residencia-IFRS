import { useEffect, useState } from "react";

// Executa uma função assíncrona (chamada à API) e devolve o estado da busca.
// `deps` diz quando a busca deve ser refeita. `recarregar()` força uma nova busca.
export function useAsync(funcao, deps) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: null });
  const [rodada, setRodada] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado((atual) => ({ ...atual, carregando: true, erro: null }));
    funcao()
      .then((dados) => {
        if (!cancelado) setEstado({ dados, carregando: false, erro: null });
      })
      .catch((e) => {
        if (!cancelado) setEstado({ dados: null, carregando: false, erro: e.message });
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, rodada]);

  return { ...estado, recarregar: () => setRodada((n) => n + 1) };
}
