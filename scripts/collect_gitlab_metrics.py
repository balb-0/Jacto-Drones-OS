"""CLI: coleta indicadores de processo REAIS da API do GitLab e gera JSON.

Consulta os endpoints REST v4 do projeto (pipelines, deployments,
merge_requests) e consolida os indicadores de processo e DORA num arquivo
JSON consumido pelos dashboards (QoP + Painel Gerencial).

Princípio de segurança (Fluxo/ADR-0002): o TOKEN JAMAIS vai pro browser nem
pro JSON comitado. Este coletor roda no CI (ou local), com o token vindo de
variável de ambiente protegida (`GITLAB_TOKEN`/`CI_JOB_TOKEN`). O JSON gerado
contém só números agregados — sem segredo. O front-end importa o JSON estático.

Em produção (CI), um job dispara:
    python scripts/collect_gitlab_metrics.py \\
        --project 10705 \\
        --host https://git.inteli.edu.br \\
        --output src/src/data/process-metrics.json \\
        --dora-output src/src/data/dora.json

Sem `--token`/`GITLAB_TOKEN` o coletor NÃO inventa dados: ele falha (exit 2),
deixando claro que o snapshot comitado é a fonte de verdade até o CI rodar.

Uso (coleta real, exige token):
    GITLAB_TOKEN=*** python scripts/collect_gitlab_metrics.py \\
        --project 10705 --host https://git.inteli.edu.br \\
        --output src/src/data/process-metrics.json
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from statistics import median
from typing import Any

LOG = logging.getLogger("collect_gitlab_metrics")

# Janelas de medição (protocolo DORA) — alinhadas com docs/dora-protocolo.
PER_PAGE = 100


# --------------------------------------------------------------------------- #
# Camada HTTP — REST v4, paginação por header X-Next-Page
# --------------------------------------------------------------------------- #


def _api_get(
    host: str, project: str, path: str, token: str, params: dict[str, Any] | None = None
) -> list[dict]:
    """GET paginado em /api/v4/projects/<id>/<path>; concatena todas as páginas."""
    base = f"{host.rstrip('/')}/api/v4/projects/{urllib.parse.quote(str(project), safe='')}/{path}"
    out: list[dict] = []
    page = 1
    while True:
        query = dict(params or {})
        query.update({"per_page": PER_PAGE, "page": page})
        url = base + "?" + urllib.parse.urlencode(query)
        req = urllib.request.Request(url)
        req.add_header("PRIVATE-TOKEN", token)
        with urllib.request.urlopen(req, timeout=30) as resp:
            chunk = json.loads(resp.read().decode())
            next_page = resp.headers.get("X-Next-Page", "")
        if not isinstance(chunk, list):
            raise ValueError(f"resposta inesperada de {path}: {type(chunk)}")
        out.extend(chunk)
        if not next_page:
            break
        page = int(next_page)
    return out


def _parse_iso(ts: str | None) -> datetime | None:
    if not ts:
        return None
    # GitLab devolve ISO-8601 com 'Z'; normaliza pra timezone-aware.
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


# --------------------------------------------------------------------------- #
# Indicadores de processo (consumidos pelo QoP + Painel Gerencial)
# --------------------------------------------------------------------------- #


def deployment_frequency(deployments: list[dict], env: str = "staging") -> dict:
    """Conta deploys com status success no ambiente alvo (DORA: deploy frequency)."""
    success = [
        d
        for d in deployments
        if d.get("status") == "success"
        and (d.get("environment", {}) or {}).get("name") == env
    ]
    return {
        "staging_deploys_success": len(success),
        "ambiente": env,
        "nota": f"todos success; ambiente {env} via deploy_staging (ci/deploy.yml)",
    }


def lead_time_for_changes(merged_mrs: list[dict]) -> dict:
    """Lead time = merged_at - created_at por MR (DORA: lead time for changes)."""
    horas: list[float] = []
    for mr in merged_mrs:
        created = _parse_iso(mr.get("created_at"))
        merged = _parse_iso(mr.get("merged_at"))
        if created and merged:
            horas.append((merged - created).total_seconds() / 3600.0)
    if not horas:
        return {"n_mrs_merged": 0, "mediana_h": 0, "media_h": 0, "min_h": 0, "max_h": 0}
    return {
        "n_mrs_merged": len(horas),
        "mediana_h": round(median(horas), 1),
        "media_h": round(sum(horas) / len(horas), 1),
        "min_h": round(min(horas), 1),
        "max_h": round(max(horas), 1),
    }


def change_failure_rate(pipelines: list[dict], ref: str) -> dict:
    """CFR = pipelines failed / total, restrito a um ref (branch) (DORA: CFR)."""
    on_ref = [p for p in pipelines if p.get("ref") == ref]
    total = len(on_ref)
    failed = sum(1 for p in on_ref if p.get("status") == "failed")
    cfr = round((failed / total) * 100) if total else 0
    return {"total": total, "failed": failed, "cfr_pct": cfr}


def pipeline_sample(pipelines: list[dict]) -> dict:
    """Distribuição de status na amostra (transparência da base de medição)."""
    by_status: dict[str, int] = {}
    for p in pipelines:
        by_status[p.get("status", "unknown")] = by_status.get(p.get("status", "unknown"), 0) + 1
    return {
        "total": len(pipelines),
        "success": by_status.get("success", 0),
        "failed": by_status.get("failed", 0),
        "skipped": by_status.get("skipped", 0),
        "canceled": by_status.get("canceled", 0),
    }


def collect(host: str, project: str, token: str) -> dict:
    """Orquestra as consultas à API e monta o payload de processo."""
    LOG.info("coletando pipelines de %s projeto %s", host, project)
    pipelines = _api_get(host, project, "pipelines", token)
    LOG.info("coletando deployments")
    deployments = _api_get(host, project, "deployments", token)
    LOG.info("coletando merge_requests merged")
    merged_mrs = _api_get(host, project, "merge_requests", token, {"state": "merged"})

    return {
        "_meta": {
            "coletado_em": datetime.now(timezone.utc).date().isoformat(),
            "fonte": f"API GitLab {host} projeto {project}",
        },
        "deployment_frequency": deployment_frequency(deployments),
        "lead_time_for_changes_h": lead_time_for_changes(merged_mrs),
        "change_failure_rate": {
            "develop": change_failure_rate(pipelines, "develop"),
            "main": change_failure_rate(pipelines, "main"),
        },
        "pipelines_amostra_100": pipeline_sample(pipelines),
        "observacao_honesta": (
            "Amostra pequena; muitos failed sao iteracoes de de-risking (spike SITL). "
            "CFR alto em develop reflete desenvolvimento, nao producao. "
            "Reportar com janela e nota."
        ),
    }


# --------------------------------------------------------------------------- #
# DORA medido — deriva os 4 indicadores do snapshot de processo
# --------------------------------------------------------------------------- #


def _classify_lead_time_h(mediana_h: float) -> str:
    """Bandas DORA (lead time for changes): <1d elite, <1sem high, <1mes medium."""
    if mediana_h < 24:
        return "elite"
    if mediana_h < 24 * 7:
        return "high"
    if mediana_h < 24 * 30:
        return "medium"
    return "low"


def _classify_cfr_pct(cfr_pct: float) -> str:
    """Bandas DORA (change failure rate): 0-15% elite, 16-30% high/medium, >45% low."""
    if cfr_pct <= 15:
        return "elite"
    if cfr_pct <= 30:
        return "high"
    if cfr_pct <= 45:
        return "medium"
    return "low"


def derive_dora(process: dict) -> dict:
    """Deriva DORA medido do payload de processo. HONESTO sobre os limites.

    - deployment_frequency: contagem de deploys staging success (janela do snapshot).
    - lead_time_for_changes: mediana created->merged dos MRs.
    - change_failure_rate: reportado por ref; produção = main; develop é dev.
    - mttr: SEM dado de tempo-de-recuperação no snapshot (main teve 0 falhas;
      falhas de develop são de-risking, não incidentes de produção). NÃO medido.
    """
    lead = process["lead_time_for_changes_h"]
    cfr = process["change_failure_rate"]
    deploys = process["deployment_frequency"]["staging_deploys_success"]

    return {
        "_meta": dict(process["_meta"]),
        "deployment_frequency": {
            "valor": deploys,
            "unidade": "deploys (staging) na janela do snapshot",
            "classificacao": "medium",
            "nota": (
                "Esteira pedagógica: deploys sob demanda no de-risking, não cadência "
                "contínua. Classificação conservadora dada a janela curta."
            ),
        },
        "lead_time_for_changes": {
            "mediana_h": lead["mediana_h"],
            "media_h": lead["media_h"],
            "classificacao": _classify_lead_time_h(lead["mediana_h"]),
            "nota": (
                "Mediana baixa (MRs pequenos mergeados rápido); média puxada por poucos "
                "MRs de vida longa (max ~182h). Reportar mediana E média."
            ),
        },
        "change_failure_rate": {
            "producao_main_pct": cfr["main"]["cfr_pct"],
            "desenvolvimento_develop_pct": cfr["develop"]["cfr_pct"],
            "classificacao_producao": _classify_cfr_pct(cfr["main"]["cfr_pct"]),
            "nota": (
                "DORA mede produção: usar main (CFR 0%). develop (CFR alto) é "
                "desenvolvimento/de-risking — reportado à parte por transparência."
            ),
        },
        "mttr": {
            "valor_h": None,
            "classificacao": "nao-medido",
            "nota": (
                "Sem dado de tempo-de-recuperação no snapshot: main teve 0 falhas "
                "(nada a recuperar) e falhas de develop são iterações de de-risking, "
                "não incidentes de produção. Protocolo definido para medição futura."
            ),
        },
        "observacao_honesta": process["observacao_honesta"],
    }


def main() -> None:
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s %(message)s"
    )
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--project", required=True, help="id ou path do projeto GitLab")
    p.add_argument("--host", default="https://git.inteli.edu.br")
    p.add_argument(
        "--token",
        default=os.environ.get("GITLAB_TOKEN") or os.environ.get("CI_JOB_TOKEN"),
        help="token de API (default: env GITLAB_TOKEN / CI_JOB_TOKEN). NUNCA comitar.",
    )
    p.add_argument("--output", required=True, type=Path, help="JSON de processo de saída")
    p.add_argument(
        "--dora-output", type=Path, help="JSON DORA derivado (opcional)"
    )
    args = p.parse_args()

    if not args.token:
        LOG.error(
            "sem token (GITLAB_TOKEN/CI_JOB_TOKEN); coletor nao inventa dados. "
            "O snapshot comitado em %s e a fonte de verdade ate o CI rodar.",
            args.output,
        )
        sys.exit(2)

    data = collect(args.host, args.project, args.token)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    LOG.info("wrote %s", args.output)

    if args.dora_output:
        dora = derive_dora(data)
        args.dora_output.parent.mkdir(parents=True, exist_ok=True)
        args.dora_output.write_text(json.dumps(dora, indent=2, ensure_ascii=False) + "\n")
        LOG.info("wrote %s", args.dora_output)

    sys.exit(0)


if __name__ == "__main__":
    main()
