# Plano de Arquitetura: Sincronismo Remoto com "Database-per-Tenant"

## 1. Objetivo Principal
Substituir a atual sincronização baseada em arquivos JSON (agrupados) por um espelhamento de banco de dados real na Nuvem (usando SQLite isolados por cliente). Isso permitirá que o Backend utilize a pasta `repositories` nativamente, suportando todos os filtros, paginações e gráficos sem a necessidade de reescrever códigos ou criar rotinas de tradução.

## 2. A Nova Arquitetura

### 2.1. O Agente de Sincronismo (`agent.py`)
- **Deixa de Fazer:** Somatórias, agrupamentos ou regras de negócio.
- **Passa a Fazer:** Extração bruta (ETL). Lê tabelas essenciais (`TB_PEDIDO_VENDA`, `TB_RECEBIMENTO`, `TB_PAGAMENTO`, `TB_USUARIO`) do Firebird local e envia os registros criados ou alterados nas últimas 24h/48h para a API.

### 2.2. O Backend e Banco Central
- **Isolamento de Dados:** Cada cliente "Matriz" terá seu próprio arquivo de banco de dados no servidor (ex: `sync_data/46512675000110.db`). Usaremos SQLite por ser leve, nativo do Python e altamente compatível com SQLAlchemy.
- **API de Recepção (`/api/sync`):** Ao receber os dados do Agente, a API abre o banco `.db` correspondente e realiza `INSERT` ou `UPDATE` nas tabelas espelhadas.

### 2.3. Roteamento Inteligente (`erp_connection.py`)
- Quando um usuário solicita dados, o sistema decide:
  - Cliente Local? -> `engine = create_engine(firebird://...)`
  - Cliente Remoto? -> `engine = create_engine(sqlite:///sync_data/cnpj.db)`
- A sessão (`Session`) gerada é passada para a pasta `repositories`. Para o repositório, é transparente se o banco é Firebird ou SQLite.

### 2.4. Tratamento de Matriz e Filiais (Ex: RR IMPERIO)
- Empresas que compartilham o mesmo Firebird no mundo real (Matriz e Filiais) compartilharão o mesmo banco `.db` na Nuvem.
- Adicionaremos uma propriedade no `companies.json`: `"sync_group": "CNPJ_MATRIZ"`.
- Assim, quando a "Filial 2" conectar, o backend abre o `.db` da Matriz, mas os comandos SQL do `repositories` continuarão aplicando o filtro nativo `WHERE EMP_ID = 2`, separando perfeitamente as informações.

## 3. Plano de Ação (Etapas de Execução)

**Fase 1: Preparação do Backend (ORM)**
1. Criar os modelos (Schemas) usando SQLAlchemy para as tabelas essenciais, garantindo compatibilidade entre tipos Firebird e SQLite.
2. Adaptar o `erp_connection.py` para gerar engines dinâmicas para SQLite.

**Fase 2: Preparação do Agente**
1. Atualizar o `agent.py` para consultar as tabelas baseadas em um campo de `UPDATE_AT` ou fazer envios em lotes diários.

**Fase 3: Transição Suave**
1. Atualizar a rota `/api/sync` para persistir dados no SQLite.
2. Homologar os gráficos do Dashboard um a um (Vendas, Financeiro).
3. Remover os métodos provisórios `_load_sync_data` e arquivos `.json`.
