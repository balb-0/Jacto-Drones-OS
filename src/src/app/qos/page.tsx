'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, MetricCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendLineChart, ComparisonBarChart, DistributionPieChart } from '@/components/charts';
import { 
  fetchBuildMetrics, 
  fetchTestDefectMetrics, 
  fetchIntegrationStabilityMetrics 
} from '@/services/metrics';
import type { 
  BuildMetrics, 
  TestDefectMetrics, 
  IntegrationStabilityMetrics 
} from '@/types/metrics';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  AlertTriangle,
  Server,
  Wifi,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { formatDuration, formatPercentage, getRelativeTime } from '@/lib/utils';

export default function QOSPage() {
  const [buildMetrics, setBuildMetrics] = useState<BuildMetrics | null>(null);
  const [testMetrics, setTestMetrics] = useState<TestDefectMetrics | null>(null);
  const [integrationMetrics, setIntegrationMetrics] = useState<IntegrationStabilityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [build, test, integration] = await Promise.all([
          fetchBuildMetrics(),
          fetchTestDefectMetrics(),
          fetchIntegrationStabilityMetrics(),
        ]);
        setBuildMetrics(build);
        setTestMetrics(test);
        setIntegrationMetrics(integration);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout 
        title="QoS - Quality of Service" 
        description="Métricas de saúde técnica do software"
      >
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="QoS - Quality of Service" 
      description="Métricas de saúde técnica do software"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Indicadores de Produto</h2>
            <p className="text-gray-600 mt-1">
              Monitoramento da saúde técnica do firmware e integrações
            </p>
          </div>
          <Badge variant="info" size="md">
            <Activity className="w-3 h-3 mr-1" />
            Atualizado {getRelativeTime(new Date())}
          </Badge>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Taxa de Sucesso de Builds</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Total de Builds"
              value={buildMetrics?.totalBuilds || 0}
              trend={12.5}
              trendLabel="vs. mês anterior"
              status="info"
            />
            <MetricCard
              title="Taxa de Sucesso"
              value={formatPercentage(buildMetrics?.successRate || 0)}
              trend={5.2}
              trendLabel="vs. mês anterior"
              status="success"
            />
            <MetricCard
              title="Builds com Falha"
              value={buildMetrics?.failedBuilds || 0}
              trend={-15.3}
              trendLabel="vs. mês anterior"
              status="success"
            />
            <MetricCard
              title="Tempo Médio"
              value={formatDuration(buildMetrics?.averageDuration || 0)}
              trend={-8.1}
              trendLabel="vs. mês anterior"
              status="success"
            />
          </div>

          <Card title="Tendência de Taxa de Sucesso" description="Últimos 30 dias">
            <TrendLineChart 
              data={buildMetrics?.trend || []} 
              color="#22c55e"
              showArea
              yAxisFormatter={(v) => `${v.toFixed(0)}%`}
            />
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Defeitos Barrados em Testes</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Total de Testes"
              value={testMetrics?.totalTests || 0}
              trend={8.7}
              trendLabel="vs. mês anterior"
              status="info"
            />
            <MetricCard
              title="Taxa de Aprovação"
              value={formatPercentage(
                ((testMetrics?.passedTests || 0) / (testMetrics?.totalTests || 1)) * 100
              )}
              trend={3.2}
              trendLabel="vs. mês anterior"
              status="success"
            />
            <MetricCard
              title="Defeitos Encontrados"
              value={testMetrics?.failedTests || 0}
              trend={-22.1}
              trendLabel="vs. mês anterior"
              status="success"
            />
            <MetricCard
              title="Densidade de Defeitos"
              value={testMetrics?.defectDensity || 0}
              unit="/1k linhas"
              trend={-10.5}
              trendLabel="vs. mês anterior"
              status="success"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Defeitos por Tipo" description="Distribuição por categoria">
              <DistributionPieChart 
                data={testMetrics?.defectsByType.map(d => ({ name: d.type, value: d.count })) || []}
                colors={['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']}
              />
            </Card>

            <Card title="Defeitos por Estágio" description="Capturados vs. Escapados">
              <ComparisonBarChart
                data={(testMetrics?.defectsByStage || []).map(stage => ({
                  name: stage.stage,
                  capturados: stage.defectsCaught,
                  escapados: stage.defectsEscaped,
                }))}
                bars={[
                  { key: 'capturados', name: 'Capturados', color: '#22c55e' },
                  { key: 'escapados', name: 'Escapados', color: '#ef4444' },
                ]}
              />
            </Card>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Estabilidade da Integração</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Status da Integração</h4>
                  <p className="text-sm text-gray-500">Firmware ↔ Plataforma Digital</p>
                </div>
                <Badge 
                  variant={integrationMetrics?.integrationHealth === 'healthy' ? 'success' : 'warning'}
                  size="md"
                >
                  {integrationMetrics?.integrationHealth === 'healthy' ? 'Saudável' : 'Degradado'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercentage(integrationMetrics?.uptime || 0)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Compatibilidade API</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercentage(integrationMetrics?.apiCompatibility || 0)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Versão Firmware</p>
                  <p className="text-lg font-bold text-gray-900">
                    {integrationMetrics?.firmwareVersion}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Versão Plataforma</p>
                  <p className="text-lg font-bold text-gray-900">
                    {integrationMetrics?.platformVersion}
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Incidentes Recentes" description="Últimas 48 horas">
              <div className="space-y-3">
                {integrationMetrics?.incidents.map((incident) => (
                  <div key={incident.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      incident.severity === 'critical' ? 'bg-red-500' :
                      incident.severity === 'high' ? 'bg-orange-500' :
                      incident.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{incident.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{getRelativeTime(incident.timestamp)}</span>
                        <span>•</span>
                        <Badge variant={incident.resolved ? 'success' : 'warning'} size="sm">
                          {incident.resolved ? 'Resolvido' : 'Aberto'}
                        </Badge>
                        {incident.resolved && incident.resolutionTime && (
                          <>
                            <span>•</span>
                            <span>Resolução: {formatDuration(incident.resolutionTime)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Tendência de Uptime" description="Últimos 30 dias">
            <TrendLineChart 
              data={integrationMetrics?.trend || []} 
              color="#0a5193"
              showArea
              yAxisFormatter={(v) => `${v.toFixed(1)}%`}
            />
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}