# Melhoria do Projeto

> Plano de ação para evolução do Jacto Drones OS v0.1 (v0.2+). Ancorado no diagnóstico em [`projeto.md` §8](projeto.md) e nos *Entregáveis Desejáveis* do TAPI.

## 1. Base do diagnóstico

O diagnóstico de partida está em [`projeto.md` §8](projeto.md) (Avaliação dos Resultados): tempos AS-IS × TO-BE em §8.1, qualitativo (centralização de governança + fechamento de malha) em §8.2, fontes em §8.3. Esta seção parte daquele diagnóstico — não o repete.

## 2. Roadmap

### Curto prazo (v0.2) — "rastro que ensina"

| Item | Evidência |
|---|---|
| Substituir `functional_tests_job` demonstrativo por PX4 SITL real + extração de `.ulg` como artefato | [`projeto.md` §5.2](projeto.md) (testes funcionais TO-BE); [`testes-funcionais.md`](testes-funcionais.md) (escopo MVP); TAPI Anexo A.4 (workflow Jacto). |
| Job `validate-log`: gates de vibração + defasagem comando×atuação | Caso de queda relatado pelo time da Jacto — TAPI Anexo B.5: *"se a gente detecta essa defasagem já nos primeiros segundos, a gente já interrompe"*. |
| ADR-0003 formalizando critérios automáticos de aprovação de log | Princípio "decisão controversa exige ADR" — ver [`decisoes/0001-eliminar-mirror-github.md`](decisoes/0001-eliminar-mirror-github.md) como referência de forma. |
| Substituir mocks dos dashboards QoS/QoP/Gerencial por dados reais do pipeline | [`dashboard-implementation-report.md`](dashboard-implementation-report.md); [`projeto.md` §4.4](projeto.md) (calibração das metas provisórias com medição efetiva). |

### Médio prazo (v0.3) — "integridade do pipeline"

| Item | Evidência |
|---|---|
| GPG signing obrigatório nos commits de `main` | [`projeto.md` §4.4](projeto.md) (assinatura digital citada, não instrumentada) + ISO 27001 A.5.21 / A.8.28 (ref [14] em §7). |
| Gitleaks pre-commit + Semgrep + CodeQL ativos como gates | [`projeto.md` §5.3](projeto.md) (SAST citado, não rodando); refs [18] e [19] em §7. |
| SBOM por release (Trivy / Syft) com retenção auditável | [`projeto.md` §5.3](projeto.md); NIST SP 800-218 (ref [15]) + CISA SBOM (ref [12]). |
| Branch protection em `main` (MR + review + pipeline verde obrigatórios) | [`dev-rules.md`](dev-rules.md) §4; [`gestao-configuração.md`](gestao-configuração.md). |

### Longo prazo (pós-M10) — *Entregáveis Desejáveis* do TAPI

| Item | Evidência |
|---|---|
| Análise de log via IA generativa | TAPI seção *Entregáveis Desejáveis* + Anexo B.5: *"1 serviço rodando que sobe o log, já gera 1 análise pra gente com a LLM"*. |
| Integração com Matlab/Simulink (Raia 1 do workflow Jacto) | TAPI Anexo A.4 — Raia 1 (Model-Based Design) com loop MIL/SIL/HIL. |
| Expansão para HIL/PIL com Pixhawk físico | TAPI Anexo A.4 — Raia 2 (Test Rigs versionados). |

## 3. Métricas de sucesso

| Métrica | Meta provisória | Fonte |
|---|---|---|
| Lead Time for Changes (DORA) | < 24h para mudanças simples | DORA Core ([6] em [`projeto.md` §7](projeto.md)) |
| Deployment Frequency (DORA) | ≥ 1 release/sprint | idem |
| Change Failure Rate (DORA) | < 15% | idem |
| Tempo de análise de voo | < 15 min (AS-IS: 2–3 dias) | TAPI Anexo B.5 |
| Cobertura de gates por commit em `main` | 100% | [`projeto.md` §5.1](projeto.md) |
