'use client';

import { Badge } from '@/components/ui/badge';
import { formatTimestamp } from '@/lib/anomaly-detection';
import { gitlabPipelineUrl } from '@/lib/config';
import anomaliesRaw from '@/data/anomalies.json';
import type { AnomaliesContract, ContractAnomaly } from '@/types/anomalies';
import { ExternalLink, FileSearch } from 'lucide-react';

const contract = anomaliesRaw as AnomaliesContract;

/** Pipeline de evidencia de uma anomalia: o seu, senao o de referencia do run. */
function evidencePipeline(anomaly: ContractAnomaly): number | undefined {
  return anomaly.evidence_pipeline ?? contract._meta.pipeline_ref;
}

/**
 * LOG DE ANOMALIAS do /qos (TG5.2) — le o contrato TG2 (src/data/anomalies.json)
 * e lista as anomalias do ultimo run da missao SITL, cada uma com LINK DIRETO
 * para a evidencia no GitLab (o pipeline que produziu o run). Exibido ao lado do
 * Flight Replay. Rotula o estado do dado (placeholder x real) com honestidade.
 */
export function AnomalyEvidenceLog() {
  const anomalies = contract.anomalies ?? [];
  const isPlaceholder = contract._meta.estado === 'placeholder';
  const criticalCount = anomalies.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = anomalies.filter((a) => a.severity === 'WARNING').length;

  return (
    <div
      style={{
        border: '3px solid #000',
        backgroundColor: '#fff',
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: '4px 4px 0px #000',
      }}
    >
      <div
        className="px-4 py-3 border-b-[3px] border-black flex items-center justify-between gap-3 flex-wrap"
        style={{ backgroundColor: '#000' }}
      >
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-primary" />
          <span className="text-sm font-black uppercase tracking-tight text-white">
            LOG DE ANOMALIAS
          </span>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <span className="text-[11px] font-black text-white flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5"
                style={{ backgroundColor: '#dc2626' }}
              />
              {criticalCount} CRITICAL
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-[11px] font-black text-white flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5"
                style={{ backgroundColor: '#ea580c' }}
              />
              {warningCount} WARNING
            </span>
          )}
          {anomalies.length === 0 && (
            <span className="text-[11px] font-bold text-gray-400 uppercase">
              0 EVENTS
            </span>
          )}
        </div>
      </div>

      {/* Rotulo de estado do dado: placeholder ate o TG2 publicar o real */}
      {isPlaceholder && (
        <div
          className="px-4 py-2 border-b-[3px] border-black"
          style={{ backgroundColor: '#fff7ed' }}
        >
          <p className="text-[10px] font-black uppercase tracking-tight text-gray-700 leading-tight">
            DADO PLACEHOLDER (contrato TG2) — eventos rotulados como amostra ate
            o anomalies.json real do job sitl-mission-metrics.
          </p>
        </div>
      )}

      <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
        {anomalies.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              NO ANOMALIES DETECTED
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-gray-200">
            {anomalies.map((anomaly, idx) => {
              const pipelineId = evidencePipeline(anomaly);
              return (
                <div
                  key={`${anomaly.type}-${anomaly.timestamp_ms}-${idx}`}
                  className="px-4 py-3 flex items-start gap-3"
                  style={{
                    backgroundColor:
                      anomaly.severity === 'CRITICAL' ? '#fef2f2' : '#fff7ed',
                  }}
                >
                  <span
                    className="text-[11px] font-black tabular-nums text-gray-600 whitespace-nowrap mt-0.5"
                    style={{ minWidth: '64px' }}
                  >
                    {formatTimestamp(anomaly.timestamp_ms)}
                  </span>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-wider text-black">
                        {anomaly.type}
                      </span>
                      <Badge
                        variant={
                          anomaly.severity === 'CRITICAL' ? 'error' : 'warning'
                        }
                        size="sm"
                      >
                        {anomaly.severity}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {anomaly.variables.map((v, vIdx) => (
                        <span
                          key={vIdx}
                          className="text-[11px] font-bold text-gray-800"
                        >
                          <span className="text-gray-500">{v.label}:</span>{' '}
                          <span className="font-black text-black">{v.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Link direto para a evidencia no GitLab (pipeline do run) */}
                  {pipelineId !== undefined && (
                    <a
                      href={gitlabPipelineUrl(pipelineId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-tight text-black border-[2px] border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
                      title={`Evidencia: pipeline #${pipelineId} no GitLab`}
                    >
                      EVID #{pipelineId}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="px-4 py-2 border-t-[3px] border-black flex items-center justify-between gap-2 flex-wrap"
        style={{ backgroundColor: '#f5f3ee' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
          TOTAL: {anomalies.length} EVENT{anomalies.length !== 1 ? 'S' : ''}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
          FONTE: {contract._meta.fonte_prevista}
        </span>
      </div>
    </div>
  );
}
