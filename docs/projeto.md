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
_Esta seção detalha os Viewpoints de Engenharia e Tecnologia da ISO 10746._
- **Viewpoint de Tecnologia:** Descrição do Stack (Dronecode, PX4, MAVLink).
- **Viewpoint de Engenharia:** Fluxo de comunicação entre componentes da esteira.
- **Controle em Malha Fechada:** Mecanismos de feedback e bloqueio de deploy.

# 5. Configuração da Esteira de Sistemas
- **Testes Funcionais:** Validação de missões e comandos de voo.
- **Testes Não-Funcionais:** SAST, Performance da esteira.
- **Rastreabilidade Técnica:** Vinculação de commits a requisitos.

# 6. Requisitos SCM
- **Políticas de Integração:** Branching strategy (Gitflow).
- **Fluxo de Promoção:** Caminho do código da Dev até a Release.
- **Indicadores de Performance:** Coleta de Cycle Time e Lead Time.

# 7. Referências
- TAP Jacto Drones 2026.
- Dronecode Foundation Documentation.
- Normas ISO/IEC de Qualidade de Software.