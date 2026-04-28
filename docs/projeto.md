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
- **Testes Funcionais:** Validação de missões e comandos de voo.
- **Testes Não-Funcionais:** SAST, Performance da esteira.
- **Rastreabilidade Técnica:** Vinculação de commits a requisitos.

# 6. Requisitos SCM
- **Políticas de Integração:** Branching strategy (Gitflow).
- **Fluxo de Promoção:** Caminho do código da Dev até a Release.
- **Indicadores de Performance:** Coleta de Cycle Time e Lead Time.

# 7. Referências

<a id="ref1"></a>[1] ISO/IEC. (1998). *ISO/IEC 10746-1:1998 - Information technology — Open Distributed Processing — Reference model: Overview*. <a href="#ref1-link">↩</a>

<a id="ref2"></a>[2] Dronecode Foundation. *PX4 Autopilot User Guide and MAVLink Developer Guide*. Disponível em: https://docs.px4.io/ <a href="#ref2-link">↩</a>

<a id="ref3"></a>[3] Forsgren, N., Humble, J., & Kim, G. (2018). *Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations*. IT Revolution Press. <a href="#ref3-link">↩</a>

- JACTO. *Termo de Abertura de Projeto (TAP) - Jacto Drones OS*. 2026.