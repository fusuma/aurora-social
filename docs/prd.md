
---

### 

# AuroraSocial - Documento de Requisitos do Produto (PRD)

## 1. Metas e Contexto de Fundo

### 1.1. Metas

* **Adoção e Crescimento:** Alcançar 50 prefeituras clientes nos primeiros 24 meses.
* **Sustentabilidade e Retenção:** Manter a taxa de Churn abaixo de 5% anualmente.
* **Eficiência Operacional:** Reduzir o tempo médio gasto em tarefas de gestão (ex: relatórios) em 30% para usuários ativos.
* **Confiança e Conformidade:** Ser referência em segurança (LGPD) e conformidade (SUAS), com zero incidentes de segurança.
* **Usabilidade e Autonomia:** Minimizar a necessidade de suporte técnico através de uma plataforma intuitiva.

### 1.2. Contexto de Fundo

A iniciativa responde a uma lacuna crítica na gestão da Assistência Social no Brasil: a maioria dos municípios de pequeno e médio porte carece de ferramentas digitais para uma gestão eficiente e baseada em dados. A plataforma SaaS proposta visa capacitar gestores e técnicos, permitindo que dediquem mais tempo ao atendimento humanizado em vez de burocracia. O sucesso será medido pelo impacto real na qualidade de vida dos cidadãos e na otimização dos recursos públicos.

### 1.3. Log de Alterações

| Data | Versão | Descrição | Autor |
|:---|:---|:---|:---|
| 31/10/2025 | 1.0 | Versão inicial baseada na Visão do Produto e elicitação de requisitos. | PM (John) |

## 2. Requisitos

### 2.1. Funcionais


1. **FR1 (Must):** O sistema deve permitir criar, editar, pesquisar e arquivar perfis de famílias e indivíduos de forma centralizada.
   * *(ACs Aprovados)*
2. **FR2 (Must):** O sistema deve permitir anexar arquivos (documentos, fotos) ao histórico dos perfis.
   * *(ACs Aprovados)*
3. **FR3 (Must):** O sistema deve fornecer uma interface simplificada para registrar atendimentos, incluindo o tipo de demanda, encaminhamentos realizados e pareceres sociais.
   * *(ACs Aprovados)*
4. **FR4 (Must):** O sistema deve gerar automaticamente relatórios oficiais obrigatórios, como o Relatório Mensal de Atendimentos (RMA).
   * *(ACs Aprovados)*
5. **FR5 (Must):** Os relatórios gerados devem ser exportáveis em formatos compatíveis (PDF, Excel).
   * *(ACs Aprovados)*
6. **FR6 (Should):** O sistema deve exibir um dashboard gerencial, com dados atualizados em uma frequência definida (ex: a cada hora), para exibir métricas-chave (ex: atendimentos diários/mensais).
   * *(ACs Aprovados)*

### 2.2. Não Funcionais


 1. **NFR1 (Must):** A solução deve ser 100% hospedada em nuvem, eliminando a necessidade de infraestrutura local do cliente.
 2. **NFR2 (Must):** A arquitetura deve ser **multitenant** para suportar múltiplos municípios de forma eficiente e segura.
 3. **NFR3 (Must):** A disponibilidade da plataforma (SLA) deve ser de, no mínimo, **99,9%**.
 4. **NFR4 (Must):** O sistema deve implementar segurança robusta, incluindo criptografia de dados em repouso e em trânsito, e controle de acesso baseado em papéis (RBAC).
 5. **NFR5 (Must):** O sistema deve superar as exigências de conformidade da **LGPD** e das normativas do **SUAS**.
 6. **NFR6 (Must):** O sistema deve realizar backups automatizados e ter uma política de retenção de dados clara.
 7. **NFR7 (Must):** A plataforma deve ser intuitiva o suficiente para minimizar a necessidade de suporte técnico para uso diário.
 8. **NFR8 (Must):** O suporte técnico deve ser oferecido via chat e e-mail, complementado por um portal de conhecimento online (FAQs, tutoriais).
 9. **NFR9 (Must):** O sistema deve validar todos os uploads de arquivos (FR2), restringindo estritamente os tipos de arquivo permitidos (ex: .jpg, .png, .pdf) e impondo um limite máximo de tamanho por arquivo (ex: 10MB).
