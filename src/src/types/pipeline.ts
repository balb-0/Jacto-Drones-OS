// Tipos do snapshot de status do pipeline (TG5 — secao "status do pipeline").
//
// Espelham src/data/pipeline-snapshot.json, um SNAPSHOT versionado do ultimo
// run consolidado da esteira (derivado de evidence/raw/*.json — API GitLab).
// Nao e leitura ao vivo: a UI rotula explicitamente como snapshot, com data e
// fonte (honestidade medido×snapshot — feedback S2/S3).

export type GateVerdict = 'PASS' | 'FAIL';

/** Status bruto de um pipeline na API GitLab (subset usado pelo dashboard). */
export type PipelineStatus =
  | 'success'
  | 'failed'
  | 'running'
  | 'pending'
  | 'canceled'
  | 'skipped'
  | 'manual';

export interface PipelineSnapshotMeta {
  tipo: string;
  coletado_em: string;
  fonte: string;
  nota: string;
}

export interface PipelineLastRun {
  pipeline_id: number;
  ref: string;
  sha: string;
  status: PipelineStatus;
  created_at: string;
  updated_at: string;
  web_url: string;
}

export interface PipelineGateCheck {
  id: string;
  label: string;
  value: string;
  limit: string;
  passed: boolean;
}

export interface PipelineGates {
  verdict: GateVerdict;
  passed: number;
  total: number;
  fonte: string;
  checks: PipelineGateCheck[];
}

export interface PipelineSast {
  status: string;
  require_passed: boolean;
  fonte: string;
  scanners: string[];
  nota: string;
}

export interface PipelineAnomaliesSummary {
  count: number;
  fonte: string;
  estado: string;
}

export interface PipelineRelease {
  tag: string;
  pipeline_id: number;
  status: PipelineStatus;
  web_url: string;
}

export interface PipelineDeploys {
  staging_success: number;
  total: number;
  ambiente: string;
  ultimo_release: PipelineRelease;
  fonte: string;
}

export interface PipelineSnapshot {
  _meta: PipelineSnapshotMeta;
  last_run: PipelineLastRun;
  gates: PipelineGates;
  sast: PipelineSast;
  anomalies: PipelineAnomaliesSummary;
  deploys: PipelineDeploys;
}
