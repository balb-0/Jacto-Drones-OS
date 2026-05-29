import type {
  TeamMemberMetrics,
  AnomalyDetection,
  BottleneckAnalysis,
  TrendDataPoint,
  ProcessMetrics,
  DoraMetricsReal,
} from '@/types/metrics';
import { getProcessMetrics, getDoraMetrics } from '@/services/process';

export async function fetchTeamMemberMetrics(): Promise<TeamMemberMetrics[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return [
    {
      name: 'Calebe',
      taskCount: 8,
      tasksByStatus: { todo: 2, inProgress: 3, review: 2, done: 1 },
      overloadFlag: true,
      avgCycleTime: 3.5,
      currentTasks: ['JACTO-201', 'JACTO-202', 'JACTO-203'],
    },
    {
      name: 'Fernando',
      taskCount: 5,
      tasksByStatus: { todo: 1, inProgress: 2, review: 1, done: 1 },
      overloadFlag: false,
      avgCycleTime: 4.2,
      currentTasks: ['JACTO-204', 'JACTO-205'],
    },
    {
      name: 'Kauan',
      taskCount: 9,
      tasksByStatus: { todo: 3, inProgress: 4, review: 1, done: 1 },
      overloadFlag: true,
      avgCycleTime: 5.1,
      currentTasks: ['JACTO-206', 'JACTO-207', 'JACTO-208', 'JACTO-209'],
    },
    {
      name: 'Lucca',
      taskCount: 4,
      tasksByStatus: { todo: 1, inProgress: 1, review: 1, done: 1 },
      overloadFlag: false,
      avgCycleTime: 3.8,
      currentTasks: ['JACTO-210'],
    },
    {
      name: 'Marlos',
      taskCount: 6,
      tasksByStatus: { todo: 2, inProgress: 2, review: 1, done: 1 },
      overloadFlag: false,
      avgCycleTime: 4.5,
      currentTasks: ['JACTO-211', 'JACTO-212'],
    },
    {
      name: 'Otávio',
      taskCount: 7,
      tasksByStatus: { todo: 2, inProgress: 3, review: 1, done: 1 },
      overloadFlag: true,
      avgCycleTime: 4.0,
      currentTasks: ['JACTO-213', 'JACTO-214', 'JACTO-215'],
    },
    {
      name: 'Vitor',
      taskCount: 5,
      tasksByStatus: { todo: 1, inProgress: 2, review: 1, done: 1 },
      overloadFlag: false,
      avgCycleTime: 3.9,
      currentTasks: ['JACTO-216', 'JACTO-217'],
    },
  ];
}

/**
 * Gargalos derivados do snapshot REAL da API GitLab (process-metrics.json):
 * lead time (mediana×máx), CFR de develop, e taxa de falha de pipelines da
 * amostra. Sem mocks — cada `currentValue` vem de um número coletado.
 */
export async function fetchBottleneckAnalysis(): Promise<BottleneckAnalysis[]> {
  const p = getProcessMetrics();
  const lead = p.lead_time_for_changes_h;
  const cfrDev = p.change_failure_rate.develop.cfr_pct;
  const sample = p.pipelines_amostra_100;
  const pipelineFailPct = sample.total
    ? Number(((sample.failed / sample.total) * 100).toFixed(1))
    : 0;
  const leadMedianDays = Number((lead.mediana_h / 24).toFixed(2));
  const leadMaxDays = Number((lead.max_h / 24).toFixed(2));

  return [
    {
      stage: 'Lead Time (mediana)',
      currentValue: leadMedianDays,
      threshold: 1,
      status:
        leadMedianDays <= 1
          ? 'normal'
          : leadMedianDays <= 3
            ? 'congested'
            : 'critical',
      description: `Mediana ${lead.mediana_h}h — MRs pequenos mergeados rápido`,
    },
    {
      stage: 'Lead Time (cauda)',
      currentValue: leadMaxDays,
      threshold: 3,
      status:
        leadMaxDays <= 3
          ? 'normal'
          : leadMaxDays <= 7
            ? 'congested'
            : 'critical',
      description: `Máx ${lead.max_h}h — poucos MRs de vida longa puxam a média`,
    },
    {
      stage: 'CFR develop',
      currentValue: cfrDev,
      threshold: 30,
      status: cfrDev <= 15 ? 'normal' : cfrDev <= 30 ? 'congested' : 'critical',
      description: `${p.change_failure_rate.develop.failed}/${p.change_failure_rate.develop.total} pipelines failed (de-risking)`,
    },
    {
      stage: 'Falha de pipeline',
      currentValue: pipelineFailPct,
      threshold: 30,
      status:
        pipelineFailPct <= 15
          ? 'normal'
          : pipelineFailPct <= 30
            ? 'congested'
            : 'critical',
      description: `${sample.failed}/${sample.total} pipelines da amostra (spike SITL)`,
    },
  ];
}