10. **NFR10 (Must):** Os modelos de dados para "Família" e "Indivíduo" (FR1) devem ser projetados para alta compatibilidade com os layouts e definições do Cadastro Único (CadÚnico), mesmo antes da integração via API, para evitar a redigitação pelo usuário.
11. **NFR11 (Should):** O sistema deve fornecer uma estratégia de importação de dados em lote (ex: via planilhas CSV) para o cadastro inicial de famílias e indivíduos (FR1) durante o onboarding de novos clientes.

## 3. Metas de Interface do Usuário (UI/UX)

### 3.1. Visão Geral da UX (Atualizado)

A visão de UX da plataforma é dupla, atendendo às necessidades distintas das nossas personas principais:


1. **Para o "Técnico de Referência" (O Operador):** A visão é **"Eficiência Focada"**. A interface deve ser um assistente invisível — simples, intuitiva e que economiza cliques. O objetivo é eliminar a burocracia, a duplicação de dados e as "fichas de papel perdidas", permitindo que o técnico foque no atendimento humano.
2. **Para o "Gestor Público" (A Estrategista):** A visão é **"Governança Clara"**. A interface deve ser um "instrumento de governança" que transforma dados operacionais em insights estratégicos. O objetivo é fornecer "dashboards intuitivos" e "relatórios que transformam dados brutos em narrativas de sucesso", garantindo transparência, conformidade e a capacidade de provar o impacto do trabalho.

### 3.2. Paradigmas de Interação Chave (Atualizado)


1. **Fluxo de Trabalho Guiado:** O sistema deve guiar o "Técnico" através de tarefas comuns (ex: registrar um atendimento a partir de um perfil), sugerindo os próximos passos.
2. **Dados Centralizados:** A interação principal será centrada no "Perfil Unificado" (FR1), onde todas as ações (Atendimentos (FR3), Anexos (FR2)) se originam.
3. **Governança via Insights (Refinado):** Para o "Gestor", a interação será focada em transformar dados em "narrativas de sucesso" através de dashboards (FR6) e relatórios (FR4) para uma governança proativa e baseada em dados.

### 3.3. Telas e Visualizações Principais (Atualizado)

Esta é uma lista conceitual das telas necessárias para entregar o MVP:

* Login / Autenticação de Usuário
* Tela de Pesquisa de Cidadão/Família (FR1)
* Tela de Visualização de Perfil (Família/Indivíduo) (Base para FR1, FR2, FR3)
* Formulário de Registro de Atendimento (Modal/Seção Integrada) (FR3)
* Dashboard Gerencial (Tela Inicial do Gestor) (FR6)
* Página de Geração de Relatórios (FR4, FR5)
* Página de Gestão de Usuários (para o Gestor adicionar/remover Técnicos) (NFR4)

### 3.4. Acessibilidade

* **Acessibilidade: WCAG AA** (Confirmado)

### 3.5. Branding

* O branding inicial deve ser **limpo, profissional e focado na clareza** (Confirmado). Deve transmitir a "confiança e conformidade" exigidas pelo setor público. Não há guias de estilo específicos definidos neste momento.

### 3.6. Dispositivos e Plataformas Alvo

* **Dispositivos e Plataformas Alvo: Web Responsivo** (Confirmado). (Nota: Requer conexão ativa com a internet, conforme NFR1).

## 4. Suposições Técnicas

### 4.1. Estrutura do Repositório

* **Estrutura do Repositório: Monorepo** (Confirmado)

### 4.2. Arquitetura de Serviço

