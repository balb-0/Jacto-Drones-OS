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

# 1. Introdução
O projeto Jacto Drones OS v0.1 visa estabelecer uma infraestrutura de Continuous Delivery para suportar o desenvolvimento de sistemas autônomos. Este documento detalha a arquitetura, processos e ferramentas que compõem o ecossistema de engenharia da solução.

# 2. Descrição do Problema
A fragmentação entre as frentes de firmware, serviços e dados na Jacto Drones gera falta de cadência, rituais não padronizados e ausência de um pipeline de integração contínua unificado.

# 3. Objetivos
- **Geral:** Desenvolver um protótipo funcional de um sistema de CD (Continuous Delivery) para software de drones.
- **Específicos:**
  - Padronizar o workflow de desenvolvimento.
  - Implementar automação de tarefas de gestão.
  - Configurar pipeline de CI/CD via GitHub/GitLab.
  - Monitorar métricas operacionais (DORA).

# 4. Arquitetura do Produto (ISO 10746)

Esta seção descreve a arquitetura da esteira de Continuous Delivery do Jacto Drones OS v0.1 utilizando os pontos de vista (Viewpoints) estabelecidos pela norma ISO/IEC 10746 (RM-ODP - Reference Model of Open Distributed Processing)<a id="ref1-link" href="#ref1"><sup>[1]</sup></a>.

## 4.1 Visão de Tecnologia (Technology Viewpoint)
A Visão de Tecnologia especifica as ferramentas e padrões técnicos escolhidos para implementar o sistema, garantindo a integração entre o ecossistema de hardware (drones) e os serviços em nuvem:
- **Repositório e CI/CD:** GitLab (GitLab CI/CD e Container Registry).
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

- **Performance do Pipeline (Time to Feedback):** A execução completa da esteira (do linting até a finalização dos testes SITL no PX4) não deve ultrapassar **15 minutos**. Este limite baseia-se nas práticas e pesquisas reportadas pela DORA (DevOps Research and Assessment) e na literatura de engenharia de software (como o livro *Accelerate*)<a id="ref3-link" href="#ref3"><sup>[3]</sup></a>, que demonstram que pipelines que excedem o intervalo de 10 a 15 minutos forçam a quebra de fluxo de trabalho e a troca de contexto mental (*context switching*) do desenvolvedor, o que degrada drasticamente a produtividade da equipe e a eficiência da resposta da malha fechada.
- **Disponibilidade (SLA):** A infraestrutura de CI/CD (GitLab e Runners) deve garantir um SLA de **99.9% de uptime** durante o horário comercial, assegurando que gargalos de infraestrutura não travem entregas críticas (como hotfixes de firmware).
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
- **Deploy:** Promoção automatizada para ambientes de staging e, mediante aprovação manual, para produção. O deploy utiliza imagens imutáveis do Container Registry do GitLab.

A execução de cada job ocorre dentro de contêineres Docker efêmeros, orquestrados por **GitLab Runners**. Essa abordagem garante isolamento total entre builds, eliminando conflitos de dependência e assegurando reprodutibilidade. O tempo total de execução da esteira é monitorado conforme o requisito não funcional de <15 minutos estabelecido na seção 4.4.

## 5.2 Testes Funcionais
Os testes funcionais validam o comportamento do firmware e dos serviços de missão sob condições que simulam cenários reais de voo. A pilha de validação baseia-se no ecossistema **Dronecode Foundation**, em especial no **PX4 Autopilot** e no protocolo **MAVLink**<a id="ref2-link" href="#ref2"><sup>[2]</sup></a><a id="ref5-link" href="#ref5"><sup>[5]</sup></a>.

