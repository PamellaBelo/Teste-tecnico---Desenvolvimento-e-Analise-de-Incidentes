# ⚖️ Judicial Process Manager

Sistema de gestão de processos judiciais desenvolvido como teste técnico para a vaga de Desenvolvedor Full Stack Java & Angular na **Attus**.

---

## 🗂️ Estrutura do Projeto

```
judicial-process-manager/
├── backend/         # Spring Boot 3 + Java 17
├── frontend/        # Angular 17 + Angular Material
├── docker-compose.yml
└── README.md
```

---

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados
- (opcional para dev local) Java 17+, Maven 3.9+, Node 20+, Angular CLI 17+

### ▶️ Com Docker (recomendado)

```bash
git clone https://github.com/PamellaBelo/Teste-tecnico---Desenvolvimento-e-Analise-de-Incidentes.git
cd judicial-process-manager

docker compose up --build
```

Aguarde todos os serviços subirem. Acesse:

| Serviço        | URL                                      |
|----------------|------------------------------------------|
| Frontend       | http://localhost:4200                    |
| Backend API    | http://localhost:8080                    |
| Swagger UI     | http://localhost:8080/swagger-ui.html    |
| API Docs (JSON)| http://localhost:8080/api-docs           |
| Health Check   | http://localhost:8080/actuator/health    |

### ▶️ Desenvolvimento Local

**Backend:**
```bash
# Suba apenas o banco
docker compose up postgres -d

cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
npm start   # roda em http://localhost:4200 com proxy para :8080
```

### 🧪 Executar Testes

**Backend (unitários + integração com H2):**
```bash
cd backend
mvn test
```

**Frontend (unitários com Karma):**
```bash
cd frontend
npm test
```

---

## 📋 Funcionalidades

- ✅ **Listagem** de processos com paginação, busca em texto livre e filtro por status
- ✅ **Cadastro** de processo com validação do número CNJ (formato `9999999-99.9999.9.99.9999`)
- ✅ **Edição** completa de processo
- ✅ **Detalhes** do processo em página dedicada
- ✅ **Exclusão** com confirmação (processos ATIVOS são protegidos contra exclusão)
- ✅ **Feedback visual** para erros de validação e operações assíncronas
- ✅ **Responsividade** para mobile e desktop

---

## 🔌 API Endpoints

| Método   | Endpoint                   | Descrição                        |
|----------|----------------------------|----------------------------------|
| `GET`    | `/api/v1/processes`        | Listar com filtros e paginação   |
| `GET`    | `/api/v1/processes/{id}`   | Buscar por ID                    |
| `POST`   | `/api/v1/processes`        | Criar processo                   |
| `PUT`    | `/api/v1/processes/{id}`   | Atualizar processo               |
| `DELETE` | `/api/v1/processes/{id}`   | Excluir processo                 |

**Query params de GET `/api/v1/processes`:**
| Param    | Tipo           | Descrição                              |
|----------|----------------|----------------------------------------|
| `status` | ProcessStatus  | ACTIVE, SUSPENDED, ARCHIVED, CLOSED    |
| `search` | String         | Busca por número, assunto ou responsável |
| `page`   | int (default 0)| Página                                 |
| `size`   | int (default 10)| Tamanho da página                     |

**Documentação interativa:** http://localhost:8080/swagger-ui.html

---

## 🏗️ Decisões Técnicas e Trade-offs

### Back-end

**Spring Boot 3 + Java 17**
Escolhido pela maturidade, ecossistema robusto e alinhamento com a stack da Attus. O uso de `records` e `sealed classes` do Java 17 foi evitado para manter compatibilidade e simplicidade, mas poderiam enriquecer o design de DTOs e enumerações.

**Flyway para migrações**
Garantia de rastreabilidade e reprodutibilidade do schema entre ambientes. Alternativa (Liquibase) oferece rollback mais elaborado, mas Flyway é mais simples para o escopo atual.

**MapStruct para mapeamento**
Geração de código em tempo de compilação evita reflection e garante performance. Trade-off: adiciona complexidade de build; para poucos DTOs, mapeamento manual seria suficiente.

**Logs estruturados com contexto (`action=`, `process_id=`)**
Facilita agregação e consulta em ferramentas como Kibana/Elasticsearch. O padrão `key=value` é compatível com o encoder `logstash-logback` incluído no projeto.

**H2 em memória para testes**
Isolamento total sem depender de infraestrutura externa. Trade-off: pequenas diferenças de dialeto SQL entre H2 (modo PostgreSQL) e o banco real. Para maior fidelidade, Testcontainers estaria configurado para CI/CD.

**Regra de negócio: processos ATIVOS não podem ser excluídos**
Protege contra exclusão acidental de processos em andamento. O fluxo esperado é: ACTIVE → ARCHIVED/CLOSED → delete.

### Front-end