* **Arquitetura de Serviço: Monolito Modular (Serverless-Ready)** (Confirmado)

### 4.3. Requisitos de Teste

* **Requisitos de Teste: Unitários + Integração** (Confirmado)

### 4.4. Suposições e Solicitações Técnicas Adicionais (Atualizado)

* **Restrições Inegociáveis:**
  * **Hospedagem:** Nativa da Nuvem (NFR1).
  * **Multitenancy:** Isolamento total de dados (NFR2, NFR5).
  * **Modelo de Dados:** Compatível com CadÚnico (NFR10).
* **Stack de Tecnologia do MVP (Confirmada):**
  * **Plataforma/Backend:** Next.js (com App Router e API Routes).
  * **Hospedagem:** Vercel.
  * **Banco de Dados (SQL):** Vercel Postgres (baseado em Neon).
  * **Autenticação (NFR4):** Auth.js (anteriormente NextAuth.js).
  * **Armazenamento de Arquivos (FR2):** Vercel Blob.

## 5. Lista de Épicos


1. **Épico 1: Plataforma Segura e Pronta para a Equipe**
   * **Meta (Refinada):** Entregar uma plataforma tecnicamente funcional e segura, onde os usuários podem se autenticar e o 'Gestor' pode controlar totalmente o acesso da sua equipe ('Técnicos').
2. **Épico 2: Gestão de Cadastros e Atendimentos (O Fluxo do Técnico)**
   * **Meta (Refinada):** Digitalizar o fluxo de trabalho diário do "Técnico de Referência", substituindo "fichas de papel" por um sistema centralizado de perfis (FR1), anexos (FR2) e atendimentos (FR3). Este épico também habilita o onboarding de clientes através da importação de dados (NFR11).
3. **Épico 3: Governança e Relatórios (O Fluxo do Gestor)**
   * **Meta:** Entregar o valor estratégico para o "Gestor Público", fornecendo o dashboard gerencial (FR6), a geração (FR4) e a exportação (FR5) de relatórios oficiais.

## 6. Detalhes dos Épicos

### Épico 1: Plataforma Segura e Pronta para a Equipe

**Meta do Épico (Refinada):** Entregar uma plataforma tecnicamente funcional e segura, onde os usuários podem se autenticar e o 'Gestor' pode controlar totalmente o acesso da sua equipe ('Técnicos').

**História 1.1: Configuração da Fundação Técnica (Enabler)**
Como Arquiteto/Desenvolvedor,
Eu quero inicializar o projeto Next.js (App Router) no Monorepo,
Para que o projeto esteja conectado ao Vercel, Vercel Postgres e Auth.js, estabelecendo a fundação da infraestrutura.

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. O projeto Next.js está no repositório (Monorepo).
  2. O projeto é implantado com sucesso na Vercel (CI/CD).
  3. A conexão com o Vercel Postgres está funcionando, provado por uma **migração de banco de dados inicial** (ex: criação da tabela 'User') executada com sucesso.
  4. Auth.js está instalado e configurado com um provedor (ex: Email).
  5. A estrutura de testes (Unitários + Integração) está configurada no pipeline de CI/CD e um teste de exemplo está passando.
  6. A migração da tabela 'User' (do AC 3) **deve** incluir um campo `tenantId` (ID do Município), estabelecendo a fundação Multitenant (NFR2).

**História 1.2: Implementação da Tela de Login**
Como um Usuário (Técnico ou Gestor),
Eu quero fazer login no sistema usando meu e-mail e senha,
Para que eu possa acessar a plataforma de forma segura (NFR4).

* **Critérios de Aceitação (ACs):**

  
  1. A "Tela de Login" deve estar acessível.
  2. O login deve ser implementado usando a configuração do Auth.js (História 1.1).
  3. Dado um e-mail/senha válidos, o usuário é autenticado e redirecionado para a plataforma.
  4. Dado um e-mail/senha inválidos, uma mensagem de erro clara é exibida.
  5. A interface deve ser "limpa e profissional" e atender ao WCAG AA.

