'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, MetricCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendLineChart, ComparisonBarChart } from '@/components/charts';
import { 
  fetchCycleTimeMetrics, 
  fetchThroughputMetrics, 
  fetchBacklogHealthMetrics 
} from '@/services/metrics';
import type { 
  CycleTimeMetrics, 
  ThroughputMetrics, 
  BacklogHealthMetrics 
} from '@/types/metrics';
import { DORA_LEVELS } from '@/lib/config';
import { 
  Clock, 
  TrendingUp, 
  Package, 
  ListTodo,
  CheckCircle2,
  AlertCircle,
  Timer,
  Zap,
  Target,
  Activity,
  ArrowRight
} from 'lucide-react';
import { formatDuration, getRelativeTime } from '@/lib/utils';

export default function QOPPage() {
  const [cycleTimeMetrics, setCycleTimeMetrics] = useState<CycleTimeMetrics | null>(null);
  const [throughputMetrics, setThroughputMetrics] = useState<ThroughputMetrics | null>(null);
  const [backlogMetrics, setBacklogMetrics] = useState<BacklogHealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cycle, throughput, backlog] = await Promise.all([
          fetchCycleTimeMetrics(),
          fetchThroughputMetrics(),
          fetchBacklogHealthMetrics(),
        ]);
        setCycleTimeMetrics(cycle);
        setThroughputMetrics(throughput);
        setBacklogMetrics(backlog);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout 
        title="QoP - Quality of Process" 
        description="Métricas do processo de engenharia ágil"
      >
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="QoP - Quality of Process" 
      description="Métricas do processo de engenharia ágil"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Indicadores de Processo</h2>
            <p className="text-gray-600 mt-1">
              Cycle time, throughput e saúde do backlog
            </p>
          </div>
          <Badge variant="info" size="md">
            <Activity className="w-3 h-3 mr-1" />
            Atualizado {getRelativeTime(new Date())}
          </Badge>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cycle Time</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Cycle Time Médio"
              value={cycleTimeMetrics?.averageCycleTime || 0}
              unit="dias"
              trend={-12.5}
              trendLabel="vs. mês anterior"
              status="success"
            />
            <MetricCard
              title="Cycle Time Mediano"
              value={cycleTimeMetrics?.medianCycleTime || 0}
              unit="dias"
              trend={-8.3}
              trendLabel="vs. mês anterior"
              status="success"
            />
            <MetricCard
              title="P85 Cycle Time"
              value={cycleTimeMetrics?.p85CycleTime || 0}
              unit="dias"
              trend={-5.2}
              trendLabel="vs. mês anterior"
              status="success"
            />
            <MetricCard
              title="P95 Cycle Time"
              value={cycleTimeMetrics?.p95CycleTime || 0}
              unit="dias"
              trend={-3.1}
              trendLabel="vs. mês anterior"
              status="success"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Cycle Time por Estágio" description="Tempo médio em cada fase">
              <div className="space-y-4">
                {cycleTimeMetrics?.byStage.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{stage.stage}</p>
                          <p className="text-xs text-gray-500">{stage.description}</p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {stage.averageTime} dias
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ 
                          width: `${(stage.averageTime / (cycleTimeMetrics?.averageCycleTime || 1)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Tendência de Cycle Time" description="Evolução ao longo do tempo">
              <TrendLineChart 
                data={cycleTimeMetrics?.trend || []} 
                color="#0a5193"
                showArea
                yAxisFormatter={(v) => `${v.toFixed(1)}d`}
              />
            </Card>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Throughput e Métricas DORA</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Deploys por Semana"
              value={throughputMetrics?.deploymentsPerWeek || 0}
              trend={15.3}
              trendLabel="vs. mês anterior"
              status="success"
            />
            <MetricCard
              title="Deploys por Mês"
              value={throughputMetrics?.deploymentsPerMonth || 0}
              trend={8.7}
              trendLabel="vs. mês anterior"
              status="success"
            />
            <MetricCard
              title="Story Points Entregues"
              value={throughputMetrics?.storyPointsDelivered || 0}
              trend={22.1}
              trendLabel="vs. mês anterior"
              status="success"
            />
            <MetricCard
              title="Lead Time"
              value={throughputMetrics?.leadTime || 0}
              unit="dias"
              trend={-10.2}
              trendLabel="vs. mês anterior"
              status="success"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Métricas DORA" description="Performance de entrega de software">
              <div className="grid grid-cols-2 gap-4">
                {throughputMetrics?.doraMetrics && Object.entries(throughputMetrics.doraMetrics).map(([key, value]) => {
                  const config = DORA_LEVELS[value as keyof typeof DORA_LEVELS];
                  const labels: Record<string, string> = {
                    deploymentFrequency: 'Frequência de Deploy',
                    leadTimeForChanges: 'Lead Time for Changes',
                    changeFailureRate: 'Change Failure Rate',
                    mttr: 'MTTR',
                  };
                  return (
                    <div key={key} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">{labels[key]}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.color as 'success' | 'info' | 'warning' | 'error'} size="md">
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Tendência de Throughput" description="Vazão de entregas">
              <TrendLineChart 
                data={throughputMetrics?.trend || []} 
                color="#ec6608"
                yAxisFormatter={(v) => `${v.toFixed(0)}`}
              />
            </Card>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Saúde do Backlog</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card title="Distribuição por Status">
              <div className="space-y-3">
                {backlogMetrics?.itemsByStatus.map((status) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status.status === 'Concluído' ? 'bg-green-500' :
                        status.status === 'Em Progresso' ? 'bg-blue-500' :
                        status.status === 'Em Revisão' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="text-sm text-gray-700">{status.status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{status.count}</span>
                      <span className="text-xs text-gray-500">({status.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total de Itens</span>
                  <span className="font-semibold text-gray-900">{backlogMetrics?.totalItems}</span>
                </div>
              </div>
            </Card>

            <Card title="Sprint Atual" description={backlogMetrics?.sprintHealth.currentSprint}>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Taxa de Conclusão</span>
                    <span className="font-medium text-gray-900">{backlogMetrics?.sprintHealth.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${backlogMetrics?.sprintHealth.completionRate}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Velocity</p>
                    <p className="text-lg font-semibold text-gray-900">{backlogMetrics?.sprintHealth.velocity}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Capacidade</p>
                    <p className="text-lg font-semibold text-gray-900">{backlogMetrics?.sprintHealth.capacity}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mudança de Escopo</span>
                  <span className={`font-medium ${
                    (backlogMetrics?.sprintHealth.scopeChange || 0) > 10 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    +{backlogMetrics?.sprintHealth.scopeChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card title="WIP Limit" description="Work In Progress">
              <div className="flex items-center justify-center py-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={backlogMetrics && backlogMetrics.wipLimitStatus.utilization > 90 ? '#ef4444' : '#0a5193'}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(backlogMetrics?.wipLimitStatus.utilization || 0) / 100 * 351.86} 351.86`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {backlogMetrics?.wipLimitStatus.current}
                    </span>
                    <span className="text-sm text-gray-500">/ {backlogMetrics?.wipLimitStatus.limit}</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Badge 
                  variant={backlogMetrics && backlogMetrics.wipLimitStatus.utilization > 90 ? 'error' : 'success'} 
                  size="md"
                >
                  {backlogMetrics?.wipLimitStatus.utilization.toFixed(0)}% Utilizado
                </Badge>
              </div>
            </Card>
          </div>

          <Card title="Itens em Envelhecimento" description="Itens com mais de 7 dias em progresso">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Título</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Prioridade</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Idade</th>
                  </tr>
                </thead>
                <tbody>
                  {backlogMetrics?.agingItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-4 text-sm font-medium text-blue-600">{item.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.title}</td>
                      <td className="py-3 px-4">
                        <Badge variant="info" size="sm">{item.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            item.priority === 'critical' ? 'error' :
                            item.priority === 'high' ? 'warning' :
                            item.priority === 'medium' ? 'info' :
                            'default'
                          } 
                          size="sm"
                        >
                          {item.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.age} dias</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}