- **PX4 SITL (Software In The Loop):** O firmware PX4 é executado em um simulador de voo (Gazebo ou jMAVSim) dentro de um contêiner Docker no pipeline. Missões de teste são carregadas automaticamente, e o comportamento do drone é monitorado em tempo simulado. Cenários cobertos incluem decolagem, navegação por waypoints, pouso e rotinas de contingência (*failsafe*).
- **PX4 HITL (Hardware In The Loop):** Para validações que exigem interação com hardware real, o pipeline dispara jobs em runners dedicados conectados a controladores de voo Pixhawk. Esse stage é executado sob demanda em branches de release, garantindo que o código compilado se comporte corretamente no hardware de produção.
- **Validação de Protocolo MAVLink:** Testes automatizados verificam a conformidade das mensagens trocadas entre o autopilot e a estação de controle. São validados comandos de missão (`MAV_CMD_NAV_WAYPOINT`), parâmetros de voo e telemetria de estado, assegurando interoperabilidade com o QGroundControl e outras GCS.
- **Validação de Missão:** Scripts de teste orquestram missões completas (planejamento de waypoints, execução de comandos de voo, verificação de restrições geográficas) e comparam os logs de voo simulado contra os critérios de aceitação definidos no Jira.

## 5.3 Testes Não-Funcionais
Os testes não-funcionais garantem que a esteira e os artefatos gerados atendam aos requisitos de segurança, performance e conformidade regulatória.

- **SAST (Static Application Security Testing):** Ferramentas de análise estática (como Semgrep, CodeQL e Trivy) são executadas em todos os repositórios. O escaneamento cobre o código-fonte C/C++ do firmware, scripts de pipeline e imagens de contêiner. Vulnerabilidades classificadas como Críticas ou Altas bloqueiam a promoção do artefato, conforme definido na seção 4.4.
- **Gates de Performance:** O tempo de execução de cada stage é medido e comparado contra thresholds definidos. O stage de testes SITL deve concluir em menos de 10 minutos, e o pipeline completo em menos de 15 minutos. Execuções que excedam esses limites geram alertas para o time de infraestrutura.
- **Escaneamento de Artefatos:** Antes do empacotamento, binários de firmware e imagens Docker passam por escaneamento de vulnerabilidades em dependências. Para imagens Docker, é gerado um relatório de camadas e pacotes vulneráveis.
- **Assinatura Digital:** Todo artefato promovido para staging ou produção é assinado digitalmente com chaves GPG armazenadas no GitLab CI/CD Vault. A assinatura garante a integridade do artefato e protege contra adulterações na cadeia de suprimentos (*supply chain security*), em conformidade com os requisitos da ISO/IEC 27001:2022<a id="ref5-link" href="#ref5"><sup>[5]</sup></a>.

## 5.4 Rastreabilidade Técnica
A rastreabilidade end-to-end é um diferencial crítico do Jacto Drones OS v0.1, permitindo auditar qualquer demanda desde sua concepção até o deploy em produção. A cadeia de rastreabilidade opera conforme descrito no documento de mapeamento do ambiente<a id="ref4-link" href="#ref4"><sup>[4]</sup></a>:

1. **Notion (Requisitos e Contexto):** A necessidade de negócio é documentada no Notion, vinculada a uma demanda estratégica.
2. **Jira (Épicos e Histórias):** O requisito é convertido em uma história no Jira, recebendo uma chave identificadora única (ex.: `JACTO-456`).
3. **GitHub (Código e Pull Requests):** O desenvolvedor cria uma branch e abre um PR contendo a chave `JACTO-456` no título. Cada commit também carrega essa chave.
4. **GitLab CI/CD (Build, Teste e Deploy):** O espelhamento do repositório dispara o pipeline. O status de cada job é reportado ao GitHub.
5. **Jira (Deploy e Releases):** Ao concluir um deploy, o pipeline atualiza a issue no Jira, registrando a versão implantada e o ambiente.
6. **Notion (Documentação e Artefatos):** O artefato gerado é catalogado no Notion, fechando o ciclo.

Para viabilizar essa cadeia, adota-se:

- **Smart Commits:** Mensagens de commit que incluem a chave do Jira são automaticamente vinculadas à respectiva história. Comandos adicionais permitem transicionar o status da issue (ex.: `JACTO-123 #close #comment Implementado controle de PID`).
- **Política de Branching:** Todo pull request deve conter a chave da issue do Jira no título ou na descrição. Commits sem chave de rastreamento são sinalizados em revisão.
- **App GitHub for Atlassian:** Sincroniza commits, pull requests e deployments para o Jira, criando abas de "Desenvolvimento" dentro de cada issue.

