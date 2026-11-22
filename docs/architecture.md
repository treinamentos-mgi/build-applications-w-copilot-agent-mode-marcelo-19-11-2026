# Arquitetura do OctoFit Tracker

O OctoFit Tracker é uma aplicação de três camadas para um programa de atividades físicas escolar. O código inicial inclui contratos de API e pontos de implementação intencionalmente incompletos para que você use o modo agent do GitHub Copilot em um ciclo guiado por testes.

```mermaid
flowchart LR
    Browser["Navegador"]
    UI["Apresentação<br/>React 19 · Vite · React Router · Bootstrap<br/>Porta 3000 · pública"]
    API["Lógica<br/>Express · TypeScript · serviços<br/>Porta 8000 · pública"]
    DB["Dados<br/>Mongoose · MongoDB<br/>Porta 27017 · privada"]
    Contracts["Contratos executáveis<br/>Atividades · Equipes · Placar · Sugestões"]

    Browser --> UI
    UI -->|HTTP /api via proxy Vite| API
    API -->|Mongoose| DB
    Contracts -. verificam .-> UI
    Contracts -. verificam .-> API
    Contracts -. verificam .-> DB
```

## Limites entre as camadas

- **Camada de apresentação**: React 19, Vite, React Router, Bootstrap e um cliente compartilhado da API em `octofit-tracker/frontend/src`.
- **Camada de lógica**: rotas e serviços Express com TypeScript em `octofit-tracker/backend/src` expõem o comportamento `/api/*` na porta `8000`.
- **Camada de dados**: modelos Mongoose e dados de demonstração em `octofit-tracker/backend/src/models` e `src/scripts/seed.ts` são persistidos no MongoDB na porta `27017`.

## Portas e regras de ambiente

- MongoDB: `27017` (privada)
- API Express: `8000` (pública)
- Interface Vite: `3000` (pública)
- O navegador acessa caminhos relativos `/api`. O Vite os encaminha para `http://localhost:8000`; `VITE_API_BASE_URL` pode substituir a URL-base.
- Não encaminhe nem torne públicas outras portas.

## Contrato da API

| Capacidade | Método e caminho | Comportamento esperado |
| --- | --- | --- |
| Registro de atividades | `GET /api/activities`, `POST /api/activities` | Lista e cria atividades válidas. POST recebe `userId`, `teamId`, `type` e `minutes`; `userId` e `teamId` devem ser IDs bem-formados de uma pessoa e uma equipe existentes, caso contrário a API retorna um 4xx intencional (nunca um 500 causado por erro de conversão). Uma atividade criada armazena `user`, `team`, `type` e `minutes` enviados, além de `points` e `occurredAt` calculados. |
| Equipes | `GET /api/teams`, `POST /api/teams` | Lista e cria equipes com integrantes. As equipes criadas e listadas mantêm os valores enviados em `name` e `mascot`. Rejeita uma equipe sem nome com `400`. |
| Placar | `GET /api/leaderboard` | Retorna as equipes ordenadas pela soma dos pontos de suas atividades, da maior para a menor. Cada item contém `teamName`, `totalPoints` e uma `rank` iniciada em 1. |
| Sugestões de treino | `GET /api/workouts/suggestions/:userEmail` | Recomenda treinos com base nos padrões de atividade recentes da pessoa correspondente ao e-mail seed. O foco da primeira sugestão (`focus`) corresponde à meta ou à atividade recente dessa pessoa, e o campo `reason` explica o motivo. Um e-mail sem pessoa correspondente retorna um 4xx intencional (por exemplo, `404`). |

## Decisões de implementação

Registre seu plano aqui antes de editar o código.

- Decisão da camada de apresentação: renderizar estados de carregamento (`role="status"`), vazio e erro (`role="alert"`) em cada rota antes de exibir dados, usando o cliente compartilhado em `api/client.ts`.
- Decisão da camada de lógica: handlers de rota apenas validam entrada e delegam a `services/octofitService.ts`, que concentra as regras de negócio.
- Decisão da camada de dados: validações obrigatórias (`required`) nos modelos Mongoose; o seed usa os modelos, sem gravação direta no MongoDB.
- Abordagem para registro de atividades: validar `userId` e `teamId` como ObjectIds existentes (4xx em caso de falha) antes de calcular `points` e `occurredAt`.
- Abordagem para gerenciamento de equipes: validar `name` e `mascot` (400 se ausentes) e retornar `201` com `members` populados.
- Abordagem para o placar: agregar `totalPoints` por equipe a partir das atividades, ordenar em ordem decrescente e atribuir `rank` iniciando em 1.
- Abordagem para sugestões de treino: derivar o foco da meta da pessoa ou da atividade recente, retornar `reason` e `404` para e-mail desconhecido.

## Plano de testes

Registre os comandos executados e o significado de cada falha.

- Testes da camada de dados: `npm run test:data --prefix octofit-tracker/backend`
- Testes da API: `npm run test:api --prefix octofit-tracker/backend`
- Testes do frontend: `npm test --prefix octofit-tracker/frontend`
- Compilação do backend: `npm run build --prefix octofit-tracker/backend`
- Compilação do frontend: `npm run build --prefix octofit-tracker/frontend`

### Estado inicial registrado

- Dados: 4 falhas de validação (`required` ausente em `User`, `Team`, `Activity` e `Workout`). Inserção idempotente passa.
- API: 4 falhas. POSTs de atividades e equipes retornam `501` (handlers pendentes), placar vazio sem atividades, e sugestões retornam `strength` em vez de `endurance` para `mona@example.com`.
- Frontend: 15 falhas. Textos "Implementação pendente" indicam componentes não implementados; faltam estados de carregamento, vazio e erro, renderização de dados e chamada de sugestões por e-mail. Os testes usam `fetch` mockado e não dependem do backend.

Ordem de correção: dados, equipes, atividades, placar, sugestões e, por último, frontend. Cada etapa deve executar os testes correspondentes antes de avançar.
