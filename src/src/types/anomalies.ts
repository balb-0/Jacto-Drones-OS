// Contrato TG2 — anomalies.json: lista de anomalias do ultimo run da missao
// SITL, extraidas do .ulg pelo job sitl-mission-metrics. Consumido pelo log de
// anomalias do /qos (TG5.2) com links de evidencia no GitLab. O TG2 (paralelo)
// e dono da producao real deste arquivo; aqui declaramos a FORMA esperada e um
// placeholder ate ele publicar.

export type AnomalySeverity = 'CRITICAL' | 'WARNING';

export interface AnomalyVariable {
  label: string;
  value: string;
}

/** Uma anomalia do contrato TG2. */
export interface ContractAnomaly {
  type: string;
  severity: AnomalySeverity;
  timestamp_ms: number;
  variables: AnomalyVariable[];
  /**
   * Id do pipeline que gerou o run desta anomalia (opcional). Quando presente,
   * o log monta um link direto para a evidencia no GitLab. Campo additivo ao
   * contrato base do TG2 — sua ausencia nao quebra o consumo.
   */
  evidence_pipeline?: number;
}

export interface AnomaliesContractMeta {
  contrato: string;
  estado: string;
  nota: string;
  fonte_prevista: string;
  pipeline_ref?: number;
}

export interface AnomaliesContract {
  _meta: AnomaliesContractMeta;
  anomalies: ContractAnomaly[];
}
