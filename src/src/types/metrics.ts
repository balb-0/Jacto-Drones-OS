// Types for QoS (Quality of Service) metrics

export interface BuildMetrics {
  totalBuilds: number;
  successfulBuilds: number;
  failedBuilds: number;
  successRate: number;
  averageDuration: number; // in minutes
  trend: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TestDefectMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  defectDensity: number; // defects per 1000 lines of code
  defectsByType: DefectType[];
  defectsByStage: DefectStage[];
  trend: TrendDataPoint[];
}

export interface DefectType {
  type: string;
  count: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface DefectStage {
  stage: string;
  defectsCaught: number;
  defectsEscaped: number;
}

export interface IntegrationStabilityMetrics {
  firmwareVersion: string;
  platformVersion: string;
  integrationHealth: 'healthy' | 'degraded' | 'critical';
  uptime: number; // percentage
  apiCompatibility: number; // percentage
  lastSync: string;
  incidents: IntegrationIncident[];
  trend: TrendDataPoint[];
}

export interface IntegrationIncident {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  resolved: boolean;
  resolutionTime?: number; // in minutes
}

// Types for QoP (Quality of Process) metrics

export interface CycleTimeMetrics {
  averageCycleTime: number; // in days
  medianCycleTime: number;
  p85CycleTime: number;
  p95CycleTime: number;
  byStage: CycleTimeStage[];
  trend: TrendDataPoint[];
}

export interface CycleTimeStage {
  stage: string;
  averageTime: number; // in days
  description: string;
}

export interface ThroughputMetrics {
  deploymentsPerWeek: number;
  deploymentsPerMonth: number;
  storyPointsDelivered: number;
  featuresShipped: number;
  leadTime: number; // in days
  trend: TrendDataPoint[];
  doraMetrics: DORAMetrics;
}

export interface DORAMetrics {
  deploymentFrequency: 'elite' | 'high' | 'medium' | 'low';
  leadTimeForChanges: 'elite' | 'high' | 'medium' | 'low';
  changeFailureRate: 'elite' | 'high' | 'medium' | 'low';
  mttr: 'elite' | 'high' | 'medium' | 'low'; // Mean Time To Recovery
}

export interface BacklogHealthMetrics {
  totalItems: number;
  itemsByStatus: BacklogStatus[];
  agingItems: AgingItem[];
  sprintHealth: SprintHealth;
  velocityTrend: TrendDataPoint[];
  wipLimitStatus: WIPStatus;
}

export interface BacklogStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface AgingItem {
  id: string;
  title: string;
  age: number; // in days
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: string;
}

export interface SprintHealth {
  currentSprint: string;
  completionRate: number;
  scopeChange: number;
  velocity: number;
  capacity: number;
}

export interface WIPStatus {
  current: number;
  limit: number;
  utilization: number; // percentage
}

// Dashboard-wide types

export interface DashboardSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  description?: string;
}

export interface TimeRange {
  start: string;
  end: string;
  label: string;
}

export interface FilterOptions {
  timeRange: TimeRange;
  project?: string;
  team?: string;
  environment?: string;
}

// Types for managerial dashboard

export interface TeamMemberMetrics {
  name: string;
  taskCount: number;
  tasksByStatus: TasksByStatus;
  overloadFlag: boolean;
  avgCycleTime: number;
  currentTasks: string[];
  /**
   * Marca o registro como dado SINTÉTICO (placeholder), não derivado do
   * GitLab. A API não expõe carga por pessoa trivialmente; honestidade
   * medido×projetado (feedback S2). A UI rotula explicitamente.
   */
  synthetic?: boolean;
}

export interface TasksByStatus {
  todo: number;
  inProgress: number;
  review: number;
  done: number;
}

export interface AnomalyDetection {
  type: 'threshold' | 'statistical';
  metric: string;
  currentValue: number;
  threshold: number;
  severity: 'warning' | 'critical';
  description: string;
  detectedAt: string;
}

export interface BottleneckAnalysis {
  stage: string;
  currentValue: number;
  threshold: number;
  status: 'normal' | 'congested' | 'critical';
  description: string;
}

// Indicadores de processo REAIS coletados da API GitLab (snapshot via
// scripts/collect_gitlab_metrics.py). Espelham src/data/process-metrics.json.

export interface ProcessMetricsMeta {
  coletado_em: string;
  fonte: string;
}

export interface DeploymentFrequencyData {
  staging_deploys_success: number;
  ambiente: string;
  nota: string;
}

export interface LeadTimeData {
  n_mrs_merged: number;
  mediana_h: number;
  media_h: number;
  min_h: number;
  max_h: number;
}

export interface ChangeFailureRefData {
  total: number;
  failed: number;
  cfr_pct: number;
}

export interface ChangeFailureRateData {
  develop: ChangeFailureRefData;
  main: ChangeFailureRefData;
}

export interface PipelineSampleData {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  canceled: number;
}

export interface ProcessMetrics {
  _meta: ProcessMetricsMeta;
  deployment_frequency: DeploymentFrequencyData;
  lead_time_for_changes_h: LeadTimeData;
  change_failure_rate: ChangeFailureRateData;
  pipelines_amostra_100: PipelineSampleData;
  observacao_honesta: string;
}

// DORA medido (derivado do snapshot real via scripts/collect_gitlab_metrics.py
// derive_dora). Espelha src/data/dora.json. Classificação honesta — MTTR
// 'nao-medido' quando não há evento de recuperação na janela.

export type DoraLevel = 'elite' | 'high' | 'medium' | 'low' | 'nao-medido';

export interface DoraDeploymentFrequency {
  valor: number;
  unidade: string;
  classificacao: DoraLevel;
  nota: string;
}

export interface DoraLeadTime {
  mediana_h: number;
  media_h: number;
  classificacao: DoraLevel;
  nota: string;
}

export interface DoraChangeFailureRate {
  producao_main_pct: number;
  desenvolvimento_develop_pct: number;
  classificacao_producao: DoraLevel;
  nota: string;
}

export interface DoraMttr {
  valor_h: number | null;
  classificacao: DoraLevel;
  nota: string;
}

export interface DoraMetricsReal {
  _meta: ProcessMetricsMeta;
  deployment_frequency: DoraDeploymentFrequency;
  lead_time_for_changes: DoraLeadTime;
  change_failure_rate: DoraChangeFailureRate;
  mttr: DoraMttr;
  observacao_honesta: string;
}