export function detectThresholdAnomalies(data: {
  wip: { current: number; limit: number };
  buildFailureRate: number;
  cycleTime: { current: number; p95: number };
  agingItems: Array<{ age: number; id: string }>;
  stages: Array<{ name: string; avgTime: number; normalTime: number }>;
}): AnomalyDetection[] {
  const anomalies: AnomalyDetection[] = [];
  const detectedAt = new Date().toISOString();

  if (data.wip.current > data.wip.limit) {
    anomalies.push({
      type: 'threshold',
      metric: 'WIP',
      currentValue: data.wip.current,
      threshold: data.wip.limit,
      severity: 'critical',
      description: `WIP (${data.wip.current}) excede o limite (${data.wip.limit})`,
      detectedAt,
    });
  }

  if (data.buildFailureRate > 10) {
    anomalies.push({
      type: 'threshold',
      metric: 'Build Failure Rate',
      currentValue: data.buildFailureRate,
      threshold: 10,
      severity: 'critical',
      description: `Taxa de falha (${data.buildFailureRate.toFixed(1)}%) acima de 10%`,
      detectedAt,
    });
  }

  if (data.cycleTime.current > data.cycleTime.p95) {
    anomalies.push({
      type: 'threshold',
      metric: 'Cycle Time',
      currentValue: data.cycleTime.current,
      threshold: data.cycleTime.p95,
      severity: 'warning',
      description: `Cycle time (${data.cycleTime.current}d) excede P95 (${data.cycleTime.p95}d)`,
      detectedAt,
    });
  }

  data.agingItems.forEach((item) => {
    if (item.age > 10) {
      anomalies.push({
        type: 'threshold',
        metric: 'Aging Item',
        currentValue: item.age,
        threshold: 10,
        severity: 'warning',
        description: `Item ${item.id} envelhecido (${item.age} dias)`,
        detectedAt,
      });
    }
  });

  data.stages.forEach((stage) => {
    if (stage.avgTime > stage.normalTime * 2) {
      anomalies.push({
        type: 'threshold',
        metric: 'Stage Congestion',
        currentValue: stage.avgTime,
        threshold: stage.normalTime * 2,
        severity: 'warning',
        description: `Estágio "${stage.name}" congestionado (${stage.avgTime.toFixed(1)}d vs ${stage.normalTime}d normal)`,
        detectedAt,
      });
    }
  });

  return anomalies;
}

export function detectStatisticalAnomalies(
  trendData: TrendDataPoint[]
): AnomalyDetection[] {
  const anomalies: AnomalyDetection[] = [];

  if (trendData.length === 0) {
    return anomalies;
  }

  const values = trendData.map((d) => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);

  const currentValue = trendData[trendData.length - 1].value;
  const detectedAt = new Date().toISOString();

  if (stdDev === 0) {
    return anomalies;
  }

  if (currentValue > mean + 2 * stdDev) {
    anomalies.push({
      type: 'statistical',
      metric: 'Trend Value',
      currentValue,
      threshold: mean + 2 * stdDev,
      severity: 'critical',
      description: `Valor atual (${currentValue.toFixed(2)}) > média + 2σ (${(mean + 2 * stdDev).toFixed(2)})`,
      detectedAt,
    });
  } else if (currentValue > mean + stdDev) {
    anomalies.push({
      type: 'statistical',
      metric: 'Trend Value',
      currentValue,
      threshold: mean + stdDev,
      severity: 'warning',
      description: `Valor atual (${currentValue.toFixed(2)}) > média + 1σ (${(mean + stdDev).toFixed(2)})`,
      detectedAt,
    });
  }

  return anomalies;
}

/**
 * Monta a entrada da detecção por limite a partir do snapshot REAL.
 * - buildFailureRate: taxa de falha de pipeline da amostra coletada.
 * - cycleTime: lead time real (mediana×máx) como proxy de ciclo, em dias.
 * - stages: gargalos reais já derivados (mapeados p/ o formato do detector).
 */
function buildThresholdInputFromProcess(p: ProcessMetrics) {
  const sample = p.pipelines_amostra_100;
  const lead = p.lead_time_for_changes_h;
  return {
    wip: { current: p.change_failure_rate.develop.total, limit: 20 },
    buildFailureRate: sample.total ? (sample.failed / sample.total) * 100 : 0,
    cycleTime: {
      current: Number((lead.max_h / 24).toFixed(2)),
      p95: Number((lead.media_h / 24).toFixed(2)),
    },
    agingItems: [] as Array<{ age: number; id: string }>,
    stages: [
      {
        name: 'CFR develop',
        avgTime: p.change_failure_rate.develop.cfr_pct,
        normalTime: 15,
      },
    ],
  };
}

/** Série real (proxy) para a detecção estatística: CFR por ref + falha de amostra. */
function buildRealSeriesFromProcess(p: ProcessMetrics): TrendDataPoint[] {
  const sample = p.pipelines_amostra_100;
  const failPct = sample.total
    ? Number(((sample.failed / sample.total) * 100).toFixed(1))
    : 0;
  return [
    { date: 'main', value: p.change_failure_rate.main.cfr_pct },
    { date: 'amostra', value: failPct },
    { date: 'develop', value: p.change_failure_rate.develop.cfr_pct },
  ];
}

export async function fetchAllManagerMetrics(): Promise<{
  teamMembers: TeamMemberMetrics[];
  bottlenecks: BottleneckAnalysis[];
  thresholdAnomalies: AnomalyDetection[];
  statisticalAnomalies: AnomalyDetection[];
  process: ProcessMetrics;
  dora: DoraMetricsReal;
}> {
  const [teamMembers, bottlenecks] = await Promise.all([
    fetchTeamMemberMetrics(),
    fetchBottleneckAnalysis(),
  ]);

  const process = getProcessMetrics();
  const dora = getDoraMetrics();

  // Detecção alimentada por DADOS REAIS do snapshot (não mais por mocks).
  const thresholdAnomalies = detectThresholdAnomalies(
    buildThresholdInputFromProcess(process)
  );
  const statisticalAnomalies = detectStatisticalAnomalies(
    buildRealSeriesFromProcess(process)
  );

  return {
    teamMembers,
    bottlenecks,
    thresholdAnomalies,
    statisticalAnomalies,
    process,
    dora,
  };
}
