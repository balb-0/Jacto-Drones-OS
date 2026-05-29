# Mapa de Cobertura do Deploy (CD) — Sprint 3

> Estende os mapas de cobertura da Sprint 2 (`projeto.md` §5.6/§5.7) ao lado de
> **deploy** (CD). Cada integração declara **contrato operacional**
> (gatilho × dado de entrada × saída esperada × critério de falha por interface),
> respondendo ao feedback do avaliador da Sprint 2 (item 1). Evidência no entorno
> imediato: as tabelas abaixo, e os arquivos `ci/*.yml` + `scripts/` citados.

## 1. Cobertura Funcional do Deploy

| Componente | Job (stage) | Onde roda | Artefato produzido |
|---|---|---|---|
| Build PX4 SITL | `sitl-mission-metrics` (build) | id=100, imagem pública px4-dev | binário `px4_sitl_default` |
| Missão simulada | `sitl-mission-metrics` (test) | mesmo job (jmavsim headless) | `.ulg` |
| Extração de métricas | `sitl-mission-metrics` (test) | mesmo job (pyulog) | `metrics.json` (artefato) |
| Quality gates | `quality-gates` (gate) | id=100 | `quality_gates_result.json` |
| Deploy staging | `deploy_staging` (deploy) | id=100 | `deploy-staging.json` + Environment |
| Deploy prod | `deploy_prod` (deploy, manual) | id=100 | `deploy-prod.json` + Environment |
| Release | `release` (deploy, tag `v*`) | id=100 | GitLab Release (checksum/SBOM) |
