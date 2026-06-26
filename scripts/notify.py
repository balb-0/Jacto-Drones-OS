"""CLI: monta a mensagem de notificação do RESULTADO do pipeline (TG3 / TG-C2).

DOIS resultados, DOIS modos — porque "a cadeia do dado até a decisão só fecha"
quando o veredito é EMPURRADO (push), não puxado (pull), nos dois sentidos:

- FALHA (modo default, on_failure): reúne o contexto das variáveis predefinidas
  do CI (CI_PROJECT_*, CI_PIPELINE_*, CI_COMMIT_*) numa mensagem curta — projeto,
  pipeline #, branch, commit, o que falhou e link. É o caminho original do TG3.
- SUCESSO (--digest, on_success): monta um DIGEST do resultado a partir dos
  ARTEFATOS do run (reports/metrics.json, reports/anomalies.json, reports/
  deploy-*.json, reports/canary-health.json) — veredito da missão (KPIs-chave),
  nº de anomalias, status do canário/deploy e o link. Responde ao parceiro ("a
  Jacto não quer ficar olhando dashboard nem pipeline pra ver o resultado da
  simulação", ver ADR-0010 §Decisão/digest no verde).

Ambos compartilham o MESMO canal do ADR-0010 (ambiente pedagógico SEM SMTP
próprio): com NOTIFY_WEBHOOK_URL o job faz POST; sem ela, só LOGA a mensagem e
referencia o Pipeline emails nativo do GitLab. Notificar é cortesia — nunca gate.

Funções PURAS (sem I/O nem os.environ; mapa de env/artefatos → dict), testáveis
em unit: `build_notification`/`format_text`/`format_json` (falha) e
`build_result_digest`/`format_digest_text` (sucesso). A leitura de artefatos do
disco fica isolada em `load_artifact` (I/O fino, tolerante a ausência). O job
(ci/notify.yml) consome este script.

Uso:
    python scripts/notify.py                 # mensagem de FALHA (texto) em stdout
    python scripts/notify.py --json          # payload JSON do webhook (falha)
    python scripts/notify.py --reason "gate reprovado"   # sobrescreve o motivo
    python scripts/notify.py --digest        # DIGEST de SUCESSO (texto) dos artefatos
    python scripts/notify.py --digest --json # payload JSON do digest (webhook)
    python scripts/notify.py --digest --reports-dir reports   # diretório dos artefatos
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any


def build_notification(env: dict[str, str], reason: str | None = None) -> dict[str, Any]:
    """Monta o registro de notificação a partir de um mapa de variáveis do CI.

    Puro e testável: não lê os.environ nem faz I/O. Toda variável ausente
    degrada para um marcador legível ("?"/"-"), nunca KeyError — o job de
    notificação dispara justamente em cenários de falha, onde nem todo contexto
    está garantido.
    """

    def g(key: str, default: str = "?") -> str:
        value = env.get(key)
        return value if value else default

    project = g("CI_PROJECT_PATH", g("CI_PROJECT_NAME"))
    pipeline_id = g("CI_PIPELINE_ID")
    pipeline_url = g("CI_PIPELINE_URL", "-")
    branch = g("CI_COMMIT_BRANCH", g("CI_COMMIT_REF_NAME"))
    sha = g("CI_COMMIT_SHA")
    short_sha = env.get("CI_COMMIT_SHORT_SHA") or (sha[:8] if sha != "?" else "?")
    title = g("CI_COMMIT_TITLE", "-")
    author = g("CI_COMMIT_AUTHOR", "-")
    # Job que disparou o gatilho de falha (quando o trigger é o gate/anomalia).
    failed_job = g("CI_JOB_NAME", "-")

    # Motivo: explícito (flag) > nome do job que falhou > genérico. NÃO inventa
    # "voo real": a falha é da esteira/missão sintética.
    motivo = reason or env.get("NOTIFY_REASON") or f"falha no job '{failed_job}'"

    return {
        "status": "failed",
        "project": project,
        "pipeline_id": pipeline_id,
        "pipeline_url": pipeline_url,
        "branch": branch,
        "commit": short_sha,
        "commit_title": title,
        "commit_author": author,
        "failed_job": failed_job,
        "reason": motivo,
    }


def format_text(n: dict[str, Any]) -> str:
    """Renderiza a notificação como texto plano (log do job / corpo de e-mail)."""
    return "\n".join(
        [
            f"[pipeline FALHOU] {n['project']} — pipeline #{n['pipeline_id']}",
            f"  branch:  {n['branch']}",
            f"  commit:  {n['commit']} ({n['commit_title']}) por {n['commit_author']}",
            f"  falhou:  {n['reason']}",
            f"  link:    {n['pipeline_url']}",
        ]
    )


def format_json(n: dict[str, Any]) -> str:
    """Serializa o payload do webhook (JSON estável, com chave `text` pronta)."""
    payload = dict(n)
    payload["text"] = format_text(n)  # compatível com Slack/Mattermost/webhooks genéricos
    return json.dumps(payload, indent=2, ensure_ascii=False, sort_keys=True)


# ───────────────────────────────────────────────────────────────────────────
# DIGEST de SUCESSO (TG-C2) — push do resultado também no pipeline VERDE.
#
# Fecha a "cadeia dado→decisão": em vez de só gritar na falha, empurra o
# veredito do run bem-sucedido (KPIs da missão, nº de anomalias, status de
# deploy/canário, link) para o mesmo canal do ADR-0010. A Jacto NÃO precisa
# abrir dashboard nem pipeline pra saber como foi a simulação.
#
# Tudo PURO e tolerante a artefato AUSENTE/ilegível: a I/O fina mora em
# `load_artifact`; os summarizers e `build_result_digest` só recebem dicts (ou
# None) e nunca levantam KeyError — um pipeline verde sem algum artefato opcional
# (ex.: deploy só em develop/main; canário ainda não publicado) continua verde.
# ───────────────────────────────────────────────────────────────────────────

# KPIs-chave da missão exibidos no digest: (chave em metrics.json, rótulo, unidade).
# Subconjunto curado de MissionMetrics (scripts/extract_metrics.py) — o veredito
# que importa pra decisão, não o dump inteiro.
_DIGEST_KPIS: tuple[tuple[str, str, str], ...] = (
    ("mission_duration_s", "duração", "s"),
    ("max_altitude_m", "alt. máx.", "m"),
    ("max_acceleration_m_s2", "acel. máx.", "m/s²"),
    ("max_battery_drop_pct", "queda bat.", "%"),
)


def load_artifact(path: str | Path) -> dict[str, Any] | None:
    """Lê um artefato JSON do disco com GRAÇA: ausência/erro → None, nunca raise.

    Único ponto de I/O do digest. Trata como "não disponível" (None) qualquer
    arquivo inexistente, ilegível, ou que não seja um objeto JSON — para que o
    digest degrade com elegância sem derrubar um pipeline verde.
    """
    try:
        p = Path(path)
        if not p.is_file():
            return None
        data = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    return data if isinstance(data, dict) else None


def _fmt_kpi(value: Any, unit: str) -> str:
    """Renderiza um KPI numérico (com unidade) ou '?' se ausente/não-numérico."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return "?"
    # inteiro sai sem casas; float sai compacto (sem zeros à toa).
    num = f"{value:g}"
    return f"{num} {unit}".strip()


