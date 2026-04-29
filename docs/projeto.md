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
  - [5.1 Plano de Testes Funcionais](#51-plano-de-testes-funcionais)
  - [5.2 Testes Não Funcionais e Quality Gates](#52-testes-não-funcionais-e-quality-gates)
  - [5.3 Matriz de Rastreabilidade Técnica](#53-matriz-de-rastreabilidade-técnica)
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

Esta seção detalha o planejamento técnico da esteira de sistemas, abrangendo testes funcionais, validação não funcional e rastreabilidade técnica, complementando as políticas estabelecidas no documento de Gestão de Configuração.

## 5.1 Plano de Testes Funcionais

### 5.1.1 Objetivo
Estruturar testes unitários e de integração baseados no stack Dronecode (PX4/MAVLink) para validar o comportamento funcional do software de drones em ambiente de simulação.

### 5.1.2 Escopo de Testes Unitários
Os testes unitários focarão na validação isolada de componentes críticos do firmware e das plataformas digitais:

**Firmware (PX4):**
- Módulos de controle de voo (PID controllers, estimadores de estado)
- Lógica de arming/disarming de motores
- Processamento de sensores (IMU, GPS, barômetro)
- Gerenciamento de modos de voo (Stabilized, Position, Mission)

**Plataformas Digitais:**
- Validação de APIs de comunicação com drones
- Lógica de parsing de mensagens MAVLink
- Componentes de gestão de missões
- Serviços de autenticação e autorização

### 5.1.3 Escopo de Testes de Integração
Os testes de integração validarão a comunicação entre componentes e o comportamento do sistema como um todo:

**Casos de Teste Básicos de Drone:**
- **Arming do Motor:** Verificação da sequência de segurança para armar os motores (GPS lock, sensores calibrados, sem falhas críticas)
- **Decolagem:** Validação da transição do estado ground para air, com verificação de altitude e estabilidade
- **Pouso:** Execução de pouso automático com verificação de touchdown seguro e desarming
- **RTH (Return to Home):** Teste de retorno ao ponto de origem em caso de perda de link ou comando manual
- **Missão Waypoint:** Execução de missão simples com múltiplos waypoints e verificação de trajetória

**Integração MAVLink:**
- Handshake entre estação de solo (QGroundControl) e drone
- Troca de mensagens de heartbeat e telemetria
- Comandos de modo de voo via MAVLink
- Upload e download de missões

### 5.1.4 Ferramentas de Teste
- **Framework de Testes Unitários:** pytest para Python, Google Test para C++
- **Simulação PX4:** PX4 SITL (Software In The Loop) para simulação de voo em ambiente virtual
- **MAVLink Testing:** pymavlink para automação de testes de comunicação
- **Mocking:** unittest.mock para isolamento de dependências externas

### 5.1.5 Critérios de Aceitação
- Todos os testes unitários devem passar antes do merge
- Cobertura mínima de 70% para módulos críticos de firmware
- Testes de integração SITL devem executar sem falhas em ambiente de simulação
- Casos básicos de drone (arming, decolagem, pouso) devem ser validados automaticamente

## 5.2 Testes Não Funcionais e Quality Gates

### 5.2.1 Objetivo
Implementar análise estática de código (SAST) e validação de vulnerabilidades como portões de qualidade obrigatórios no pipeline de CI/CD, complementando as políticas definidas no documento de Gestão de Configuração.

### 5.2.2 Ferramenta SAST Principal: SonarQube
O SonarQube será utilizado como ferramenta central de análise estática, integrada ao pipeline de CI/CD para fornecer feedback contínuo sobre qualidade de código.

**Funcionalidades Habilitadas:**
- Análise de código fonte (C++, Python, JavaScript)
- Detecção de code smells e bugs
- Cálculo de complexidade ciclomática
- Identificação de duplicação de código
- Medição de cobertura de testes
- Análise de segurança (Security Hotspots)

### 5.2.3 Métricas de Qualidade Estática
As seguintes métricas serão monitoradas e utilizadas como critérios de bloqueio:

**Métricas de Código:**
- **Complexidade Ciclomática:** Máximo de 15 por função
- **Duplicação de Código:** Máximo de 3% de duplicação
- **Linhas por Função:** Máximo de 50 linhas
- **Parâmetros por Função:** Máximo de 7 parâmetros

**Métricas de Cobertura:**
- **Cobertura de Testes:** Mínimo de 70% para linhas de código (alinhado com gestao-configuração.md)
- **Cobertura de Branch:** Mínimo de 60% para ramificações condicionais
- **Cobertura de Novo Código:** Não redução da cobertura global

### 5.2.4 Escaneamento de Vulnerabilidades
A análise de segurança será realizada em dois níveis:

**Análise de Dependências:**
- Escaneamento de vulnerabilidades conhecidas em bibliotecas de terceiros
- Verificação contra bases de dados CVE (Common Vulnerabilities and Exposures)
- Alertas para dependências desatualizadas ou inseguras

**Análise de Código Fonte:**
- Identificação de padrões inseguros (hardcoded secrets, SQL injection, XSS)
- Validação de boas práticas de segurança
- Detecção de vazamento de informações sensíveis

### 5.2.5 Definição de Quality Gates
Os Quality Gates atuam como portões de qualidade obrigatórios no pipeline de CI/CD, complementando os critérios definidos no documento de Gestão de Configuração:

**Gate de Qualidade para Merge Request:**
- Zero vulnerabilidades críticas (Critical)
- Zero vulnerabilidades altas (High)
- Cobertura de testes ≥ 70% (alinhado com gestao-configuração.md)
- Zero bugs bloqueantes
- Duplicação de código ≤ 3%
- Code Review aprovado por pelo menos 1 peer

**Gate de Qualidade para Release:**
- Todas as condições do Gate de Merge Request
- Zero vulnerabilidades médias (Medium)
- Cobertura de testes ≥ 80% (critério mais estrito para releases)
- Todos os Security Hotspots revisados
- Documentação atualizada

### 5.2.6 Integração com Pipeline de CI/CD
A análise estática será integrada ao pipeline de CI/CD conforme definido no documento de Gestão de Configuração:

- **Estágio de Lint:** Execução rápida de análise estática (SonarQube Scanner)
- **Estágio de Segurança:** Escaneamento completo de vulnerabilidades
- **Feedback Automático:** Bloqueio de MRs que não atendem aos Quality Gates
- **Dashboard:** Visualização de métricas de qualidade em tempo real

## 5.3 Matriz de Rastreabilidade Técnica

### 5.3.1 Objetivo
Definir Identificadores Únicos para Itens de Configuração (CIs) e vincular commits no GitLab a requisitos funcionais e tarefas, garantindo rastreabilidade completa entre código, requisitos e entregas.

### 5.3.2 Sistema de Identificação Única para CIs
Cada Item de Configuração (CI) receberá um identificador único seguindo o padrão:

**Formato:** `JACTO-[TIPO]-[NNN]`

**Tipos de CIs:**
- `REQ`: Requisitos funcionais (ex: JACTO-REQ-001)
- `TASK`: Tarefas de desenvolvimento (ex: JACTO-TASK-042)
- `BUG`: Defeitos reportados (ex: JACTO-BUG-015)
- `DOC`: Documentação técnica (ex: JACTO-DOC-008)
- `TEST`: Casos de teste (ex: JACTO-TEST-023)

**Exemplo de Nomenclatura:**
- `JACTO-REQ-001`: Requisito de arming seguro de motores
- `JACTO-TASK-042`: Implementar verificação de GPS lock antes de arming
- `JACTO-BUG-015`: Falha no modo RTH quando GPS perde sinal

### 5.3.3 Mapeamento entre CIs e Requisitos Funcionais
A matriz de rastreabilidade estabelecerá vínculos explícitos entre diferentes níveis de abstração:

**Hierarquia de Rastreabilidade:**
1. **Requisito Funcional (REQ):** Define o que o sistema deve fazer
2. **Tarefa de Desenvolvimento (TASK):** Implementação técnica do requisito
3. **Item de Configuração (CI):** Artefato de código resultante
4. **Caso de Teste (TEST):** Validação do requisito implementado

**Exemplo de Mapeamento:**
- `JACTO-REQ-001` (Arming seguro) → `JACTO-TASK-042` (Verificação GPS) → `CI: src/modules/commander/arming_check.cpp` → `JACTO-TEST-023` (Teste de arming sem GPS)

### 5.3.4 Estrutura de Vinculação de Commits
A vinculação de commits aos CIs será realizada através do padrão Conventional Commits, conforme definido no documento de Gestão de Configuração:

**Formato de Commit:**
```
[tipo]([escopo]): [descrição curta] ([ID do CI])
```

**Exemplos Válidos:**
- `feat(firmware): add GPS lock verification before arming (JACTO-TASK-042)`
- `fix(mission): correct RTH altitude calculation (JACTO-BUG-015)`
- `test(api): add unit tests for MAVLink parser (JACTO-TEST-023)`
- `docs(readme): update installation guide (JACTO-DOC-008)`

**Nota:** O formato é compatível com o padrão definido no documento de Gestão de Configuração, que utiliza o prefixo `#` (ex: `#JACTO-042`). Ambos os formatos são aceitos, sendo o formato completo `JACTO-[TIPO]-[NNN]` recomendado para maior clareza.

**Vinculação Múltipla:**
Quando um commit resolve múltiplos CIs, utilizar lista separada por vírgulas:
- `feat(firmware): implement failsafe mechanisms (JACTO-TASK-042, JACTO-TASK-043)`

### 5.3.5 Matriz de Rastreabilidade
A matriz de rastreabilidade será mantida em formato estruturado (CSV ou tabela) com os seguintes campos:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| ID_CI | Identificador único do Item de Configuração | JACTO-TASK-042 |
| Tipo | Tipo de CI (REQ, TASK, BUG, DOC, TEST) | TASK |
| Descrição | Descrição breve do CI | Implementar verificação GPS lock |
| ID_Requisito | Requisito funcional associado | JACTO-REQ-001 |
| Commit_SHA | Hash do commit que implementa o CI | a1b2c3d |
| Branch | Branch onde o CI foi desenvolvido | feature/firmware/arming |
| Data_Commit | Data do commit | 2026-04-29 |
| Autor | Desenvolvedor responsável | Otávio Vasconcelos |
| Status | Estado do CI (Pendente, Em Progresso, Concluído) | Concluído |
| ID_Testes | Casos de teste associados | JACTO-TEST-023 |

### 5.3.6 Integração com Sistema de Gestão de Tarefas
A rastreabilidade será integrada ao sistema de gestão de tarefas (Notion/Jira) através de:

**Automações:**
- Criação automática de tarefas a partir de requisitos
- Vinculação automática de commits às tarefas correspondentes
- Atualização de status de tarefas baseada em eventos do repositório
- Geração de relatórios de rastreabilidade

**Webhooks e Integrações:**
- Webhook do GitLab para notificar o sistema de gestão
- Atualização bidirecional entre tarefas e commits
- Sincronização de metadados (labels, milestones)

### 5.3.7 Exemplo de Fluxo de Rastreabilidade Completo
**Cenário:** Implementação de arming seguro de motores

1. **Definição do Requisito:**
   - Criar `JACTO-REQ-001` no sistema de gestão
   - Descrição: "O drone só deve permitir arming dos motores se GPS estiver com lock válido"

2. **Criação da Tarefa:**
   - Criar `JACTO-TASK-042` vinculada a `JACTO-REQ-001`
   - Atribuir ao desenvolvedor responsável

3. **Desenvolvimento:**
   - Criar branch `feature/firmware/arming-gps-check`
   - Implementar código em `src/modules/commander/arming_check.cpp`
   - Commit: `feat(firmware): add GPS lock verification before arming (JACTO-TASK-042)`

4. **Testes:**
   - Criar `JACTO-TEST-023` vinculado a `JACTO-TASK-042`
   - Implementar testes unitários e de integração
   - Commit: `test(firmware): add arming GPS check tests (JACTO-TEST-023)`

5. **Validação:**
   - Pipeline CI/CD executa testes e análise estática
   - Quality Gates aprovados
   - Code review aprovado

6. **Merge e Rastreabilidade:**
   - Merge request aprovado e merged para `dev`
   - Atualizar matriz de rastreabilidade com commit SHA
   - Marcar `JACTO-TASK-042` como Concluído
   - Vincular `JACTO-REQ-001` como Implementado

# 6. Requisitos SCM
- **Políticas de Integração:** Branching strategy (Gitflow).
- **Fluxo de Promoção:** Caminho do código da Dev até a Release.
- **Indicadores de Performance:** Coleta de Cycle Time e Lead Time.

# 7. Referências

<a id="ref1"></a>[1] ISO/IEC. (1998). *ISO/IEC 10746-1:1998 - Information technology — Open Distributed Processing — Reference model: Overview*. <a href="#ref1-link">↩</a>

<a id="ref2"></a>[2] Dronecode Foundation. *PX4 Autopilot User Guide and MAVLink Developer Guide*. Disponível em: https://docs.px4.io/ <a href="#ref2-link">↩</a>

<a id="ref3"></a>[3] Forsgren, N., Humble, J., & Kim, G. (2018). *Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations*. IT Revolution Press. <a href="#ref3-link">↩</a>

<a id="ref4"></a>[4] SonarSource. *SonarQube Documentation*. Disponível em: https://docs.sonarqube.org/ <a href="#ref4-link">↩</a>

- JACTO. *Termo de Abertura de Projeto (TAP) - Jacto Drones OS*. 2026.