## 5.5 Infraestrutura de Execução
A execução do pipeline depende de uma infraestrutura escalável e segura de runners e registro de artefatos.

- **GitLab Runners:** Os jobs são executados por runners que podem ser auto-hospedados (*self-hosted*) na infraestrutura da Jacto ou provisionados em nuvem (AWS EC2, GCP Compute Engine). Runners auto-hospedados são recomendados para jobs de HITL, pois exigem acesso físico a hardware de voo.
- **Docker-in-Docker (DinD):** Para builds que necessitam construir imagens Docker dentro do pipeline (como os serviços de plataforma), utiliza-se a modalidade Docker-in-Docker. Cada execução recebe um daemon Docker isolado, garantindo que caches e camadas de imagem não vazem entre builds concorrentes.
- **Container Registry:** O GitLab Container Registry armazena as imagens Docker versionadas e assinadas. Cada imagem é tagueada com o hash do commit e a versão SemVer, permitindo rollback imediato.
- **Armazenamento de Artefatos:** Binários de firmware, relatórios de teste e SBOMs são armazenados como artefatos do GitLab CI/CD com retenção configurada. Artefatos de releases são promovidos para um bucket de armazenamento de longo prazo (S3 ou equivalente) para auditoria regulatória.

## 5.6 Mapa de Cobertura de Funcionalidades
O Mapa de Cobertura de Funcionalidades consolida, em forma de matriz de rastreabilidade, quais componentes do ecossistema Jacto Drones (firmware embarcado, plataforma de serviços e sistemas de dados) são versionados em repositório Git e exercitados pelo pipeline de integração contínua descrito em §5.1. A organização por frente segue o panorama tecnológico documentado no mapeamento do ambiente Jacto<a href="#ref4"><sup>[4]</sup></a>, e o caso pedagógico Dronecode é utilizado como ambiente de validação realista do fluxo de CI/CD, conforme previsto no Termo de Abertura de Projeto Inteli (TAPI) — ESMD10<a id="ref7-link" href="#ref7"><sup>[7]</sup></a>. A estruturação do pipeline em estágios sequenciais com gates de qualidade segue as práticas consagradas por Humble e Farley em *Continuous Delivery*<a id="ref8-link" href="#ref8"><sup>[8]</sup></a>.

**Tabela 1 — Cobertura por frente, repositório e build automatizado**

| Frente | Componente | Repositório Git | Build automatizado | Stage(s) do pipeline | Caso pedagógico Dronecode |
| --- | --- | --- | --- | --- | --- |
| Firmware embarcado | PX4 Autopilot (controle de voo) | `jacto-drones/px4-firmware` (fork PX4-Autopilot) | Cross-compile ARM Cortex-M + x86_64 SITL | Lint → Build → Test (SITL) | PX4 v1.14 (Dronecode)<a href="#ref2"><sup>[2]</sup></a> |
| Firmware embarcado | Protocolo MAVLink | submódulo `mavlink/mavlink` | Geração de stubs C/Python | Build | MAVLink v2<a id="ref9-link" href="#ref9"><sup>[9]</sup></a> |
| Firmware embarcado | QGroundControl (GCS de validação) | `jacto-drones/qgc-tests` | Empacotamento Qt para teste de comandos | Test (integração) | QGroundControl v4.x<a id="ref10-link" href="#ref10"><sup>[10]</sup></a> |
| Plataforma de clientes | Serviço de Missão (planejamento) | `jacto-drones/mission-service` | Imagem Docker multi-arch | Build → Test → Package | — |
| Plataforma de clientes | Frontend de operação | `jacto-drones/ops-web` | Vite + ESLint + Docker | Lint → Build → Test | — |
| Sistema de dados | Pipeline de telemetria | `jacto-drones/telemetry-ingest` | Docker + workers Python | Build → Test → SAST | — |
| Sistema de dados | Dashboard DORA / Cycle Time | `jacto-drones/devops-dashboard` | Docker Compose | Build → Deploy (staging) | — |