**História 1.3: Estabelecimento de Papéis (Roles) e Proteção de Rotas**
Como Arquiteto/Desenvolvedor,
Eu quero implementar o Controle de Acesso Baseado em Papéis (RBAC) na sessão do usuário (Auth.js),
Para que o sistema possa distinguir entre "Técnico" e "Gestor" e proteger as rotas.

* **Critérios de Aceitação (ACs):**

  
  1. O modelo de dados do Usuário (no Vercel Postgres) deve incluir um campo "role" (ex: 'GESTOR', 'TECNICO').
  2. A sessão do Auth.js deve incluir o "role" do usuário.
  3. Rotas/telas administrativas (ex: "Página de Gestão de Usuários") devem ser protegidas, permitindo acesso apenas a usuários com o "role" 'GESTOR'.
  4. Um usuário 'TECNICO' que tentar acessar uma rota 'GESTOR' deve ser bloqueado/redirecionado.

**História 1.4: Visualização da Página de Gestão de Usuários**
Como uma "Gestora Pública",
Eu quero navegar até a "Página de Gestão de Usuários" e ver uma lista de todos os usuários (Técnicos e Gestores) do meu município,
Para que eu possa auditar quem tem acesso ao sistema.

* **Critérios de Aceitação (ACs):**

  
  1. A página deve ser acessível (ex: por um link "Equipe" no menu), mas apenas para o "role" 'GESTOR' (História 1.3).
  2. A página deve exibir uma tabela ou lista de usuários.
  3. A lista deve mostrar informações essenciais (ex: Nome, Email, Papel).
  4. **Segurança:** A consulta deve exibir **apenas** usuários associados ao mesmo município (Tenant) da Gestora (NFR2, NFR5).
  5. A interface atende ao WCAG AA.

**História 1.5: Convidar Novo Usuário (Técnico)**
Como uma "Gestora Pública",
Eu quero convidar um novo "Técnico" para a plataforma inserindo o e-mail dele e definindo seu papel,
Para que minha equipe possa começar a usar o sistema.

* **Critérios de Aceitação (ACs):**

  
  1. Na "Página de Gestão de Usuários", deve haver um botão/formulário "Convidar Usuário".
  2. A Gestora deve poder inserir um e-mail e selecionar o papel (ex: 'TECNICO').
  3. Ao enviar, um novo registro de usuário é criado e um e-mail de convite (ou definição de senha) é enviado.
  4. O novo usuário é automaticamente associado ao município (Tenant) da Gestora.

**História 1.6: Desativar Usuário (Técnico)**
Como uma "Gestora Pública",
Eu quero desativar (ou remover) a conta de um "Técnico",
Para que, em caso de desligamento, ele perca imediatamente o acesso aos dados sensíveis (LGPD).

* **Critérios de Aceitação (ACs):**

  
  1. Na lista de usuários (História 1.4), deve haver uma opção (ex: botão "Desativar" ou "Remover") para cada usuário.
  2. Ao ser desativado, o usuário não deve mais conseguir fazer login (História 1.2).
  3. A sessão do usuário (se ativa) deve ser invalidada imediatamente ou na próxima interação.
  4. Os dados históricos do usuário (ex: quem registrou um atendimento) devem ser preservados (integridade referencial).

### Épico 2: Gestão de Cadastros e Atendimentos (O Fluxo do Técnico)

**Meta do Épico (Refinada):** Digitalizar o fluxo de trabalho diário do "Técnico de Referência", substituindo "fichas de papel" por um sistema centralizado de perfis (FR1), anexos (FR2) e atendimentos (FR3). Este épico também habilita o onboarding de clientes através da importação de dados (NFR11).

