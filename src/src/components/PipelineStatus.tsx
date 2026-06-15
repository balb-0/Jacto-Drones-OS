'use client';

import { Badge } from '@/components/ui/badge';
import { gitlabPipelineUrl, gitlabTagUrl } from '@/lib/config';
import type { PipelineSnapshot } from '@/types/pipeline';
import {
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Rocket,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStatusProps {
  snapshot: PipelineSnapshot;
}

/**
 * Secao "status do pipeline" (TG5.1) — ultimo run consolidado da esteira:
 * veredito dos gates, SAST e contagem de anomalias, consumindo o snapshot
 * versionado (src/data/pipeline-snapshot.json). ROTULA explicitamente que e um
 * snapshot (nao leitura ao vivo) com data, fonte e link de auditoria.
 */
export function PipelineStatus({ snapshot }: PipelineStatusProps) {
  const { last_run, gates, sast, anomalies, deploys, _meta } = snapshot;
  const gatesPass = gates.verdict === 'PASS';
  const runOk = last_run.status === 'success';

  return (
    <section className="space-y-6" data-testid="pipeline-status-section">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="p-3 bg-black border-[3px] border-primary">
          <GitBranch className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-3xl font-black text-black uppercase italic border-b-4 border-black pb-2">
          STATUS DO PIPELINE
        </h3>
        <Badge variant="default" size="sm">
          SNAPSHOT
        </Badge>
      </div>

      {/* Rotulo de honestidade: e snapshot versionado, nao leitura ao vivo. */}
      <p className="text-[11px] font-bold text-gray-500 uppercase italic tracking-widest">
        SNAPSHOT VERSIONADO · {_meta.coletado_em} · {_meta.fonte}
      </p>

      {/* Cabecalho do ultimo run + link de auditoria por numero de pipeline */}
      <div
        className={cn(
          'brutal-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4',
          runOk ? 'bg-primary/10' : 'bg-error/10'
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'p-2 border-[3px] border-black',
              runOk ? 'bg-primary' : 'bg-error'
            )}
          >
            {runOk ? (
              <CheckCircle2 className="w-6 h-6 text-black" />
            ) : (
              <XCircle className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              ULTIMO RUN · {last_run.ref}
            </p>
            <p className="text-2xl font-black italic leading-none">
              #{last_run.pipeline_id} · {last_run.status.toUpperCase()}
            </p>
            <p className="mt-1 text-[10px] font-bold text-gray-600 uppercase">
              {last_run.sha.slice(0, 8)}
            </p>
          </div>
        </div>
        <a
          href={gitlabPipelineUrl(last_run.pipeline_id)}
          target="_blank"
          rel="noopener noreferrer"
          className="brutal-btn bg-black text-white inline-flex items-center gap-2 text-xs"
        >
          AUDITAR PIPELINE
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Resumo: gates / SAST / anomalias / deploys */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gates */}
        <div className="brutal-card p-6 bg-white relative overflow-hidden">
          <div
            className={cn(
              'absolute top-0 right-0 px-3 py-1 border-l-[4px] border-b-[4px] border-black font-black text-[10px] uppercase',
              gatesPass ? 'bg-primary text-black' : 'bg-error text-white'
            )}
          >
            {gates.verdict}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              QUALITY GATES
            </p>
          </div>
          <p className="text-4xl font-black italic leading-none mb-3">
            {gates.passed}/{gates.total}
          </p>
          <div className="border-t-2 border-black pt-3 space-y-2">
            {gates.checks.map((check) => (
              <div
                key={check.id}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-[10px] font-bold text-gray-700 uppercase leading-tight">
                  {check.label}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-black uppercase',
                    check.passed ? 'text-primary' : 'text-error'
                  )}
                >
                  {check.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SAST */}
        <div className="brutal-card p-6 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 border-l-[4px] border-b-[4px] border-black font-black text-[10px] uppercase bg-secondary text-white">
            {sast.require_passed ? 'GATE' : 'INFO'}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              SAST + SECRETS
            </p>
          </div>
          <p className="text-2xl font-black italic leading-none mb-3 uppercase">
            {sast.status}
          </p>
          <div className="border-t-2 border-black pt-3 flex flex-wrap gap-1">
            {sast.scanners.map((scanner) => (
              <span
                key={scanner}
                className="text-[9px] font-black bg-black text-white px-2 py-0.5 uppercase"
              >
                {scanner}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[9px] font-bold text-gray-600 uppercase italic leading-tight">
            {sast.nota}
          </p>
        </div>

        {/* Anomalias */}
        <div className="brutal-card p-6 bg-white relative overflow-hidden">
          <div
            className={cn(
              'absolute top-0 right-0 px-3 py-1 border-l-[4px] border-b-[4px] border-black font-black text-[10px] uppercase',
              anomalies.count > 0 ? 'bg-warning text-black' : 'bg-primary text-black'
            )}
          >
            {anomalies.estado}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="w-4 h-4 text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              ANOMALIAS (MISSAO)
            </p>
          </div>
          <p className="text-4xl font-black italic leading-none mb-3">
            {anomalies.count}
          </p>
          <p className="text-[9px] font-bold text-gray-600 uppercase italic leading-tight border-t-2 border-black pt-3">
            {anomalies.fonte}
          </p>
        </div>

        {/* Deploys / release */}
        <div className="brutal-card p-6 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 border-l-[4px] border-b-[4px] border-black font-black text-[10px] uppercase bg-primary text-black">
            {deploys.ambiente}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              DEPLOYS
            </p>
          </div>
          <p className="text-4xl font-black italic leading-none mb-1">
            {deploys.staging_success}
          </p>
          <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">
            success · {deploys.total} total
          </p>
          <a
            href={gitlabTagUrl(deploys.ultimo_release.tag)}
            target="_blank"
            rel="noopener noreferrer"
            className="border-t-2 border-black pt-3 flex items-center justify-between gap-2 group"
          >
            <span className="text-[10px] font-black text-gray-700 uppercase">
              RELEASE {deploys.ultimo_release.tag}
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-black" />
          </a>
        </div>
      </div>

      {/* Procedencia dos gates */}
      <div className="p-5 border-[3px] border-black bg-warning/10">
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-700 mb-1">
          PROCEDENCIA · {_meta.tipo.toUpperCase()}
        </p>
        <p className="text-xs font-bold text-gray-700 italic">{_meta.nota}</p>
      </div>
    </section>
  );
}