> **Nota:** os repositórios listados são placeholders previstos no plano de gestão de configuração e serão materializados ao longo das sprints. À medida que cada repositório é criado, esta tabela deve ser atualizada com a URL definitiva no GitLab e a chave Jira do épico associado.

**Tabela 2 — Rastreio de funcionalidades pedagógicas (validação Dronecode)**

| Funcionalidade do MVP | Cenário de validação | Stage que valida | Critério de aceitação |
| --- | --- | --- | --- |
| Decolagem autônoma | PX4 SITL com `MAV_CMD_NAV_TAKEOFF` | Test (SITL) | Altitude alvo ±0.5 m em <30 s simulados<a id="ref11-link" href="#ref11"><sup>[11]</sup></a> |
| Navegação por waypoints | Missão multi-waypoint em Gazebo | Test (SITL) | Todos os waypoints atingidos sem desvio >2 m<a href="#ref11"><sup>[11]</sup></a> |
| Pouso e failsafe | Cenário de perda de RC | Test (SITL) | Pouso seguro em <60 s |
| Conformidade MAVLink | Suite de mensagens `MAV_CMD` | Test (integração) | 100% das mensagens críticas validadas<a href="#ref9"><sup>[9]</sup></a> |
| Promoção de artefato | Tag SemVer em branch de release | Package → Deploy | Imagem assinada e SBOM gerado<a id="ref12-link" href="#ref12"><sup>[12]</sup></a> |

Cada linha das tabelas acima compõe um elo na cadeia de Controle em Malha Fechada descrita em §4.3: a chave Jira (`JACTO-XXX`) associada ao épico ou história alimenta o pipeline via Smart Commits (§5.4), e o resultado do stage de validação é realimentado para o Jira e o Notion, fechando a rastreabilidade fim a fim exigida pela norma ISO/IEC 12207:2017<a href="#ref5"><sup>[5]</sup></a>.

## 5.7 Mapa de Cobertura de Não Funcionalidades
Como o software produzido pelo Jacto Drones OS v0.1 dará suporte a sistemas autônomos e críticos, o pipeline incorpora análises não funcionais obrigatórias em diferentes stages. Esta seção consolida em forma matricial os controles de **padronização de formatação (linting)**, **análise estática de código (SAST)**, **segurança de dependências e containers**, **tempo de execução do build** e **integridade de artefato**, exigidos como entrega do caso pedagógico no TAPI<a href="#ref7"><sup>[7]</sup></a> e referenciados nos requisitos não funcionais de §4.4. As categorias de qualidade exercitadas correspondem aos atributos definidos pela ISO/IEC 25010:2023<a id="ref13-link" href="#ref13"><sup>[13]</sup></a>, e os controles de segurança seguem a ISO/IEC 27001:2022<a id="ref14-link" href="#ref14"><sup>[14]</sup></a> e o *Secure Software Development Framework* (NIST SP 800-218)<a id="ref15-link" href="#ref15"><sup>[15]</sup></a>.

**Tabela 3 — Cobertura de análises não funcionais por categoria**