def summarize_metrics(metrics: dict[str, Any] | None) -> dict[str, Any]:
    """KPIs-chave de metrics.json → {available, line, kpis}. Tolerante a None.

    `line` é a frase do veredito ("duração 152 s · alt. máx. 48.3 m · …") ou um
    aviso de ausência. `kpis` guarda os pares cru→formatado para o payload JSON.
    """
    if not metrics:
        return {"available": False, "line": "métricas indisponíveis (sem metrics.json)", "kpis": {}}
    kpis: dict[str, str] = {}
    parts: list[str] = []
    for key, label, unit in _DIGEST_KPIS:
        rendered = _fmt_kpi(metrics.get(key), unit)
        kpis[key] = rendered
        parts.append(f"{label} {rendered}")
    return {"available": True, "line": " · ".join(parts), "kpis": kpis}


def summarize_anomalies(anomalies_doc: dict[str, Any] | None) -> dict[str, Any]:
    """anomalies.json ({_meta, anomalies}) → contagem total/critical/warning.

    Conta a partir da lista `.anomalies` (fonte da verdade); cai para
    `_meta.n_anomalias` se a lista faltar. Ausência total → available=False.
    """
    if not anomalies_doc:
        return {"available": False, "total": None, "critical": 0, "warning": 0,
                "line": "anomalias indisponíveis (sem anomalies.json)"}
    items = anomalies_doc.get("anomalies")
    if isinstance(items, list):
        critical = sum(1 for a in items if isinstance(a, dict) and a.get("severity") == "CRITICAL")
        total = len(items)
        warning = total - critical
    else:
        # sem a lista, confia no contador do _meta (pode ser None).
        meta = anomalies_doc.get("_meta") or {}
        total = meta.get("n_anomalias")
        critical = warning = 0
    if total == 0:
        line = "0 anomalias (voo limpo)"
    elif total is None:
        line = "anomalias: contagem indisponível"
    else:
        line = f"{total} anomalia(s): {critical} CRITICAL, {warning} WARNING"
    return {"available": True, "total": total, "critical": critical,
            "warning": warning, "line": line}


