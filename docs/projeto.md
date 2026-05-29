# Nome do Projeto: Jacto Drones Operating System v0.1

## Nome do Grupo: G04 (O Grupo Quatro)

## Professores:
### Orientador(a)
- <a href="https://www.linkedin.com/in/reginaldo-arakaki-9574222b/">Reginaldo Arakaki</a>
### Instrutores
- <a href="https://www.linkedin.com/in/hermano-peixoto-1091796/">Computação - Hermano</a>
- <a href="https://www.linkedin.com/in/jose-romualdo/">Computação - José Romualdo</a>
- <a href="https://www.linkedin.com/in/ovidio-netto/">Computação - Ovídio</a>
- <a href="https://www.linkedin.com/in/fernando-pizzo-208b526a/">Matemática e Física - Pizzo</a>
- <a href="https://www.linkedin.com/in/egondaxbacher/?locale=pt">Negócios - Egon</a>
- <a href="https://www.linkedin.com/in/juliastateri/?locale=pt">Design - Julia</a>
- <a href="https://www.linkedin.com/in/profclaudioandre/">Liderança - Claudio Andre</a>

## Integrantes:

- <a href="https://www.linkedin.com/in/calebe-matias/?locale=pt">Calebe Matias</a>
- <a href="https://www.linkedin.com/in/fernandobertholdo/">Fernando Bertholdo</a>
- <a href="https://www.linkedin.com/in/kauanmassuia/">Kauan Massuia</a>
- <a href="https://www.linkedin.com/in/lucca-henrique-pereira/">Lucca Henrique</a>
- <a href="https://www.linkedin.com/in/marlos-do-carmo-guedes-366987250/">Marlos Guedes</a>
- <a href="https://www.linkedin.com/in/otavio-vasc/">Otávio Vasconcelos</a>
- <a href="https://www.linkedin.com/in/vitorbalbo/">Vitor Balbo</a>

# Sumário

