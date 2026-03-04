<h1 align="center">Food Order API 🍔</h1>

<p align="center">
  Sistema completo para gerenciamento de contas, mesas e pedidos de restaurante.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

<p align="center">
  <a href="#TODO">Demo</a> •
  <a href="#TODO">Docs</a> •
  <a href="#TODO">Wiki</a> •
  <a href="https://github.com/juninalmeida/food-order-api/issues">Issues</a> •
  <a href="https://github.com/juninalmeida/food-order-api/pulse">Insights</a>
</p>

⚠️ **Aviso de Branches:** Este repositório conta com duas branches principais:

- `master` : Contém estritamente a API desenvolvida durante o curso.
- `gamified_tables`: Contém o projeto evoluído para **Fullstack** (API + Frontend) focado em produção.

---

## 🎯 Visão Geral

- **Problema:** Restaurantes enfrentam gargalos no controle de comandas, mesas e pedidos, resultando em erros e lentidão no atendimento.
- **Solução:** Uma plataforma consolidada (API + Client) que gerencia sessões de mesas, catálogo de produtos e fluxo de pedidos em tempo real.
- **O que este projeto demonstra tecnicamente:**
  - Construção de uma **API RESTful** robusta em Node.js com TypeScript e Express.
  - Integração fullstack servindo arquivos estáticos e frontend (TypeScript + TailwindCSS) através do próprio backend.
  - Modelagem relacional e migrations flexíveis utilizando **Knex** e SQLite3.
  - Validação rigorosa de payloads de entrada com **Zod**.
  - Configuração manual de cabeçalhos de segurança (CSP, HSTS, CORS) reforçando segurança HTTP.

## ✨ Funcionalidades

**Core:**

- **Produtos:** Cadastro e listagem do cardápio do estabelecimento.
- **Mesas:** Gerenciamento do mapa de mesas do local.
- **Sessões de Mesas:** Abertura e fechamento de contas para atendimento específico.
- **Pedidos:** Controle ágil de pedidos vinculados a uma sessão ativa, apurando totais e consolidando status.

**Validações & UX:**

- Sanitização e tipagem forte em todas as rotas usando **Zod**, rejeitando payloads imprecisos.
- Middleware customizado (`error-handling`) para padronização de exceções da API provendo clareza no debug.
- Headers de segurança estritos (`X-Content-Type-Options`, `Frame-Options`, `CSP`) aplicados globalmente.

## 🏗️ Arquitetura & Decisões

- **Fullstack em um único serviço (Monorepo leve):** Optei por construir o frontend de forma nativa e servi-lo via Express (diretório `public`), simplificando o deploy e mantendo a coesão sem depender de frameworks Single Page Applications complexos.
- **Query Builder (Knex):** Adotado no lugar de um ORM completo para demonstrar maior domínio sobre modelagem SQL, conferindo precisão no controle de _migrations_ e _seeds_.
- **Fluxo Frontend:** Interação centrada em `Vanilla TS` → `Manipulação e Reactividade da DOM` → `Chamadas API Fetch` → `Renderização UI`, mantendo dependências leves e performance nativa.

## 🧪 Qualidade

- **Lint/Type-check:** Comandos `npm run build:front` e `npm run build:server` executam o compilador TypeScript garantindo segurança de tipos antes do run.
- **Estilo:** Geração otimizada de CSS via Tailwind (`npm run build:css` com `--minify`).
- **Testes & CI/CD:**

## 🚀 Como rodar localmente

**Pré-requisitos:** Node.js (v20+), npm ou yarn.

1. Clone o repositório e acesse o diretório:

````bash
git clone https://github.com/juninalmeida/food-order-api.git

*A aplicação responderá internamente em `http://localhost:3333`.*

## 📂 Estrutura do Projeto

```text
├── public/                # Assets originais e build do client (CSS, JS)
├── src/
│   ├── database/          # Configuração do banco, migrations e seeds (Knex)
│   ├── frontend/          # Código fonte do Client TS e classes do Tailwind CSS
│   ├── controllers/       # Lógica e handlers de requisição HTTP (Regra principal)
│   ├── routes/            # Declaração dos endpoints e agrupamento de rotas
│   ├── middlewares/       # Interceptadores (Padronização e captura Erros)
│   └── server.ts          # Entry point do Express (Setup CORS, Headers, Static)
└── package.json           # Declarações Node e automação de scripts
````

_A organização aparta responsabilidades puramente HTTP perante a coesão de infraestrutura (`Database`/`Middlewares`), isolando regras de negócio._

## 📚 Documentação

💡 _Nota: Há um artefato auxiliar (`Insomnia_2026-03-02.yaml`) no repositório. Importe-o no seu cliente API para testar e inspecionar a modelagem de payloads preexistentes._

## 📈 Métricas & Insights

Este repositório sendo **Público**, o avanço e constância dos commits é visualizável nos \*\*[Insights do GitHub]

## 👨‍💻 Autor

<img style="border-radius: 50%;" src="https://github.com/juninalmeida.png" width="80px;" alt=""/>

**Horácio Júnior**

- 💼 LinkedIn: [júnior-almeida-3563a934b](https://www.linkedin.com/in/j%C3%BAnior-almeida-3563a934b/)
- 🐱 GitHub: [@juninalmeida](https://github.com/juninalmeida)
- ✉️ Email: [junioralmeidati2023@gmail.com](mailto:junioralmeidati2023@gmail.com)
