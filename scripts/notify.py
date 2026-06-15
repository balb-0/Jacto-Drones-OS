"""CLI: monta a mensagem de notificação do RESULTADO do pipeline (TG3).

Reúne o contexto das variáveis predefinidas do CI (CI_PROJECT_*, CI_PIPELINE_*,
CI_COMMIT_*) numa mensagem curta — projeto, pipeline #, branch, commit, o que
falhou e link — e a serializa como texto (para log) e como JSON (para o POST do
webhook). Espelha o eixo de feedback do demo do avaliador ("notificar o
resultado do pipeline"), adaptado ao ambiente pedagógico SEM SMTP próprio
(ver ADR-0010): com NOTIFY_WEBHOOK_URL faz POST; sem ela, o job só loga a
mensagem e referencia o Pipeline emails nativo do GitLab.

A função `build_notification` é PURA (recebe um dict de env e devolve um dict,
sem I/O nem leitura de os.environ) — testável em unit; `format_text` e
`format_json` são igualmente puras. O job (ci/notify.yml) consome este script.

Uso:
    python scripts/notify.py                 # imprime a mensagem (texto) em stdout
    python scripts/notify.py --json          # imprime o payload JSON do webhook
    python scripts/notify.py --reason "gate reprovado"   # sobrescreve o motivo
"""

from __future__ import annotations

import argparse
import json
import os
import sys
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


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--json", action="store_true", help="emite o payload JSON do webhook")
    p.add_argument("--reason", default=None, help="sobrescreve o motivo da falha")
    args = p.parse_args()

    notification = build_notification(dict(os.environ), reason=args.reason)
    print(format_json(notification) if args.json else format_text(notification))
    sys.exit(0)


if __name__ == "__main__":
    main()