**História 2.1: Modelagem de Dados do Cidadão (Enabler)**
Como Arquiteto/Desenvolvedor,
Eu quero definir e migrar os esquemas do Vercel Postgres para 'Família', 'Indivíduo' (FR1) e 'Atendimento' (FR3),
Para que eles estejam alinhados com o modelo do CadÚnico (NFR10) e implementem o isolamento por `tenantId` (NFR2).

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. As migrações do banco de dados (Vercel Postgres) para as tabelas 'Família', 'Indivíduo', 'Atendimento', **'Anexo'** (FR2) e **'ComposicaoFamiliar'** (para ligar Indivíduos a Famílias) estão criadas.
  2. Todas as tabelas contêm um campo `tenantId` (isolamento de dados) (NFR2).
  3. A estrutura das tabelas 'Família' e 'Indivíduo' reflete os campos-chave e definições do Cadastro Único (conforme ACs do FR1) (NFR10).
  4. As chaves estrangeiras (ex: 'Atendimento' pertence a 'Indivíduo', 'Anexo' pertence a 'Indivíduo' ou 'Família', 'ComposicaoFamiliar' liga 'Indivíduo' e 'Família') estão estabelecidas para garantir a integridade referencial.
  5. A tabela 'Anexo' deve incluir campos para a URL do Vercel Blob, tipo de arquivo, tamanho, `tenantId` e metadados de upload (usuário, data) (NFR5, NFR9).

**História 2.2: Implementação da Tela de Pesquisa de Cidadão**
Como um "Técnico de Referência",
Eu quero uma "Tela de Pesquisa" simples para buscar famílias ou indivíduos por nome ou CPF (FR1),
Para que eu possa encontrar rapidamente o perfil que preciso atender.

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. A "Tela de Pesquisa de Cidadão/Família" existe e está acessível após o login para o "role" 'TECNICO'.
  2. O usuário pode inserir um termo de busca (ex: nome parcial, nome completo, CPF). A pesquisa deve ser *rápida* e *indulgente* (ex: ignorar acentos ou maiúsculas).
  3. Os resultados da pesquisa são exibidos em uma lista clara, mostrando informações mínimas para identificação (ex: Nome Completo, CPF, Data de Nasc.).
  4. **Segurança:** A pesquisa deve retornar **apenas** resultados do `tenantId` (município) do usuário logado (NFR2, NFR5).
  5. A interface atende ao WCAG AA.
  6. Clicar em um resultado da pesquisa deve navegar o usuário **diretamente** para a "Tela de Visualização de Perfil" (História 2.3) daquele cidadão/família.
  7. Se a pesquisa não retornar resultados, o sistema deve exibir uma mensagem clara (ex: "Nenhum perfil encontrado") e um link/botão para "Criar Novo Perfil" (História 2.4).

**História 2.3: Implementação da Tela de Visualização de Perfil**
Como um "Técnico de Referência",
Ao clicar em um resultado de pesquisa (História 2.2), eu quero ver a "Tela de Visualização de Perfil" com o histórico completo do cidadão,
Para que eu tenha todo o contexto antes do atendimento (FR1).

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. A "Tela de Visualização de Perfil" é exibida ao selecionar um resultado da pesquisa.
  2. A tela exibe os dados cadastrais *principais* (ex: Nome Completo, CPF, Data de Nasc., Endereço) do indivíduo/família (baseados no CadÚnico) em local de destaque.
  3. A tela contém uma seção visível de "Histórico de Atendimentos" que exibe uma *lista resumida* dos atendimentos mais recentes (ex: Data, Tipo de Demanda, Técnico).
  4. A tela contém uma seção visível de "Anexos" que exibe uma *lista* dos arquivos anexados (ex: Nome do Arquivo, Data de Upload).
  5. A tela deve conter os botões de ação principais e claros: "Registrar Atendimento" (para História 2.5), "Adicionar Anexo" (para História 2.6) e "Editar Perfil" (para História 2.4).
  6. A interface atende ao WCAG AA e é "limpa e profissional".

