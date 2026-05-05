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
- [2. Estratégia de Branching (GitFlow)](#2-estratégia-de-branching-gitflow)
- [3. Políticas de Commit e Rastreabilidade](#3-políticas-de-commit-e-rastreabilidade)
- [4. Pipeline de CI/CD e Integração Contínua](#4-pipeline-de-cicd-e-integração-contínua)
- [5. Quality Gates e Code Review (Malha Fechada)](#5-quality-gates-e-code-review-malha-fechada)
- [6. Gestão de Artefatos e Infraestrutura](#6-gestão-de-artefatos-e-infraestrutura)
- [7. Métricas de Engenharia (DORA Metrics)](#7-métricas-de-engenharia-dora-metrics)
- [8. Política de Rollback](#8-política-de-rollback)
- [Referências](#referências)

---

# 1. Introdução
Este documento estabelece as diretrizes de **Gestão de Configuração de Software (SCM)** para o projeto *Jacto Drones OS v0.1*. Como o objetivo do projeto é construir uma esteira ágil de produção (Continuous Delivery), as políticas aqui definidas não são apenas regras de conduta, mas os requisitos técnicos que sustentam a automação, a qualidade e a rastreabilidade entre as frentes de firmware, serviços de plataforma e sistemas de dados.

---

# 2. Estratégia de Branching (GitFlow)

Para lidar com a complexidade de desenvolvimento de sistemas autônomos (onde firmware exige estabilidade crítica e plataformas web exigem agilidade), adotamos uma variação do **GitFlow**.

## 2.1 Estrutura de Branches
- **`main`**: Código estável e homologado. Cada commit na main representa uma *Release* pronta para o ambiente de produção da Jacto.
- **`dev`**: Branch principal de integração. Todos os novos desenvolvimentos são mesclados aqui após aprovação.
- **`feature/[escopo]/[nome]`**: Para o desenvolvimento de novas funcionalidades. O escopo deve definir a frente técnica (ex: `feature/firmware/px4-update`, `feature/web/dashboard-ui`).
- **`bugfix/[nome]`**: Correção de erros mapeados durante o desenvolvimento na branch `dev`.
- **`release/v[X.Y.Z]`**: Branch temporária criada a partir da `dev` para estabilização de uma nova versão antes de ir para a `main`.
- **`hotfix/[nome]`**: Correções críticas geradas diretamente a partir da `main` e enviadas para produção o mais rápido possível.

## 2.2 Proteção de Branches no GitLab
- Commits diretos nas branches `main` e `dev` são estritamente **proibidos**.
- Merge requests (MRs) para a `main` e `dev` exigem aprovação de testes automatizados e code review.

---

# 3. Políticas de Commit e Rastreabilidade

A rastreabilidade técnica é um requisito fundamental. É necessário conectar cada alteração de código a um requisito de negócio ou tarefa.

## 3.1 Padrão Conventional Commits
As mensagens de commit devem seguir o formato estruturado:
`[tipo]([escopo opcional]): [descrição curta] ([ID da Tarefa])`

**Tipos permitidos:**
- `feat`: Nova funcionalidade no OS ou nos sistemas gerenciados.
- `fix`: Correção de falhas ou comportamentos indesejados.
- `docs`: Modificações restritas a arquivos markdown e documentações.
- `test`: Adição ou refatoração de testes automatizados.
- `ci`: Alterações no pipeline do GitLab (`.gitlab-ci.yml`) ou scripts de automação.
- `chore`: Atualização de dependências ou configurações de build (ex: Dockerfiles).

## 3.2 Rastreabilidade Obrigatória
Para garantir a ligação entre o Item de Configuração (código) e o requisito funcional, todo commit que resolve uma tarefa deve incluir a tag de identificação única gerada pelo sistema de gestão (ex: Notion/Jira).
**Exemplo válido:** `feat(pipeline): add SAST security scanner (#JACTO-042)`

## 3.3 Automação de Feedback Local (Husky + Commitlint)

Para garantir que as políticas de *Conventional Commits* e rastreabilidade obrigatória sejam respeitadas, o projeto utiliza **Husky** e **Commitlint** como mecanismos de feedback local automatizado.
- **Hook de `commit-msg`**: O Husky intercepta todas as tentativas de commit na máquina do desenvolvedor.
- **Validação Automática**: O Commitlint analisa a mensagem e a rejeita imediatamente se não estiver no padrão exigido ou se faltar o ID da tarefa. Isso atua como o primeiro "Quality Gate" da malha fechada, poupando tempo de pipeline e mantendo o histórico do GitLab impecável.

---

# 4. Pipeline de CI/CD e Integração Contínua

O GitLab CI será utilizado como o motor do *Jacto Drones OS v0.1*. O fluxo de promoção do código ocorre em estágios definidos no `.gitlab-ci.yml`.

## 4.1 Estágios do Pipeline
1. **Lint e Formatação:** Verificação estática do padrão de código.
2. **Build:** Construção dos artefatos (ex: compilação de binários de firmware ou construção de imagens Docker).
3. **Testes Funcionais:** Execução de testes unitários e de integração utilizando simuladores Dronecode (SITL/HITL) para firmware e testes de API para plataformas.
4. **Segurança (SAST):** Varredura de vulnerabilidades estáticas (ex: SonarQube, Bandit para Python).
5. **Deploy Simulado:** Promoção automática do código para o ambiente de *Staging* para validação de ponta a ponta.

---

# 5. Quality Gates e Code Review (Malha Fechada)

Para implementar a **Modelagem de Controle em Malha Fechada**, o pipeline atua como um juiz automatizado. O feedback de falhas volta imediatamente para os desenvolvedores, bloqueando avanços indevidos.

## 5.1 Critérios de Aprovação (Quality Gates)
Um Merge Request só será liberado para merge se atingir 100% dos critérios abaixo:
- **Testes Automatizados:** O pipeline do GitLab deve passar com sucesso (ícone verde).
- **Cobertura de Testes:** Não redução da cobertura global de testes (mínimo exigido: 70%).
- **Segurança:** Zero vulnerabilidades críticas reportadas pelo estágio de SAST.
- **Revisão Humana (Peer Review):** Aprovação de pelo menos 1 (um) membro da equipe que não seja o autor do código.

Qualquer falha nesses "portões de qualidade" impede o merge automaticamente via configurações do repositório, garantindo a integridade do firmware e dos sistemas web. O arquivo `.gitlab-ci.yml` contém a regra `allow_failure: false` em todos os jobs para impor este bloqueio remotamente.

## 5.2 Checklists de Validação de Entregas (MR Templates)
Para garantir que o *Definition of Done (DoD)* seja ativamente verificado pela equipe, implementamos uma automação de template de Merge Request.
- O arquivo `.gitlab/merge_request_templates/Default.md` injeta automaticamente um checklist de validação na descrição de todo novo MR aberto.
- O autor e o revisor devem obrigatoriamente validar itens como testes, documentação e ausência de *secrets* antes de aprovar a integração.

## 5.3 Automação de Estado das Tarefas (GitLab Issues)
Para eliminar overhead operacional, o controle de estado das tarefas do projeto é integrado aos eventos do repositório:
- **Vinculação e Fechamento:** A inclusão de palavras-chave como `Closes #123` nos commits e descrições de MR automatiza o fluxo. Quando o MR é mesclado e o pipeline concluído, a Issue correspondente no GitLab transita automaticamente de "Em Desenvolvimento/Validação" para "Concluída" (Closed).

---

# 6. Gestão de Artefatos e Infraestrutura

## 6.1 Infraestrutura como Código (IaC) e Contêineres
- Todos os ambientes devem ser reprodutíveis. Dependências complexas (ex: stack PX4) devem ser empacotadas em imagens **Docker**.
- Utilizar o *GitLab Container Registry* para versionamento das imagens geradas na esteira.

## 6.2 Segurança e Dados Sensíveis
- Arquivos contendo chaves de API, senhas ou tokens estão expressamente proibidos de serem enviados ao repositório via `.gitignore`.
- O fornecimento de credenciais no ambiente de pipeline deve ser feito exclusivamente pelas **CI/CD Variables** (mascaradas e protegidas) do GitLab.
- Um arquivo `.env.example` deve existir no repositório com as chaves neutras para instruir o setup local.

---

# 7. Métricas de Engenharia (DORA Metrics)

Para avaliar o desempenho e a saúde da esteira de produção (conforme exigido pelo escopo do OS v0.1), as ferramentas de SCM devem fornecer dados para os dashboards operacionais focados nas métricas DORA:

1. **Deployment Frequency (Frequência de Deploy):** Quantas vezes o código validado é promovido ao ambiente de simulação/produção via CI/CD.
2. **Lead Time for Changes:** Tempo decorrido entre o commit do desenvolvedor e o sucesso do deploy.
3. **Change Failure Rate:** Porcentagem de deploys que resultam em falhas (bugfixes/hotfixes subsequentes).
4. **Time to Restore Service:** Tempo médio para reverter uma versão quebrada ou lançar um hotfix funcional.

Esses indicadores servirão para validar o sucesso do OS v0.1 no longo prazo.

---

# 8. Política de Rollback

Incidentes em produção, especialmente relacionados a software autônomo físico, exigem recuperação imediata.
- **Firmware:** O processo de rollback envolve fazer o flash da versão estável anterior `release/vX.Y.Z` que possui tag no Git, através de intervenção via estação de controle de solo (QGroundControl).
- **Serviços Cloud:** Reversão automatizada via CI/CD (re-execução do pipeline de deploy da branch correspondente ao commit anterior estável).
- É mandatório que toda ação de Rollback gere um post-mortem documentado e uma task do tipo `hotfix`.

---

# Referências
- **ISO/IEC/IEEE 12207:** Systems and software engineering — Software life cycle processes.
- **DORA Metrics:** Accelerate State of DevOps Report (Google Cloud).
- **Dronecode Foundation:** PX4 SITL/HITL Simulation and MAVLink integration standards.
- **Conventional Commits:** https://www.conventionalcommits.org/
- **GitLab CI/CD Documentation:** https://docs.gitlab.com/ee/ci/