**Angular 17 standalone components**
Elimina NgModules, reduz boilerplate e alinha com a direção oficial do Angular. Lazy loading de rotas com `loadComponent` melhora o tempo de carregamento inicial.

**Signals para estado local**
API reativa moderna do Angular, mais simples que RxJS para estado de UI simples (loading, dados da página). RxJS é mantido para streams de HTTP e debounce de busca.

**Angular Material**
Biblioteca de componentes com acessibilidade nativa (ARIA), temas configuráveis e consistência visual. Trade-off: bundle maior; para produto final, custom design system seria mais adequado.

**Interceptor global de erros HTTP**
Centraliza o tratamento de erros de rede com feedback visual via Snackbar, evitando duplicação de lógica nos componentes.

### Possíveis Melhorias Futuras

- [ ] Autenticação JWT com Spring Security e guarda de rotas no Angular
- [ ] Paginação server-side com sort dinâmico por coluna
- [ ] Upload de documentos associados ao processo
- [ ] Histórico de alterações (audit trail) com Hibernate Envers
- [ ] Notificações por e-mail ao responsável em mudanças de status
- [ ] Dashboard com métricas (processos por status, por responsável)
- [ ] Cache com Redis para consultas frequentes
- [ ] Testes E2E com Cypress ou Playwright

---

## 🔥 Parte 2: Análise de Incidente

### Cenário

```
ERROR 2024-03-15 14:32:01 [http-nio-8080-exec-7] c.a.p.service.JudicialProcessService
action=update_process process_id=1047
org.springframework.dao.CannotAcquireLockException: could not obtain lock on row in relation "judicial_processes"
  at o.s.orm.jpa.vendor.HibernateJpaDialect.convertHibernateAccessException(...)
Caused by: org.postgresql.util.PSQLException: ERROR: could not obtain lock on row in relation "judicial_processes"
  ...

[Erro se repete 47 vezes em 3 minutos para process_id entre 1040-1055]
```

### Diagnóstico

O erro `CannotAcquireLockException` indica **contenção de lock a nível de linha** no PostgreSQL. Os sintomas apontam para:

1. **Múltiplas threads tentando atualizar os mesmos processos simultaneamente** — o range `1040-1055` sugere um job ou processo em lote atualizando registros em sequência sem controle de concorrência.
2. **Transações longas mantendo locks** — se uma transação demora para fechar (ex: chamada externa dentro de `@Transactional`), outras ficam bloqueadas até timeout.
3. **Ausência de tratamento de concorrência otimista** — sem `@Version` na entidade, não há detecção antecipada de conflito.

### Correções Aplicadas

**1. Adicionar versionamento otimista na entidade:**
```java
@Version
@Column(name = "version")
private Long version;
```
Ao invés de locks pessimistas, o banco rejeita updates se a versão mudou desde a leitura — mais escalável.

**2. Isolar chamadas externas fora do escopo transacional:**
```java
// Ruim: chamada HTTP dentro de @Transactional segura o lock
@Transactional
public void update(Long id, Request req) {
    var entity = repository.findById(id);
    externalService.notify(entity); // bloqueia a transação
    repository.save(entity);
}

// Correto: separar responsabilidades
@Transactional
public Process update(Long id, Request req) { ... }

public void updateAndNotify(Long id, Request req) {
    var saved = update(id, req);       // transação fechada aqui
    externalService.notify(saved);    // fora do lock
}
```

**3. Para jobs em lote, processar com chunking e backoff:**
```java
for (Long id : processIds) {
    try {
        processService.update(id, payload);
    } catch (CannotAcquireLockException e) {
        log.warn("Lock contention for id={}, scheduling retry", id);
        retryQueue.add(id); // retentar depois
    }
}
```

### Medidas de Prevenção

| Ação | Impacto |
|------|---------|
| Adicionar `@Version` em entidades críticas | Elimina locks pessimistas |
| Monitorar `pg_locks` e `pg_stat_activity` no Kibana | Detecção proativa de contenção |
| Definir `spring.jpa.properties.hibernate.lock.timeout` | Falha rápida em vez de timeout longo |
| Alertar quando `CannotAcquireLockException` > 5/min | Resposta antes do impacto ao usuário |
| Code review: proibir I/O externo dentro de `@Transactional` | Prevenção por processo |

---

## 🛠️ Stack

| Camada      | Tecnologia                          |
|-------------|-------------------------------------|
| Back-end    | Java 17, Spring Boot 3.2, Spring Data JPA |
| Banco       | PostgreSQL 16, Flyway               |
| Front-end   | Angular 17, Angular Material 17     |
| Testes BE   | JUnit 5, Mockito, H2                |
| Testes FE   | Jasmine, Karma, HttpClientTestingModule |
| Docs API    | SpringDoc OpenAPI (Swagger UI)      |
| Infra       | Docker, Docker Compose, Nginx       |
| Logs        | SLF4J + Logback + Logstash encoder  |
