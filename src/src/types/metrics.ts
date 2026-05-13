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