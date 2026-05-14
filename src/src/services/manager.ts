import type {
  TeamMemberMetrics,
  AnomalyDetection,
  BottleneckAnalysis,
  TrendDataPoint,
} from '@/types/metrics';

function generateTrendData(baseValue: number, variance: number = 0.2): Array<{ date: string; value: number }> {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const randomVariance = (Math.random() - 0.5) * 2 * variance;
    let value = baseValue * (1 + randomVariance);
    value = Math.max(0, value);

    data.push({
      date: date.toISOString().split('T')[0],
      value: Number(value.toFixed(2)),
    });
  }

  return data;
}

export async function fetchTeamMemberMetrics(): Promise<TeamMemberMetrics[]> {
  await new Promise(resolve => setTimeout(resolve, 600));

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

export async function fetchBottleneckAnalysis(): Promise<BottleneckAnalysis[]> {
  await new Promise(resolve => setTimeout(resolve, 550));

  return [
    {
      stage: 'Code Review',
      currentValue: 4.2,
      threshold: 2.0,
      status: 'congested',
      description: 'Tempo médio 2.1x acima do normal',
    },
    {
      stage: 'Desenvolvimento',
      currentValue: 2.1,
      threshold: 2.5,
      status: 'normal',
      description: 'Fluxo dentro do esperado',
    },
    {
      stage: 'Testes',
      currentValue: 1.8,
      threshold: 1.5,
      status: 'critical',
      description: 'Acúmulo de itens em validação',
    },
    {
      stage: 'Deploy',
      currentValue: 0.6,
      threshold: 1.0,
      status: 'normal',
      description: 'Implantação fluida',
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

  data.agingItems.forEach(item => {
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

  data.stages.forEach(stage => {
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

export function detectStatisticalAnomalies(trendData: TrendDataPoint[]): AnomalyDetection[] {
  const anomalies: AnomalyDetection[] = [];
  
  if (trendData.length === 0) {
    return anomalies;
  }

  const values = trendData.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
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

export async function fetchAllManagerMetrics(): Promise<{
  teamMembers: TeamMemberMetrics[];
  bottlenecks: BottleneckAnalysis[];
  thresholdAnomalies: AnomalyDetection[];
  statisticalAnomalies: AnomalyDetection[];
}> {
  const [teamMembers, bottlenecks] = await Promise.all([
    fetchTeamMemberMetrics(),
    fetchBottleneckAnalysis(),
  ]);

  const thresholdData = {
    wip: { current: 22, limit: 20 },
    buildFailureRate: 12.5,
    cycleTime: { current: 10.5, p95: 9.2 },
    agingItems: [
      { age: 12, id: 'JACTO-123' },
      { age: 8, id: 'JACTO-124' },
      { age: 15, id: 'JACTO-125' },
    ],
    stages: [
      { name: 'Code Review', avgTime: 4.2, normalTime: 2.0 },
      { name: 'Testes', avgTime: 1.8, normalTime: 0.8 },
    ],
  };

  const thresholdAnomalies = detectThresholdAnomalies(thresholdData);

  const cycleTimeTrend = generateTrendData(4.5, 0.3);
  cycleTimeTrend[cycleTimeTrend.length - 1].value = 10.5;

  const statisticalAnomalies = detectStatisticalAnomalies(cycleTimeTrend);

  return {
    teamMembers,
    bottlenecks,
    thresholdAnomalies,
    statisticalAnomalies,
  };
}
