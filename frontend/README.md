# Front-end – Sistema de Chamados de Manutenção

React 19 + Vite, com React Router. Implementa as 4 telas do [wireframe](../docs/Wireframe%20UI%20-%20Sistema%20de%20Chamados.png).

## Como rodar

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

## Telas

| Rota | Tela |
|---|---|
| `/chamados` | Lista de chamados, com filtros por status, prioridade, local e busca na descrição |
| `/chamados/novo` | Formulário para abrir um chamado |
| `/chamados/:id` | Detalhe do chamado: assumir, concluir, cancelar e gerenciar tarefas |
| `/tarefas` | Tarefas do técnico, em abas: pendentes, em andamento, atrasadas e concluídas |

Não há login no MVP. O seletor **"Você é"** no topo escolhe o usuário atual (solicitante ou técnico), e isso define quem pode assumir um chamado e de quem são as "Minhas tarefas".

## Modo demonstração

Se `VITE_API_URL` estiver vazio (ou `VITE_USE_MOCK=true`), o front não chama a API: usa dados simulados guardados no `localStorage` do navegador, com as mesmas regras de negócio previstas para o back-end. O botão **Reiniciar dados** no aviso amarelo do topo restaura os dados de exemplo.

Para usar a API de verdade, copie `.env.example` para `.env` e preencha `VITE_API_URL`.

## Estrutura

```text
src/
├── api/
│   ├── client.js     # chamadas reais à API (fetch)
│   ├── mock.js       # API simulada (modo demonstração)
│   └── index.js      # escolhe qual das duas usar
├── components/       # Layout, selos de status e avisos
├── pages/            # as 4 telas
├── AppContext.jsx    # locais, usuários e usuário atual
├── constants.js      # rótulos e funções de data
└── hooks.js          # useAsync (carregamento de dados)
```

## Contrato esperado da API

O front foi feito para este contrato. O back-end deve segui-lo (ou este arquivo deve ser atualizado se algo mudar).

Valores aceitos:

- `status` do chamado: `aberto`, `em_atendimento`, `concluido`, `cancelado`
- `status` da tarefa: `pendente`, `em_andamento`, `concluida`
- `prioridade`: `baixa`, `media`, `alta`, `urgente`
- `tipo` do usuário: `solicitante`, `tecnico`
- datas: `prazo` como `AAAA-MM-DD`; `data_abertura` como data e hora ISO

| Método | Rota | Corpo ou parâmetros | Resposta |
|---|---|---|---|
| GET | `/chamados` | `status`, `prioridade`, `local_id` (opcionais) | lista de chamados |
| POST | `/chamados` | `local_id`, `solicitante_id`, `descricao` (mín. 10 caracteres), `prioridade` | chamado criado |
| GET | `/chamados/{id}` | – | chamado |
| PATCH | `/chamados/{id}` | `status`, `responsavel_id` | chamado atualizado |
| DELETE | `/chamados/{id}` | – | cancela o chamado (204) |
| GET | `/chamados/{id}/tarefas` | – | lista de tarefas |
| POST | `/chamados/{id}/tarefas` | `descricao`, `prazo`, `responsavel_id` | tarefa criada |
| GET | `/tarefas` | `responsavel_id`, `status` (opcionais) | lista de tarefas |
| PATCH | `/tarefas/{id}` | `status` | tarefa atualizada |
| GET | `/locais` | – | lista de `{ id, nome }` |
| GET | `/usuarios` | – | lista de `{ id, nome, tipo }` |

Formato dos objetos:

```json
// chamado
{ "id": 1, "descricao": "...", "local_id": 1, "solicitante_id": 1, "responsavel_id": null,
  "prioridade": "media", "status": "aberto", "data_abertura": "2026-11-14T10:30:00Z" }

// tarefa
{ "id": 1, "chamado_id": 1, "descricao": "...", "responsavel_id": 3,
  "prazo": "2026-11-20", "status": "pendente" }
```

Erros: o front lê a mensagem de `{ "detail": "texto" }` (padrão do FastAPI) ou de uma lista `{ "detail": [{ "msg": "..." }] }` e a mostra ao usuário. Códigos esperados: `400` ou `422` para dado inválido, `404` para não encontrado e `409` para conflito de regra (transição de status inválida, chamado já assumido, tarefas pendentes).

CORS: a API precisa liberar o endereço do front (variável `ALLOWED_ORIGINS`).
