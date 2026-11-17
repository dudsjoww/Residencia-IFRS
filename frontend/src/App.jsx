import { Link, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ChamadoDetalhe from "./pages/ChamadoDetalhe.jsx";
import ChamadoNovo from "./pages/ChamadoNovo.jsx";
import ChamadosList from "./pages/ChamadosList.jsx";
import MinhasTarefas from "./pages/MinhasTarefas.jsx";

function NaoEncontrado() {
  return (
    <section>
      <h1>Página não encontrada</h1>
      <p>
        O endereço não existe. <Link to="/chamados">Voltar para os chamados</Link>
      </p>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/chamados" replace />} />
        <Route path="chamados" element={<ChamadosList />} />
        <Route path="chamados/novo" element={<ChamadoNovo />} />
        <Route path="chamados/:id" element={<ChamadoDetalhe />} />
        <Route path="tarefas" element={<MinhasTarefas />} />
        <Route path="*" element={<NaoEncontrado />} />
      </Route>
    </Routes>
  );
}