def summarize_deploys(deploys: dict[str, dict[str, Any] | None]) -> dict[str, Any]:
    """Manifests de deploy por ambiente (deploy-*.json) → resumo legível.

    `deploys`: {env: manifest|None}. Lista os ambientes promovidos neste run
    (manifest presente), marcando rollback. Nenhum presente → available=False
    (ex.: branch de feature sem deploy automático — normal, não é erro).
    """
    present = {env: m for env, m in deploys.items() if m}
    if not present:
        return {"available": False, "environments": [], "line": "deploy: nenhum manifesto neste run"}
    labels: list[str] = []
    envs: list[str] = []
    for env, manifest in present.items():
        envs.append(env)
        ref = manifest.get("artifact_ref") or manifest.get("artifact_sha") or "?"
        tag = " (rollback)" if manifest.get("rollback") else ""
        labels.append(f"{env}←{ref}{tag}")
    return {"available": True, "environments": envs, "line": "deploy: " + ", ".join(labels)}


def summarize_canary(canary: dict[str, Any] | None) -> dict[str, Any]:
    """canary-health.json → status do canário (DEFENSIVO: contrato externo).

    O manifesto do canário é produzido por outro fluxo (TG-C1) cujo shape exato
    pode evoluir; por isso lemos de forma defensiva, aceitando várias chaves
    plausíveis para o veredito ('status'/'health'/'healthy'/'ok') e nunca
    impondo um formato. Ausência → available=False (passo opcional do run).
    """
    if not canary:
        return {"available": False, "status": None, "line": "canário: sem healthcheck neste run"}
    status: Any = None
    for key in ("status", "health", "state", "result", "verdict"):
        if isinstance(canary.get(key), str):
            status = canary[key]
            break
    if status is None:
        # veredito booleano? (healthy/ok/passed) → traduz pra rótulo legível.
        for key in ("healthy", "ok", "passed", "success"):
            if isinstance(canary.get(key), bool):
                status = "healthy" if canary[key] else "unhealthy"
                break
    if status is None:
        status = "desconhecido"
    return {"available": True, "status": status, "line": f"canário: {status}"}