- [1. Introdução](#1-introdução)
- [2. Descrição do Problema](#2-descrição-do-problema)
- [3. Objetivos](#3-objetivos)
- [4. Arquitetura do Produto (ISO 10746)](#4-arquitetura-do-produto-iso-10746)
  - [4.0 Estado Atual da Jacto (AS-IS)](#40-estado-atual-da-jacto-as-is)
  - [4.1 Visão de Tecnologia](#41-visão-de-tecnologia-technology-viewpoint)
  - [4.2 Visão de Engenharia](#42-visão-de-engenharia-engineering-viewpoint)
  - [4.3 Controle em Malha Fechada](#43-controle-em-malha-fechada)
  - [4.4 Aspectos Não Funcionais da Esteira](#44-aspectos-não-funcionais-da-esteira)
- [5. Configuração da Esteira de Sistemas](#5-configuração-da-esteira-de-sistemas)
  - [5.1 Visão Geral do Pipeline](#51-visão-geral-do-pipeline)
  - [5.2 Testes Funcionais](#52-testes-funcionais)
  - [5.3 Testes Não-Funcionais](#53-testes-não-funcionais)
  - [5.4 Rastreabilidade Técnica](#54-rastreabilidade-técnica)
  - [5.5 Infraestrutura de Execução](#55-infraestrutura-de-execução)
  - [5.6 Mapa de Cobertura de Funcionalidades](#56-mapa-de-cobertura-de-funcionalidades)
  - [5.7 Mapa de Cobertura de Não Funcionalidades](#57-mapa-de-cobertura-de-não-funcionalidades)
- [6. Requisitos SCM](#6-requisitos-scm)
- [7. Referências](#7-referências)
- [8. Avaliação dos Resultados](#8-avaliação-dos-resultados)

# 1. Introdução
O projeto Jacto Drones OS v0.1 visa estabelecer uma infraestrutura de Continuous Delivery para suportar o desenvolvimento de sistemas autônomos. Este documento detalha a arquitetura, processos e ferramentas que compõem o ecossistema de engenharia da solução.

# 2. Descrição do Problema
A fragmentação entre as frentes de firmware, serviços e dados na Jacto Drones gera falta de cadência, rituais não padronizados e ausência de um pipeline de integração contínua unificado.

# 3. Objetivos
- **Geral:** Desenvolver um protótipo funcional de um sistema de CD (Continuous Delivery) para software de drones.
- **Específicos:**
  - Padronizar o workflow de desenvolvimento.
  - Configurar pipeline de CI/CD via GitLab.
  - Monitorar métricas operacionais (DORA).

# 4. Arquitetura do Produto (ISO 10746)

Esta seção descreve a arquitetura da esteira de Continuous Delivery do Jacto Drones OS v0.1 utilizando os pontos de vista (Viewpoints) estabelecidos pela norma ISO/IEC 10746 (RM-ODP - Reference Model of Open Distributed Processing)<a id="ref1-link" href="#ref1"><sup>[1]</sup></a>. As subseções §4.1 a §4.4 descrevem a proposta do G04 (TO-BE); a §4.0 abaixo descreve o ponto de partida (AS-IS).

## 4.0 Estado Atual da Jacto (AS-IS)

Diagnóstico levantado em **workshop com o time técnico da Jacto Drones em 24/04/2026** (Vinícius Lopes — engenheiro de controle de voo; Heldebrandt — engenheiro de firmware; Tamires Silva — líder técnica) e nos **Anexos A.1 a A.4 e B do TAPI**<a href="#ref7"><sup>[7]</sup></a>. Esta subseção é o ponto de comparação para a proposta TO-BE detalhada nas subseções subsequentes — todo número quantitativo de impacto em §8.1 toma esta seção como linha de base.

### 4.0.1 Stack atual de software e hardware

A frente de drones da Jacto opera hoje sobre uma combinação de ferramentas adotadas isoladamente ao longo do tempo, sem integração centralizada (TAPI Anexo B.2):

| Camada | Ferramenta atual | Observação |
| :--- | :--- | :--- |
| Controle de voo | **PX4 Autopilot** (open-source) | Base oficial do trabalho — não há ainda firmware proprietário Jacto. |
| Modelagem e controle | **MATLAB / Simulink** | Citado como referência de fidelidade superior ao Gazebo; restrito a alunos. |
| Simulação aberta | **Gazebo** (do ecossistema PX4) | Liberado para uso no projeto acadêmico. |
| Simulação robusta interna | Próprio, baseado em Matlab | Restrito. |
| Gestão de tarefas | **Jira + Trello** (mistos) | Sem padrão único; cada raia adota o seu. |
| Versionamento | **Git / GitHub** | Não há CI centralizado; pushes pulverizados. |
| "Cloud" do time | **Google Drive** | Descrito pelo próprio time como *"rudimentar, aquecido"*. |
| Hardware embarcado | **Pixhawk** (RTOS para controle em tempo real) + **Jetson Linux** (computação não-crítica em soft real-time) | Separação real-time × soft-real-time. |

### 4.0.2 Workflow técnico em três raias paralelas

O parceiro compartilhou um diagrama do loop de desenvolvimento atual (TAPI Anexo A.4), organizado em três raias que operam em cadência de Sprint mas sem orquestração unificada:

- **Raia 1 — Model-Based Design (MATLAB/Simulink):** `Backlog → Tasks Breakdown → Feature Modeling → Tests in MIL → Generating Code → Commit`. Loop interno: retorno de Generating Code para Feature Modeling. Saída integra ao Jira/GitHub no fim da sprint.
- **Raia 2 — Infraestrutura de simulação versionada:** **MIL** (Model-in-the-Loop, `V.z.z.z`), **SIL** (Software-in-the-Loop, `V.y.y.y`) e **HIL/PIL** (Hardware/Processor-in-the-Loop, `V.x.x.x`). Saída agregada: **Problem Reports** que retornam ao backlog como bugs.
- **Raia 3 — Código tradicional (PX4-style):** `Backlog → Tasks Breakdown → Feature Development → Unit Testing → Integration Testing → Commit → Merge Request → Release`. Unit Testing dispara SIL; Integration Testing dispara HIL/PIL.

As três raias compartilham os Test Rigs versionados (Raia 2) mas **não há orquestrador único** disparando o rig correto para o tipo de mudança correto — coordenação manual, feita pelos próprios engenheiros.

### 4.0.3 Gargalos quantificados

O time relatou dores específicas, com valores extraídos do TAPI Anexo B.5 e B.6:

- **Análise de log pós-voo:** 2 a 3 dias por voo, manual. Um voo de 15 manobras gera ~90 arquivos × ~120 parâmetros (.ulg). Hoje o engenheiro de controle clica botão por botão em uma ferramenta caseira em Python para gerar cada gráfico.
- **Custo de cada voo perdido por bug detectado tarde:** drone protótipo ≈ R$ 700.000; microcontroladores importados levam 3–4 meses para chegar. Cada queda evitada recupera meses de schedule.
- **Caso real de queda relatado:** rotina de ajuste de parâmetros internos causou **defasagem silenciosa entre comando e atuação**, que cresceu até o drone perder o controle e cair. Citação literal do Held (TAPI Anexo B.5): *"Se a gente detecta essa defasagem já nos primeiros segundos, a gente já interrompe"* — hoje essa detecção não existe.
- **Métricas de engenharia:** nenhuma formalizada. O que se monitora é "padrão e outliers" subjetivos. A Camille (gestão) declarou no workshop: *"Estamos abertos a receber sugestões de métricas, de indicadores"*.

### 4.0.4 Tamanho do time e implicação de ROI

A engenharia ativa da frente Jacto Drones é composta por **~2 engenheiros técnicos** (Vinícius no controle de voo e Heldebrandt no firmware/SIL-HIL) **+ 1 gestora** (Tamires Silva). Citação direta do Vinícius (TAPI Anexo B.1): *"hoje sou eu aqui, o Held [no firmware], e eu me divido em 2 às vezes"*. Isso implica que automações de alto ROI (qualquer coisa que tire trabalho manual recorrente) têm valor real mesmo em escala pequena, porque liberam diretamente capacidade de duas pessoas — enquanto features de "produtividade de time grande" têm pouca aderência.

### 4.0.5 Síntese para a proposta TO-BE

A proposta arquitetural detalhada em §4.1 a §4.4 ataca os gargalos acima respondendo às seguintes questões:

| Pergunta de partida (AS-IS) | Responde em |
| :--- | :--- |
| Como reduzir as 2–3 dias de análise de log para minutos? | §4.4 (meta provisória de tempo de pipeline) + §5.1 (stages) + §5.2 (validação automática de log). |
| Como detectar defasagem comando×atuação antes da queda? | §4.3 (Controle em Malha Fechada com Sensor automatizado) + §5.2 (testes funcionais SITL) + [`decisoes/0003-criterios-aprovacao-log-sitl.md`](decisoes/0003-criterios-aprovacao-log-sitl.md) (ADR prospectivo dos critérios). |
| Como orquestrar as três raias com cadência única? | §4.1 + §4.2 (Visões Tecnologia e Engenharia unificadas via GitLab CI/CD). |
| Como expor métricas de engenharia que o time admitiu não ter? | §5 + dashboards QoS/QoP/Gerencial (ver [`dashboard-implementation-report.md`](dashboard-implementation-report.md)). |

O diagnóstico operacional da esteira atual (testes manuais, ausência de runners, validação por voo real) está consolidado em [`referencias/mapeamento-ambiente-jacto.md`](referencias/mapeamento-ambiente-jacto.md) §2.1.

## 4.1 Visão de Tecnologia (Technology Viewpoint)
A Visão de Tecnologia especifica as ferramentas e padrões técnicos escolhidos para implementar o sistema, garantindo a integração entre o ecossistema de hardware (drones) e os serviços em nuvem:
- **Repositório e CI/CD:** GitLab (GitLab CI/CD). Container Registry para imagens é **proposto (ADR-0006, Sprints 4-5)**; na Sprint 3 o runner (id=100) não tem privilégio/socket Docker, então o CD é simulado por ambiente e o artefato é imutável por `$CI_COMMIT_SHA`, sem Registry.
- **Simulação e Testes de Firmware:** Ecossistema Dronecode, utilizando **PX4 Autopilot** rodando em simulações SITL/HITL (Software/Hardware In The Loop) e comunicação via protocolo **MAVLink**<a id="ref2-link" href="#ref2"><sup>[2]</sup></a>.
- **Infraestrutura:** Docker para conteinerização isolada dos ambientes de build e simulação de voo.
- **Análise Estática (SAST):** Ferramentas integradas ao pipeline para validação de segurança e qualidade estrita do código.

## 4.2 Visão de Engenharia (Engineering Viewpoint)
A Visão de Engenharia detalha os mecanismos e a infraestrutura distribuída necessários para suportar a execução contínua do pipeline.
- **Nós de Execução (GitLab Runners):** Servidores configurados para processar isoladamente os jobs de compilação pesada (firmware) e execução de testes.
- **Isolamento de Ambiente:** Cada execução do pipeline ocorre em um contêiner efêmero, garantindo que dependências não entrem em conflito e que os testes sejam determinísticos.
- **Artefatos Homologados:** Códigos aprovados são compilados, empacotados e armazenados de forma imutável e versionada, prontos para implantação (Deployment).

## 4.3 Controle em Malha Fechada
O diferencial de automação da nossa esteira de desenvolvimento é a modelagem baseada em **Controle em Malha Fechada** (Closed-Loop Control). Esse conceito de sistemas de controle físico foi traduzido para o fluxo de engenharia de software para garantir que falhas sejam detectadas e corrigidas o mais cedo possível.

Neste modelo arquitetural:
- O **Controlador** é o sistema de gestão e o backlog (onde as referências e os *Definition of Done* são estipulados).
- O **Atuador** é a ação do desenvolvedor inserindo código no sistema (Git Push).
- O **Processo** é a execução técnica na esteira (Pipeline de CI/CD).
- O **Sensor (Comparador de Qualidade)** atua através dos testes automatizados e das verificações de segurança estática. Ele lê os logs de saída do processo e compara com a referência de qualidade exigida.

Caso o *Sensor* detecte qualquer discrepância ou falha, o erro é realimentado imediatamente para o início do fluxo: o deploy é abortado instantaneamente e um alerta de correção é gerado para a equipe, fechando a malha de feedback sem intervenção humana.

<br>
<div align="center">
  <sup>Figura 1: Fluxo do Controle em Malha Fechada aplicado ao CI/CD</sup>
  <img src="../img/diagrama_malha.png" alt="Fluxo de Malha Fechada no CI/CD">
  <sub>Produzido pelos Autores - 2026</sub>
</div>
<br>

## 4.4 Aspectos Não Funcionais da Esteira
Além do comportamento funcional, a arquitetura do OS v0.1 deve garantir requisitos operacionais estritos para não gargalar o desenvolvimento da Jacto Drones. Foram definidos os seguintes critérios não funcionais:

- **Performance do Pipeline (Time to Feedback):** **Meta provisória do projeto:** a execução completa da esteira (do linting até a finalização dos testes SITL no PX4) **deve ficar abaixo de 15 minutos**, alinhada às práticas reportadas pela DORA (DevOps Research and Assessment) e à literatura de *Accelerate*<a id="ref3-link" href="#ref3"><sup>[3]</sup></a> (elite performers operam pipelines abaixo de 10–15 min para evitar quebra de fluxo). O número opera como **alvo aspiracional**, a ser confirmado por medição real após consolidação dos jobs de SITL na Sprint 3 — não como SLA contratual.
- **Disponibilidade (SLA):** **Meta provisória do projeto:** 99.9% de uptime no horário comercial, referência aspiracional alinhada a operações de CI/CD maduras (DORA elite performers). A medição efetiva depende de provisionamento de runners e ainda não foi instrumentada — opera como alvo, não como SLA contratual.
- **Segurança dos Artefatos:**
  - Todo artefato gerado (imagens Docker ou binários de firmware) deve ser escaneado por ferramentas SAST.
  - Vulnerabilidades classificadas como "Críticas" ou "Altas" bloqueiam imediatamente a promoção do artefato.
  - Imagens de contêiner e binários devem ser assinados digitalmente antes de serem disponibilizados no Registry para evitar adulterações (Supply Chain Security).

# 5. Configuração da Esteira de Sistemas

## 5.1 Visão Geral do Pipeline
A esteira de CI/CD do Jacto Drones OS v0.1 é implementada no GitLab CI/CD e organizada em stages sequenciais que refletem o conceito de Controle em Malha Fechada descrito na seção 4.3. Cada stage atua como um gate de qualidade, e falhas em qualquer ponto abortam imediatamente o pipeline, realimentando o time com logs e alertas.

O pipeline compreende as seguintes etapas:

- **Lint:** Verificação de estilo de código, formatação e análise estática preliminar. Para o firmware PX4, utiliza-se o `clang-tidy` e o Google C++ Style Guide do ecossistema Dronecode.
- **Build:** Compilação cruzada do firmware para as arquiteturas alvo (ARM Cortex-M e simulação x86_64) e build de imagens Docker dos serviços de plataforma.
- **Test:** Execução de testes unitários e de integração, seguida dos testes funcionais em simulação SITL e HITL (seção 5.2).
- **SAST:** Análise estática de segurança do código-fonte e das dependências, incluindo escaneamento de vulnerabilidades em containers (seção 5.3).
- **Package:** Empacotamento de artefatos homologados — binários de firmware versionados, imagens Docker assinadas e SBOMs (*Software Bill of Materials*).
- **Deploy:** Promoção automatizada para ambientes de staging e, mediante aprovação manual, para produção. Na Sprint 3 o CD é **simulado por ambiente**, com artefato imutável identificado por `$CI_COMMIT_SHA` (sem reconstrução); o uso de imagens imutáveis do Container Registry do GitLab é **proposto (ADR-0006, Sprints 4-5)**, ainda não ativo.

A execução de cada job ocorre dentro de contêineres Docker efêmeros, orquestrados por **GitLab Runners**. Essa abordagem garante isolamento total entre builds, eliminando conflitos de dependência e assegurando reprodutibilidade. O tempo total de execução da esteira é monitorado conforme o requisito não funcional de <15 minutos estabelecido na seção 4.4.

## 5.2 Testes Funcionais
Colocamos o detalhamento do item **"1 - Testes Funcionais"** no arquivo [`testes-funcionais.md`](testes-funcionais.md). Nesse documento explicamos o escopo do MVP, indicando as partes do TAP e do workflow de desenvolvimento disponibilizado pelo parceiro usados como base e descrevemos as evidências geradas pelo pipeline.

Os testes funcionais validam o comportamento do firmware e dos serviços de missão sob condições que simulam cenários reais de voo. A pilha de validação baseia-se no ecossistema **Dronecode Foundation**, em especial no **PX4 Autopilot** e no protocolo **MAVLink**<a id="ref2-link" href="#ref2"><sup>[2]</sup></a><a id="ref5-link" href="#ref5"><sup>[5]</sup></a>.

- **PX4 SITL (Software In The Loop):** O firmware PX4 é executado em um simulador de voo (Gazebo ou jMAVSim) dentro de um contêiner Docker no pipeline. Missões de teste são carregadas automaticamente, e o comportamento do drone é monitorado em tempo simulado. Cenários cobertos incluem decolagem, navegação por waypoints, pouso e rotinas de contingência (*failsafe*).
- **PX4 HITL (Hardware In The Loop):** Para validações que exigem interação com hardware real, o pipeline dispara jobs em runners dedicados conectados a controladores de voo Pixhawk. Esse stage é executado sob demanda em branches de release, garantindo que o código compilado se comporte corretamente no hardware de produção.
- **Validação de Protocolo MAVLink:** Testes automatizados verificam a conformidade das mensagens trocadas entre o autopilot e a estação de controle. São validados comandos de missão (`MAV_CMD_NAV_WAYPOINT`), parâmetros de voo e telemetria de estado, assegurando interoperabilidade com o QGroundControl e outras GCS.
- **Validação de Missão:** Scripts de teste orquestram missões completas (planejamento de waypoints, execução de comandos de voo, verificação de restrições geográficas) e comparam os logs de voo simulado contra os critérios de aceitação versionados em `quality_gates.yaml` (ADR-0003).

## 5.3 Testes Não-Funcionais
Os testes não-funcionais garantem que a esteira e os artefatos gerados atendam aos requisitos de segurança, performance e conformidade regulatória.

- **SAST (Static Application Security Testing):** Ferramentas de análise estática (como Semgrep, CodeQL e Trivy) são executadas em todos os repositórios. O escaneamento cobre o código-fonte C/C++ do firmware, scripts de pipeline e imagens de contêiner. Vulnerabilidades classificadas como Críticas ou Altas bloqueiam a promoção do artefato, conforme definido na seção 4.4.
- **Gates de Performance:** O tempo de execução de cada stage é medido e comparado contra thresholds-alvo (meta provisória: SITL <10 min e pipeline completo <15 min, conforme §4.4). Os valores operam como referência aspiracional alinhada à DORA<a href="#ref3"><sup>[3]</sup></a>; a medição efetiva e a calibração final serão consolidadas na Sprint 3.
- **Escaneamento de Artefatos:** Antes do empacotamento, binários de firmware e imagens Docker passam por escaneamento de vulnerabilidades em dependências. Para imagens Docker, é gerado um relatório de camadas e pacotes vulneráveis.
- **Assinatura Digital:** **Proposto (ADR-0004, Sprints 4-5); não ativa na Sprint 3.** A meta é que todo artefato promovido para staging ou produção seja assinado digitalmente com chaves GPG armazenadas no GitLab CI/CD Vault, garantindo a integridade do artefato e a proteção contra adulterações na cadeia de suprimentos (*supply chain security*), em conformidade com os requisitos da ISO/IEC 27001:2022<a id="ref5-link" href="#ref5"><sup>[5]</sup></a>.

## 5.4 Rastreabilidade Técnica
A rastreabilidade end-to-end é um diferencial crítico do Jacto Drones OS v0.1, permitindo auditar qualquer demanda desde sua concepção até o deploy em produção.

**Operacional na Sprint 3 (o que roda hoje).** A rastreabilidade é realizada inteiramente dentro do GitLab, sem dependência de ferramentas externas:

1. **Issue do GitLab (Requisitos e Contexto):** A demanda é registrada como uma **issue do GitLab** (#2-#7, uma por TG), que concentra o contexto e os critérios.
2. **GitLab (Código e Merge Requests):** O desenvolvedor cria uma branch e abre um MR. Cada commit referencia a issue via **`Refs #N`** e segue **Conventional Commits**, validados por **commitlint**.
3. **GitLab CI/CD (Build, Teste e Deploy):** O push dispara o pipeline; o status de cada job é reportado ao MR, e o veredito dos gates volta como comentário automático (malha de §4.3).

Para viabilizar essa cadeia, adota-se:

- **Conventional Commits + `Refs #N`:** Mensagens de commit seguem o padrão Conventional Commits e citam a issue do GitLab por `Refs #N`, vinculando automaticamente o trabalho à respectiva issue. A validação é feita por commitlint no pipeline.
- **Política de Branching:** Todo merge request deve referenciar a issue do GitLab (`Refs #N`) em commits, título ou descrição. Commits sem referência de rastreamento são sinalizados em revisão.

**Proposto (TO-BE, Sprints 4-5).** A extensão da cadeia para ferramentas externas — **Notion (requisitos estratégicos) → Jira (épicos/histórias, ex.: chave `JACTO-456`) → GitLab** — com **Smart Commits** (comandos como `JACTO-123 #close #comment ...`) e a **GitLab Jira Integration** (sincronizando commits, MRs e deployments para abas de "Desenvolvimento" no Jira) permanece como visão futura, conforme o documento de mapeamento do ambiente<a id="ref4-link" href="#ref4"><sup>[4]</sup></a>. Não está ativa na Sprint 3.

## 5.5 Infraestrutura de Execução
A execução do pipeline depende de uma infraestrutura escalável e segura de runners e registro de artefatos.

- **GitLab Runners:** Os jobs são executados por runners que podem ser auto-hospedados (*self-hosted*) na infraestrutura da Jacto ou provisionados em nuvem (AWS EC2, GCP Compute Engine). Runners auto-hospedados são recomendados para jobs de HITL, pois exigem acesso físico a hardware de voo.
- **Docker-in-Docker (DinD):** **Proposto (ADR-0006, Sprints 4-5).** Para builds que necessitam construir imagens Docker dentro do pipeline (como os serviços de plataforma), a modalidade Docker-in-Docker daria a cada execução um daemon Docker isolado. Na Sprint 3 não está disponível: o runner (id=100) não tem privilégio nem socket Docker, logo não há DinD ativo.
- **Container Registry:** **Proposto (ADR-0006, Sprints 4-5).** O GitLab Container Registry armazenaria as imagens Docker versionadas e assinadas, tagueadas por hash de commit e versão SemVer. Na Sprint 3 **não há Registry**: o CD é simulado por ambiente e o artefato é imutável por `$CI_COMMIT_SHA`.
- **Armazenamento de Artefatos:** Binários de firmware, relatórios de teste e SBOMs são armazenados como artefatos do GitLab CI/CD com retenção configurada. A promoção de artefatos de release para um bucket de armazenamento de longo prazo (S3 ou equivalente) para auditoria regulatória é **proposta (Sprints 4-5)**, ainda não provisionada.

## 5.6 Mapa de Cobertura de Funcionalidades
O Mapa de Cobertura de Funcionalidades consolida, em forma de matriz de rastreabilidade, quais componentes são versionados em repositório Git e exercitados pelo pipeline descrito em §5.1. Para não confundir o que **já roda** com o que está **planejado**, as tabelas trazem uma coluna **Estado** com dois valores: **operacional na Sprint 3** (exercitado pelo pipeline real, com evidência no entorno imediato) e **proposto (Sprints 4-5)** (meta projetada, ainda não ativa). A organização por frente segue o mapeamento do ambiente Jacto<a href="#ref4"><sup>[4]</sup></a>; o caso pedagógico Dronecode é o ambiente de validação realista previsto no Termo de Abertura de Projeto Inteli (TAPI) — ESMD10<a id="ref7-link" href="#ref7"><sup>[7]</sup></a>; e a estruturação em estágios com gates segue Humble e Farley<a id="ref8-link" href="#ref8"><sup>[8]</sup></a>.

> **AS-IS antes de TO-BE.** A stack efetivamente exercitada nesta sprint é **Python** (libs/scripts/testes), **C/C++ do PX4** (firmware, via SITL) e **Next.js/TypeScript** (dashboards). Componentes da plataforma de clientes (serviço de missão, frontend de operação) e o pipeline de telemetria seguem como repositórios **previstos** no plano de configuração, ainda não materializados; o MVP da esteira é validado sobre o firmware PX4 e os artefatos de dados/painéis.

**Tabela 1 — Cobertura por frente, com estado e evidência (develop @ Sprint 3)**

| Frente | Componente | Estado | Build / stage(s) | Evidência no entorno imediato |
| --- | --- | --- | --- | --- |
| Firmware embarcado | PX4 Autopilot (controle de voo) | **Operacional (S3)** | Build PX4 SITL (cache ccache) + missão `square_50m` → `metrics.json`, stages `build`/`test` | [`ci/sitl-metrics.yml`](../ci/sitl-metrics.yml), [`scripts/run_mission.py`](../scripts/run_mission.py), PX4 v1.16.2 (Dronecode)<a href="#ref2"><sup>[2]</sup></a> |
| Firmware embarcado | Protocolo MAVLink (MAVSDK) | **Operacional (S3)** | Comando da missão SITL via MAVSDK, stage `test` | [`scripts/run_mission.py`](../scripts/run_mission.py); MAVLink v2<a id="ref9-link" href="#ref9"><sup>[9]</sup></a> |
| Sistema de dados | Painéis DORA / QoS / gerencial | **Operacional (S3)** | App Next.js/TS sobre KPIs reais (DORA + missão), lint `tsc`/ESLint no stage `lint` | [`src/`](../src) (Next.js), [`scripts/collect_gitlab_metrics.py`](../scripts/collect_gitlab_metrics.py); ADR-0002<a href="#ref-adr">↗</a> |
| Sistema de dados | Extração de métricas de missão | **Operacional (S3)** | `pyulog` sobre `.ulg` → `metrics.json` (artefato de CI), stage `test` | [`scripts/extract_metrics.py`](../scripts/extract_metrics.py); [`quality_gates.yaml`](../quality_gates.yaml) |
| Firmware embarcado | QGroundControl (GCS de validação) | Proposto (S4-5) | Empacotamento Qt para teste de comandos | QGroundControl v4.x<a id="ref10-link" href="#ref10"><sup>[10]</sup></a> |
| Plataforma de clientes | Serviço de Missão / Frontend de operação | Proposto (S4-5) | Build de serviço + web (stack a definir) | Repositórios previstos no plano de configuração |
| Sistema de dados | Pipeline de telemetria (ingest) | Proposto (S4-5) | Workers Python, stages `build`/`test`/`sast` | Repositório previsto no plano de configuração |

**Tabela 2 — Rastreio de funcionalidades pedagógicas (validação Dronecode)**

| Funcionalidade do MVP | Estado | Cenário de validação | Stage / critério | Evidência |
| --- | --- | --- | --- | --- |
| Decolagem + navegação por waypoints | **Operacional (S3)** | PX4 SITL<a id="ref11-link" href="#ref11"><sup>[11]</sup></a>, missão `square_50m` | `test`: missão voa, `metrics.json` não degenerado (altitude e amostras > 0) | [`missions/square_50m.yaml`](../missions/square_50m.yaml), [`tests/sitl/`](../tests/sitl), [`ci/sitl-metrics.yml`](../ci/sitl-metrics.yml) |
| Invariantes físicos de voo | **Operacional (S3)** | Métricas extraídas do `.ulg` | `gate`: aceleração ≤ 15 m/s², duração ≤ 180 s, σ-altitude cruzeiro ≤ 1,0 m | [`quality_gates.yaml`](../quality_gates.yaml), ADR-0003<a href="#ref-adr">↗</a> |
| Pouso e failsafe (perda de RC) | Proposto (S4-5) | Cenário de perda de RC em SITL | `test`: pouso seguro | Roadmap de cenários SITL |
| Conformidade MAVLink (suite `MAV_CMD`) | Proposto (S4-5) | Suite de mensagens críticas | `test`: 100% das críticas validadas<a href="#ref9"><sup>[9]</sup></a> | Roadmap de validação de protocolo |
| Promoção de artefato em release | **Operacional (S3, simulado)** | Tag `v*` → GitLab Release real | `deploy`: artefato imutável por SHA, **sem** Container Registry | [`ci/deploy.yml`](../ci/deploy.yml), [`scripts/promote_artifact.py`](../scripts/promote_artifact.py), ADR-0006<a href="#ref-adr">↗</a> |

<sub><a id="ref-adr"></a>↗ ADRs em [`docs/decisoes/`](decisoes/): 0002 (Next.js), 0003 (critérios de log SITL), 0006 (CD sem Registry).</sub>

Cada linha **operacional** compõe um elo já fechado da malha de §4.3: o resultado do stage de validação volta como veredito de gate e como comentário automático no MR. A rastreabilidade fim a fim exigida pela ISO/IEC 12207:2017<a href="#ref5"><sup>[5]</sup></a> é realizada hoje por **issues do GitLab (#2-#7, uma por TG) + Conventional Commits + `Refs #N`** (validado por commitlint), e não por chave Jira — a integração com Jira/Notion permanece como proposta (§5.4).

## 5.7 Mapa de Cobertura de Não Funcionalidades
Como o Jacto Drones OS v0.1 dará suporte a sistemas autônomos e críticos, o pipeline incorpora análises não funcionais em diferentes stages. Esta seção consolida os controles de **lint**, **SAST e segredos**, **segurança de dependências/IaC**, **quality gates de missão**, **tempo de execução** e **integridade de artefato**, exigidos no TAPI<a href="#ref7"><sup>[7]</sup></a> e em §4.4. Como em §5.6, a coluna **Estado** separa o que **roda na Sprint 3** do que é **proposto (Sprints 4-5)**, e há ainda a distinção entre **bloqueante** (reprova o merge) e **informativo** (`allow_failure`, publica achado sem bloquear). As categorias seguem a ISO/IEC 25010:2023<a id="ref13-link" href="#ref13"><sup>[13]</sup></a>; os controles de segurança, a ISO/IEC 27001:2022<a id="ref14-link" href="#ref14"><sup>[14]</sup></a> e o NIST SP 800-218 (SSDF)<a id="ref15-link" href="#ref15"><sup>[15]</sup></a>.

**Tabela 3 — Cobertura de análises não funcionais (estado e evidência)**

| Categoria NF | Ferramenta (real) | Stage | Estado / enforcement | Evidência no entorno imediato |
| --- | --- | --- | --- | --- |
| Lint (web/dados) | ESLint + `tsc` (Next.js/TS)<a id="ref17-link" href="#ref17"><sup>[17]</sup></a> | `lint` | **Operacional (S3)** | [`src/eslint.config.mjs`](../src/eslint.config.mjs), [`.gitlab-ci.yml`](../.gitlab-ci.yml) |
| Quality gates de missão | `scripts/quality_gates.py` + `quality_gates.yaml` | `gate` | **Operacional (S3), BLOQUEANTE** (exit ≠ 0 trava o merge) | [`scripts/quality_gates.py`](../scripts/quality_gates.py), [`quality_gates.yaml`](../quality_gates.yaml), ADR-0005<a href="#ref-adr2">↗</a> |
| Cobertura de testes unitários | `pytest` + `coverage` (ratchet 0,90) | `build`/`gate` | **Operacional (S3), BLOQUEANTE** | [`tests/unit/`](../tests/unit), [`quality_gates.yaml`](../quality_gates.yaml) |
| Segredos | TruffleHog + Gitleaks (`filesystem`) | `sast` | **Operacional (S3), informativo** (`allow_failure`) | [`ci/sast.yml`](../ci/sast.yml) |
| SAST (código) | Semgrep<a id="ref18-link" href="#ref18"><sup>[18]</sup></a> (OSS) | `sast` | **Operacional (S3), informativo** | [`ci/sast.yml`](../ci/sast.yml), ADR-0007<a href="#ref-adr2">↗</a> |
| Dependências / IaC | Trivy<a id="ref21-link" href="#ref21"><sup>[21]</sup></a> `fs` + `config` (CVE + misconfig) | `sast` | **Operacional (S3), informativo** (sem `trivy image`: deploy sem Registry) | [`ci/sast.yml`](../ci/sast.yml), ADR-0006<a href="#ref-adr2">↗</a> |
| Conventional Commits | commitlint | `sast` | **Operacional (S3), informativo** | [`ci/sast.yml`](../ci/sast.yml), [`commitlint.config.js`](../commitlint.config.js) |
| SAST/segredos **bloqueantes** | Semgrep/Trivy (+ análise semântica tipo CodeQL<a id="ref19-link" href="#ref19"><sup>[19]</sup></a>) no runner `sonar-00` | `sast`/`gate` | Proposto (S4-5) | ADR-0007<a href="#ref-adr2">↗</a> |
| Integridade de artefato | Assinatura GPG + SBOM<a id="ref12-link" href="#ref12"><sup>[12]</sup></a> | `gate`/`deploy` | Proposto (S4-5) | ADR-0004<a href="#ref-adr2">↗</a> (GPG em `main`) |
| Lint de firmware | clang-tidy + Google C++ Style<a id="ref16-link" href="#ref16"><sup>[16]</sup></a> | `lint` | Proposto (S4-5) | Roadmap (firmware compila hoje só via SITL) |

**Tabela 4 — Cobertura cruzada por frente (S3 operacional × proposto)**

| Frente | Lint | SAST / segredos | Dependências | Quality gate | Integridade |
| --- | --- | --- | --- | --- | --- |
| Firmware (PX4, C/C++) | clang-tidy *(proposto)* | Semgrep *(informativo)* | Trivy `fs` *(informativo)* | invariantes de missão **(bloqueante)** | GPG *(proposto)* |
| Dados / painéis (Python, Next.js/TS) | ESLint + `tsc` **(operacional)** | Semgrep *(informativo)* | Trivy `fs`+`config` *(informativo)* | coverage ratchet **(bloqueante)** | GPG *(proposto)* |

O que já fecha a malha de §4.3 hoje são os gates **bloqueantes** (`scripts/quality_gates.py`): violação de threshold de cobertura ou de invariante de missão interrompe a promoção e realimenta o time, e o veredito é publicado como comentário automático no MR. Os scanners de segurança são **informativos** nesta sprint (publicam achado sem reprovar) e tornam-se bloqueantes nas Sprints 4-5 (ADR-0007), junto com GPG/SBOM (ADR-0004) — descritos aqui como **roadmap**, não como controle ativo. O alvo de tempo de esteira segue a referência DORA (*Lead Time*)<a href="#ref3"><sup>[3]</sup></a> e é **meta projetada**, não medida ainda travada por gate. As normas detalhadas estão em [docs/referencias/normas-engenharia.md](referencias/normas-engenharia.md)<a href="#ref5"><sup>[5]</sup></a>; para firmware aeronáutico, os princípios do DO-178C<a id="ref20-link" href="#ref20"><sup>[20]</sup></a> e do NIST SSDF<a href="#ref15"><sup>[15]</sup></a> orientam o rigor das próximas sprints.

<sub><a id="ref-adr2"></a>↗ ADRs em [`docs/decisoes/`](decisoes/): 0004 (GPG em `main`), 0005 (thresholds/ratchet), 0006 (CD sem Registry), 0007 (SAST Semgrep).</sub>

# 6. Requisitos SCM

## 6.1 Políticas de Integração
O controle de versão do Jacto Drones OS v0.1 adota a estratégia **Gitflow** como modelo de branching, garantindo isolamento entre desenvolvimento ativo, preparação de release e correções urgentes.

As branches principais são:

- **`main`:** Branch de produção. Contém apenas código estável e artefatos validados. Todos os commits na `main` devem estar associados a uma tag de versão.
- **`develop`:** Branch de integração contínua. Recebe merges de features concluídas e serve como base para testes de regressão e validação em ambiente de staging.
- **`feature/*`:** Branches de desenvolvimento de funcionalidades. Criadas a partir da `develop` e mergeadas de volta via merge request. O nome descreve a funcionalidade (ex.: `feat/quality-gates`), e os commits referenciam a issue do GitLab via `Refs #N`. (A nomeação por chave Jira — ex.: `feature/JACTO-456-controle-pid` — é **proposta**, TO-BE Sprints 4-5.)
- **`release/*`:** Branches de preparação de release. Criadas a partir da `develop` quando o conjunto de funcionalidades está congelado. Apenas correções de bug e ajustes de documentação são permitidos.
- **`hotfix/*`:** Branches de correção urgente em produção. Criadas a partir da `main` e mergeadas tanto para `main` quanto para `develop` após validação.

As seguintes proteções são obrigatórias em todas as branches persistentes (`main` e `develop`):

- **Revisão de Código Obrigatória:** Todo merge request exige aprovação de pelo menos um revisor que não seja o autor. Revisões devem verificar lógica, testes, documentação e conformidade com os padrões do projeto.
- **CI Passing:** O pipeline GitLab CI/CD deve concluir com sucesso antes que o merge seja permitido. Falhas em qualquer stage bloqueiam o botão de merge.
- **Sem Conflitos:** O branch de origem deve estar atualizado em relação ao destino. Conflitos de merge devem ser resolvidos localmente antes da abertura ou atualização do MR.
- **Assinatura de Commits:** A assinatura GPG (de commits e de artefatos) é **proposta (ADR-0004, Sprints 4-5)** e não está ativa na Sprint 3; quando habilitada, garante autoria e integridade do histórico e dos artefatos.

## 6.2 Fluxo de Promoção
O fluxo de promoção de código define o caminho que uma alteração percorre desde o desenvolvimento local até a produção, com gates de qualidade em cada estágio.

1. **Desenvolvimento em Feature Branch:** O desenvolvedor cria um branch `feature/*` a partir da `develop`, vinculado a uma issue do GitLab via `Refs #N`. Commits seguem a especificação Conventional Commits (validados por commitlint). O vínculo a uma história do Jira é **proposto (TO-BE, Sprints 4-5)**.
2. **Merge Request para `develop`:** Ao concluir a implementação, abre-se um MR para a `develop`. O MR dispara o pipeline de CI/CD (lint, build, testes unitários, SAST).
3. **Validação de CI e Revisão:** O pipeline deve passar e o MR deve receber aprovação de pelo menos um revisor. Somente então o merge é permitido.
4. **Integração na `develop`:** Após o merge, o pipeline de integração executa testes de regressão completos, incluindo SITL. A `develop` reflete o estado mais atual do sistema.
5. **Branch de Release:** Quando o conjunto de funcionalidades está estável, cria-se um branch `release/vX.Y.Z` a partir da `develop`. Nesse branch, são executados testes HITL e validações de aceitação final.
6. **Deploy para Staging:** O artefato gerado no branch de release é automaticamente implantado no ambiente de staging. Testes de smoke e validação de missão são executados.
7. **Merge para `main` e Tag:** Após validação em staging, o release branch é mergeado para `main` e uma tag SemVer é criada. Na Sprint 3, a tag `v*` gera um **GitLab Release** com artefato imutável por `$CI_COMMIT_SHA` (**sem** Container Registry, ADR-0006); a assinatura GPG e a promoção para o Registry são **propostas (ADR-0004/0006, Sprints 4-5)**.
8. **Deploy para Produção:** O deploy em produção requer aprovação manual (gate de *change advisory board* ou aprovação do tech lead). O artefato implantado é exatamente o mesmo validado em staging, sem reconstrução.

Cada estágio funciona como um filtro. Falhas em qualquer gate retornam o código para correção, fechando a malha de feedback descrita na seção 4.3.

## 6.3 Versionamento Semântico
O versionamento de artefatos do Jacto Drones OS v0.1 segue o padrão **SemVer** (*Semantic Versioning*), aplicado tanto aos binários de firmware quanto às imagens Docker dos serviços de plataforma. O formato é:

**MAJOR.MINOR.PATCH**

- **MAJOR:** Incrementado quando há mudanças incompatíveis na API, protocolo de comunicação ou interface de hardware. Exige atualização de documentação regulatória e testes de regressão completos.
- **MINOR:** Incrementado quando novas funcionalidades são adicionadas de forma compatível. Inclui novos modos de voo, melhorias de telemetria ou novos endpoints de API.
- **PATCH:** Incrementado para correções de bugs, ajustes de parâmetros de voo ou atualizações de segurança que não alteram a API.

O versionamento é disparado automaticamente pelo pipeline a partir da análise de mensagens de commit no formato **Conventional Commits**. Commits do tipo `feat:` geram incremento de MINOR; `fix:` geram incremento de PATCH; e a presença de `BREAKING CHANGE:` no corpo da mensagem gera incremento de MAJOR. A ferramenta `semantic-release` ou equivalente é configurada no pipeline para calcular a nova versão, gerar o changelog e criar a tag no GitLab.

## 6.4 Indicadores de Performance
A medição contínua da performance de entrega é essencial para identificar gargalos e orientar melhorias na esteira. O Jacto Drones OS v0.1 adota um conjunto integrado de métricas que combinam indicadores de fluxo (Cycle Time e Lead Time) com as métricas DORA (*DevOps Research and Assessment*)<a id="ref3-link" href="#ref3"><sup>[3]</sup></a><a id="ref6-link" href="#ref6"><sup>[6]</sup></a>.

As métricas DORA são **medidas via API do GitLab** por [`scripts/collect_gitlab_metrics.py`](../scripts/collect_gitlab_metrics.py) (operacional na Sprint 3): a coleta atual reporta **lead time mediana de 0,4h**, **Change Failure Rate de 0% na `main`** e **10 deploys em staging**. A correlação de Cycle/Lead Time e de falhas é feita contra as **issues do GitLab** (`Refs #N`); a leitura a partir de cards/tickets do Jira ou Notion é **proposta (TO-BE, Sprints 4-5)**.

- **Cycle Time:** Tempo decorrido entre o início do trabalho em uma issue do GitLab (quando entra em progresso) e a conclusão do MR mergeado na `develop`. Indica a eficiência do processo de desenvolvimento e revisão. (Origem em card do Jira: proposta.)
- **Lead Time:** Tempo total entre a criação da demanda (issue do GitLab) e a disponibilização da funcionalidade. Engloba não apenas o desenvolvimento, mas também os estágios de teste, homologação e deploy. (Origem em Jira/Notion: proposta.)
- **Deployment Frequency (Frequência de Deploy):** Número de deploys por janela de tempo. Medido a partir dos eventos de deploy registrados no GitLab CI/CD (10 deploys em staging na coleta atual). Alta frequência indica capacidade de entregar valor de forma contínua.
- **Lead Time for Changes (Tempo de Espera de Mudanças):** Tempo entre o primeiro commit de uma funcionalidade e seu deploy. Calculado a partir dos timestamps de commits e dos eventos de deploy no GitLab (mediana 0,4h na coleta atual).
- **Change Failure Rate (Taxa de Falha de Mudança):** Percentual de deploys que resultam em incidentes, bugs críticos ou rollback (0% na `main` na coleta atual). A correlação é feita entre deploys e **issues de bug do GitLab** abertas nas 24 horas seguintes à entrega; o uso de tickets do Jira é **proposto**.
- **Mean Time To Recovery (MTTR - Tempo Médio de Recuperação):** Tempo médio para restaurar o serviço ou corrigir um firmware defeituoso após uma falha. Medido a partir da abertura de uma **issue de incidente no GitLab** até o registro de sua resolução; o registro do incidente no Jira é **proposto**.

A coleta dessas métricas já é **automatizada via API do GitLab** ([`scripts/collect_gitlab_metrics.py`](../scripts/collect_gitlab_metrics.py)) na Sprint 3. A integração com painéis externos como **GitLab DORA nativo ou Datadog** é **proposta (TO-BE, Sprints 4-5)**.

## 6.5 Definição de Pronto (Definition of Done)
Uma funcionalidade só é considerada concluída no Jacto Drones OS v0.1 quando atende a todos os critérios da **Definição de Pronto** (DoD). Essa lista garante que o trabalho entregue possa ser rastreado, auditado e implantado com confiança:

- **Código Revisado:** O merge request foi aprovado por pelo menos um revisor, com todos os comentários resolvidos.
- **Testes Passando:** Todos os testes unitários, de integração, SITL e SAST do pipeline concluíram com sucesso.
- **SAST Limpo:** Nenhuma vulnerabilidade Crítica ou Alta permanece sem tratamento ou exceção documentada.
- **Documentação Atualizada:** O README do repositório, a documentação técnica no repositório (`docs/`) e as notas de release foram atualizados para refletir a mudança. (A documentação no Confluence é **proposta**, TO-BE Sprints 4-5.)
- **Issue do GitLab Fechada:** A issue do GitLab vinculada (`Refs #N`) foi movida para "Concluído" ou equivalente, com links para o MR e o pipeline. (O fechamento da história no Jira é **proposto**.)
- **Deploy em Staging:** O artefato foi implantado com sucesso no ambiente de staging e passou nos testes de smoke.
- **Rastreabilidade Completa:** A cadeia **issue do GitLab → commits/MR (`Refs #N`) → pipeline** está intacta e verificável, com a referência da issue presente em commits e MRs. (A extensão Notion → Jira → GitLab é **proposta**, TO-BE Sprints 4-5.)

Somente após o cumprimento integral desses critérios a funcionalidade é elegível para promoção à produção.

# 7. Referências

<a id="ref1"></a>[1] ISO/IEC. (1998). *ISO/IEC 10746-1:1998 - Information technology — Open Distributed Processing — Reference model: Overview*. Disponível em: https://www.iso.org/standard/20696.html (Acesso em: 16/05/2026). <a href="#ref1-link">↩</a>

<a id="ref2"></a>[2] Dronecode Foundation. *PX4 Autopilot User Guide and MAVLink Developer Guide*. Disponível em: https://docs.px4.io/ <a href="#ref2-link">↩</a>

<a id="ref3"></a>[3] Forsgren, N., Humble, J., & Kim, G. (2018). *Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations*. IT Revolution Press. Disponível em: https://itrevolution.com/product/accelerate/ (Acesso em: 16/05/2026). <a href="#ref3-link">↩</a>

<a id="ref4"></a>[4] G04 — Inteli. (2026). *Mapeamento do Ambiente Jacto — Jacto Drones OS v0.1*. Disponível em: `docs/referencias/mapeamento-ambiente-jacto.md` <a href="#ref4-link">↩</a>

<a id="ref5"></a>[5] G04 — Inteli. (2026). *Normas de Engenharia e Referências Técnicas — Jacto Drones OS v0.1*. Disponível em: `docs/referencias/normas-engenharia.md` <a href="#ref5-link">↩</a>

<a id="ref6"></a>[6] Google Cloud. *DORA Core Model*. DevOps Research and Assessment. Disponível em: https://dora.dev/research/ <a href="#ref6-link">↩</a>

<a id="ref7"></a>[7] JACTO / Inteli. (2026). *Termo de Abertura de Projeto Inteli (TAPI) — ESMD10: Esteira ágil de produção de software*. <a href="#ref7-link">↩</a>

<a id="ref8"></a>[8] Humble, J., & Farley, D. (2010). *Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation*. Addison-Wesley. Disponível em: https://martinfowler.com/books/continuousDelivery.html (Acesso em: 16/05/2026). <a href="#ref8-link">↩</a>

<a id="ref9"></a>[9] MAVLink. *MAVLink v2 — Developer Guide: Message Format and Common Messages*. Disponível em: https://mavlink.io/ <a href="#ref9-link">↩</a>

<a id="ref10"></a>[10] Dronecode Foundation. *QGroundControl User Guide — Ground Control Station for PX4 and ArduPilot*. Disponível em: http://qgroundcontrol.com/ <a href="#ref10-link">↩</a>

<a id="ref11"></a>[11] PX4 Autopilot. *PX4 User Guide — Simulation (SITL/HITL) and Flight Modes*. Dronecode Foundation. Disponível em: https://docs.px4.io/ <a href="#ref11-link">↩</a>

<a id="ref12"></a>[12] NTIA / CISA. *Software Bill of Materials (SBOM) — Minimum Elements & Supply Chain Security Guidance*. Disponível em: https://www.cisa.gov/sbom <a href="#ref12-link">↩</a>

<a id="ref13"></a>[13] ISO/IEC. (2023). *ISO/IEC 25010:2023 — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*. Disponível em: https://www.iso.org/standard/78176.html (Acesso em: 16/05/2026). <a href="#ref13-link">↩</a>

<a id="ref14"></a>[14] ISO/IEC. (2022). *ISO/IEC 27001:2022 — Information security, cybersecurity and privacy protection — Information security management systems — Requirements*. Disponível em: https://www.iso.org/standard/27001 (Acesso em: 16/05/2026). <a href="#ref14-link">↩</a>

<a id="ref15"></a>[15] NIST. (2022). *NIST SP 800-218 — Secure Software Development Framework (SSDF) v1.1*. Disponível em: https://csrc.nist.gov/publications/detail/sp/800-218/final (Acesso em: 16/05/2026). <a href="#ref15-link">↩</a>

<a id="ref16"></a>[16] Google. *Google C++ Style Guide* e LLVM Project, *clang-tidy — A Clang-based C++ Linter*. Disponíveis em: https://google.github.io/styleguide/cppguide.html e https://clang.llvm.org/extra/clang-tidy/ <a href="#ref16-link">↩</a>

<a id="ref17"></a>[17] OpenJS Foundation. *ESLint — Pluggable JavaScript Linter*. Disponível em: https://eslint.org/ <a href="#ref17-link">↩</a>

<a id="ref18"></a>[18] Semgrep, Inc. *Semgrep — Lightweight Static Analysis*. Disponível em: https://semgrep.dev/ <a href="#ref18-link">↩</a>

<a id="ref19"></a>[19] GitHub. *CodeQL — Semantic Code Analysis Engine*. Disponível em: https://codeql.github.com/ <a href="#ref19-link">↩</a>

<a id="ref20"></a>[20] RTCA. (2011). *DO-178C — Software Considerations in Airborne Systems and Equipment Certification*. Disponível em: https://www.rtca.org/products/do-178c-software-considerations-in-airborne-systems-and-equipment-certification/ (Acesso em: 16/05/2026). <a href="#ref20-link">↩</a>

<a id="ref21"></a>[21] Aqua Security. *Trivy — Comprehensive Vulnerability Scanner for Containers and Dependencies*. Disponível em: https://trivy.dev/ <a href="#ref21-link">↩</a>

- JACTO. *Termo de Abertura de Projeto (TAP) - Jacto Drones OS*. 2026.

# 8. Avaliação dos Resultados

A validação do protótipo **Jacto Drones OS v0.1** confronta o processo manual descrito pela Jacto (AS-IS) com o desempenho da esteira de CI/CD automatizada (TO-BE).

## 8.1 Métricas de Eficiência (Quantitativo)

A Sprint 3 consolidou o pipeline PX4 SITL real e converteu as metas provisórias da Sprint 2 em **números medidos**. A tabela abaixo registra os resultados **medidos** no pipeline `#30535` em `develop` (commit `c967ad6`, status VERDE), confrontados com a baseline AS-IS do TAPI. Os campos que dependem do voo real de produção (`.ulg` da Jacto) permanecem como **meta projetada** — separados literalmente em §8.1.2.

### 8.1.1 ✅ Resultado MEDIDO nesta sprint (pipeline real)

Tempos e métricas extraídos diretamente dos logs do GitLab CI e do artefato `reports/metrics.json` (job `sitl-mission-metrics`), não de estimativas. **Toda linha desta tabela é um fato medido no pipeline `#30535`.**

| Indicador | Resultado medido (Sprint 3) | Como foi medido |
| :--- | :--- | :--- |
| **Pipeline CI/CD completo** | **~4–5 min** (vs. meta S2 < 15 min) | Logs do pipeline `#30535` (GitLab CI), `develop` @ `c967ad6` |
| **Caminho crítico: build PX4 SITL + missão** | **183 s** | Job `sitl-mission-metrics` ([`ci/sitl-metrics.yml`](../ci/sitl-metrics.yml)) |
| **Cobertura de testes unitários** (`libs/`: geometria + loader de missão) | **98%** (gate ratchet ≥ 0,90) | `pytest --cov` sobre `tests/unit`; gate em [`quality_gates.yaml`](../quality_gates.yaml) |
| **Missão SITL `square_50m` — duração** | **78,83 s** | `reports/metrics.json` → `mission_duration_s` |
| **Altitude máx. / média** | **10,01 m** / 7,12 m | `reports/metrics.json` → `max_altitude_m` / `mean_altitude_m` |
| **σ de altitude em cruzeiro** | **0,688 m** (gate ≤ 1,0 m) | `reports/metrics.json` → `std_altitude_cruise_m` |
| **Aceleração máx.** | **11,01 m/s²** (gate ≤ 15 m/s²) | `reports/metrics.json` → `max_acceleration_m_s2` |
| **Queda de bateria na missão** | **0,333%** | `reports/metrics.json` → `max_battery_drop_pct` |
| **Amostras do log de voo simulado** | **9.855 amostras** | `reports/metrics.json` → `n_samples` |
| **Quality gates aprovados** | **5/5** (cobertura, aceleração, duração, σ altitude, SAST skip) | Job `quality-gates` BLOQUEANTE ([`ci/quality-gates.yml`](../ci/quality-gates.yml), [`scripts/quality_gates.py`](../scripts/quality_gates.py)) |
| **`deploy_staging`** | **success** (deploy simulado por Environment) | Job de deploy ([`ci/deploy.yml`](../ci/deploy.yml)); artefato imutável por `$CI_COMMIT_SHA` ([ADR-0006](decisoes/0006-promocao-sem-registry.md)) |

**Métricas DORA medidas** (via API GitLab, projeto `10705`, [`scripts/collect_gitlab_metrics.py`](../scripts/collect_gitlab_metrics.py)):

| Métrica DORA | Valor medido (Sprint 3) | Observação |
| :--- | :--- | :--- |
| **Lead Time for Changes** | mediana **0,4 h** / média 27,4 h | sobre 21 MRs *merged* |
| **Deployment Frequency** | **10 deploys** em *staging* | na Sprint 3 |
| **Change Failure Rate** | **`main` 0%** / `develop` 45% | o valor alto em `develop` reflete iterações de *de-risking* (não produção) |
| **MTTR** | **não-medido** | sem incidente em `main` para medir (ver §8.1.2) |

> **Nota sobre números:** todos os valores acima são **medidos**, não projetados. As métricas da missão são reproduzíveis: o job regenera o `.ulg` via PX4 SITL e o `extract_metrics.py` produz o `reports/metrics.json`. O gate é **bloqueante** (sem `allow_failure`) — um pipeline que não atinge os thresholds de [`quality_gates.yaml`](../quality_gates.yaml) falha e impede o merge.

**Evidências de Coleta:**
- **Dados AS-IS:** Extraídos do TAPI Seção B.5 (Gargalos operacionais de logs)<a id="ref7-link" href="#ref7"><sup>[7]</sup></a>.
- **Dados TO-BE medidos:** Logs do pipeline `#30535` (GitLab CI, `develop` @ `c967ad6`); artefato `reports/metrics.json` do job `sitl-mission-metrics`; saída do `quality-gates` (5/5); coleta DORA via API GitLab (projeto `10705`).

**Evidências visuais da esteira CI/CD (Sprint 3).** As três figuras mostram a malha fechada em três momentos: a validação contínua no MR → a realimentação automática no próprio MR → a promoção controlada a produção.

<div align="center">
  <img src="../img/pipeline-ci-mr-quality-gates.png" alt="Pipeline de CI de um merge request da branch feat/quality-gates, com status Passed"><br>
  <sub><strong>Figura 1 — CI no Merge Request</strong> (branch <code>feat/quality-gates</code>): pipeline <em>Passed</em>. O <strong>quality gate</strong> é aprovado e o <code>quality-gates-mr-comment</code> roda; o <strong>gate humano é opcional</strong> (<code>quality-gates-human-approval</code>, <em>manual</em>) e por isso <strong>não bloqueia</strong> o status verde do MR. A branch executa apenas seu próprio fragmento (<code>lint/build/test/gate</code>) — efeito do <code>include</code> por <em>concern</em> (glob <code>ci/*.yml</code>); <code>sast</code> chega pela branch de integridade e <code>deploy</code> só roda em <code>develop</code>/<code>main</code>.</sub>
</div>

<div align="center">
  <img src="../img/comentario-bot-mr-gates.png" alt="Comentário automático do pipeline no merge request com a tabela 5/5 quality gates"><br>
  <sub><strong>Figura 2 — Comentário automático no MR</strong> (TG6.4 — "rastro que ensina"): o pipeline posta a tabela <strong>5/5 quality gates</strong> com <em>actual × threshold</em> (cobertura 0,9853 ≥ 0,90; aceleração 11,04 ≤ 15,0; duração 78,9 ≤ 180 s; σ-altitude 0,682 ≤ 1,0; SAST <em>skipped</em>). É a prova direta do <strong>fechamento do feedback S2 (item 2)</strong>: o indicador aparece com sua evidência no entorno imediato do MR. Publicado via token de serviço impessoal (<a href="decisoes/0008-gate-humano-aprovacao-manual.md">ADR-0008</a>). <em>(Pequenas diferenças de valores entre execuções são esperadas — o SITL não é determinístico; cada run regenera o <code>.ulg</code>.)</em></sub>
</div>

<div align="center">
  <img src="../img/pipeline-cd-main-v0.3.0.png" alt="Pipeline de CD no merge develop para main (release v0.3.0), com os gates manuais de produção"><br>
  <sub><strong>Figura 3 — CD em produção</strong> (merge <code>develop → main</code>, commit <code>0b63bde5</code>, release <strong>v0.3.0</strong>): os seis stages automáticos concluem com sucesso, incluindo o <strong>quality gate bloqueante</strong> e o <code>deploy_staging</code>. O estado <em>Blocked</em> <strong>não é falha</strong>: <code>deploy_prod</code> (e o gate humano) são <strong>manuais</strong> — a promoção a produção exige aprovação humana explícita ("quem aperta o botão"). Contraste com a Figura 1: no MR o gate humano é opcional e o pipeline passa; em <code>main</code> o deploy de produção bloqueia até a aprovação. Semgrep/Trivy em amarelo são achados informativos (<code>allow_failure</code>; bloqueantes nas Sprints 4-5, <a href="decisoes/0007-sast-semgrep.md">ADR-0007</a>).</sub>
</div>

### 8.1.2 🎯 Meta / PROJETADO para sprints futuras (NÃO medido nesta sprint)

Os indicadores abaixo **não foram medidos** na Sprint 3: dependem de instrumentação ou de insumos de produção que ainda não existem no escopo do protótipo. Permanecem como **meta projetada** explícita — **nenhum** valor desta tabela deve ser lido como resultado obtido.

| Indicador (projetado) | Meta | Por que não foi medido nesta sprint |
| :--- | :--- | :--- |
| **Análise de log `.ulg` de voo real de produção** | < 10 min (AS-IS Jacto: 48–72 h) | A Sprint 3 mede a missão SITL `square_50m` (caso pedagógico reproduzível), **não** o `.ulg` de um voo real da Jacto. A meta de produção segue projetada. |
| **Sincronização de tokens** | < 30 s | Fluxo não instrumentado nesta sprint — sem coleta de tempo. |
| **MTTR (Mean Time To Restore)** | < 1 h (alvo DORA elite) | Não houve incidente em `main` na Sprint 3, logo **não há evento para medir** (ver CFR `main` 0% em §8.1.1). |

> **Separação medido × projetado:** esta subseção existe para não confundir o avaliador. Tudo em §8.1.1 é **medido** no pipeline `#30535`; tudo em §8.1.2 é **meta** a ser confirmada por medição em sprints futuras (eixo de produção: voo real, tokens, incidentes).

## 8.2 Diagnóstico de Processo (Qualitativo)

O texto abaixo é **aderente** às tabelas de §8.1: descreve como "medido" apenas o que roda de fato no pipeline `#30535`, e marca explicitamente como "projetado" o que ainda é meta.

### Centralização de Governança

**Medido:** a unificação no GitLab substituiu, no escopo do protótipo, o fluxo fragmentado entre ferramentas isoladas (Notion/Jira/Word) — toda a esteira (código, CI/CD, MRs, métricas) vive num único projeto (`10705`). Os dashboards QoS/QoP/Gerencial passaram a consumir **dados reais do pipeline** (Camada 1 da Sprint 3, ver [`dashboard-implementation-report.md`](dashboard-implementation-report.md)), e não mais mocks: a visualização de saúde do projeto é gerada a partir do `reports/metrics.json` e da coleta DORA, sem extração manual.

### Fechamento de Malha (Sensores)

**Medido (roda de fato):** a missão SITL `square_50m` é executada de fato a cada pipeline — o firmware PX4 voa em simulação *headless*, gera o `.ulg`, e o [`scripts/extract_metrics.py`](../scripts/extract_metrics.py) produz o `reports/metrics.json` que alimenta os testes de invariantes e baseline (`tests/sitl`). Sobre essas métricas, o job `quality-gates` ([`scripts/quality_gates.py`](../scripts/quality_gates.py)) é **bloqueante**: sem `allow_failure`, um pipeline que viole qualquer dos 5 gates falha e **impede o merge** de fato — esse é o "sensor" da malha fechada que opera hoje, substituindo a subjetividade da inspeção manual por critérios versionados em [`quality_gates.yaml`](../quality_gates.yaml) ([ADR-0005](decisoes/0005-thresholds-quality-gates.md)).

**Projetado (ainda meta):** a validação automática do `.ulg` de **voo real de produção** (gates de vibração e de defasagem comando×atuação — caso de queda relatado pela Jacto, TAPI B.5) ainda **não** está instrumentada sobre logs reais; os critérios estão formalizados em [ADR-0003](decisoes/0003-criterios-aprovacao-log-sitl.md) e exercitados sobre o caso pedagógico `square_50m`, mas a aplicação ao voo real da Jacto segue como meta (ver §8.1.2). Da mesma forma, o gate de SAST roda em modo *skip* nesta sprint (`require_passed: false` em [`quality_gates.yaml`](../quality_gates.yaml)); torná-lo bloqueante é próximo passo do eixo integridade ([ADR-0007](decisoes/0007-sast-semgrep.md), ver [`melhoria-projeto.md`](melhoria-projeto.md)).

## 8.3 Tabela de Fontes e Auditabilidade

Cada afirmação quantitativa de §8.1 tem fonte auditável no entorno imediato (commit, MR, job de pipeline ou artefato versionado). As fontes da **Sprint 3** abaixo são as que sustentam os números medidos.

| Documento/Evento | Referência Técnica (auditável) | Data |
| :--- | :--- | :--- |
| **Requisitos Iniciais** | TAPI_ESMD10_V01.pdf (Reginaldo Arakaki)<a href="#ref7"><sup>[7]</sup></a> | 14/05/2026 |
| **Validação Stakeholder** | Sprint Review (Vinícius Lopes — Jacto) | 30/04/2026 |
| **Métricas de missão (medidas)** | Pipeline `#30535` (`develop` @ `c967ad6`, VERDE) + pipeline `#30154`; artefato `reports/metrics.json` do job `sitl-mission-metrics` ([`ci/sitl-metrics.yml`](../ci/sitl-metrics.yml)) | Sprint 3 |
| **Veredito dos quality gates (5/5)** | Job `quality-gates` BLOQUEANTE — [`scripts/quality_gates.py`](../scripts/quality_gates.py) + thresholds em [`quality_gates.yaml`](../quality_gates.yaml) ([ADR-0005](decisoes/0005-thresholds-quality-gates.md)) | Sprint 3 |
| **Cobertura 98% (`libs/`)** | `pytest --cov` em `tests/unit`; gate ratchet ≥ 0,90 ([`quality_gates.yaml`](../quality_gates.yaml)) | Sprint 3 |
| **DORA medido** | Coleta via API GitLab (projeto `10705`) — [`scripts/collect_gitlab_metrics.py`](../scripts/collect_gitlab_metrics.py); 21 MRs *merged* | Sprint 3 |
| **Deploy simulado (staging)** | Job de deploy ([`ci/deploy.yml`](../ci/deploy.yml)); artefato imutável por `$CI_COMMIT_SHA`, sem Container Registry ([ADR-0006](decisoes/0006-promocao-sem-registry.md)) | Sprint 3 |
| **Camada 1 da Sprint 3 (código que sustenta o pipeline)** | MRs `!25`–`!28` (esteira real): deploy/CD (commit `b847a13`), SITL + métricas + testes (`7055b80`), quality gates (`b441a72`), dashboards QoP/QoS com dados reais (`2a523b6`, `69d8949`), SAST/integridade (`c967ad6`) | Sprint 3 |
| **Dashboards com dados reais** | [`dashboard-implementation-report.md`](dashboard-implementation-report.md); fonte `reports/metrics.json` + coleta DORA (substituem mocks) | Sprint 3 |
