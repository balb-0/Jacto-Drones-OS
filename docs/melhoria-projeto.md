# Melhoria do Projeto — Roadmap pós-Sprint 2

> Documento auxiliar de Avaliação dos Resultados (Task 3.2 da rubrica peso 9 da Sprint 2). Esboço inicial — será refinado ao longo da Sprint 3 com base na medição real do pipeline e no feedback da Sprint 2.

## 1. Contexto

O Jacto Drones OS v0.1 conclui a Sprint 2 com a esteira básica de Continuous Delivery em operação: pipeline GitLab CI/CD em execução, dashboards QoS/QoP/Gerencial em Next.js consumindo dados mock, e testes funcionais demonstrativos cobrindo o flow MVP do PX4 SITL. A documentação técnica do produto (arquitetura ISO 10746, mapa de cobertura de funcionalidades e não funcionalidades, mapeamento da integração) está consolidada em `main` na tag `v0.2.0`.

Este documento sintetiza, com base no panorama atual e nas validações do parceiro durante a Sprint Review (Vinícius Lopes — Jacto, 30/04/2026), as **melhorias propostas para o projeto** ao longo das Sprints 3 a 5 e do pós-M10.

## 2. Gargalos identificados

Fontes: dashboard Painel Gerencial (anomalias e gargalos), feedback formal do avaliador da Sprint 1 (30/04/2026), e Sprint Review com a Jacto.

- **Dados reais ainda ausentes:** os dashboards QoS/QoP/Gerencial operam sobre mocks. Sem instrumentação real, a malha fechada do pipeline não se fecha.
- **Validação de log do PX4:** o `functional_tests_job` é demonstrativo (script Python com cenários simulados). A integração real com PX4 SITL + Gazebo + extração de `.ulg` + gates de vibração e defasagem ainda precisa ser implementada — exatamente o gargalo crítico que a Jacto sinalizou (2-3 dias por análise manual de voo, TAPI Anexo B.5).
- **Eixo "integridade" do orientador (Reginaldo):** GPG signing, Gitleaks, SAST efetivo e SBOM mencionados em `projeto.md` §4.4 e §5.3 ainda não estão instrumentados na pipeline real.
- **Documentação rastreável incompleta:** alguns docs em `develop` (ex.: `mapa-cobertura-integracao.md`, `dashboard-implementation-report.md`) ainda têm afirmações sem referência numerada — débito do princípio "objetividade com referência rastreável".

## 3. Roadmap proposto

### 3.1 Curto prazo (Sprint 3) — Eixo "rastro que ensina" (Reginaldo)

- Substituir o `functional_tests_job` demonstrativo por execução real de **PX4 SITL** em Gazebo dentro do pipeline, gerando log `.ulg` como artefato.
- Implementar `validate-log` como job: extração de métricas-chave (vibração, defasagem comando × atuação, perfil de altitude) e gate de aprovação automática conforme thresholds derivados do caso de queda relatado pela Jacto.
- Conectar dashboards QoS/QoP a fontes reais (logs do GitLab CI + relatórios do runner Python).
- Calibrar números fortes (`Pipeline <15 min`, `SITL <10 min`, `SLA 99,9%`) a partir da medição real — substituir a marcação de "meta provisória" do `projeto.md` §4.4 por valores observados.
- Implementar `ADR-0003` documentando os critérios automáticos de aprovação/reprovação de voo simulado (referenciar Reginaldo: "rastro que ensina" — critério não pode ser caixa-preta, precisa ser auditável).

### 3.2 Médio prazo (Sprints 4–5) — Eixo "integridade do pipeline" (Reginaldo)

- **Assinatura digital de commits:** GPG signing obrigatório nos commits da `main`, com chave de chave de cada integrante registrada no GitLab.
- **Detecção de secrets:** `gitleaks` como hook pre-commit + job no pipeline.
- **SAST efetivo:** Semgrep + CodeQL configurados no pipeline com regras adaptadas ao domínio (C++ para firmware, TS para dashboard).
- **SBOM gerado por job:** Trivy / Syft produzindo SBOM em cada release, com retenção de longo prazo em bucket auditável.
- **Política de branch protection:** configurar `main` como protegida, exigindo MR + 1 review + pipeline verde.
- **Painel Gerencial conectado a dados reais:** anomalias detectadas a partir de séries históricas de cycle time, throughput e taxa de falha por job.

### 3.3 Longo prazo (pós-M10) — Entregáveis Desejáveis (TAPI)

- **Integração com IA generativa para análise de log** (sonho declarado pela Jacto, Held citado no TAPI Anexo B.5): serviço que recebe `.ulg`, gera análise e retorna status do voo em linguagem natural.
- **Conexão com Matlab/Simulink:** importação de modelos do time da Jacto para alimentar o pipeline com requisitos de alto nível (Model-Based Design da Raia 1 do workflow Jacto descrito no TAPI Anexo A.4).
- **Expansão para HIL/PIL:** runners dedicados com Pixhawk físico para validação em hardware real, com gates específicos no pipeline.
- **Conectores Jira/Notion bidirecionais:** automação completa de `Problem Reports` retornando ao backlog conforme workflow declarado pelo parceiro.

## 4. Métricas de sucesso

Combinação de **métricas DORA** com adaptação do framework **REACH** ao contexto do parceiro:

- **Lead Time for Changes (DORA):** tempo da abertura de issue ao deploy. Meta provisória de elite performer: <24h para mudanças simples.
- **Deployment Frequency (DORA):** frequência de releases promovidas para `main`. Meta: pelo menos uma release por sprint do projeto acadêmico (~quinzenal).
- **Change Failure Rate (DORA):** % de releases que precisam de reverter ou hotfix. Meta: <15%.
- **Mean Time to Restore (DORA):** tempo entre detecção de falha e correção. Meta: <1 dia.
- **Tempo de análise de voo (adaptação REACH):** redução do tempo manual (2–3 dias hoje) para tempo automatizado via pipeline. Meta provisória: <15 minutos.
- **Cobertura de gates por commit:** % de commits que passam por lint + build + test + SAST. Meta: 100% para `main`.

## 5. Referências

- TAPI_ESMD10_V01.pdf — seção *Entregáveis Desejáveis* e Anexos A.4, B.5, B.6, B.8.
- Sprint Review 1 (30/04/2026) — validação do vetor "logs do PX4" pelo Vinícius Lopes (Jacto).
- Feedback formal do avaliador da Sprint 1 (30/04/2026, nota 6,5/10) e conversa oral pós-feedback.
- DORA Core Model — DevOps Research and Assessment (https://dora.dev/research/).
- Forsgren, Humble & Kim (2018), *Accelerate*.
- `docs/projeto.md` §8 — Avaliação dos Resultados.
- `docs/decisoes/0001-eliminar-mirror-github.md` e `docs/decisoes/0002-adotar-nextjs-dashboard.md`.
- Princípios operacionais permanentes do G04 (`guia/guia-v1.md`).
