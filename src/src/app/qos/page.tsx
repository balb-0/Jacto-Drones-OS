'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, MetricCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendLineChart, ComparisonBarChart, DistributionPieChart } from '@/components/charts';
import { motion } from 'framer-motion';
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
  AlertTriangle,
  Server,
  Wifi,
} from 'lucide-react';
import { formatDuration, formatPercentage, getRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="QOS LOADING..." description="PROCESSANDO MÉTRICAS DE SERVIÇO">
        <div className="flex flex-col items-center justify-center h-96">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-12 h-12 bg-black border-[4px] border-primary"
          />
          <p className="mt-4 font-black uppercase italic">SINC_KERNEL...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="QUALITY OF SERVICE" 
      description="MÉTRICAS DE SAÚDE TÉCNICA E ESTABILIDADE DO FIRMWARE"
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-[6px] border-black pb-8 relative overflow-hidden">
          <div>
            <h2 className="text-5xl font-black text-black leading-none mb-2">PRODUTO CORE</h2>
            <div className="flex items-center gap-3">
              <Badge variant="primary" size="lg">KERNEL_V2.4.1</Badge>
              <Badge variant="secondary" size="lg">STABLE_BUILD</Badge>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-4 border-[3px] border-black bg-white shadow-[4px_4px_0px_000000] font-black italic">
              UPTIME: {formatPercentage(integrationMetrics?.uptime || 0)}
            </div>
          </div>
        </div>

        {/* Section: Builds */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black border-[3px] border-primary">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic">PIPELINE DE BUILD</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="TOTAL DE BUILDS"
              value={buildMetrics?.totalBuilds || 0}
              trend={12.5}
              trendLabel="VS. ANTERIOR"
              status="info"
            />
            <MetricCard
              title="TAXA DE SUCESSO"
              value={formatPercentage(buildMetrics?.successRate || 0)}
              status="success"
            />
            <MetricCard
              title="FALHAS"
              value={buildMetrics?.failedBuilds || 0}
              status="error"
            />
            <MetricCard
              title="TEMPO MÉDIO"
              value={formatDuration(buildMetrics?.averageDuration || 0)}
              status="info"
            />
          </div>

          <Card className="border-black overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-10 -mr-16 -mt-16 rotate-45" />
            <div className="mb-6">
              <h4 className="text-xl font-black italic">HISTÓRICO DE ESTABILIDADE</h4>
            </div>
            <div className="h-[300px] w-full bg-white border-[3px] border-black p-4">
              <TrendLineChart 
                data={buildMetrics?.trend || []} 
                color="#000000"
                showArea
                yAxisFormatter={(v) => `${v.toFixed(0)}%`}
              />
            </div>
          </Card>
        </section>

        {/* Section: Defects */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black border-[3px] border-error">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic">DEFESA E QUALIDADE</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="TESTES EXECUTADOS"
              value={testMetrics?.totalTests || 0}
              status="info"
            />
            <MetricCard
              title="DEFREITOS BARRADOS"
              value={testMetrics?.failedTests || 0}
              status="success"
            />
            <MetricCard
              title="DENSIDADE"
              value={testMetrics?.defectDensity || 0}
              unit="/1K LOC"
              status="warning"
            />
            <MetricCard
              title="COVERAGE"
              value="92.4"
              unit="%"
              status="success"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card title="CATEGORIAS DE ERRO" className="border-black">
              <div className="h-[300px] w-full bg-white p-4">
                <DistributionPieChart 
                  data={testMetrics?.defectsByType.map(d => ({ name: d.type.toUpperCase(), value: d.count })) || []}
                  colors={['#000000', '#A3E635', '#F472B6', '#3B82F6']}
                />
              </div>
            </Card>

            <Card title="EFICIÊNCIA DE CAPTURA" className="border-black">
              <div className="h-[300px] w-full bg-white p-4">
                <ComparisonBarChart
                  data={(testMetrics?.defectsByStage || []).map(stage => ({
                    name: stage.stage.toUpperCase(),
                    capturados: stage.defectsCaught,
                    escapados: stage.defectsEscaped,
                  }))}
                  bars={[
                    { key: 'capturados', name: 'CAPTURA', color: '#A3E635' },
                    { key: 'escapados', name: 'ESCAPE', color: '#EF4444' },
                  ]}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Section: Integration */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black border-[3px] border-secondary">
              <Wifi className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic">MATRIZ DE INTEGRAÇÃO</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <Card className="lg:col-span-2 bg-black text-white border-black">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-2xl font-black italic text-primary">STATUS DA MALHA</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase">FIRMWARE ↔ CLOUD BRIDGE</p>
                </div>
                <div className="px-6 py-2 border-[3px] border-primary text-primary font-black uppercase italic">
                  {integrationMetrics?.integrationHealth === 'healthy' ? 'CONNECTED' : 'DEGRADED'}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'UPTIME', val: formatPercentage(integrationMetrics?.uptime || 0) },
                  { label: 'API_COMPAT', val: formatPercentage(integrationMetrics?.apiCompatibility || 0) },
                  { label: 'FW_VER', val: integrationMetrics?.firmwareVersion },
                  { label: 'PL_VER', val: integrationMetrics?.platformVersion },
                ].map((stat, i) => (
                  <div key={i} className="p-4 border-[2px] border-gray-800 bg-gray-900 shadow-[4px_4px_0px_#000]">
                    <p className="text-[10px] font-black text-gray-500 uppercase">{stat.label}</p>
                    <p className="text-xl font-black text-white italic">{stat.val}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="LOG DE INCIDENTES" className="bg-secondary/10 border-black">
              <div className="space-y-4">
                {integrationMetrics?.incidents.map((incident) => (
                  <motion.div 
                    key={incident.id} 
                    whileHover={{ x: 5 }}
                    className="flex flex-col gap-2 p-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_000000]"
                  >
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-3 h-3 border-[2px] border-black",
                        incident.severity === 'critical' ? 'bg-error' : 'bg-warning'
                      )} />
                      <Badge variant={incident.resolved ? 'primary' : 'warning'}>
                        {incident.resolved ? 'RESOLVIDO' : 'PENDENTE'}
                      </Badge>
                    </div>
                    <p className="text-sm font-black italic uppercase leading-tight">{incident.description}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">{getRelativeTime(incident.timestamp)}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </motion.div>
    </DashboardLayout>
  );
}