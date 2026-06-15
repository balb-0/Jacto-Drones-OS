'use client';

import { Badge } from '@/components/ui/badge';
import type { DoraMetricsReal } from '@/types/metrics';
import type { PipelineSnapshot, AuditRefKind } from '@/types/pipeline';
import {
  LayoutDashboard,
  Rocket,
  Clock,
  GitMerge,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  GitBranch,
  Tag,
  GitPullRequest,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DORA_BADGE: Record<
  string,
  'primary' | 'secondary' | 'warning' | 'error' | 'default'
> = {
  elite: 'primary',
  high: 'secondary',
  medium: 'warning',
  low: 'error',
  'nao-medido': 'default',
};

const AUDIT_ICON: Record<AuditRefKind, React.ComponentType<{ className?: string }>> = {
  pipeline: GitBranch,
  merge_request: GitPullRequest,
  tag: Tag,
};

interface ConsolidatedPanelProps {
  dora: DoraMetricsReal;
  snapshot: PipelineSnapshot;
}

/** Tile compacto de um numero consolidado. */
function Tile({
  icon: Icon,
  label,
  value,
  sub,
  badge,
  badgeVariant = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'secondary' | 'warning' | 'error' | 'default';
}) {
  return (
    <div className="p-5 border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-secondary" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          {label}
        </p>
      </div>
      <p className="text-3xl font-black italic leading-none mb-2">{value}</p>
      {badge && (
        <Badge variant={badgeVariant} size="sm">
          {badge}
        </Badge>
      )}
      {sub && (
        <p className="mt-2 text-[10px] font-bold text-gray-600 uppercase italic leading-tight">
          {sub}
        </p>
      )}
    </div>
  );
}

/**
 * Painel "UM LUGAR SO" (TG5.3) — visao consolidada do estado do projeto numa
 * unica tela: DORA medido + veredito dos gates + anomalias + deploys, com
 * TRILHA DE AUDITORIA por numero (pipeline/MR/tag) linkando direto ao GitLab.
 * Honestidade: rotula que e snapshot e mistura DORA real com o snapshot da
 * esteira (ambos versionados/reauditaveis).
 */
export function ConsolidatedPanel({ dora, snapshot }: ConsolidatedPanelProps) {
  const { gates, anomalies, deploys, last_run, _meta } = snapshot;
  const gatesPass = gates.verdict === 'PASS';
  const auditRefs = snapshot.audit_refs ?? [];

  return (
    <section
      className="space-y-6 border-[5px] border-black p-6 bg-[#f9f9f9] shadow-[8px_8px_0px_#000]"
      data-testid="consolidated-panel"
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="p-3 bg-black border-[3px] border-primary">
          <LayoutDashboard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-black uppercase italic leading-none">
            UM LUGAR SO
          </h3>
          <p className="text-[11px] font-bold text-gray-500 uppercase italic tracking-widest mt-1">
            VISAO CONSOLIDADA · DORA + GATES + ANOMALIAS + DEPLOYS
          </p>
        </div>
        <div className="md:ml-auto">
          <Badge variant={gatesPass ? 'primary' : 'error'} size="lg">
            {gatesPass ? 'GATES OK' : 'GATES FAIL'}
          </Badge>
        </div>
      </div>

      <p className="text-[11px] font-bold text-gray-500 uppercase italic tracking-widest">
        SNAPSHOT VERSIONADO · {_meta.coletado_em} · {_meta.fonte}
      </p>

      {/* DORA medido (real) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile
          icon={Rocket}
          label="DEPLOY FREQ"
          value={String(dora.deployment_frequency.valor)}
          badge={dora.deployment_frequency.classificacao.toUpperCase()}
          badgeVariant={DORA_BADGE[dora.deployment_frequency.classificacao]}
          sub={dora.deployment_frequency.unidade}
        />
        <Tile
          icon={Clock}
          label="LEAD TIME"
          value={`${dora.lead_time_for_changes.mediana_h}h`}
          badge={dora.lead_time_for_changes.classificacao.toUpperCase()}
          badgeVariant={DORA_BADGE[dora.lead_time_for_changes.classificacao]}
          sub={`mediana · media ${dora.lead_time_for_changes.media_h}h`}
        />
        <Tile
          icon={GitMerge}
          label="CFR (PROD)"
          value={`${dora.change_failure_rate.producao_main_pct}%`}
          badge={dora.change_failure_rate.classificacao_producao.toUpperCase()}
          badgeVariant={DORA_BADGE[dora.change_failure_rate.classificacao_producao]}
          sub={`main · develop ${dora.change_failure_rate.desenvolvimento_develop_pct}%`}
        />
        <Tile
          icon={AlertOctagon}
          label="MTTR"
          value={dora.mttr.valor_h === null ? 'N/D' : `${dora.mttr.valor_h}h`}
          badge={dora.mttr.classificacao.toUpperCase()}
          badgeVariant={DORA_BADGE[dora.mttr.classificacao]}
          sub="sem incidente de producao na janela"
        />
      </div>

      {/* Esteira: gates + anomalias + deploys */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={cn(
            'p-5 border-[3px] border-black shadow-[4px_4px_0px_#000]',
            gatesPass ? 'bg-primary/10' : 'bg-error/10'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            {gatesPass ? (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            ) : (
              <XCircle className="w-4 h-4 text-error" />
            )}
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              QUALITY GATES
            </p>
          </div>
          <p className="text-3xl font-black italic leading-none mb-2">
            {gates.passed}/{gates.total}
          </p>
          <p className="text-[10px] font-bold text-gray-600 uppercase italic leading-tight">
            run #{last_run.pipeline_id} · {last_run.ref}
          </p>
        </div>

        <div className="p-5 border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="w-4 h-4 text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              ANOMALIAS (MISSAO)
            </p>
          </div>
          <p className="text-3xl font-black italic leading-none mb-2">
            {anomalies.count}
          </p>
          <Badge
            variant={anomalies.count > 0 ? 'warning' : 'primary'}
            size="sm"
          >
            {anomalies.estado.toUpperCase()}
          </Badge>
        </div>

        <div className="p-5 border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              DEPLOYS ({deploys.ambiente})
            </p>
          </div>
          <p className="text-3xl font-black italic leading-none mb-2">
            {deploys.staging_success}
          </p>
          <p className="text-[10px] font-bold text-gray-600 uppercase italic leading-tight">
            success · {deploys.total} total · release {deploys.ultimo_release.tag}
          </p>
        </div>
      </div>

      {/* Trilha de auditoria por numero (pipeline/MR/tag) */}
      {auditRefs.length > 0 && (
        <div className="border-t-[3px] border-black pt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
            AUDITORIA POR NUMERO (PIPELINE / MR / TAG)
          </p>
          <div className="flex flex-wrap gap-3">
            {auditRefs.map((ref) => {
              const Icon = AUDIT_ICON[ref.kind];
              const display =
                ref.kind === 'tag' ? `${ref.number}` : `#${ref.number}`;
              return (
                <a
                  key={`${ref.kind}-${ref.number}`}
                  href={ref.web_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 border-[3px] border-black bg-white text-black font-black text-xs uppercase tracking-tight hover:bg-black hover:text-white transition-colors shadow-[3px_3px_0px_#000]"
                  title={ref.label}
                >
                  <Icon className="w-4 h-4" />
                  <span>{display}</span>
                  <span className="hidden sm:inline font-bold normal-case text-[10px] tracking-normal opacity-80">
                    {ref.label}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
