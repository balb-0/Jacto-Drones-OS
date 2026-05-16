import type {
  BuildMetrics,
  TestDefectMetrics,
  IntegrationStabilityMetrics,
  CycleTimeMetrics,
  ThroughputMetrics,
  BacklogHealthMetrics,
} from '@/types/metrics';

function generateTrendData(baseValue: number, variance: number = 0.2, max?: number): Array<{ date: string; value: number }> {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const randomVariance = (Math.random() - 0.5) * 2 * variance;
    let value = baseValue * (1 + randomVariance);
    value = Math.max(0, value);
    if (max !== undefined) {
      value = Math.min(max, value);
    }

    data.push({
      date: date.toISOString().split('T')[0],
      value: Number(value.toFixed(2)),
    });
  }

  return data;
}

export async function fetchBuildMetrics(): Promise<BuildMetrics> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const totalBuilds = 156;
  const failedBuilds = 12;
  const successfulBuilds = totalBuilds - failedBuilds;
  
  return {
    totalBuilds,
    successfulBuilds,
    failedBuilds,
    successRate: Number(((successfulBuilds / totalBuilds) * 100).toFixed(1)),
    averageDuration: 8.5,
    trend: generateTrendData(95, 0.1, 100),
  };
}

export async function fetchTestDefectMetrics(): Promise<TestDefectMetrics> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    totalTests: 1247,
    passedTests: 1189,
    failedTests: 38,
    skippedTests: 20,
    defectDensity: 2.3,
    defectsByType: [
      { type: 'Lógica', count: 15, severity: 'high' },
      { type: 'Integração', count: 12, severity: 'critical' },
      { type: 'Performance', count: 8, severity: 'medium' },
      { type: 'Segurança', count: 3, severity: 'critical' },
    ],
    defectsByStage: [
      { stage: 'Unit Tests', defectsCaught: 28, defectsEscaped: 2 },
      { stage: 'Integration Tests', defectsCaught: 18, defectsEscaped: 3 },
      { stage: 'SITL', defectsCaught: 8, defectsEscaped: 1 },
      { stage: 'HITL', defectsCaught: 5, defectsEscaped: 0 },
    ],
    trend: generateTrendData(35, 0.25),
  };
}

export async function fetchIntegrationStabilityMetrics(): Promise<IntegrationStabilityMetrics> {
  await new Promise(resolve => setTimeout(resolve, 550));
  
  return {
    firmwareVersion: 'v2.4.1',
    platformVersion: 'v1.8.3',
    integrationHealth: 'healthy',
    uptime: 99.7,
    apiCompatibility: 100,
    lastSync: new Date().toISOString(),
    incidents: [
      {
        id: 'INC-001',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        severity: 'medium',
        description: 'Latência elevada na sincronização de telemetria',
        resolved: true,
        resolutionTime: 45,
      },
      {
        id: 'INC-002',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        severity: 'low',
        description: 'Timeout esporádico em requisições MAVLink',
        resolved: true,
        resolutionTime: 20,
      },
    ],
    trend: generateTrendData(99.5, 0.02, 100),
  };
}

export async function fetchCycleTimeMetrics(): Promise<CycleTimeMetrics> {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return {
    averageCycleTime: 4.2,
    medianCycleTime: 3.8,
    p85CycleTime: 6.5,
    p95CycleTime: 9.2,
    byStage: [
      { stage: 'Backlog', averageTime: 1.2, description: 'Tempo em análise e refinamento' },
      { stage: 'Desenvolvimento', averageTime: 2.1, description: 'Codificação e testes unitários' },
      { stage: 'Code Review', averageTime: 0.5, description: 'Revisão de código' },
      { stage: 'Testes', averageTime: 0.8, description: 'Testes de integração e validação' },
      { stage: 'Deploy', averageTime: 0.6, description: 'Implantação em produção' },
    ],
    trend: generateTrendData(4.5, 0.15),
  };
}

export async function fetchThroughputMetrics(): Promise<ThroughputMetrics> {
  await new Promise(resolve => setTimeout(resolve, 650));
  
  return {
    deploymentsPerWeek: 8.5,
    deploymentsPerMonth: 34,
    storyPointsDelivered: 127,
    featuresShipped: 12,
    leadTime: 3.8,
    trend: generateTrendData(8.2, 0.2),
    doraMetrics: {
      deploymentFrequency: 'high',
      leadTimeForChanges: 'high',
      changeFailureRate: 'elite',
      mttr: 'elite',
    },
  };
}

export async function fetchBacklogHealthMetrics(): Promise<BacklogHealthMetrics> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    totalItems: 89,
    itemsByStatus: [
      { status: 'A Fazer', count: 23, percentage: 25.8 },
      { status: 'Em Progresso', count: 18, percentage: 20.2 },
      { status: 'Em Revisão', count: 12, percentage: 13.5 },
      { status: 'Concluído', count: 36, percentage: 40.5 },
    ],
    agingItems: [
      { id: 'JACTO-123', title: 'Implementar controle PID', age: 12, priority: 'high', status: 'Em Progresso' },
      { id: 'JACTO-124', title: 'Otimizar consumo de memória', age: 8, priority: 'medium', status: 'Em Progresso' },
      { id: 'JACTO-125', title: 'Atualizar documentação MAVLink', age: 15, priority: 'low', status: 'A Fazer' },
    ],
    sprintHealth: {
      currentSprint: 'Sprint 5',
      completionRate: 78.5,
      scopeChange: 5.2,
      velocity: 26,
      capacity: 32,
    },
    velocityTrend: generateTrendData(24, 0.15),
    wipLimitStatus: {
      current: 18,
      limit: 20,
      utilization: 90,
    },
  };
}