**História 2.4: Criação e Edição de Perfil de Cidadão**
Como um "Técnico de Referência",
Eu quero poder criar um novo perfil de Família/Indivíduo (FR1) (ou editar um existente),
Para que eu possa cadastrar novos usuários ou corrigir informações no sistema.

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. A "Tela de Visualização de Perfil" (ou uma rota dedicada) deve ter funcionalidade de "Editar".
  2. Deve haver um botão "Criar Novo Perfil" (provavelmente na Tela de Pesquisa).
  3. Os formulários de criação/edição devem ser baseados nos campos-chave e definições do CadÚnico (NFR10) (ex: Responsável Familiar, composição familiar, renda, etc.), conforme os ACs do FR1.
  4. Ao criar um novo "Indivíduo", o sistema **deve** verificar a duplicidade por CPF (conforme ACs do FR1) e exibir um aviso claro se o CPF já existir.
  5. Os perfis criados são salvos com o `tenantId` (NFR2) correto e o `userId` (Técnico) que criou o registro (para auditoria NFR5).
  6. O formulário de criação de "Família" deve permitir ao usuário (Técnico) **associar** "Indivíduos" existentes ou criar novos "Indivíduos" como membros daquela família (implementando a tabela 'ComposicaoFamiliar' da História 2.1).
  7. A funcionalidade "Editar" (AC 1) deve registrar um log de auditoria de quais campos foram alterados, por quem e quando (conforme ACs do FR1 e NFR5).

**História 2.5: Registro de Atendimento (Modal)**
Como um "Técnico de Referência",
Enquanto visualizo um perfil (História 2.3), eu quero clicar em "Registrar Atendimento" e preencher um formulário (Modal) (FR3),
Para que eu possa registrar a demanda de forma rápida, sem perder o contexto.

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. Um botão "Registrar Atendimento" está visível na Tela de Perfil.
  2. Ao clicar, um formulário em **Modal (ou seção integrada)** é exibido.
  3. O formulário contém os campos (tipo de demanda, encaminhamento, parecer), é pré-preenchido com a data/hora atual e não exige redigitação (conforme ACs do FR3).
  4. Ao salvar, o modal fecha e o novo atendimento aparece (ou é adicionado) ao "Histórico de Atendimentos" da Tela de Perfil (FR3/AC4).
  5. O registro de atendimento salvo é **permanentemente** associado ao `userId` (Técnico) logado e ao `tenantId` (NFR2) correto (conforme ACs do FR3 e NFR5).

**História 2.6: Gestão de Anexos (Upload e Visualização)**
Como um "Técnico de Referência",
Enquanto visualizo um perfil (História 2.3), eu quero poder anexar arquivos (FR2) (ex: fotos, PDFs) e ver os anexos existentes,
Para que eu possa digitalizar o histórico de "fichas de papel".

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. A seção "Anexos" na Tela de Perfil permite o upload de arquivos.
  2. O upload é tratado pelo Vercel Blob e os metadados do arquivo (URL, nome, tamanho, tipo, `tenantId`, `userId`) são salvos na tabela 'Anexo' do Vercel Postgres.
  3. O upload impõe validações estritas de tipo (`.jpg`, `.png`, `.pdf`) e tamanho (ex: 10MB) (conforme ACs do FR2 e NFR9).
  4. O upload rejeita arquivos inválidos com mensagens de erro claras e amigáveis (conforme ACs do FR2).
  5. A seção "Anexos" na Tela de Perfil lista os arquivos anexados (puxando da tabela 'Anexo'), exibindo metadados úteis (ex: nome, data, quem enviou).
  6. Clicar para visualizar/baixar um anexo listado deve verificar a permissão do usuário (NFR4) e usar uma URL segura (ex: assinada) para o Vercel Blob, garantindo que apenas usuários do `tenantId` correto possam acessar o arquivo (NFR5).
  7. O usuário deve poder excluir um anexo (com confirmação), o que remove o registro da tabela 'Anexo' e o arquivo do Vercel Blob (ou arquiva), registrando a ação em log de auditoria (ACs do FR2 e NFR5).

