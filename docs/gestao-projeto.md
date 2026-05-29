<Table>
  <tr>
    <td><a href= "link"><img src="img/logo.png" alt="Nome" border="0"></td>
    <td>
      <a href= "https://www.inteli.edu.br/"><img src="img/logo-Inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0"></a>
    </td>
  </tr>
</table>

# Nome do Projeto: Jacto Drones OS v0.1

## Nome do Grupo: G04

## Integrantes:

- <a href="https://www.linkedin.com/in/username/">Nome</a>
- <a href="https://www.linkedin.com/in/username/">Nome</a>
- <a href="https://www.linkedin.com/in/username/">Nome</a>
- <a href="https://www.linkedin.com/in/username/">Nome</a>
- <a href="https://www.linkedin.com/in/username/">Nome</a>
- <a href="https://www.linkedin.com/in/username/">Nome</a>
- <a href="https://www.linkedin.com/in/username/">Nome</a>
- <a href="https://www.linkedin.com/in/username/">Nome</a>


# Sumário
- [1. Introdução](#1-introdução)
- [2. Avaliação das Sprints](#2-avaliação-das-sprints)
  - [2.1 Sprint 1](#21-sprint-1)
  - [2.2 Sprint 2](#21-sprint-2)
  - [2.3 Sprint 3](#21-sprint-3)
  - [2.4 Sprint 4](#21-sprint-4)
  - [2.5 Sprint 5](#21-sprint-5)
- [3. Análise de Riscos](#3-análise-de-riscos)
  - [3.1 Riscos identificados](#31-riscos-identificados)
  - [3.2 Mitigação de Riscos](#32-mitigação-de-riscos)
- [4. Análise Post Mortem](#4-análise-post-mortem)
  - [4.1 Sucessos do Projeto](#41-sucessos-do-projeto)
  - [4.2 Oportunidades de Melhoria](#42-oportunidades-de-melhoria)
  - [4.3 Lições Aprendidas](#43-lições-aprendidas)

# 1. Introdução
_conteúdo_
**Nota:** Insira informações sobreobjetivo do documento

# 2. Avaliação das Sprints

Esta seção registra, sprint a sprint, a nota recebida, o que foi entregue e as lições que mudaram a forma de trabalhar nas sprints seguintes. As entregas das Sprints 1 e 2 foram documentais (planejamento e desenho da esteira); a partir da Sprint 3 a esteira passa a rodar de fato (pipeline real, SITL e quality gates).

## 2.1 Sprint 1

**Nota:** 6,5/10.

**O que foi entregue.** Termo de Abertura de Projeto, primeiro recorte do problema (esteira CI/CD para o ecossistema de drones autônomos da Jacto, com o caso pedagógico Dronecode/PX4 como ambiente de validação) e a versão inicial da documentação de projeto.

**Principal crítica do feedback.** A documentação descrevia o estado desejado (TO-BE) sem antes caracterizar o estado atual (AS-IS), trazia afirmações sem referência rastreável e apresentava incoerências entre documentos (o mesmo conceito descrito de formas diferentes em arquivos distintos).

**Lições aprendidas (incorporadas a partir da Sprint 2):**

- **AS-IS antes de TO-BE.** Caracterizar o ambiente atual da Jacto e do caso Dronecode antes de propor a esteira-alvo, deixando explícito o que é diagnóstico e o que é proposta.
- **Referências rastreáveis.** Toda afirmação relevante deve apontar para a evidência que a sustenta (norma, fonte do parceiro, commit/MR ou arquivo do repositório) — princípio de "evidência no entorno imediato".
- **Coerência inter-documento.** Um conceito é definido uma vez e referenciado nos demais documentos, evitando divergência entre `projeto.md`, `gestao-configuracao.md` e o mapa de cobertura.

## 2.2 Sprint 2

**Nota:** 7,5/10.

**O que foi entregue.** Desenho da esteira de CI/CD em malha fechada, mapa de cobertura de integração (frentes, DoD por track) e o detalhamento das políticas de SCM e do fluxo de promoção. As lições da Sprint 1 (AS-IS antes de TO-BE, referências rastreáveis, coerência inter-doc) já aparecem refletidas aqui.

**Principal crítica do feedback.** O desenho era sólido no conceito, mas faltava fechar o **protocolo operacional**: como cada integração é contratada e medida na prática, e a separação entre o que já está medido e o que ainda é meta projetada.

**Lições aprendidas (incorporadas a partir da Sprint 3):**

- **Contrato por integração.** Para cada ponto de integração, explicitar entradas, saídas e o critério objetivo de aceitação (o gate), em vez de descrever a integração apenas em prosa.
- **Protocolo de medição.** Definir como cada indicador é coletado e de onde sai o número (artefato de CI, API do GitLab, log do SITL), para que a métrica seja reproduzível.
- **Medido × projetado.** Separar literalmente o que já foi medido do que é meta projetada, evitando tom aspiracional — base direta para a revisão de coerência conduzida na Sprint 3.

## 2.3 Sprint 3
_conteúdo_
 **Nota:** Insira informações sobre mudanças realizadas.

## 2.4 Sprint 4
_conteúdo_
 **Nota:** Insira informações sobre mudanças realizadas.

## 2.5 Sprint 5
_conteúdo_
 **Nota:** Insira informações sobre mudanças realizadas.

# 3. Análise de Riscos
_conteúdo_

## 3.1 Riscos identificados
_conteúdo_

## 3.2 Mitigação de Riscos
_conteúdo_

# 4. Análise Post Mortem
_conteúdo_

## 4.1 Sucessos do Projeto
_conteúdo_

## 4.2 Oportunidades de Melhoria
_conteúdo_

## 4.3 Lições Aprendidas
_conteúdo_