| Categoria NF | Ferramenta | Onde atua (frente) | Stage do pipeline | Gate / threshold | Norma de referência |
| --- | --- | --- | --- | --- | --- |
| Padronização de formatação (lint) | clang-tidy + Google C++ Style<a id="ref16-link" href="#ref16"><sup>[16]</sup></a> | Firmware (PX4) | Lint | 0 warnings críticos | ISO/IEC 25010 (manutenibilidade)<a href="#ref13"><sup>[13]</sup></a> |
| Padronização de formatação (lint) | ESLint<a id="ref17-link" href="#ref17"><sup>[17]</sup></a> | Plataforma de clientes (web) | Lint | 0 erros, warnings sob revisão | ISO/IEC 25010<a href="#ref13"><sup>[13]</sup></a> |
| Análise estática de segurança (SAST) | Semgrep<a id="ref18-link" href="#ref18"><sup>[18]</sup></a> | Todos os repositórios | SAST | 0 vulnerabilidades Críticas/Altas | ISO/IEC 27001:2022<a href="#ref14"><sup>[14]</sup></a> |
| Análise estática de segurança (SAST) | CodeQL<a id="ref19-link" href="#ref19"><sup>[19]</sup></a> | Firmware C/C++ + serviços | SAST | 0 vulnerabilidades Críticas/Altas | DO-178C (rastreio de defeitos)<a id="ref20-link" href="#ref20"><sup>[20]</sup></a> |
| Segurança de dependências / containers | Trivy<a id="ref21-link" href="#ref21"><sup>[21]</sup></a> | Imagens Docker e SBOM | SAST → Package | Bloqueio em CVE Crítico/Alto | ISO/IEC 27001<a href="#ref14"><sup>[14]</sup></a>, NIST SSDF<a href="#ref15"><sup>[15]</sup></a> |
| Tempo de execução da esteira | Métricas nativas do GitLab CI/CD | Pipeline completo | Todos | Pipeline <15 min; SITL <10 min | DORA (Lead Time)<a id="ref3-link" href="#ref3"><sup>[3]</sup></a> |
| Integridade de artefato | Assinatura GPG + SBOM | Binários e imagens | Package | Toda promoção assinada | ISO/IEC 27001<a href="#ref14"><sup>[14]</sup></a>, supply chain<a href="#ref15"><sup>[15]</sup></a> |
| Disponibilidade da esteira | Monitoramento de GitLab Runners | Infra de CI/CD | Observabilidade contínua | 99.9% uptime no horário comercial | DORA (MTTR)<a href="#ref6"><sup>[6]</sup></a> |

**Tabela 4 — Cobertura cruzada por frente do ecossistema**

| Frente | Lint | SAST (código) | SCA (dependências) | Performance | Assinatura |
| --- | --- | --- | --- | --- | --- |
| Firmware embarcado | clang-tidy | CodeQL / Semgrep | Trivy (toolchain) | <10 min SITL | GPG firmware |
| Plataforma de clientes | ESLint | Semgrep | Trivy (imagens) | <15 min pipeline | GPG imagens |
| Sistema de dados | Semgrep | Semgrep / CodeQL | Trivy | <15 min pipeline | GPG imagens |

Cada gate da Tabela 3 funciona como um *sensor* da malha fechada (§4.3): a violação de qualquer threshold interrompe a promoção do artefato e realimenta o time com logs e alertas, sem intervenção manual. A combinação de cobertura por categoria (Tabela 3) e por frente (Tabela 4) garante que os atributos de qualidade exigidos pela ISO/IEC 25010:2023 (manutenibilidade, segurança, performance)<a href="#ref13"><sup>[13]</sup></a> e pela ISO/IEC 27001:2022 (segurança de dependências e supply chain)<a href="#ref14"><sup>[14]</sup></a> sejam exercitados em todos os componentes versionados. Para o firmware embarcado, a aderência aos princípios de segurança de software aeronáutico do DO-178C<a href="#ref20"><sup>[20]</sup></a> e às boas práticas do NIST SSDF<a href="#ref15"><sup>[15]</sup></a> reforça o rigor exigido para sistemas autônomos críticos, conforme detalhamento das normas em [docs/referencias/normas-engenharia.md](referencias/normas-engenharia.md)<a href="#ref5"><sup>[5]</sup></a>.

# 6. Requisitos SCM

## 6.1 Políticas de Integração
O controle de versão do Jacto Drones OS v0.1 adota a estratégia **Gitflow** como modelo de branching, garantindo isolamento entre desenvolvimento ativo, preparação de release e correções urgentes.

As branches principais são:

- **`main`:** Branch de produção. Contém apenas código estável e artefatos validados. Todos os commits na `main` devem estar associados a uma tag de versão.
- **`develop`:** Branch de integração contínua. Recebe merges de features concluídas e serve como base para testes de regressão e validação em ambiente de staging.
- **`feature/*`:** Branches de desenvolvimento de funcionalidades. Criadas a partir da `develop` e mergeadas de volta via pull request. O nome deve incluir a chave do Jira (ex.: `feature/JACTO-456-controle-pid`).
- **`release/*`:** Branches de preparação de release. Criadas a partir da `develop` quando o conjunto de funcionalidades está congelado. Apenas correções de bug e ajustes de documentação são permitidos.
- **`hotfix/*`:** Branches de correção urgente em produção. Criadas a partir da `main` e mergeadas tanto para `main` quanto para `develop` após validação.

