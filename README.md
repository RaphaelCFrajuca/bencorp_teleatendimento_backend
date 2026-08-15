# BenCorp Teleatendimento

Recorte simplificado de uma plataforma de teleatendimento: fila de pronto atendimento digital, onde profissionais de saúde (enfermeiros e médicos) atendem pacientes por videochamada e registram prontuário. Desenvolvido como case técnico para a vaga de Dev Fullstack Sênior — BenCorp.

> Requisito central do case: nenhuma rota, dado ou sala de vídeo pode ser acessada sem autorização explícita, independentemente do frontend. Toda a arquitetura foi desenhada em função disso.

---

## Índice

- [Stack utilizada](#stack-utilizada)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar localmente](#como-rodar-localmente)
- [Como rodar com Docker](#como-rodar-com-docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Documentação da API](#documentação-da-api)
- [Perfis e regras de acesso](#perfis-e-regras-de-acesso)
- [Decisões técnicas e trade-offs](#decisões-técnicas-e-trade-offs)
- [Limitações conhecidas](#limitações-conhecidas)
- [Uso de IA no desenvolvimento](#uso-de-ia-no-desenvolvimento)

---

## Stack utilizada

**Backend**

- Node.js + NestJS + TypeScript
- TypeORM + PostgreSQL
- JWT (Passport) para autenticação
- nestjs-pino para logging estruturado
- LiveKit (SDK server) para emissão de credenciais de sala de vídeo
- Docker

**Frontend**

- React + Vite + TypeScript
- React Router
- TanStack Query (cache e revalidação de dados de servidor)
- React Hook Form + Zod (formulários e validação)
- LiveKit Client + `@livekit/components-react` (consumo da sala de vídeo)
- PWA (`vite-plugin-pwa`)

---

## Estrutura de pastas

O projeto segue a estrutura modular do Nest, com um ajuste: cada módulo é organizado **por tipo de arquivo** (`controller`, `service`, `entity`, `dto`, `enum`), não por camada de domínio (`domain/application/infrastructure`). A separação de responsabilidades é mantida pelo uso de interfaces de repositório injetadas por DI, não pela estrutura de pastas em si.

```
backend/
  src/
    modules/
      auth/
        controller/
        service/
        strategy/
        dto/
      users/
        controller/
        service/
        entity/
        enum/
        dto/
      patients/
        controller/
        service/
        entity/
        dto/
      consultations/
        controller/
        service/
        entity/
        enum/
        dto/
      medical-records/
        controller/
        service/
        entity/
        dto/
      rooms/
        controller/
        service/
        dto/
    common/
      guards/            # JwtAuthGuard, RolesGuard, RoomTokenGuard
      decorators/         # @Roles, @Public, @CurrentUser
      interceptors/        # AuditLogInterceptor
      filters/              # mapeamento de exceções de domínio -> HTTP
    database/
      migrations/
    main.ts
  Dockerfile
  docker-compose.yml
  .env.example

frontend/
  src/
    modules/
      auth/ users/ patients/ consultations/ medical-records/ rooms/
        service/ hook/ dto/ component/ page/
    common/
      api/                 # client HTTP central
      guards/               # RequireAuth, RequireRole
      context/               # AuthContext
      components/
  vite.config.ts
  .env.example
```

---

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+ rodando localmente (ou via Docker apenas para o banco — ver seção seguinte)
- npm ou yarn

### Backend

```bash
cd backend
cp .env.example .env
# edite o .env com as credenciais do seu Postgres local e as chaves do LiveKit

npm install
npm run migration:run
npm run start:dev
```

A API sobe em `http://localhost:3000` (ou na porta definida em `PORT` no `.env`). A documentação Swagger fica disponível em `http://localhost:3000/docs`.

### Frontend

```bash
cd frontend
cp .env.example .env
# edite VITE_API_BASE_URL apontando para a API acima

npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`.

---

## Como rodar com Docker

Sobe API, banco de dados e frontend com um único comando:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# ajuste os .env conforme necessário (principalmente as chaves do LiveKit)

docker compose up --build
```

Serviços:

| Serviço    | Descrição                                | Porta padrão |
| ---------- | ---------------------------------------- | ------------ |
| `api`      | Backend NestJS                           | `3000`       |
| `postgres` | Banco de dados PostgreSQL                | `5432`       |
| `web`      | Frontend React (build servido via Nginx) | `8080`       |

As migrations são executadas automaticamente na subida do container `api` (via script de entrypoint).

Para derrubar o ambiente:

```bash
docker compose down
```

Para derrubar e apagar os dados do banco (reset completo):

```bash
docker compose down -v
```

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável                 | Descrição                                      | Exemplo                                       |
| ------------------------ | ---------------------------------------------- | --------------------------------------------- |
| `PORT`                   | Porta da aplicação NestJS                      | `3000`                                        |
| `DATABASE_URL`           | String de conexão PostgreSQL                   | `postgres://user:pass@localhost:5432/bencorp` |
| `JWT_SECRET`             | Segredo para assinatura do JWT                 | `troque-por-um-valor-forte`                   |
| `JWT_EXPIRES_IN`         | Tempo de expiração do token de sessão          | `8h`                                          |
| `LIVEKIT_API_KEY`        | Chave de API do LiveKit                        | `devkey`                                      |
| `LIVEKIT_API_SECRET`     | Segredo de API do LiveKit                      | `devsecret`                                   |
| `LIVEKIT_SERVER_URL`     | URL do servidor LiveKit (cloud ou self-hosted) | `wss://seu-projeto.livekit.cloud`             |
| `ROOM_TOKEN_TTL_SECONDS` | TTL do token de acesso à sala                  | `900`                                         |

### Frontend (`frontend/.env`)

| Variável            | Descrição                            | Exemplo                 |
| ------------------- | ------------------------------------ | ----------------------- |
| `VITE_API_BASE_URL` | URL base da API consumida pelo front | `http://localhost:3000` |

---

## Documentação da API

A especificação completa (OpenAPI/Swagger) fica disponível em `/docs` com a aplicação rodando. Principais grupos de endpoints:

- `POST /auth/login` — autenticação e emissão de JWT.
- `/users` — gestão de usuários (exclusivo ADMIN).
- `/patients` — cadastro e histórico de pacientes.
- `/consultations` — fila de atendimento, início, transferência, finalização e cancelamento.
- `/medical-records` — prontuário, finalização e adendos.
- `/rooms` — emissão de credenciais de acesso à sala de vídeo (profissional e paciente).

---

## Perfis e regras de acesso

| Perfil   | Acesso                                                                        |
| -------- | ----------------------------------------------------------------------------- |
| `admin`  | Gestão de usuários e permissões. **Não acessa prontuário clínico.**           |
| `nurse`  | Fila de atendimento, triagem, iniciar atendimento, encaminhar para médico.    |
| `doctor` | Fila de atendimento, atendimentos recebidos, prescrição, prontuário completo. |
| Paciente | Sem login. Acessa a sala por link temporário de uso único.                    |

Toda autorização é validada no backend, em duas camadas:

1. **Por role**, via `RolesGuard` + decorator `@Roles(...)`.
2. **Por recurso**, dentro dos services — por exemplo, um médico só acessa o prontuário do atendimento ao qual está vinculado, não qualquer prontuário do sistema, mesmo tendo a role correta.

O frontend reflete essas regras visualmente (ocultando rotas e ações), mas essa camada é apenas UX — a única fonte real de autorização é a resposta da API.

---

## Decisões técnicas e trade-offs

### Concorrência resolvida no banco, não em memória

A regra "dois cliques simultâneos em Iniciar Atendimento: um vence, o outro recebe 409" foi implementada com **UPDATE condicional atômico** (`WHERE id = :id AND status = :statusEsperado`), nunca com um `SELECT` de verificação seguido de `UPDATE`. Isso elimina a janela de corrida (TOCTOU) entre a leitura e a escrita. Reforçado por um índice único parcial no banco (`profissional_id` com `status = 'em_andamento'`), garantindo em nível de constraint que um profissional não tenha dois atendimentos simultâneos — mesmo que alguma regra de aplicação falhe.

O mesmo padrão foi aplicado na criação de usuário (e-mail duplicado): a unicidade é resolvida pela constraint do banco, com o erro de violação capturado e traduzido para `409`, nunca por um `SELECT` prévio de "e-mail já existe".

### Repositórios abstratos via interface + DI

Nenhum service depende diretamente de `@InjectRepository`. Interfaces de repositório são injetadas por token, e a implementação concreta (TypeORM/PostgreSQL) fica isolada. Isso significa que trocar de banco de dados exigiria apenas uma nova implementação da interface, sem tocar em regra de negócio — **essa segunda implementação não foi construída**, pois PostgreSQL é o requisito técnico obrigatório do case e o tempo foi priorizado para as regras de negócio críticas (concorrência, RBAC, imutabilidade).

### Autenticação: role sempre validada no banco, nunca só no payload do JWT

O payload do JWT carrega apenas o identificador do usuário (`sub`). A cada requisição, a role é buscada novamente no banco (`JwtStrategy.validate`). Isso tem um custo pequeno de uma query indexada a mais por requisição, mas garante que a revogação de acesso (ex: um ADMIN desativa um profissional) tenha efeito imediato, sem esperar o token antigo expirar — decisão relevante em um sistema com dados de saúde sensíveis.

### Invalidação de sala sem estado adicional (sem Redis)

A invalidação de todos os tokens de sala na finalização do atendimento foi resolvida com um contador de versão (`salaVersion`) incrementado no próprio registro do atendimento, embutido no token no momento da emissão. A validação compara a versão do token com a versão atual — nenhuma blacklist ou cache externo foi necessário.

### Prontuário imutável via adendo, não via versionamento completo

Uma vez finalizado, o prontuário não é mais editável por nenhuma rota. Correções são registradas em uma entidade separada (adendo), com autor e timestamp próprios, sem sobrescrever o conteúdo original. Optou-se por esse modelo (mais simples) em vez de um histórico de versões completo do prontuário, por ser suficiente para atender ao requisito de auditabilidade do case dentro do prazo disponível.

### Frontend: React + Vite em vez de Next.js

Todas as telas do sistema são autenticadas ou de acesso via link temporário — não há ganho relevante de SSR/SEO que justificasse Next.js. Optou-se por React + Vite, com PWA configurado via `vite-plugin-pwa`, priorizando velocidade de entrega dentro do prazo do case.

---

## Limitações conhecidas

- **Idempotency key não implementada.** O UPDATE condicional resolve corretamente a race condition entre profissionais diferentes, mas, isoladamente, pode gerar um `409` falso para o mesmo profissional em caso de retentativa após timeout de rede (ex: duplo envio por perda de resposta). A solução correta seria uma chave de idempotência por header, persistida na mesma transação da operação. Identificado, mas não implementado por restrição de tempo.
- **Log de auditoria gravado de forma síncrona.** Para o volume e escopo do case, gravação síncrona no mesmo ciclo de request é suficiente; um ambiente de produção com maior volume se beneficiaria de uma fila assíncrona para não acoplar a latência da escrita de auditoria à resposta da API.
- **Sem rate limiting no login.** Não implementado por restrição de tempo; seria uma camada adicional de defesa contra força bruta, recomendada para produção.
- **Busca de pacientes por nome/CPF é filtrada no cliente.** O backend não expõe um endpoint de busca textual dedicado; a listagem paginada é consumida e filtrada no frontend. Para uma base de pacientes muito grande, isso deixaria de ser eficiente e passaria a exigir um endpoint de busca no backend.
- **Sessão do frontend armazenada sem proteção adicional contra XSS.** Para o escopo do case, o token é mantido em memória/contexto React; em produção, a abordagem recomendada seria um cookie `httpOnly`, o que exigiria mudanças no fluxo de autenticação do backend.
- **Sem testes de carga para a condição de corrida.** A resolução da concorrência foi validada com testes automatizados disparando requisições concorrentes em ambiente de desenvolvimento, mas não houve teste de carga em escala.

---

## Uso de IA no desenvolvimento

IA foi utilizada como ferramenta de apoio ao longo do desenvolvimento, principalmente para:

- Discussão e validação de abordagens arquiteturais (ex: resolução de race condition via UPDATE condicional vs. lock pessimista, estratégia de invalidação de token de sala sem estado adicional).
- Geração de boilerplate repetitivo seguindo padrões já definidos manualmente (DTOs, guards, estrutura de módulos).
- Revisão de trade-offs para as decisões documentadas neste README.

Todas as decisões arquiteturais centrais (resolução de concorrência no banco, separação de responsabilidades entre módulos, modelo de invalidação de sala, estrutura de RBAC em duas camadas) foram definidas antes da geração de código, com domínio pleno sobre o funcionamento e capacidade de explicar cada escolha e seus trade-offs, conforme detalhado nas seções acima.
