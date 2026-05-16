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
- [2. Panorama Atual do Ambiente Jacto](#2-panorama-atual-do-ambiente-jacto)
- [3. Mapeamento de Ferramentas por Frente](#3-mapeamento-de-ferramentas-por-frente)
- [4. Estratégia de Integração com o OS v0.1](#4-estratégia-de-integração-com-o-os-v01)
- [5. Cadeia de Rastreabilidade](#5-cadeia-de-rastreabilidade)
- [6. Métricas DORA e Coleta de Dados](#6-métricas-dora-e-coleta-de-dados)
- [7. Considerações para Software de Drones Regulado](#7-considerações-para-software-de-drones-regulado)
- [8. Referências](#8-referências)

# 1. Introdução

O mapeamento das ferramentas de desenvolvimento da Jacto Drones define a integração da esteira CI/CD do Jacto Drones OS v0.1 com os sistemas existentes (Notion, Jira, GitHub). O objetivo é unificar a rastreabilidade técnica entre requisitos, código e deploy.

> **Dados de Referência:** Informações levantadas via TAPI_ESMD10_V01.pdf e entrevistas técnicas com stakeholders da Jacto (Abril/Maio 2026).

# 2. Panorama Atual do Ambiente Jacto

## 2.1 Esteira Atual da Jacto (AS-IS)

> Diagnóstico do estado atual, levantado em workshop com o time técnico da Jacto em 24/04/2026 e nos Anexos A.4 e B.5 do TAPI. Esta subseção descreve o ponto de partida; o restante de §2 e §3 a §7 descreve a proposta de integração do OS v0.1.

- **Testes funcionais hoje:** executados manualmente, com piloto licenciado em campo (drone protótipo ≈ R$ 700.000) e análise pós-voo via script Python caseiro (livraria do próprio engenheiro de controle). Não há simulação automatizada disparada por pipeline; cada ciclo de teste implica logística de voo real.
- **Runners / servidores de CI:** inexistentes. Desenvolvedores rodam builds e testes localmente, sem isolamento ou reprodutibilidade entre máquinas.
- **Tratamento atual de logs:** manual. Cada voo de 15 manobras gera aproximadamente 90 arquivos × 120 parâmetros (`.ulg`); a análise consome entre 2 e 3 dias por voo, com gargalo concentrado no engenheiro de controle (gerar gráfico por gráfico via cliques sequenciais na ferramenta caseira).
- **Validação de firmware:** baseada em voo real e inspeção manual de log. Sem gate automatizado para vibração ou defasagem; o caso de queda relatado pelo time (defasagem silenciosa entre comando e atuação) só foi diagnosticado a posteriori.
- **Time técnico envolvido:** ~2 engenheiros (controle de voo + firmware/SIL-HIL) + 1 gestora — tamanho que torna automação de alto ROI especialmente valiosa.

A proposta do OS v0.1 detalhada nas seções seguintes substitui esse fluxo manual por uma esteira de Continuous Delivery com simulação SITL automatizada, runners isolados em contêineres, validação de log por gates programáticos e dashboard operacional de métricas.

## 2.2 Stack Fragmentado das Três Frentes

A Jacto Drones mantém hoje três frentes de desenvolvimento de software que operam de forma isolada, sem um pipeline de integração contínua centralizado:

- **Firmware embarcado:** Responsável pelo código que roda diretamente nos drones, incluindo controle de voo, sensores e atuadores.
- **Serviços de plataforma:** APIs, microsserviços e backends que suportam operações de missão, telemetria e gestão de frota.
- **Dados e Business Intelligence (BI):** Pipelines de ingestão, transformação e visualização de dados gerados pelos voos e pelo agronegócio.

Cada frente adotou ferramentas de forma independente ao longo do tempo, resultando no seguinte cenário:

- **Notion:** Utilizado como base de conhecimento geral, registro de requisitos iniciais e documentação de descobertas de produto. Sua flexibilidade permitiu que diferentes times criassem workspaces isolados, mas sem padrão unificado.
- **Jira:** Ferramenta oficial de rastreamento de issues, epics, histórias e sprints. Os times de firmware e plataforma utilizam Jira Cloud para gestão de backlog, enquanto o time de dados mantém seu próprio quadro de tarefas.
- **GitHub (Legado/Referência):** Hospedava originalmente o código-fonte dos três fronts de forma fragmentada. No novo fluxo do OS v0.1, o GitHub é tratado como um espelho (mirror) secundário ou legado, não sendo mais o ponto de push dos desenvolvedores.
- **GitLab (Fonte Única de Verdade):** Adotado como a plataforma central para o OS v0.1. Centraliza o repositório Git, o motor de CI/CD, o registro de containers e a auditoria de processos, eliminando riscos de latência e dessincronização que existiam no modelo anterior.
- **Confluence:** Wiki corporativo e repositório de documentação técnica legada. Parte da documentação de arquitetura de firmware e APIs reside em espaços desatualizados, dificultando a manutenção.
- **Microsoft Word:** Utilizado para documentos formais, relatórios de release, atas de reunião e entregáveis para áreas não técnicas (regulatório, jurídico e comercial).

## O problema da fragmentação

A ausência de uma esteira unificada gera custos operacionais significativos:

- **Handoffs manuais:** Promover uma alteração de código até o ambiente de homologação ou produção exige intervenção humana em múltiplos pontos, aumentando o risco de erro e o tempo de espera.
- **Ferramentas desconectadas:** Informações fluem de Notion para Jira, de Jira para GitHub e de GitHub para Confluence sem automação, criando silos de conhecimento e versões conflitantes da verdade.
- **Falta de visibilidade de ciclo:** Não há uma visão end-to-end do tempo que uma demanda leva desde a concepção até a entrega em produção, impedindo a identificação de gargalos sistemáticos.
- **Rastreabilidade quebrada:** É impossível, em muitos casos, partir de um requisito escrito no Notion e chegar ao commit específico que o implementou, ou ao deploy que o colocou em operação.

O OS v0.1 propõe justamente sanar essas lacunas, utilizando GitLab CI/CD como orquestrador central e integrando-o ao conjunto existente de ferramentas.

# 3. Mapeamento de Ferramentas por Frente

A tabela a seguir relaciona cada ferramenta às funções que desempenha para cada uma das três frentes de desenvolvimento.

| Ferramenta | Firmware | Serviços de Plataforma | Dados / BI |
|---|---|---|---|
| **Notion** | Base de conhecimento de requisitos de hardware e especificações de voo | Documentação de APIs, descoberta de produto e registros de decisão arquitetural | Catálogo de dados, glossário de métricas e documentação de pipelines ETL |
| **Jira** | Epics e stories de desenvolvimento de firmware, sprints de hardware | Gestão de backlog de features, bugs e débitos técnicos | Tarefas de ingestão, transformação e relatórios de dados |
| **GitHub** | Repositórios de código C/C++ para PX4 e drivers de sensores | Repositórios de APIs (Node.js/Python) e infraestrutura como código | Repositórios de scripts SQL, notebooks e modelos de ML |
| **Confluence** | Wiki técnico de arquitetura de firmware legada | Documentação de integração de serviços e guias de onboarding | Documentação de modelagem de dados e dicionários de schema |
| **Word** | Relatórios de testes de voo, documentação regulatória preliminar | Especificações de contrato (SRS), atas de revisão | Relatórios executivos de dashboards e análises de campo |

Esse mapeamento evidencia que cada frente já possui ferramentas adequadas para seu domínio, mas a integração entre elas é inexistente. O OS v0.1 não substitui essas ferramentas, mas as conecta por meio de uma camada de automação.<a id="ref1-link" href="#ref1"><sup>[1]</sup></a>

# 4. Estratégia de Integração com o OS v0.1

O pipeline de CI/CD do OS v0.1 é implementado no GitLab. A estratégia de integração consolida o GitLab como fonte de verdade para o código-fonte e como motor de execução da esteira. As demais ferramentas são integradas por meio de APIs nativas, webhooks e automações de dados.

## 4.1 GitLab como Fonte Única da Verdade (SSoT)
O GitLab atua como o repositório primário e único executor do pipeline para o OS v0.1. Esta escolha estratégica simplifica a cadeia de SCM, eliminando a "tensão" de operar duas plataformas simultâneas (GitHub e GitLab).
- **Eliminação de Riscos:** Ao centralizar o push no GitLab, removemos os riscos de latência de sincronização, conflitos de permissões divergentes e a ambiguidade sobre qual plataforma detém a versão final do código.
- **Auditoria Simplificada:** Todos os logs de build, Merge Requests e artefatos residem no mesmo ambiente, facilitando a rastreabilidade exigida por normas como a DO-178C.
- **Desenvolvimento Direto:** Todos os desenvolvedores realizam o push diretamente para o GitLab, onde os Merge Requests são revisados e integrados nativamente.

## 4.2 GitLab e Jira

A integração entre GitLab e Jira é fundamental para garantir rastreabilidade entre código e demandas de negócio. A estratégia adota dois mecanismos complementares:

- **Smart Commits:** Mensagens de commit que incluem a chave da issue do Jira (por exemplo, `JACTO-123`) são automaticamente vinculadas à respectiva história no Jira. Comandos adicionais no corpo da mensagem permitem transicionar o status da issue (ex.: `JACTO-123 #close #comment Implementado controle de PID`).
- **Integração Nativa GitLab-Jira:** O GitLab possui uma integração nativa com o Jira Cloud que sincroniza commits, merge requests e deployments, permitindo que o time de gestão visualize o progresso técnico diretamente nas issues do Jira.
- **Transição automática via CI:** Jobs do pipeline GitLab podem executar chamadas à API do Jira para atualizar o status de issues quando um deploy é concluído em determinado ambiente, fechando o ciclo de entrega.

Recomenda-se ainda a adoção de uma política de branching que exija a chave do Jira no título de todo pull request, garantindo que nenhuma alteração de código entre no repositório sem rastreabilidade.<a id="ref3-link" href="#ref3"><sup>[3]</sup></a>

## 4.3 Notion

O Notion funciona como hub de documentação e contexto de produto. A integração com a esteira de CI/CD ocorre da seguinte forma:

- **Bancos de dados sincronizados:** Requisitos catalogados no Notion podem ser sincronizados com o Jira. No plano Business, a sincronização é unidirecional (Notion → Jira). No plano Enterprise, ela é bidirecional, permitindo que atualizações de status no Jira reflitam automaticamente no Notion. A sincronização exige o uso do Jira Cloud.
- **Linkagem de artefatos:** Páginas de documentação no Notion passam a incluir links dinâmicos para relatórios de pipeline, binários de firmware e imagens de contêiner armazenados no GitLab Registry, transformando o Notion em um painel de acesso aos entregáveis técnicos.
- **Dashboard de status:** Um banco de dados no Notion pode consumir webhooks do GitLab para exibir o status de build dos principais repositórios, oferecendo visibilidade em tempo real para stakeholders não técnicos.

## 4.4 Confluence

O Confluence continua sendo o repositório de documentação técnica formal. A integração com o pipeline foca na publicação automatizada de informações geradas durante a execução da esteira:

- **Notas de release:** Ao concluir uma tag de versão no GitLab, um job do pipeline gera notas de release em formato Markdown a partir do changelog dos commits e publica automaticamente uma nova página no Confluence via API REST.
- **Relatórios de pipeline:** Sumários de execução (tempo de build, taxa de sucesso, cobertura de testes) são publicados em um espaço dedicado do Confluence, criando um histórico auditável de qualidade por release.
- **Sincronização de arquitetura:** Diagramas e especificações armazenados em repositórios Git (como código em formato Mermaid ou PlantUML) são renderizados e publicados no Confluence, garantindo que a documentação técnica esteja sempre alinhada à implementação.

## 4.5 Microsoft Word

Documentos formais em Word continuam sendo necessários para entregáveis regulatórios, comerciais e jurídicos. A integração propõe automação na geração desses documentos:

- **Geração via Pandoc:** Markdowns versionados em repositórios Git (especificações, relatórios técnicos, manuais) são convertidos automaticamente para formato `.docx` por meio de ferramentas como Pandoc durante a execução do pipeline.
- **Templates corporativos:** O pipeline utiliza templates de referência da Jacto (fontes, logotipos, cabeçalhos) para que o documento gerado esteja em conformidade com a identidade visual corporativa.
- **Armazenamento versionado:** Os documentos finais são armazenados em um repositório de artefatos ou compartilhados via link para o SharePoint/OneDrive, garantindo que cada versão do software tenha sua documentação formal correspondente rastreável.

# 5. Cadeia de Rastreabilidade

A rastreabilidade end-to-end é o principal ganho qualitativo da integração proposta. A cadeia completa opera da seguinte forma:

1. **Notion (Requisitos e Contexto):** A necessidade de negócio ou o requisito técnico é documentado no Notion, vinculado a uma demanda estratégica ou a uma especificação de sistema.
2. **Jira (Épicos, Histórias e Tarefas):** O requisito do Notion é convertido em um épico ou história no Jira, recebendo uma chave identificadora única (ex.: `JACTO-456`). Essa chave será a âncora de todo o rastro subsequente.
3. **GitLab (Código, Commits e Merge Requests):** O desenvolvedor cria uma branch a partir da história do Jira e abre um merge request contendo a chave `JACTO-456` no título ou na descrição. Cada commit também carrega essa chave. O GitLab sincroniza automaticamente o MR e os commits à issue no Jira.
4. **GitLab CI/CD (Build, Teste e Deploy):** O push dispara o pipeline no GitLab. O pipeline executa linting, compilação, testes unitários, testes SITL/HITL (para firmware), análise estática de segurança (SAST) e empacotamento de artefatos.

5. **Jira (Deploy e Releases):** Ao concluir com sucesso um deploy em ambiente de staging ou produção, o pipeline GitLab atualiza a issue `JACTO-456` no Jira, registrando a versão implantada, o ambiente de destino e o link para os logs de execução.

6. **Notion (Documentação e Artefatos):** O artefato gerado (binário de firmware, imagem Docker, relatório de testes) é catalogado no Notion, e a página de requisitos original é atualizada com links para a documentação de release e para os artefatos técnicos.

Essa malha fechada garante que qualquer auditor possa partir de um requisito no Notion e chegar ao exato commit, pipeline e deploy que o materializou, e vice-versa.

# 6. Métricas DORA e Coleta de Dados

As métricas DORA (DevOps Research and Assessment) são o conjunto de indicadores mais robusto para avaliar a performance de entrega de software. O OS v0.1 adota as quatro métricas principais:<a id="ref4-link" href="#ref4"><sup>[4]</sup></a>

- **Deployment Frequency (Frequência de Deploy):** Número de deploys para produção por unidade de tempo. Medido a partir dos eventos de deploy registrados no GitLab CI/CD.
- **Lead Time for Changes (Tempo de Espera de Mudanças):** Tempo decorrido entre o primeiro commit de uma funcionalidade e o momento em que essa funcionalidade entra em produção. Calculado a partir dos timestamps de commits e dos eventos de deploy registrados no GitLab.
- **Change Failure Rate (Taxa de Falha de Mudança):** Percentual de deploys que resultam em incidentes ou rollback. Requer correlação entre deploys e tickets de bug crítico abertos no Jira após a entrega.
- **Mean Time To Recovery (MTTR - Tempo Médio de Recuperação):** Tempo médio para restaurar o serviço após uma falha em produção. Medido a partir da abertura de um incidente no Jira até o registro de sua resolução.

## Coleta nativa versus ferramentas dedicadas

A integração nativa GitLab + Jira oferece visibilidade completa dessas métricas, permitindo uma análise contínua de performance através de ferramentas integradas:

- **GitLab DORA:** O próprio GitLab oferece dashboards DORA nativos para projetos que utilizam seus pipelines, fornecendo Deployment Frequency e Lead Time com base nos dados do runner.
- **Datadog:** Permite correlacionar eventos de deploy (enviados via API pelo GitLab) com métricas de infraestrutura e logs de aplicação, possibilitando o cálculo automático de Change Failure Rate e MTTR.
- **Grafana:** Utilizado para construir painéis customizados que consolidam dados de múltiplas fontes (GitLab, Jira, Prometheus) em uma única visão operacional.

Recomenda-se que a Jacto inicie a coleta manual das métricas DORA via planilhas (calculando a partir dos timestamps de commits e deploys) e, em paralelo, avalie a implantação do GitLab DORA ou Datadog para automação completa no segundo semestre de operação do OS v0.1.<a id="ref5-link" href="#ref5"><sup>[5]</sup></a>

# 7. Considerações para Software de Drones Regulado

O desenvolvimento de software para sistemas aéreos não tripulados (drones) operando em ambientes agrícolas está sujeito a requisitos regulatórios rigorosos. As normas **DO-178C** (Software Considerations in Airborne Systems and Equipment Certification) e **ISO 21384-2** (Unmanned Aircraft Systems — Part 2: UAS components) estabelecem diretrizes para garantir a segurança, confiabilidade e rastreabilidade do software.<a id="ref6-link" href="#ref6"><sup>[6]</sup></a><a id="ref7-link" href="#ref7"><sup>[7]</sup></a> No contexto brasileiro, a **ANAC** (Agência Nacional de Aviação Civil) regula as operações de UAS através da **RBAC-E nº 94**, que estabelece requisitos de aeronavegabilidade para sistemas de aeronaves remotamente pilotadas.<a id="ref8-link" href="#ref8"><sup>[8]</sup></a>

Para atender a esses padrões, a cadeia de ferramentas integrada do OS v0.1 deve garantir:

- **Rastreabilidade total de requisitos:** Todo requisito de software deve ser rastreável até o código-fonte que o implementa, aos testes que o validam e ao artefato de deploy que o entrega. A cadeia Notion → Jira → GitLab → Jira atende a esse requisito desde que a chave de rastreamento seja obrigatória em todo commit e merge request.
- **Registro imutável de eventos:** Deploys, testes e aprovações devem ser registrados de forma auditável e não editável. O GitLab CI/CD mantém logs de execução e artefatos versionados que satisfazem essa condição.
- **Documentação formal versionada:** Relatórios de testes, evidências de cobertura e notas de release devem ser gerados automaticamente e armazenados com referência inequívoca à versão do software. A geração via Pandoc e o armazenamento no GitLab Registry ou Confluence cumprem esse papel.
- **Separação de ambientes:** A esteira deve garantir que artefatos homologados em ambiente de testes sejam exatamente os mesmos promovidos para produção, sem reconstrução. O uso de imagens de contêiner imutáveis e binários assinados digitalmente no pipeline atende a essa exigência.

A conformidade regulatória não é um estado final, mas um processo contínuo. O OS v0.1 estabelece as bases técnicas para que a Jacto Drones evolua sua certificação de software de forma sustentável, com trilhas de auditoria geradas automaticamente a cada execução de pipeline.

# 8. Referências

<a id="ref1"></a>[1] Notion. *Sync Jira issues to Notion databases*. Notion API Documentation. Disponível em: https://www.notion.so/help/guides/sync-databases <a href="#ref1-link">↩</a>

<a id="ref2"></a>[2] GitLab. *Repository mirroring*. GitLab Documentation. Disponível em: https://docs.gitlab.com/ee/user/project/repository/mirror/ <a href="#ref2-link">↩</a>

<a id="ref3"></a>[3] Atlassian. *Processing issues with smart commits*. Bitbucket Documentation. Disponível em: https://support.atlassian.com/bitbucket-cloud/docs/use-smart-commits/ <a href="#ref3-link">↩</a>

<a id="ref4"></a>[4] Forsgren, N., Humble, J., & Kim, G. (2018). *Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations*. IT Revolution Press. <a href="#ref4-link">↩</a>

<a id="ref5"></a>[5] Google Cloud. *DORA Core Model*. DevOps Research and Assessment. Disponível em: https://dora.dev/research/ <a href="#ref5-link">↩</a>

<a id="ref6"></a>[6] RTCA. (2011). *DO-178C — Software Considerations in Airborne Systems and Equipment Certification*. RTCA/DO-178C. <a href="#ref6-link">↩</a>

<a id="ref7"></a>[7] ISO. (2021). *ISO 21384-2:2021 — Unmanned aircraft systems — Part 2: UAS components*. International Organization for Standardization. <a href="#ref7-link">↩</a>

<a id="ref8"></a>[8] ANAC. *RBAC-E nº 94 — Requisitos de Aeronavegabilidade para Sistemas de Aeronaves Remotamente Pilotadas*. Agência Nacional de Aviação Civil. <a href="#ref8-link">↩</a>