As seguintes proteções são obrigatórias em todas as branches persistentes (`main` e `develop`):

- **Revisão de Código Obrigatória:** Todo pull request exige aprovação de pelo menos um revisor que não seja o autor. Revisões devem verificar lógica, testes, documentação e conformidade com os padrões do projeto.
- **CI Passing:** O pipeline GitLab CI/CD deve concluir com sucesso antes que o merge seja permitido. Falhas em qualquer stage bloqueiam o botão de merge.
- **Sem Conflitos:** O branch de origem deve estar atualizado em relação ao destino. Conflitos de merge devem ser resolvidos localmente antes da abertura ou atualização do PR.
- **Assinatura de Commits:** Recomenda-se o uso de commits assinados com GPG para garantir a autoria e integridade do histórico.

## 6.2 Fluxo de Promoção
O fluxo de promoção de código define o caminho que uma alteração percorre desde o desenvolvimento local até a produção, com gates de qualidade em cada estágio.

1. **Desenvolvimento em Feature Branch:** O desenvolvedor cria um branch `feature/*` a partir da `develop`, vinculado a uma história do Jira. Commits seguem a especificação Conventional Commits.
2. **Pull Request para `develop`:** Ao concluir a implementação, abre-se um PR para a `develop`. O PR dispara o pipeline de CI/CD (lint, build, testes unitários, SAST).
3. **Validação de CI e Revisão:** O pipeline deve passar e o PR deve receber aprovação de pelo menos um revisor. Somente então o merge é permitido.
4. **Integração na `develop`:** Após o merge, o pipeline de integração executa testes de regressão completos, incluindo SITL. A `develop` reflete o estado mais atual do sistema.
5. **Branch de Release:** Quando o conjunto de funcionalidades está estável, cria-se um branch `release/vX.Y.Z` a partir da `develop`. Nesse branch, são executados testes HITL e validações de aceitação final.
6. **Deploy para Staging:** O artefato gerado no branch de release é automaticamente implantado no ambiente de staging. Testes de smoke e validação de missão são executados.
7. **Merge para `main` e Tag:** Após validação em staging, o release branch é mergeado para `main` e uma tag SemVer é criada. O artefato é assinado e promovido para o Registry.
8. **Deploy para Produção:** O deploy em produção requer aprovação manual (gate de *change advisory board* ou aprovação do tech lead). O artefato implantado é exatamente o mesmo validado em staging, sem reconstrução.

Cada estágio funciona como um filtro. Falhas em qualquer gate retornam o código para correção, fechando a malha de feedback descrita na seção 4.3.

## 6.3 Versionamento Semântico
O versionamento de artefatos do Jacto Drones OS v0.1 segue o padrão **SemVer** (*Semantic Versioning*), aplicado tanto aos binários de firmware quanto às imagens Docker dos serviços de plataforma. O formato é:

**MAJOR.MINOR.PATCH**

- **MAJOR:** Incrementado quando há mudanças incompatíveis na API, protocolo de comunicação ou interface de hardware. Exige atualização de documentação regulatória e testes de regressão completos.
- **MINOR:** Incrementado quando novas funcionalidades são adicionadas de forma compatível. Inclui novos modos de voo, melhorias de telemetria ou novos endpoints de API.
- **PATCH:** Incrementado para correções de bugs, ajustes de parâmetros de voo ou atualizações de segurança que não alteram a API.

O versionamento é disparado automaticamente pelo pipeline a partir da análise de mensagens de commit no formato **Conventional Commits**. Commits do tipo `feat:` geram incremento de MINOR; `fix:` geram incremento de PATCH; e a presença de `BREAKING CHANGE:` no corpo da mensagem gera incremento de MAJOR. A ferramenta `semantic-release` ou equivalente é configurada no pipeline para calcular a nova versão, gerar o changelog e criar a tag no GitHub.