**História 2.7: Implementação da Importação de Dados (Should Have)**
Como uma "Gestora Pública",
Eu quero ter uma forma de importar cadastros existentes (ex: via CSV) (NFR11),
Para que minha equipe não precise redigitar milhares de perfis no onboarding.

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. O "Gestor Público" deve ter acesso a uma interface (ex: uma seção na "Página de Gestão de Usuários") que lhe permita fazer o upload de um arquivo CSV.
  2. O sistema deve fornecer um **arquivo CSV modelo (template)** para download, garantindo que o usuário saiba quais colunas são necessárias para o mapeamento com o modelo do CadÚnico (NFR10) (História 2.1).
  3. **Segurança:** Todos os registros importados são **obrigatoriamente** associados ao `tenantId` (NFR2) do município (Gestor) que está fazendo o upload.
  4. A importação **deve validar** dados (ex: CPF) contra registros existentes. Se forem encontrados duplicados ou erros de formatação, a importação deve falhar com segurança.
  5. Se a importação falhar (AC 4), o sistema deve fornecer um relatório de erro claro (ex: "Linha 5: CPF duplicado").
  6. Se a importação for bem-sucedida, o sistema deve exibir uma mensagem de sucesso (ex: "1.500 famílias importadas com sucesso").

### Épico 3: Governança e Relatórios (O Fluxo do Gestor)

**Meta do Épico:** Entregar o valor estratégico para o "Gestor Público", fornecendo o dashboard gerencial (FR6), a geração (FR4) e a exportação (FR5) de relatórios oficiais.

**História 3.1: Fundação de API para Relatórios (Enabler)**
Como Arquiteto/Desenvolvedor,
Eu quero criar os endpoints de API (API Routes) e consultas SQL otimizadas para agregar os dados de atendimentos (FR3) e perfis (FR1),
Para que os dados possam ser consumidos de forma eficiente pela "Página de Geração de Relatórios" e pelo "Dashboard" sem causar lentidão (NFR3).

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. Endpoints de API (API Routes) específicos são criados (ex: `/api/reports/rma`, `/api/reports/dashboard-metrics`).
  2. Os endpoints de API (AC 1) **devem aceitar parâmetros** de filtro quando apropriado (ex: `mes`, `ano` para o RMA).
  3. As consultas SQL (Vercel Postgres) são otimizadas para agregação (ex: usando `COUNT`, `GROUP BY`) e **não** devem fazer `SELECT *` em tabelas de transação (como 'Atendimentos'), para proteger o desempenho do sistema (NFR3).
  4. As consultas filtram **obrigatoriamente** por `tenantId` (passado pela sessão do Auth.js) (NFR2, NFR5).
  5. Os endpoints são protegidos e acessíveis apenas pelo "role" 'GESTOR' (NFR4).
  6. A consulta do dashboard (FR6) é projetada para ser executada em cache ou em intervalos (conforme ACs do FR6).
  7. **Testes de Integração** devem ser criados para provar que a lógica de agregação (AC 3) está correta, que o filtro de `tenantId` (AC 4) é infalível e que a proteção de "role" (AC 5) funciona (NFR4).

