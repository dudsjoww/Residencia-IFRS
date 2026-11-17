import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api/index.js";

const Contexto = createContext(null);
const CHAVE_USUARIO = "usuario-atual";

// Guarda o que várias telas precisam: lista de locais, lista de usuários e
// "quem está usando o sistema". O MVP não tem login, então o usuário atual é
// escolhido num seletor no topo da página.
export function AppProvider({ children }) {
  const [locais, setLocais] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [usuarioId, setUsuarioId] = useState(() => {
    try {
      return Number(localStorage.getItem(CHAVE_USUARIO)) || null;
    } catch {
      return null;
    }
  });

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [listaLocais, listaUsuarios] = await Promise.all([api.listLocais(), api.listUsuarios()]);
      setLocais(listaLocais);
      setUsuarios(listaUsuarios);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const usuarioAtual =
    usuarios.find((u) => u.id === usuarioId) ??
    usuarios.find((u) => u.tipo === "solicitante") ??
    usuarios[0] ??
    null;

  const trocarUsuario = (id) => {
    setUsuarioId(id);
    try {
      localStorage.setItem(CHAVE_USUARIO, String(id));
    } catch {
      /* ignora */
    }
  };

  const valor = useMemo(
    () => ({
      locais,
      usuarios,
      tecnicos: usuarios.filter((u) => u.tipo === "tecnico"),
      solicitantes: usuarios.filter((u) => u.tipo === "solicitante"),
      usuarioAtual,
      trocarUsuario,
      nomeLocal: (id) => locais.find((l) => l.id === id)?.nome ?? "—",
      nomeUsuario: (id) => usuarios.find((u) => u.id === id)?.nome ?? "—",
      carregando,
      erro,
      recarregar: carregar,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locais, usuarios, usuarioAtual, carregando, erro, carregar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useApp() {
  return useContext(Contexto);
}