## 6.4 Indicadores de Performance
A medição contínua da performance de entrega é essencial para identificar gargalos e orientar melhorias na esteira. O Jacto Drones OS v0.1 adota um conjunto integrado de métricas que combinam indicadores de fluxo (Cycle Time e Lead Time) com as métricas DORA (*DevOps Research and Assessment*)<a id="ref3-link" href="#ref3"><sup>[3]</sup></a><a id="ref6-link" href="#ref6"><sup>[6]</sup></a>.

- **Cycle Time:** Tempo decorrido entre o início do trabalho em uma história (quando o card entra em progresso no Jira) e a conclusão do PR mergeado na `develop`. Indica a eficiência do processo de desenvolvimento e revisão.
- **Lead Time:** Tempo total entre a criação da demanda no Jira (ou Notion) e a disponibilização da funcionalidade em produção. Engloba não apenas o desenvolvimento, mas também os estágios de teste, homologação e deploy.
- **Deployment Frequency (Frequência de Deploy):** Número de deploys para produção por semana ou por mês. Medido a partir dos eventos de deploy registrados no GitLab CI/CD. Alta frequência indica capacidade de entregar valor de forma contínua.
- **Lead Time for Changes (Tempo de Espera de Mudanças):** Tempo entre o primeiro commit de uma funcionalidade e seu deploy em produção. Calculado a partir dos timestamps de commits no GitHub e dos eventos de deploy no GitLab.
- **Change Failure Rate (Taxa de Falha de Mudança):** Percentual de deploys que resultam em incidentes, bugs críticos ou rollback. Requer correlação entre deploys e tickets de bug abertos no Jira nas 24 horas seguintes à entrega.
- **Mean Time To Recovery (MTTR - Tempo Médio de Recuperação):** Tempo médio para restaurar o serviço ou corrigir um firmware defeituoso após uma falha em produção. Medido a partir da abertura de um incidente no Jira até o registro de sua resolução.

A coleta dessas métricas é realizada de forma manual inicialmente (via planilhas e timestamps de commits), com meta de automatização completa através do GitLab DORA ou Datadog no segundo semestre de operação.

## 6.5 Definição de Pronto (Definition of Done)
Uma funcionalidade só é considerada concluída no Jacto Drones OS v0.1 quando atende a todos os critérios da **Definição de Pronto** (DoD). Essa lista garante que o trabalho entregue possa ser rastreado, auditado e implantado com confiança:

- **Código Revisado:** O pull request foi aprovado por pelo menos um revisor, com todos os comentários resolvidos.
- **Testes Passando:** Todos os testes unitários, de integração, SITL e SAST do pipeline concluíram com sucesso.
- **SAST Limpo:** Nenhuma vulnerabilidade Crítica ou Alta permanece sem tratamento ou exceção documentada.
- **Documentação Atualizada:** O README do repositório, a documentação técnica no Confluence e as notas de release foram atualizados para refletir a mudança.
- **Issue do Jira Fechada:** A história ou tarefa do Jira vinculada foi movida para o status "Concluído" ou equivalente, com links para o PR e o pipeline.
- **Deploy em Staging:** O artefato foi implantado com sucesso no ambiente de staging e passou nos testes de smoke.
- **Rastreabilidade Completa:** A cadeia Notion → Jira → GitHub → GitLab está intacta e verificável, com a chave da issue presente em commits e PRs.

Somente após o cumprimento integral desses critérios a funcionalidade é elegível para promoção à produção.

# 7. Referências

<a id="ref1"></a>[1] ISO/IEC. (1998). *ISO/IEC 10746-1:1998 - Information technology — Open Distributed Processing — Reference model: Overview*. <a href="#ref1-link">↩</a>

<a id="ref2"></a>[2] Dronecode Foundation. *PX4 Autopilot User Guide and MAVLink Developer Guide*. Disponível em: https://docs.px4.io/ <a href="#ref2-link">↩</a>

<a id="ref3"></a>[3] Forsgren, N., Humble, J., & Kim, G. (2018). *Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations*. IT Revolution Press. <a href="#ref3-link">↩</a>

<a id="ref4"></a>[4] G04 — Inteli. (2026). *Mapeamento do Ambiente Jacto — Jacto Drones OS v0.1*. Disponível em: `docs/referencias/mapeamento-ambiente-jacto.md` <a href="#ref4-link">↩</a>

