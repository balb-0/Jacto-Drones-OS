'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, MetricCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendLineChart } from '@/components/charts';
import { motion } from 'framer-motion';
import {
  fetchCycleTimeMetrics,
  fetchThroughputMetrics,
  fetchBacklogHealthMetrics
} from '@/services/metrics';
import { getProcessMetrics, getDoraMetrics } from '@/services/process';
import type {
  CycleTimeMetrics,
  ThroughputMetrics,
  BacklogHealthMetrics,
  ProcessMetrics,
  DoraMetricsReal,
} from '@/types/metrics';
import {
  Clock,
  TrendingUp,
  ListTodo,
  Rocket,
  GitMerge,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DORA_BADGE: Record<
  string,
  'primary' | 'secondary' | 'warning' | 'error' | 'default'
> = {
  elite: 'primary',
  high: 'secondary',
  medium: 'warning',
  low: 'error',
  'nao-medido': 'default',
};

// Protocolo de medição (janela × método × aceite) — espelha docs/dora-protocolo.md.
// Renderizado JUNTO dos indicadores reais (princípio "evidência no entorno imediato").
const DORA_PROTOCOL: Record<string, { janela: string; metodo: string; aceite: string }> = {
  deployment_frequency: {
    janela: 'Toda a vida do projeto até o snapshot (esteira pedagógica)',
    metodo: 'Contagem de deployments status=success no ambiente staging',
    aceite: 'Contagem absoluta + janela; classificação conservadora (medium)',
  },
  lead_time: {
    janela: '21 MRs mergeados (estado merged)',
    metodo: 'Por MR: merged_at − created_at (h); reporta mediana E média',
    aceite: 'Mediana < 24h → elite; média reportada junto (caudas longas)',
  },
  change_failure_rate: {
    janela: 'Pipelines por ref na amostra (main: 4; develop: 11)',
    metodo: 'pipelines failed / total restrito ao ref; DORA usa main (produção)',
    aceite: 'CFR de main ≤ 15% → elite; develop reportado à parte (transparência)',
  },
  mttr: {
    janela: 'Snapshot atual',
    metodo: 'Tempo entre falha em produção e recuperação (próximo success)',
    aceite: 'Não medido: main teve 0 falhas; develop é de-risking, não produção',
  },
};

export default function QOPPage() {
  const [cycleTimeMetrics, setCycleTimeMetrics] = useState<CycleTimeMetrics | null>(null);
  const [throughputMetrics, setThroughputMetrics] = useState<ThroughputMetrics | null>(null);
  const [backlogMetrics, setBacklogMetrics] = useState<BacklogHealthMetrics | null>(null);
  const [process, setProcess] = useState<ProcessMetrics | null>(null);
  const [dora, setDora] = useState<DoraMetricsReal | null>(null);
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
        // DORA MEDIDO real (snapshot API GitLab) — fonte de verdade desta página.
        setProcess(getProcessMetrics());
        setDora(getDoraMetrics());
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
      <DashboardLayout title="QOP LOADING..." description="REPROCESSANDO FLUXO DE ENGENHARIA">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-16 h-16 border-[6px] border-black bg-secondary animate-bounce" />
          <p className="mt-6 font-black uppercase italic animate-pulse">CALIBRANDO VELOCITY...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="QUALITY OF PROCESS"
      description="INDICADORES DE EFICIÊNCIA, VAZÃO E SAÚDE DO BACKLOG"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end border-b-[6px] border-black pb-10 relative overflow-hidden">
          <div>
            <h2 className="text-6xl font-black text-black leading-[0.8] mb-4 uppercase italic">VELOCITY<br/>CONTROL</h2>
            <p className="text-sm font-bold text-gray-500 uppercase italic tracking-widest">OTIMIZAÇÃO DE FLUXO DE TRABALHO G4</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-end">
            <div className="px-8 py-4 bg-black text-primary border-[4px] border-black shadow-[6px_6px_0px_var(--color-secondary)] font-black italic text-2xl uppercase">
              DORA (PROD): {dora?.change_failure_rate.classificacao_producao.toUpperCase() ?? 'N/D'}
            </div>
          </div>
        </div>

        {/* Section: DORA MEDIDO (DADOS REAIS) — fonte de verdade desta página */}
        {dora && process && (
          <section className="space-y-8" data-testid="qop-dora-real-section">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black border-[3px] border-primary">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-3xl font-black text-black uppercase italic border-b-4 border-black pb-2">
                DORA MEDIDO (DADOS REAIS)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Deployment Frequency */}
              <div className="brutal-card p-6 bg-white relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-4 h-4 text-secondary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    DEPLOY FREQ
                  </p>
                </div>
                <p className="text-4xl font-black italic leading-none mb-3">
                  {dora.deployment_frequency.valor}
                </p>
                <Badge
                  variant={DORA_BADGE[dora.deployment_frequency.classificacao]}
                  size="sm"
                >
                  {dora.deployment_frequency.classificacao.toUpperCase()}
                </Badge>
                <p className="mt-3 text-[10px] font-bold text-gray-600 uppercase italic leading-tight">
                  {dora.deployment_frequency.unidade}
                </p>
                <div className="mt-4 pt-3 border-t-2 border-black space-y-1">
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Janela:</span> {DORA_PROTOCOL.deployment_frequency.janela}
                  </p>
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Método:</span> {DORA_PROTOCOL.deployment_frequency.metodo}
                  </p>
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Aceite:</span> {DORA_PROTOCOL.deployment_frequency.aceite}
                  </p>
                </div>
              </div>

              {/* Lead Time */}
              <div className="brutal-card p-6 bg-white relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-secondary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    LEAD TIME
                  </p>
                </div>
                <p className="text-4xl font-black italic leading-none mb-1">
                  {dora.lead_time_for_changes.mediana_h}h
                </p>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">
                  mediana · média {dora.lead_time_for_changes.media_h}h
                </p>
                <Badge
                  variant={DORA_BADGE[dora.lead_time_for_changes.classificacao]}
                  size="sm"
                >
                  {dora.lead_time_for_changes.classificacao.toUpperCase()}
                </Badge>
                <div className="mt-4 pt-3 border-t-2 border-black space-y-1">
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Janela:</span> {DORA_PROTOCOL.lead_time.janela}
                  </p>
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Método:</span> {DORA_PROTOCOL.lead_time.metodo}
                  </p>
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Aceite:</span> {DORA_PROTOCOL.lead_time.aceite}
                  </p>
                </div>
              </div>

              {/* Change Failure Rate (produção) */}
              <div className="brutal-card p-6 bg-white relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <GitMerge className="w-4 h-4 text-secondary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    CFR (PRODUÇÃO)
                  </p>
                </div>
                <p className="text-4xl font-black italic leading-none mb-1">
                  {dora.change_failure_rate.producao_main_pct}%
                </p>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">
                  main · develop{' '}
                  {dora.change_failure_rate.desenvolvimento_develop_pct}%
                </p>
                <Badge
                  variant={
                    DORA_BADGE[dora.change_failure_rate.classificacao_producao]
                  }
                  size="sm"
                >
                  {dora.change_failure_rate.classificacao_producao.toUpperCase()}
                </Badge>
                <div className="mt-4 pt-3 border-t-2 border-black space-y-1">
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Janela:</span> {DORA_PROTOCOL.change_failure_rate.janela}
                  </p>
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Método:</span> {DORA_PROTOCOL.change_failure_rate.metodo}
                  </p>
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Aceite:</span> {DORA_PROTOCOL.change_failure_rate.aceite}
                  </p>
                </div>
              </div>

              {/* MTTR */}
              <div className="brutal-card p-6 bg-white relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-secondary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    MTTR
                  </p>
                </div>
                <p className="text-4xl font-black italic leading-none mb-3">
                  {dora.mttr.valor_h === null ? 'N/D' : `${dora.mttr.valor_h}h`}
                </p>
                <Badge variant={DORA_BADGE[dora.mttr.classificacao]} size="sm">
                  {dora.mttr.classificacao.toUpperCase()}
                </Badge>
                <p className="mt-3 text-[10px] font-bold text-gray-600 uppercase italic leading-tight">
                  sem incidente de produção na janela
                </p>
                <div className="mt-4 pt-3 border-t-2 border-black space-y-1">
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Janela:</span> {DORA_PROTOCOL.mttr.janela}
                  </p>
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Método:</span> {DORA_PROTOCOL.mttr.metodo}
                  </p>
                  <p className="text-[9px] font-bold text-gray-600 leading-tight">
                    <span className="font-black uppercase">Aceite:</span> {DORA_PROTOCOL.mttr.aceite}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="PIPELINES (AMOSTRA)"
                value={process.pipelines_amostra_100.total}
                status="info"
              />
              <MetricCard
                title="PIPELINES SUCCESS"
                value={process.pipelines_amostra_100.success}
                status="success"
              />
              <MetricCard
                title="PIPELINES FAILED"
                value={process.pipelines_amostra_100.failed}
                status="warning"
              />
            </div>

            <div className="p-5 border-[3px] border-black bg-warning/10">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-700 mb-1">
                NOTA DE HONESTIDADE · {process._meta.coletado_em} ·{' '}
                {process._meta.fonte}
              </p>
              <p className="text-xs font-bold text-gray-700 italic">
                {dora.observacao_honesta}
              </p>
            </div>
          </section>
        )}

        {/* Section: Cycle Time — PROJETADO (mock legado, não derivado do GitLab) */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="p-3 bg-black border-[3px] border-secondary">
              <Clock className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic">CICLO DE ENTREGA</h3>
            <Badge variant="warning" size="sm">PROJETADO</Badge>
          </div>
          <p className="text-[11px] font-bold text-gray-500 uppercase italic tracking-widest">
            ⚠️ Dados projetados (placeholder) — não derivados do GitLab. Métrica real de lead time acima (DORA MEDIDO).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="MÉDIA TOTAL"
              value={cycleTimeMetrics?.averageCycleTime || 0}
              unit="DIAS"
              status="success"
              trend={-12.5}
            />
            <MetricCard
              title="MEDIANA"
              value={cycleTimeMetrics?.medianCycleTime || 0}
              unit="DIAS"
              status="success"
            />
            <MetricCard
              title="P85"
              value={cycleTimeMetrics?.p85CycleTime || 0}
              unit="DIAS"
              status="warning"
            />
            <MetricCard
              title="P95"
              value={cycleTimeMetrics?.p95CycleTime || 0}
              unit="DIAS"
              status="error"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card title="GARGALOS POR ESTÁGIO" className="border-black bg-white">
              <div className="space-y-6 mt-4">
                {cycleTimeMetrics?.byStage.map((stage, index) => (
                  <div key={stage.stage} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border-[3px] border-black bg-secondary flex items-center justify-center font-black italic group-hover:bg-black group-hover:text-white transition-colors">
                          0{index + 1}
                        </div>
                        <div>
                          <p className="font-black text-black uppercase italic leading-none">{stage.stage}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{stage.description}</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black italic text-black">
                        {stage.averageTime}D
                      </span>
                    </div>
                    <div className="h-4 bg-[#f0f0f0] border-[2px] border-black overflow-hidden shadow-[2px_2px_0px_000000]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stage.averageTime / (cycleTimeMetrics?.averageCycleTime || 1)) * 100}%` }}
                        className="h-full bg-secondary border-r-[2px] border-black"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="TENDÊNCIA DE ENTREGA" className="border-black">
              <div className="h-[350px] w-full bg-white p-4">
                <TrendLineChart
                  data={cycleTimeMetrics?.trend || []}
                  color="#F472B6"
                  showArea
                  yAxisFormatter={(v) => `${v.toFixed(1)}d`}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Section: Throughput — PROJETADO (mock legado; DORA real fica na seção acima) */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="p-3 bg-black border-[3px] border-primary">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic">THROUGHPUT (PROJETADO)</h3>
            <Badge variant="warning" size="sm">PROJETADO</Badge>
          </div>
          <p className="text-[11px] font-bold text-gray-500 uppercase italic tracking-widest">
            ⚠️ Dados projetados (placeholder) — não derivados do GitLab. O DORA MEDIDO real está na seção no topo da página.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="DEPLOYS / SEMANA" value={throughputMetrics?.deploymentsPerWeek || 0} status="success" />
            <MetricCard title="DEPLOYS / MÊS" value={throughputMetrics?.deploymentsPerMonth || 0} status="success" />
            <MetricCard title="STORY POINTS" value={throughputMetrics?.storyPointsDelivered || 0} status="success" />
            <MetricCard title="LEAD TIME" value={throughputMetrics?.leadTime || 0} unit="DIAS" status="success" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <Card title="MÉTRICAS DORA (PROJETADO)" description="CATEGÓRICO — VER DORA MEDIDO NO TOPO" className="bg-black text-white border-black col-span-1">
              <div className="grid grid-cols-1 gap-4 mt-4">
                {throughputMetrics?.doraMetrics && Object.entries(throughputMetrics.doraMetrics).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    deploymentFrequency: 'DEPLOY FREQ',
                    leadTimeForChanges: 'LEAD TIME',
                    changeFailureRate: 'FAILURE RATE',
                    mttr: 'MTTR',
                  };
                  return (
                    <div key={key} className="p-4 border-[2px] border-gray-800 bg-gray-900 flex justify-between items-center shadow-[4px_4px_0px_#000]">
                      <p className="text-xs font-black text-gray-500 uppercase">{labels[key]}</p>
                      <Badge variant={DORA_BADGE[value] ?? 'default'}>
                        {String(value).toUpperCase()}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="VAZÃO DE ENTREGA" className="lg:col-span-2 border-black">
              <div className="h-[300px] w-full bg-white p-4">
                <TrendLineChart
                  data={throughputMetrics?.trend || []}
                  color="#A3E635"
                  yAxisFormatter={(v) => `${v.toFixed(0)}`}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Section: Backlog — PROJETADO (mock legado, não derivado do GitLab) */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="p-3 bg-black border-[3px] border-warning">
              <ListTodo className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic">SAÚDE DO BACKLOG</h3>
            <Badge variant="warning" size="sm">PROJETADO</Badge>
          </div>
          <p className="text-[11px] font-bold text-gray-500 uppercase italic tracking-widest">
            ⚠️ Dados projetados (placeholder) — não derivados do GitLab.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <Card title="STATUS DO INVENTÁRIO" className="border-black">
              <div className="space-y-4 mt-4">
                {backlogMetrics?.itemsByStatus.map((status) => (
                  <div key={status.status} className="flex items-center justify-between p-3 border-[2px] border-black bg-[#f9f9f9]">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 border-[2px] border-black",
                        status.status === 'Concluído' ? 'bg-primary' :
                        status.status === 'Em Progresso' ? 'bg-secondary' :
                        status.status === 'Em Revisão' ? 'bg-warning' : 'bg-gray-400'
                      )} />
                      <span className="text-sm font-black italic uppercase">{status.status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black">{status.count}</span>
                      <Badge variant="default" size="sm">{status.percentage.toFixed(0)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-black text-white font-black italic uppercase text-center border-[2px] border-black">
                TOTAL: {backlogMetrics?.totalItems} ITENS
              </div>
            </Card>

            <Card title="SPRINT ATUAL" description={backlogMetrics?.sprintHealth.currentSprint.toUpperCase()} className="border-black">
              <div className="space-y-8 mt-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-black uppercase text-gray-500">COMPLETION RATE</span>
                    <span className="text-3xl font-black italic">{backlogMetrics?.sprintHealth.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-6 bg-[#f0f0f0] border-[3px] border-black shadow-[4px_4px_0px_000000] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${backlogMetrics?.sprintHealth.completionRate}%` }}
                      className="h-full bg-primary border-r-[3px] border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 border-[2px] border-black bg-white shadow-[4px_4px_0px_000000]">
                    <p className="text-[10px] font-black text-gray-400 uppercase">VELOCITY</p>
                    <p className="text-2xl font-black italic">{backlogMetrics?.sprintHealth.velocity}</p>
                  </div>
                  <div className="p-4 border-[2px] border-black bg-white shadow-[4px_4px_0px_000000]">
                    <p className="text-[10px] font-black text-gray-400 uppercase">CAPACITY</p>
                    <p className="text-2xl font-black italic">{backlogMetrics?.sprintHealth.capacity}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-black text-white italic font-black uppercase">
                  <span>SCOPE CHANGE</span>
                  <span className={cn(
                    (backlogMetrics?.sprintHealth.scopeChange || 0) > 10 ? 'text-error' : 'text-primary'
                  )}>
                    +{backlogMetrics?.sprintHealth.scopeChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card title="WIP LIMIT" description="UTILIZAÇÃO DA BANDA" className="border-black">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative w-40 h-40 border-[6px] border-black rounded-full flex items-center justify-center bg-white shadow-[8px_8px_0px_000000]">
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-black italic leading-none">{backlogMetrics?.wipLimitStatus.current}</span>
                    <div className="h-[3px] w-12 bg-black my-1" />
                    <span className="text-xl font-black text-gray-500 italic leading-none">{backlogMetrics?.wipLimitStatus.limit}</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Badge
                    variant={backlogMetrics && backlogMetrics.wipLimitStatus.utilization > 90 ? 'error' : 'primary'}
                    size="lg"
                    className="text-lg px-6 py-2"
                  >
                    {backlogMetrics?.wipLimitStatus.utilization.toFixed(0)}% UTILIZADO
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          <Card title="ITENS EM ENVELHECIMENTO" description="ANOMALIAS DE PROCESSO (+7 DIAS EM WIP)" className="border-black">
            <div className="overflow-x-auto mt-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-black text-white italic">
                    <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-xs">ID</th>
                    <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-xs">TÍTULO</th>
                    <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-xs">STATUS</th>
                    <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-xs">PRIORIDADE</th>
                    <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-xs">IDADE</th>
                  </tr>
                </thead>
                <tbody>
                  {backlogMetrics?.agingItems.map((item) => (
                    <tr key={item.id} className="border-b-[3px] border-black hover:bg-secondary/5 transition-colors group">
                      <td className="py-5 px-6 font-black text-secondary">{item.id}</td>
                      <td className="py-5 px-6 font-black uppercase italic text-sm">{item.title}</td>
                      <td className="py-5 px-6">
                        <Badge variant="default" size="sm">{item.status.toUpperCase()}</Badge>
                      </td>
                      <td className="py-5 px-6">
                        <Badge
                          variant={
                            item.priority === 'critical' ? 'error' :
                            item.priority === 'high' ? 'warning' :
                            item.priority === 'medium' ? 'secondary' : 'default'
                          }
                          size="sm"
                        >
                          {item.priority.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-5 px-6 font-black italic text-black group-hover:scale-110 transition-transform">
                        {item.age} DIAS
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </motion.div>
    </DashboardLayout>
  );
}
