# ADR-0011 — Matrix multi-cliente: conjuntos de missões via parallel:matrix

**Status:** Aceito
**Data:** 2026-06-14
**Autores:** G04 (Sprint 4)

> **Prova de conceito pedagógica, não multi-tenancy real.** Este ADR introduz a
> ideia de "vários clientes" como **conjuntos de missões** parametrizando o
> MESMO job SITL via `parallel:matrix`. Não há repositório por cliente, isolamento
> de credenciais por tenant, namespaces nem qualquer fronteira de segurança real:
> é um exercício didático que demonstra o mecanismo `parallel:matrix` do GitLab e
> a noção de "mesmo firmware, missões diferentes". No espírito "rastro que ensina"
> do orientador Reginaldo, a fronteira do que é real fica explícita aqui.

## Contexto

O job `sitl-mission-metrics` (`ci/sitl-metrics.yml`, ADR-0006) builda o PX4 do
zero, sobe SITL + `mavsdk_server` headless, roda **uma** missão fixa
(`missions/square_50m.yaml`) e extrai `reports/metrics.json` do `.ulg` real. É a
prova de que a esteira voa um cenário de ponta a ponta.

Na narrativa da Jacto, o mesmo firmware de drone atende **clientes diferentes**,
cada um com seu envelope de operação (talhões maiores/menores, altitudes e
velocidades de aplicação distintas). Surge a pergunta de plataforma: *como a
esteira valida o mesmo firmware contra mais de um perfil de missão sem duplicar
o pipeline?*

A resposta nativa do GitLab é `parallel:matrix`: uma única definição de job
gera N execuções paralelas, cada uma com um valor de variável diferente. É o
mesmo recurso que pipelines reais usam para testar uma build contra várias
plataformas/configurações.

## Decisão

1. **"Cliente" = um conjunto de missões versionado em `missions/<cliente>/`.**
   Cada cliente tem ao menos uma missão `.yaml` derivada de `square_50m.yaml`,
   mantendo o schema que `scripts/run_mission.py` / `load_mission` esperam
   (`home`, `takeoff_altitude_m`, `cruise_speed_m_s`, `acceptance_radius_m`,
   `waypoints[]` em NED, `limits`). O que varia entre clientes é o **envelope**:
   waypoints (tamanho do talhão), altitude e velocidade de cruzeiro.

2. **Reduzido a 2 clientes (`cliente_a`, `cliente_b`) como prova de conceito.**
   O job SITL é caro (build PX4 do zero, ~até 55 min de timeout por execução); a
   matrix multiplica esse custo por cliente. Dois clientes bastam para demonstrar
   o mecanismo sem estourar o orçamento de CI da turma. Escalar para 3+ é trocar
   uma linha na lista da matrix.

3. **`parallel:matrix` no `sitl-mission-metrics`**, eixo `CLIENTE: [cliente_a,
   cliente_b]`. O **mesmo firmware** (mesmo build PX4, mesma imagem, mesmo
   `PX4_TAG`) roda a missão de cada cliente. Cada execução extrai um artefato
   **distinto e sufixado**, `reports/metrics-$CLIENTE.json`, do seu próprio
   `.ulg` real — sem mock. Os guards anti-falso-verde (px4 vivo, `.ulg` gerado,
   métricas não-degeneradas) são preservados por execução.

## Fronteira da prova de conceito (o que NÃO é)

- **Não é multi-tenancy real.** Não há repositório, projeto GitLab, runner,
  credencial nem namespace por cliente — apenas pastas de missão no mesmo repo.
- **Não há isolamento de segurança** entre "clientes": todos compartilham o mesmo
  pipeline, mesmo runner e mesmos segredos do projeto.
- **Não é onboarding de cliente real.** "Adicionar cliente" aqui é criar uma
  pasta `missions/<novo>/` e incluir o nome na lista da matrix — não há fluxo de
  provisionamento, billing ou SLA.
- **Telemetria de dashboard segue à parte.** O `flight-telemetry.json` consumido
  pelo dashboard (`src/src/`) é **sintético** (`scripts/generate_telemetry.py`),
  desacoplado do SITL; a matrix não o gera nem o sufixa por cliente. O artefato
  por cliente que a matrix produz é o `metrics-$CLIENTE.json` real do `.ulg`.

## Alternativas consideradas (e rejeitadas para a Sprint 4)

- **Um pipeline/projeto GitLab por cliente.** Seria o mais próximo de
  multi-tenancy real, mas exige N repositórios/configurações e foge do escopo
  pedagógico (e do orçamento). Rejeitada; fica como evolução se houver cliente
  real.
- **Loop sobre missões dentro de um único job** (sem matrix). Esconde os clientes
  num único job (logs e artefatos misturados, sem paralelismo) e não demonstra o
  recurso `parallel:matrix`. Rejeitada por ser menos legível e menos didática.
- **Mais de 2 clientes já na PoC.** Multiplicaria o custo do job SITL sem ganho
  conceitual. Rejeitada; 2 já provam o mecanismo, escalar é trivial.

## Consequências

**Positivas:** demonstra `parallel:matrix` (recurso real de pipelines) com um
caso de negócio plausível (mesmo firmware, perfis de missão por cliente);
artefatos por cliente reais (`.ulg` → `metrics-$CLIENTE.json`), auditáveis;
mudança mínima e aditiva no job existente (preserva os guards e o fluxo de
ADR-0006); escalar para mais clientes é trivial.

**Negativas:** custo de CI multiplicado pelo número de clientes (cada execução
rebuilda o PX4 — mitigado por `cache: .ccache` compartilhado entre as execuções
da matrix); a abstração "cliente" é didática e pode dar falsa impressão de
multi-tenancy se lida fora deste ADR (mitigado por esta seção de fronteira).

## ADRs relacionadas

- **ADR-0003** — critérios de aprovação do log SITL; `square_50m.yaml` é a missão
  baseline da qual as missões por cliente derivam.
- **ADR-0006** — CD sem registry: a matrix preserva o modelo (build in-job,
  artefato de CI por SHA, sem rebuild de imagem entre ambientes).