def build_result_digest(
    env: dict[str, str],
    metrics: dict[str, Any] | None = None,
    anomalies: dict[str, Any] | None = None,
    deploys: dict[str, dict[str, Any] | None] | None = None,
    canary: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Monta o DIGEST de SUCESSO a partir do env + artefatos JÁ carregados (PURO).

    Espelho do `build_notification` para o caminho verde: não lê disco nem
    os.environ; recebe os artefatos como dicts (ou None) e devolve um registro
    serializável. Toda ausência degrada para um resumo legível, jamais KeyError —
    notificar o sucesso é cortesia e não pode quebrar o pipeline verde.
    """

    def g(key: str, default: str = "?") -> str:
        value = env.get(key)
        return value if value else default

    sha = g("CI_COMMIT_SHA")
    short_sha = env.get("CI_COMMIT_SHORT_SHA") or (sha[:8] if sha != "?" else "?")

    m = summarize_metrics(metrics)
    a = summarize_anomalies(anomalies)
    d = summarize_deploys(deploys or {})
    c = summarize_canary(canary)

    # Veredito de UMA linha pra leitura rápida (topo da mensagem): missão OK +
    # contagem de anomalias. NÃO inventa "voo real" — é a missão SITL sintética.
    if a.get("total") in (0, None):
        verdict = "missão SITL aprovada"
    else:
        verdict = f"missão SITL aprovada · {a['total']} anomalia(s) registrada(s)"

    return {
        "status": "success",
        "kind": "result-digest",
        "project": g("CI_PROJECT_PATH", g("CI_PROJECT_NAME")),
        "pipeline_id": g("CI_PIPELINE_ID"),
        "pipeline_url": g("CI_PIPELINE_URL", "-"),
        "branch": g("CI_COMMIT_BRANCH", g("CI_COMMIT_REF_NAME")),
        "commit": short_sha,
        "commit_title": g("CI_COMMIT_TITLE", "-"),
        "commit_author": g("CI_COMMIT_AUTHOR", "-"),
        "verdict": verdict,
        "metrics": m,
        "anomalies": a,
        "deploy": d,
        "canary": c,
    }


def format_digest_text(dg: dict[str, Any]) -> str:
    """Renderiza o digest de sucesso como texto (log do job / corpo de e-mail)."""
    return "\n".join(
        [
            f"[pipeline VERDE] {dg['project']} — pipeline #{dg['pipeline_id']}",
            f"  veredito: {dg['verdict']}",
            f"  branch:   {dg['branch']}  commit: {dg['commit']} ({dg['commit_title']})",
            f"  KPIs:     {dg['metrics']['line']}",
            f"  {dg['anomalies']['line']}",
            f"  {dg['deploy']['line']}",
            f"  {dg['canary']['line']}",
            f"  link:     {dg['pipeline_url']}",
        ]
    )


def format_digest_json(dg: dict[str, Any]) -> str:
    """Serializa o payload do webhook para o digest (JSON estável, chave `text`)."""
    payload = dict(dg)
    payload["text"] = format_digest_text(dg)  # pronto p/ Slack/Mattermost/webhook genérico
    return json.dumps(payload, indent=2, ensure_ascii=False, sort_keys=True)


def load_result_digest(env: dict[str, str], reports_dir: str | Path = "reports") -> dict[str, Any]:
    """Carrega os artefatos do disco (com graça) e monta o digest — ORQUESTRA I/O.

    Procura, sob `reports_dir`: metrics.json, anomalies.json, deploy-canary.json,
    deploy-staging.json, deploy-prod.json e canary-health.json. Qualquer ausência
    é tolerada por `load_artifact` (→ None) e tratada pelos summarizers. A montagem
    em si é a função pura `build_result_digest`.
    """
    base = Path(reports_dir)
    deploys = {
        env_name: load_artifact(base / f"deploy-{env_name}.json")
        for env_name in ("canary", "staging", "prod")
    }
    return build_result_digest(
        env,
        metrics=load_artifact(base / "metrics.json"),
        anomalies=load_artifact(base / "anomalies.json"),
        deploys=deploys,
        canary=load_artifact(base / "canary-health.json"),
    )


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--json", action="store_true", help="emite o payload JSON do webhook")
    p.add_argument("--reason", default=None, help="sobrescreve o motivo da falha")
    p.add_argument(
        "--digest",
        action="store_true",
        help="modo SUCESSO: digest do resultado (KPIs, anomalias, deploy/canário) dos artefatos",
    )
    p.add_argument(
        "--reports-dir",
        default="reports",
        help="diretório dos artefatos do run para o digest (default: reports)",
    )
    args = p.parse_args()

    if args.digest:
        # Caminho VERDE (TG-C2): lê os artefatos do run e empurra o resultado.
        digest = load_result_digest(dict(os.environ), reports_dir=args.reports_dir)
        print(format_digest_json(digest) if args.json else format_digest_text(digest))
        sys.exit(0)

    # Caminho de FALHA original (TG3) — inalterado.
    notification = build_notification(dict(os.environ), reason=args.reason)
    print(format_json(notification) if args.json else format_text(notification))
    sys.exit(0)


if __name__ == "__main__":
    main()
