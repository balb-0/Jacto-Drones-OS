'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, MetricCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  fetchBuildMetrics, 
  fetchTestDefectMetrics,
  fetchCycleTimeMetrics,
  fetchThroughputMetrics,
  fetchBacklogHealthMetrics
} from '@/services/metrics';
import { 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  ArrowRight,
  Activity,
  GitBranch,
  Package
} from 'lucide-react';
import { formatPercentage, getRelativeTime } from '@/lib/utils';

export default function HomePage() {
  const [metrics, setMetrics] = useState({
    buildSuccess: 0,
    testPassRate: 0,
    cycleTime: 0,
    deploymentsPerWeek: 0,
    backlogHealth: 0,
    integrationUptime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [build, test, cycle, throughput, backlog] = await Promise.all([
          fetchBuildMetrics(),
          fetchTestDefectMetrics(),
          fetchCycleTimeMetrics(),
          fetchThroughputMetrics(),
          fetchBacklogHealthMetrics(),
        ]);

        setMetrics({
          buildSuccess: build.successRate,
          testPassRate: (test.passedTests / test.totalTests) * 100,
          cycleTime: cycle.averageCycleTime,
          deploymentsPerWeek: throughput.deploymentsPerWeek,
          backlogHealth: backlog.sprintHealth.completionRate,
          integrationUptime: 99.7,
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" description="Visão geral dos indicadores">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" description="Visão geral dos indicadores de qualidade">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
            <p className="text-gray-600 mt-1">
              Métricas consolidadas de QoS e QoP
            </p>
          </div>
          <Badge variant="info" size="md">
            <Activity className="w-3 h-3 mr-1" />
            Atualizado {getRelativeTime(new Date())}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/qos">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">QoS</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Quality of Service</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Build Success</span>
                      <span className="font-medium text-gray-900">{formatPercentage(metrics.buildSuccess)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Test Pass Rate</span>
                      <span className="font-medium text-gray-900">{formatPercentage(metrics.testPassRate)}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link href="/qop">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">QoP</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Quality of Process</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cycle Time</span>
                      <span className="font-medium text-gray-900">{metrics.cycleTime} dias</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Deploys/Semana</span>
                      <span className="font-medium text-gray-900">{metrics.deploymentsPerWeek}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Saúde Geral</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backlog</span>
                <Badge variant={metrics.backlogHealth > 75 ? 'success' : 'warning'} size="sm">
                  {metrics.backlogHealth.toFixed(0)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Integração</span>
                <Badge variant="success" size="sm">
                  {formatPercentage(metrics.integrationUptime)}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Métricas de Destaque" description="Principais indicadores do período">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-900">Total de Builds</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">156</p>
                <p className="text-xs text-blue-700 mt-1">+12% vs. mês anterior</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-900">Features Entregues</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">12</p>
                <p className="text-xs text-orange-700 mt-1">Sprint atual</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-900">Taxa de Sucesso</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{formatPercentage(metrics.buildSuccess)}</p>
                <p className="text-xs text-green-700 mt-1">Meta: &gt;95%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-900">Tempo Médio</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">8.5m</p>
                <p className="text-xs text-purple-700 mt-1">Pipeline completo</p>
              </div>
            </div>
          </Card>

          <Card title="Status do Sistema" description="Componentes e integrações">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">GitLab CI/CD</span>
                </div>
                <Badge variant="success" size="sm">Operacional</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">PX4 SITL/HITL</span>
                </div>
                <Badge variant="success" size="sm">Operacional</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Integração Firmware</span>
                </div>
                <Badge variant="success" size="sm">Saudável</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Jira API</span>
                </div>
                <Badge variant="warning" size="sm">Latência Elevada</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}