<a id="ref5"></a>[5] G04 — Inteli. (2026). *Normas de Engenharia e Referências Técnicas — Jacto Drones OS v0.1*. Disponível em: `docs/referencias/normas-engenharia.md` <a href="#ref5-link">↩</a>

<a id="ref6"></a>[6] Google Cloud. *DORA Core Model*. DevOps Research and Assessment. Disponível em: https://dora.dev/research/ <a href="#ref6-link">↩</a>

<a id="ref7"></a>[7] JACTO Máquinas Agrícolas S/A & Inteli. (2026). *Termo de Abertura de Projeto Inteli (TAPI) — ESMD10: Esteira Ágil de Produção de Software — Jacto Drones Operating System v0.1*. Documento de projeto parceiro, módulo ESMD10. <a href="#ref7-link">↩</a>

<a id="ref8"></a>[8] Humble, J., & Farley, D. (2010). *Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation*. Addison-Wesley. <a href="#ref8-link">↩</a>

<a id="ref9"></a>[9] Dronecode Foundation. *MAVLink Developer Guide — Messages, Microservices and Protocol Specification*. Disponível em: https://mavlink.io/en/ <a href="#ref9-link">↩</a>

<a id="ref10"></a>[10] Dronecode Foundation. *QGroundControl User Guide*. Disponível em: https://docs.qgroundcontrol.com/ <a href="#ref10-link">↩</a>

<a id="ref11"></a>[11] PX4 Development Team. *PX4 Autopilot — Software in the Loop (SITL) Simulation Guide*. Disponível em: https://docs.px4.io/main/en/simulation/ <a href="#ref11-link">↩</a>

<a id="ref12"></a>[12] Linux Foundation. *SPDX Specification v2.3 — Software Package Data Exchange*. ISO/IEC 5962:2021. Disponível em: https://spdx.dev/ <a href="#ref12-link">↩</a>

<a id="ref13"></a>[13] ISO/IEC. (2023). *ISO/IEC 25010:2023 — Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model*. International Organization for Standardization. <a href="#ref13-link">↩</a>

<a id="ref14"></a>[14] ISO/IEC. (2022). *ISO/IEC 27001:2022 — Information security, cybersecurity and privacy protection — Information security management systems — Requirements*. International Organization for Standardization. <a href="#ref14-link">↩</a>

<a id="ref15"></a>[15] Souppaya, M., Scarfone, K., & Dodson, D. (2022). *NIST Special Publication 800-218: Secure Software Development Framework (SSDF) Version 1.1 — Recommendations for Mitigating the Risk of Software Vulnerabilities*. National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800-218 <a href="#ref15-link">↩</a>

<a id="ref16"></a>[16] LLVM Project. *clang-tidy — Clang-based C++ "linter" tool*. Disponível em: https://clang.llvm.org/extra/clang-tidy/ <a href="#ref16-link">↩</a>

<a id="ref17"></a>[17] OpenJS Foundation. *ESLint — Pluggable JavaScript and TypeScript Linter*. Disponível em: https://eslint.org/docs/latest/ <a href="#ref17-link">↩</a>

<a id="ref18"></a>[18] Semgrep, Inc. *Semgrep — Static Analysis at Ludicrous Speed*. Disponível em: https://semgrep.dev/docs/ <a href="#ref18-link">↩</a>

<a id="ref19"></a>[19] GitHub, Inc. *CodeQL Documentation — Semantic Code Analysis Engine*. Disponível em: https://codeql.github.com/docs/ <a href="#ref19-link">↩</a>

<a id="ref20"></a>[20] RTCA. (2011). *DO-178C — Software Considerations in Airborne Systems and Equipment Certification*. Radio Technical Commission for Aeronautics, em conjunto com EUROCAE ED-12C. <a href="#ref20-link">↩</a>

<a id="ref21"></a>[21] Aqua Security. *Trivy — Comprehensive and Versatile Security Scanner for Containers, Filesystems and IaC*. Disponível em: https://aquasecurity.github.io/trivy/ <a href="#ref21-link">↩</a>