**História 3.2: Implementação da Página de Geração de Relatórios (RMA)**
Como uma "Gestora Pública",
Eu quero acessar a "Página de Geração de Relatórios", selecionar um período (Mês/Ano) e gerar o Relatório Mensal de Atendimentos (RMA),
Para que eu possa cumprir minhas obrigações de conformidade (SUAS) e ver os dados de atendimento.

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. A "Página de Geração de Relatórios" está acessível (apenas para 'GESTOR').
  2. A interface permite ao usuário selecionar o tipo de relatório (RMA) e o período (Mês/Ano) (conforme ACs do FR4).
  3. Ao gerar, a página chama a API (História 3.1). **Enquanto o relatório está sendo gerado**, a tela deve exibir um indicador de carregamento claro (ex: "Gerando relatório...").
  4. Os dados exibidos estão corretos... conforme o layout do RMA. Os totais e dados exibidos na tela devem ser **idênticos** aos que serão exportados (integridade dos dados).
  5. A página exibe botões claros para "Exportar para PDF" e "Exportar para Excel" (para História 3.3).
  6. A interface atende ao WCAG AA e à visão de "Governança Clara".
  7. Se a API (História 3.1) retornar um erro (ex: falha na consulta), a interface deve exibir uma mensagem de erro amigável (ex: "Não foi possível gerar o relatório no momento. Tente novamente.") (NFR7).

**História 3.3: Exportação de Relatórios (PDF e Excel)**
Como uma "Gestora Pública",
Eu quero clicar nos botões "Exportar para PDF" e "Exportar para Excel" na página de relatório (História 3.2),
Para que eu possa baixar os arquivos para arquivamento, impressão ou análise de dados.

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. Clicar em "Exportar para PDF" deve chamar uma API de back-end (API Route na História 3.1) para gerar e baixar um `.pdf` formatado (conforme ACs do FR5).
  2. Clicar em "Exportar para Excel" deve chamar uma API de back-end (API Route na História 3.1) para gerar e baixar um `.xlsx` com os dados brutos (conforme ACs do FR5).
  3. **Segurança:** Ambos os arquivos gerados devem conter **apenas** dados do `tenantId` da Gestora (NFR2, NFR5).
  4. **Enquanto o arquivo está sendo gerado** (AC 1, AC 2), a interface deve exibir um indicador de carregamento claro (ex: "Preparando seu arquivo...").
  5. O arquivo baixado deve ter um nome de arquivo descritivo (ex: `RMA_Outubro_2025.pdf` ou `RMA_Outubro_2025.xlsx`).
  6. Se a geração do arquivo falhar (ex: erro na API), a interface deve exibir uma mensagem de erro amigável (ex: "Não foi possível gerar o arquivo.") (NFR7).

**História 3.4: Implementação do Dashboard Gerencial (Should Have)**
Como uma "Gestora Pública",
Eu quero ver o "Dashboard Gerencial" como minha tela inicial (ou de fácil acesso),
Para que eu possa ter uma visão rápida (Governança Clara) das métricas-chave da minha operação (FR6).

* **Critérios de Aceitação (ACs) (Refinados):**

  
  1. O "Dashboard Gerencial" é a tela padrão para o "role" 'GESTOR' (ou está a 1 clique) (conforme ACs do FR6).
  2. A tela exibe os "cards" com as métricas-chave (Total de Atendimentos, Total de Famílias, etc.) (conforme ACs do FR6). **Enquanto os dados estão sendo carregados (ou atualizados) pela primeira vez**, um indicador de carregamento claro deve ser exibido.
  3. A tela exibe claramente a data/hora da "Última atualização" dos dados (conforme ACs do FR6).
  4. A consulta dos dados do dashboard respeita o trade-off de não ser em tempo real (conforme ACs do FR6).
  5. A interface atende ao WCAG AA e é "intuitiva".
  6. **Segurança:** Os dados (métricas) exibidos no dashboard devem ser baseados **exclusivamente** nos dados do `tenantId` do Gestor logado (conforme ACs da História 3.1 e FR6).
  7. Se a API (História 3.1) retornar um erro ao buscar os dados do dashboard, a interface deve exibir uma mensagem de erro amigável (ex: "Não foi possível carregar as métricas no momento.") (NFR7).

## 7. Relatório de Resultados da Checklist

\[cite_start\]*(Esta seção será preenchida após a execução da checklist)*

## 8. Próximos Passos

\[cite_start\]*(Esta seção será preenchida após a execução da checklist)* \[cite: 215\]