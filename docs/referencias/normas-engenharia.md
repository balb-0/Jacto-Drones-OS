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
- [2. Dronecode Foundation](#2-dronecode-foundation)
  - [2.1 O que é a Dronecode Foundation](#21-o-que-é-a-dronecode-foundation)
  - [2.2 Estrutura de Associação](#22-estrutura-de-associação)
  - [2.3 Projetos de Alto Nível](#23-projetos-de-alto-nível)
  - [2.4 Padrões de Código e Processos](#24-padrões-de-código-e-processos)
  - [2.5 Relevância para o Projeto Jacto Drones OS](#25-relevância-para-o-projeto-jacto-drones-os)
- [3. Normas ISO/IEC de Processo e Qualidade](#3-normas-isoiec-de-processo-e-qualidade)
  - [3.1 ISO/IEC/IEEE 12207:2017](#31-isoiecieee-122072017)
  - [3.2 ISO/IEC 10746 (RM-ODP)](#32-isoiec-10746-rm-odp)
  - [3.3 ISO/IEC 25010:2023](#33-isoiec-250102023)
  - [3.4 ISO/IEC 27001:2022](#34-isoiec-270012022)
  - [3.5 ISO/IEC/IEEE 32675:2022](#35-isoiecieee-326752022)
  - [3.6 IEC 62304](#36-iec-62304)
  - [3.7 ISO 21384-2:2021](#37-iso-21384-22021)
  - [3.8 ISO 21895](#38-iso-21895)
  - [3.9 ISO/DIS 25132](#39-isodis-25132)
  - [3.10 DO-178C](#310-do-178c)
- [4. Mapeamento das Normas para a Esteira CI/CD](#4-mapeamento-das-normas-para-a-esteira-cicd)
- [5. Métricas DORA e Qualidade](#5-métricas-dora-e-qualidade)
- [6. Referências](#6-referências)

# 1. Introdução

Este documento compila as normas de engenharia e as referências técnicas que fundamentam o desenvolvimento do projeto **Jacto Drones Operating System v0.1**. Sua finalidade é servir como referência oficial para a Tarefa 4.2 do projeto, garantindo que todas as decisões de arquitetura, processo e qualidade estejam alinhadas a padrões reconhecidos internacionalmente e a ecossistemas técnicos consagrados na indústria de drones.

A escolha das normas e frameworks aqui catalogadas reflete a necessidade de construir uma esteira de Continuous Delivery robusta, segura e rastreável, capaz de suportar o ciclo de vida completo do software de drones, desde a especificação de requisitos até a implantação em ambiente produtivo. O documento abrange duas grandes vertentes: o ecossistema **Dronecode Foundation**, que fornece a pilha tecnológica de validação de firmware, e as **normas ISO/IEC**, que estabelecem os critérios de qualidade, segurança e processo aplicáveis ao software embarcado e distribuído.

# 2. Dronecode Foundation

## 2.1 O que é a Dronecode Foundation

A **Dronecode Foundation** é um projeto colaborativo da **Linux Foundation**, fundado em 2014, dedicado a promover a adoção aberta e neutra de tecnologias de código aberto para veículos aéreos não tripulados (UAS, do inglês *Unmanned Aircraft Systems*) e robótica autônoma. Sua governança é estruturada por um **Board of Directors** (Conselho de Administração) e um **Technical Steering Committee** (TSC), que garantem a direção estratégica e a evolução técnica dos projetos sob seu guarda-chuva<a id="ref1-link" href="#ref1"><sup>[1]</sup></a>.

A fundação atua como um ponto de convergência para empresas, desenvolvedores e instituições que buscam padronização e interoperabilidade no desenvolvimento de sistemas de drones, eliminando a fragmentação de soluções proprietárias e acelerando a inovação através de uma base de código aberta, auditável e extensível.

## 2.2 Estrutura de Associação

A Dronecode Foundation opera com um modelo de membresia em múltiplos níveis, que assegura sustentabilidade financeira e representatividade democrática na tomada de decisões:

- **Platinum:** Concede assentos no Board e direitos de voto estratégicos. O membro Platinum atual é a **Auterion**.
- **Silver:** Oferece participação no TSC e acesso antecipado a roadmaps técnicos. Membros Silver incluem **ARK Electronics**, **CUAV**, **Holybro**, **ModalAI** e **NXP Semiconductors**, entre outros.
- **Acadêmico e Comunidade:** Universidades, institutos de pesquisa e desenvolvedores individuais contribuem com validação científica, experimentação e manutenção de código.

## 2.3 Projetos de Alto Nível

A Dronecode Foundation hospeda cinco projetos de alto nível que cobrem, de forma integrada, o ciclo completo de desenvolvimento e operação de sistemas de drones:

### PX4 Autopilot
O **PX4 Autopilot** é o projeto de maior destaque, licenciado sob **BSD-3-Clause**. Trata-se de um flight stack modular composto por três camadas arquiteturais:
- **Flight Stack:** Controladores de voo, estimadores de estado e gerenciadores de missão.
- **Middleware:** Barramento de comunicação **uORB** (*micro Object Request Broker*), que permite a troca de mensagens entre módulos em tempo real.
- **Sistema Operacional:** Baseado em **NuttX** (RTOS para sistemas embarcados) ou **Linux** (para plataformas de maior capacidade computacional, como companion computers).

O PX4 oferece suporte nativo a simulações **SITL** (*Software In The Loop*) e **HITL** (*Hardware In The Loop*), essenciais para validação de firmware sem risco a equipamentos físicos. Seu pipeline de integração contínua utiliza **GitHub Actions** com um orquestrador em quatro níveis: linting, build de hardware, testes de unidade e testes de integração em simulador. A suíte de testes emprega **GTest**, **Catch2** e **MAVSDK** para validação funcional e de regressão<a id="ref2-link" href="#ref2"><sup>[2]</sup></a>.

### MAVLink
O **MAVLink** é um protocolo de comunicação leve, licenciado sob **MIT**, projetado especificamente para troca de mensagens entre drones e estações de controle terrestre. Sua versão 2 introduziu identificadores de mensagem de 24 bits, assinatura de pacotes para integridade e um conjunto de **231 mensagens comuns** distribuídas em **25 microsserviços**. A geração de código é realizada pela ferramenta **mavgen**, que produz *bindings* para C/C++, Python, Rust, JavaScript e outras linguagens<a id="ref3-link" href="#ref3"><sup>[3]</sup></a>.

### QGroundControl
O **QGroundControl** é a estação de controle terrestre (GCS, do inglês *Ground Control Station*) oficial do ecossistema Dronecode. Fornece interface gráfica para planejamento de missões, calibração de sensores, monitoramento de telemetria e atualização de firmware. Comunica-se exclusivamente via MAVLink, funcionando como o ponto de interação humano-máquina no ciclo de operação do drone.

### MAVSDK
O **MAVSDK** (*MAVLink Software Development Kit*) é uma biblioteca de alto nível que abstrai a complexidade do protocolo MAVLink, permitindo que desenvolvedores criem aplicações de controle de drones em linguagens modernas (C++, Python, Swift, Java, etc.) sem necessidade de manipular diretamente a estrutura binária das mensagens.

### Padrões Pixhawk
Os **Padrões Pixhawk** definem especificações de hardware aberto para *autopilots* (controladores de voo), incluindo pinagem de conectores, requisitos elétricos, formatos de dados de sensores e interfaces de barramento (I2C, SPI, UART, CAN). Esses padrões garantem interoperabilidade física entre diferentes fabricantes de hardware e o software PX4.

## 2.4 Padrões de Código e Processos

Todos os projetos sob a Dronecode Foundation adotam padrões rigorosos de qualidade de código e governança de processos:

- **Google C++ Style Guide:** Regras de formatação, nomenclatura e organização de código C++ aplicadas a todo o PX4 e MAVSDK.
- **clang-tidy:** Ferramenta de análise estática automatizada que verifica violações de estilo, *code smells* e padrões de C++ moderno.
- **Conventional Commits:** Especificação para mensagens de commit semânticas, que permitem geração automática de changelogs e versionamento semântico (SemVer).

## 2.5 Relevância para o Projeto Jacto Drones OS

A Dronecode Foundation foi selecionada como base tecnológica do Jacto Drones OS v0.1 porque fornece a **pilha de validação completa para testes de firmware** em nossa esteira CI/CD:

- O **PX4 SITL/HITL** é executado dentro de contêineres Docker no pipeline GitLab CI, permitindo que cada *merge request* seja validada contra cenários de voo simulados antes da integração ao branch principal.
- O protocolo **MAVLink** é utilizado como interface de comunicação entre o simulador e os testes automatizados, garantindo que comandos de missão, waypoints e parâmetros de voo sejam processados corretamente.
- Os padrões de código do ecossistema (Google C++ Style Guide, clang-tidy, Conventional Commits) foram incorporados como gates obrigatórios no pipeline, assegurando que o código contribuído pelo time da Jacto atenda aos mesmos critérios de qualidade exigidos pela comunidade internacional.

**Nota sobre certificação:** Os projetos Dronecode não possuem certificação direta sob normas como **ISO** ou **DO-178C**. Entretanto, seus processos de desenvolvimento, revisão de código e testes automatizados estão alinhados com objetivos de **DAL** (*Design Assurance Level*) inferiores, o que os torna adequados para aplicações agrícolas não-críticas de voo e como base para futuras certificações regulatórias.

# 3. Normas ISO/IEC de Processo e Qualidade

Esta seção detalha as normas internacionais de processo, qualidade e segurança que orientam a arquitetura, o desenvolvimento e a operação do Jacto Drones OS v0.1. Para cada norma, apresentamos seu número/ano, nome completo, relevância para o projeto e o mapeamento direto para nossa esteira CI/CD.

## 3.1 ISO/IEC/IEEE 12207:2017

**Nome completo:** *Systems and software engineering — Software life cycle processes*<a id="ref4-link" href="#ref4"><sup>[4]</sup></a>.

A ISO/IEC/IEEE 12207:2017 é a norma fundamental para processos de ciclo de vida de software. Ela organiza as atividades de desenvolvimento em **quatro grupos de processos**:

- **Agreement Processes:** Estabelecimento de contratos e requisitos entre partes (cliente, fornecedor, equipe de desenvolvimento).
- **Organizational Project-Enabling Processes:** Gestão de recursos, qualidade, infraestrutura e conhecimento.
- **Technical Management Processes:** Planejamento de projeto, avaliação de riscos, medição e controle.
- **Technical Processes:** Análise de requisitos, design arquitetural, implementação, integração, verificação, validação e transição.

**Relevância para o projeto:** A norma mapeia diretamente para as etapas da nossa esteira CI/CD. Cada stage do pipeline GitLab (build, test, deploy) pode ser rastreado a um ou mais processos técnicos da 12207. Uma nova edição da norma, discutida em comitês técnicos da ISO/IEC, busca alinhar o framework com práticas **Agile** e **DevOps**, reforçando sua aplicabilidade a pipelines de entrega contínua.

## 3.2 ISO/IEC 10746 (RM-ODP)

**Nome completo:** *Information technology — Open Distributed Processing — Reference Model*<a id="ref5-link" href="#ref5"><sup>[5]</sup></a>.

O **RM-ODP** (*Reference Model of Open Distributed Processing*) estabelece um framework conceitual para descrever sistemas distribuídos através de **cinco pontos de vista** (*viewpoints*):

- **Enterprise Viewpoint:** Contexto de negócio, objetivos e políticas organizacionais.
- **Information Viewpoint:** Semântica dos dados e regras de processamento de informação.
- **Computational Viewpoint:** Decomposição funcional do sistema em objetos e interfaces.
- **Engineering Viewpoint:** Mecanismos de infraestrutura e comunicação entre nós distribuídos.
- **Technology Viewpoint:** Escolha de tecnologias, protocolos e plataformas de implementação.

**Relevância para o projeto:** O RM-ODP já é utilizado no documento `projeto.md` como framework de descrição arquitetural da esteira CI/CD. Cada viewpoint oferece uma camada de abstração que facilita a comunicação entre stakeholders técnicos e de negócio, além de garantir que decisões de infraestrutura (Engineering e Technology) estejam alinhadas aos objetivos estratégicos da Jacto Drones (Enterprise).

## 3.3 ISO/IEC 25010:2023

**Nome completo:** *Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*<a id="ref6-link" href="#ref6"><sup>[6]</sup></a>.

A ISO/IEC 25010:2023 define um modelo de qualidade para sistemas e software, estruturado em **nove características de qualidade**:

- Functional Suitability
- Performance Efficiency
- Compatibility
- Interaction Capability (antiga Usability)
- Reliability
- Security
- Maintainability
- Flexibility
- Safety (nova na edição 2023)

**Relevância para o projeto:** A norma é aplicável como **gates automatizados** no pipeline. Ferramentas de **SAST** (*Static Application Security Testing*) verificam a característica *Security*. Testes de carga e benchmarks de simulação validam *Performance Efficiency*. Testes de regressão e estabilidade de missão simulada garantem *Reliability* e *Safety*. A inclusão de *Safety* na edição 2023 reforça ainda mais a adequação desta norma ao contexto de software para drones autônomos.

## 3.4 ISO/IEC 27001:2022

**Nome completo:** *Information security, cybersecurity and privacy protection — Information security management systems — Requirements*<a id="ref7-link" href="#ref7"><sup>[7]</sup></a>.

A ISO/IEC 27001:2022 estabelece requisitos para Sistemas de Gestão de Segurança da Informação (SGSI). Sua edição 2022 reestruturou os controles em quatro temas organizacionais, com foco especial em segurança da cadeia de suprimentos (*supply chain security*).

**Controles específicos relevantes ao projeto:**

- **A.5.21:** Gestão de segurança da cadeia de suprimentos de TI — exige o uso de **SBOM** (*Software Bill of Materials*) para rastreabilidade de componentes de software.
- **A.8.28:** Codificação segura — estabelece que práticas de desenvolvimento seguro devem ser integradas ao ciclo de vida do software.
- **A.8.31:** Separação de ambientes de desenvolvimento, teste e produção — obriga o isolamento lógico e físico entre estágios do pipeline.

**Relevância para o projeto:** A esteira CI/CD do Jacto Drones OS deve estar dentro do escopo do ISMS da Jacto Máquinas Agrícolas. Isso implica que todos os artefatos gerados (imagens Docker, binários de firmware) devem ser escaneados, assinados e rastreados via SBOM antes da promoção entre ambientes.

## 3.5 ISO/IEC/IEEE 32675:2022

**Nome completo:** *Software and systems engineering — Capabilities of CI/CD tools*<a id="ref8-link" href="#ref8"><sup>[8]</sup></a>.

A ISO/IEC/IEEE 32675:2022 é a **única norma ISO específica para DevOps e CI/CD**. Ela define um framework de capacidades para ferramentas de integração e entrega contínuas, incluindo:

- Orquestração de pipelines
- Gestão de artefatos e versionamento
- Execução de testes automatizados
- Rastreabilidade de requisitos a commits
- Segurança do pipeline e controle de acesso

**Relevância para o projeto:** A norma mapeia diretamente para a configuração do nosso pipeline GitLab CI/CD. Cada capability definida na 32675 foi considerada na seleção de ferramentas e na definição das etapas do workflow, garantindo que a esteira atenda a um padrão internacionalmente reconhecido para práticas DevOps.

## 3.6 IEC 62304

**Nome completo:** *Medical device software — Software life cycle processes*<a id="ref9-link" href="#ref9"><sup>[9]</sup></a>.

A IEC 62304 é a norma internacional para processos de ciclo de vida de software em dispositivos médicos. Discute-se em comitês técnicos uma atualização da norma para incorporar diretrizes de compatibilidade com métodos ágeis e captura automática de evidências através de pipelines CI/CD.

**Relevância para o projeto:** Embora o Jacto Drones OS não seja um dispositivo médico, a IEC 62304 serve como **modelo de referência para processos de software regulamentados**. Sua estrutura de classes de segurança (Classe A, B, C) e a exigência de rastreabilidade bidirecional entre requisitos, código e testes são diretamente aplicáveis ao desenvolvimento de software de voo autônomo, onde falhas podem causar danos materiais ou ambientais.

## 3.7 ISO 21384-2:2021

**Nome completo:** *Unmanned aircraft systems — Part 2: UAS components*<a id="ref10-link" href="#ref10"><sup>[10]</sup></a>.

A ISO 21384-2:2021 estabelece requisitos para componentes de UAS, incluindo software embarcado. Sua **Cláusula 15** trata especificamente da qualidade de software, exigindo:

- Processos de verificação e validação documentados
- Gestão de configuração de software
- Análise de riscos de segurança de software
- Testes em ambiente representativo

**Relevância para o projeto:** Como norma específica para software de drones, a ISO 21384-2:2021 é um requisito direto de conformidade. Nossa esteira CI/CD, com testes SITL/HITL e análise estática, atende aos critérios de verificação da Cláusula 15.

## 3.8 ISO 21895

**Nome completo:** *Unmanned aircraft systems — Classification*<a id="ref11-link" href="#ref11"><sup>[11]</sup></a>.

A ISO 21895 fornece um framework de classificação de UAS baseado em múltiplas dimensões: classe de operação, nível de risco, massa, altitude e complexidade do sistema.

**Relevância para o projeto:** A classificação do drone agrícola da Jacto segundo esta norma determina o rigor dos processos de qualidade e segurança aplicáveis. Drones de maior porte ou operação em modo autônomo exigem conformidade com níveis mais altos de assurance, o que se reflete diretamente na configuração de nossos gates de pipeline.

## 3.9 ISO/DIS 25132

**Nome completo:** *Unmanned aircraft systems — Levels of autonomy*<a id="ref12-link" href="#ref12"><sup>[12]</sup></a>.

A ISO/DIS 25132 define **níveis de autonomia de 0 a 5** para UAS, análogos aos níveis de autonomia veicular (SAE J3016):

- **Nível 0:** Operação totalmente manual
- **Nível 1:** Assistência ao piloto
- **Nível 2:** Automação parcial
- **Nível 3:** Automação condicional
- **Nível 4:** Automação elevada
- **Nível 5:** Autonomia total

**Relevância para o projeto:** O desenvolvimento autônomo de drones pela Jacto está alinhado aos níveis 3 a 5 desta norma. A esteira CI/CD deve garantir que, à medida que o nível de autonomia aumenta, os processos de verificação e validação também se intensifiquem, incluindo testes de missão complexa e cenários de contingência.

## 3.10 DO-178C

**Nome completo:** *Software Considerations in Airborne Systems and Equipment Certification*<a id="ref13-link" href="#ref13"><sup>[13]</sup></a>.

O **DO-178C** (e seus supplements DO-330, DO-331, DO-332, DO-333) é o padrão primário para certificação de software em sistemas aéreos, publicado pela **RTCA** e reconhecido por autoridades de aviação civil (FAA, EASA, ANAC). Ele define cinco níveis de **Design Assurance Level (DAL)**, do A (catastrófico) ao E (sem efeito de segurança), e exige rigor crescente de processos, testes e documentação.

**Relevância para o projeto:** O DO-178C é relevante para drones com **massa superior a 25 kg** ou operações comerciais autônomas em espaço aéreo controlado. Embora os drones agrícolas atuais da Jacto possam operar em categorias de menor risco, a adoção antecipada de práticas inspiradas no DO-178C (rastreabilidade de requisitos, cobertura de testes estrutural, análise de dead code) posiciona a empresa para futuras certificações regulatórias à medida que a regulamentação brasileira e internacional evolui.

# 4. Mapeamento das Normas para a Esteira CI/CD

A tabela a seguir apresenta o mapeamento sistemático entre as normas catalogadas neste documento e as etapas do pipeline de Continuous Delivery do Jacto Drones OS v0.1:

| Etapa do Pipeline | Normas e Referências Aplicáveis | Aplicação Prática |
|---|---|---|
| **Requisitos** | ISO/IEC/IEEE 12207:2017 (Agreement Processes); ISO/IEC 10746 (Enterprise Viewpoint) | Elicitação e documentação de requisitos de firmware e pipeline; alinhamento entre objetivos de negócio e especificação técnica |
| **Design** | ISO/IEC 10746 (Information e Computational Viewpoints); ISO 21895 | Modelagem arquitetural da esteira; classificação do UAS e definição de rigor dos processos |
| **Implementação** | ISO/IEC/IEEE 12207:2017 (Technical Processes); Google C++ Style Guide (Dronecode) | Codificação do firmware PX4 e scripts de pipeline; linting com clang-tidy; mensagens de commit conforme Conventional Commits |
| **Testes** | ISO/IEC 25010:2023; Dronecode PX4 SITL/HITL; MAVLink tests | Execução de simulações de voo; testes de unidade (GTest, Catch2); validação de protocolo MAVLink; verificação de qualidade e segurança |
| **Segurança** | ISO/IEC 27001:2022 (A.8.28, A.8.31); SAST tools | Análise estática de código; escaneamento de vulnerabilidades; separação de ambientes dev/teste/produção |
| **Deployment** | ISO/IEC/IEEE 32675:2022; IEC 62304 (evidence capture) | Orquestração de releases; assinatura digital de artefatos; geração de SBOM; captura automatizada de evidências de conformidade |
| **Monitoramento** | DORA metrics → ISO/IEC 25010 quality characteristics | Coleta de Deployment Frequency, Lead Time, Change Failure Rate e MTTR; correlação com características de qualidade da 25010 |

# 5. Métricas DORA e Qualidade

O projeto Jacto Drones OS v0.1 adota as **métricas DORA** (*DevOps Research and Assessment*) como indicadores primários de performance da esteira de entrega contínua. A correlação entre as quatro métricas centrais do framework DORA e as características de qualidade da ISO/IEC 25010:2023 é uma *analogia operacional* para fins de relatórios e auditorias, não uma equivalência normativa — o DORA mede performance de processo, enquanto a ISO 25010 avalia qualidade de produto. O mapeamento detalhado é apresentado a seguir<a id="ref14-link" href="#ref14"><sup>[14]</sup></a>:

### Deployment Frequency (Frequência de Deploy)
- **Definição:** Quantidade de releases para produção em um determinado período.
- **Mapeamento para ISO 25010:** *Functional Suitability* (capacidade de entregar funcionalidades de forma contínua) e *Performance Efficiency* (eficiência do pipeline em suportar entregas rápidas sem degradação).

### Lead Time for Changes (Tempo de Entrega de Mudanças)
- **Definição:** Tempo decorrido entre o commit de uma mudança e sua disponibilização em produção.
- **Mapeamento para ISO 25010:** *Time Behavior* (comportamento temporal do processo de entrega) e *Efficiency* (eficiência no uso de recursos do pipeline).

### Change Failure Rate (Taxa de Falha de Mudanças)
- **Definição:** Porcentagem de releases que resultam em defeitos, rollback ou incidentes em produção.
- **Mapeamento para ISO 25010:** *Reliability* (confiabilidade do processo de entrega) e *Maturity* (maturidade dos testes e gates de qualidade).

### Mean Time To Recovery (Tempo Médio de Recuperação - MTTR)
- **Definição:** Tempo médio necessário para recuperar o serviço após uma falha em produção.
- **Mapeamento para ISO 25010:** *Recoverability* (capacidade de recuperação do sistema) e *Availability* (disponibilidade da esteira e dos serviços de drone).

A correlação entre DORA e ISO 25010 permite que o time de engenharia da Jacto traduza melhorias operacionais da esteira em linguagem de qualidade reconhecida internacionalmente, facilitando auditorias, relatórios de conformidade e comunicação com stakeholders externos.

# 6. Referências

<a id="ref1"></a>[1] Dronecode Foundation. *About Dronecode*. Linux Foundation Collaborative Project. Disponível em: https://www.dronecode.org/ <a href="#ref1-link">↩</a>

<a id="ref2"></a>[2] PX4 Autopilot. *PX4 User Guide — Simulation*. Dronecode Foundation. Disponível em: https://docs.px4.io/ <a href="#ref2-link">↩</a>

<a id="ref3"></a>[3] MAVLink. *MAVLink Developer Guide — Message Format and Code Generation*. Disponível em: https://mavlink.io/ <a href="#ref3-link">↩</a>

<a id="ref4"></a>[4] ISO/IEC/IEEE. (2017). *ISO/IEC/IEEE 12207:2017 — Systems and software engineering — Software life cycle processes*. <a href="#ref4-link">↩</a>

<a id="ref5"></a>[5] ISO/IEC. (1998). *ISO/IEC 10746-1:1998 — Information technology — Open Distributed Processing — Reference model: Overview*. <a href="#ref5-link">↩</a>

<a id="ref6"></a>[6] ISO/IEC. (2023). *ISO/IEC 25010:2023 — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*. <a href="#ref6-link">↩</a>

<a id="ref7"></a>[7] ISO/IEC. (2022). *ISO/IEC 27001:2022 — Information security, cybersecurity and privacy protection — Information security management systems — Requirements*. <a href="#ref7-link">↩</a>

<a id="ref8"></a>[8] ISO/IEC/IEEE. (2022). *ISO/IEC/IEEE 32675:2022 — Software and systems engineering — Capabilities of CI/CD tools*. <a href="#ref8-link">↩</a>

<a id="ref9"></a>[9] IEC. (2006+AMD1:2015). *IEC 62304:2006 — Medical device software — Software life cycle processes*. <a href="#ref9-link">↩</a>

<a id="ref10"></a>[10] ISO. (2021). *ISO 21384-2:2021 — Unmanned aircraft systems — Part 2: UAS components*. <a href="#ref10-link">↩</a>

<a id="ref11"></a>[11] ISO. (2020). *ISO 21895:2020 — Unmanned aircraft systems — Classification*. <a href="#ref11-link">↩</a>

<a id="ref12"></a>[12] ISO. (em desenvolvimento). *ISO/DIS 25132 — Unmanned aircraft systems — Levels of autonomy*. <a href="#ref12-link">↩</a>

<a id="ref13"></a>[13] RTCA. (2011). *DO-178C — Software Considerations in Airborne Systems and Equipment Certification*. <a href="#ref13-link">↩</a>

<a id="ref14"></a>[14] Forsgren, N., Humble, J., & Kim, G. (2018). *Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations*. IT Revolution Press. <a href="#ref14-link">↩</a>