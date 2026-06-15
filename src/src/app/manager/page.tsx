'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, MetricCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { fetchAllManagerMetrics } from '@/services/manager';
import { fetchPipelineSnapshot } from '@/services/pipeline';
import { ConsolidatedPanel } from '@/components/ConsolidatedPanel';
import type {
  TeamMemberMetrics,
  AnomalyDetection,
  BottleneckAnalysis,
  ProcessMetrics,
  DoraMetricsReal,
} from '@/types/metrics';
import type { PipelineSnapshot } from '@/types/pipeline';
import {
  AlertTriangle,
  AlertOctagon,
  Users,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  GitPullRequest,
  GitMerge,
  Rocket,
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

export default function ManagerPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberMetrics[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BottleneckAnalysis[]>([]);
  const [thresholdAnomalies, setThresholdAnomalies] = useState<
    AnomalyDetection[]
  >([]);
  const [statisticalAnomalies, setStatisticalAnomalies] = useState<
    AnomalyDetection[]
  >([]);
  const [process, setProcess] = useState<ProcessMetrics | null>(null);
  const [dora, setDora] = useState<DoraMetricsReal | null>(null);
  const [pipeline, setPipeline] = useState<PipelineSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [data, pipelineSnap] = await Promise.all([
          fetchAllManagerMetrics(),
          fetchPipelineSnapshot(),
        ]);
        setTeamMembers(data.teamMembers);
        setBottlenecks(data.bottlenecks);
        setThresholdAnomalies(data.thresholdAnomalies);
        setStatisticalAnomalies(data.statisticalAnomalies);
        setProcess(data.process);
        setDora(data.dora);
        setPipeline(pipelineSnap);
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
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <DashboardLayout
        title="CARREGANDO..."
        description="Sincronizando dados gerenciais"
      >
        <div className="flex flex-col items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-[6px] border-black border-t-primary"
          />
          <p className="mt-6 font-black uppercase italic animate-pulse">
            ALINHANDO DADOS GERENCIAIS...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const totalTasks = teamMembers.reduce(
    (sum, member) => sum + member.taskCount,
    0
  );
  const avgTasksPerMember =
    teamMembers.length > 0 ? (totalTasks / teamMembers.length).toFixed(1) : '0';
  const overloadedCount = teamMembers.filter((m) => m.overloadFlag).length;
  // Carga por pessoa é placeholder: a API GitLab não a expõe trivialmente.
  const teamIsSynthetic =
    teamMembers.length > 0 && teamMembers.every((m) => m.synthetic);

  return (
    <DashboardLayout
      title="PAINEL GERENCIAL"
      description="MONITORAMENTO DE ANOMALIAS, GARGALOS E CARGA DA EQUIPE"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end border-b-[6px] border-black pb-10 relative overflow-hidden">
          <div>
            <h2 className="text-6xl font-black text-black leading-[0.8] mb-4 uppercase italic">
              GESTÃO
              <br />
              OPERACIONAL
            </h2>
            <p className="text-sm font-bold text-gray-500 uppercase italic tracking-widest">
              VISÃO GERENCIAL DO TIME G4
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-end">
            <div className="px-8 py-4 bg-black text-primary border-[4px] border-black shadow-[6px_6px_0px_var(--color-secondary)] font-black italic text-2xl uppercase">
              {teamMembers.length} MEMBROS
            </div>
          </div>
        </div>

        {/* "UM LUGAR SO" — visao consolidada (DORA + gates + anomalias +
            deploys) com trilha de auditoria por numero (TG5.3) */}
        {dora && pipeline && (
          <ConsolidatedPanel dora={dora} snapshot={pipeline} />
        )}

        {/* DORA & PROCESSO — dados REAIS coletados da API GitLab */}
        {dora && process && (
          <section className="space-y-8" data-testid="dora-real-section">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black border-[3px] border-primary">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-3xl font-black text-black uppercase italic border-b-4 border-black pb-2">
                DORA MEDIDO (DADOS REAIS)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="brutal-card p-6 bg-white relative overflow-hidden">
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
              </div>

              <div className="brutal-card p-6 bg-white relative overflow-hidden">
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
              </div>

              <div className="brutal-card p-6 bg-white relative overflow-hidden">
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
              </div>

              <div className="brutal-card p-6 bg-white relative overflow-hidden">
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

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black border-[3px] border-error">
              <AlertOctagon className="w-6 h-6 text-error" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic border-b-4 border-black pb-2">
              ANOMALIAS DETECTADAS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="ANOMALIAS THRESHOLD"
              value={thresholdAnomalies.length}
              status={
                thresholdAnomalies.length > 3
                  ? 'error'
                  : thresholdAnomalies.length > 0
                    ? 'warning'
                    : 'success'
              }
            />
            <MetricCard
              title="ANOMALIAS ESTATÍSTICAS"
              value={statisticalAnomalies.length}
              status={statisticalAnomalies.length > 0 ? 'warning' : 'success'}
            />
            <MetricCard
              title="TOTAL DE ALERTAS"
              value={thresholdAnomalies.length + statisticalAnomalies.length}
              status={
                thresholdAnomalies.length + statisticalAnomalies.length > 4
                  ? 'error'
                  : 'warning'
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card title="ANOMALIAS POR LIMITE" className="border-black">
              <div className="space-y-4 mt-4">
                {thresholdAnomalies.length === 0 ? (
                  <div className="p-6 border-[3px] border-black bg-primary/10 text-center">
                    <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="font-black uppercase italic">
                      NENHUMA ANOMALIA DE LIMITE
                    </p>
                  </div>
                ) : (
                  thresholdAnomalies.map((anomaly, index) => (
                    <motion.div
                      key={index}
                      variants={item}
                      className="p-4 border-[3px] border-black bg-white shadow-[4px_4px_0px_000000] hover:shadow-[6px_6px_0px_000000] transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle
                            className={cn(
                              'w-5 h-5',
                              anomaly.severity === 'critical'
                                ? 'text-error'
                                : 'text-warning'
                            )}
                          />
                          <span className="font-black uppercase italic text-sm">
                            {anomaly.metric}
                          </span>
                        </div>
                        <Badge
                          variant={
                            anomaly.severity === 'critical'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="border-l-4 border-black pl-3">
                          <p className="text-[10px] font-black text-gray-500 uppercase">
                            ATUAL
                          </p>
                          <p className="text-xl font-black italic">
                            {anomaly.currentValue}
                          </p>
                        </div>
                        <div className="border-l-4 border-black pl-3">
                          <p className="text-[10px] font-black text-gray-500 uppercase">
                            LIMITE
                          </p>
                          <p className="text-xl font-black italic">
                            {anomaly.threshold}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-gray-600 uppercase">
                        {anomaly.description}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>

            <Card title="ANOMALIAS ESTATÍSTICAS" className="border-black">
              <div className="space-y-4 mt-4">
                {statisticalAnomalies.length === 0 ? (
                  <div className="p-6 border-[3px] border-black bg-primary/10 text-center">
                    <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="font-black uppercase italic">
                      NENHUMA ANOMALIA ESTATÍSTICA
                    </p>
                  </div>
                ) : (
                  statisticalAnomalies.map((anomaly, index) => (
                    <motion.div
                      key={index}
                      variants={item}
                      className="p-4 border-[3px] border-black bg-white shadow-[4px_4px_0px_000000] hover:shadow-[6px_6px_0px_000000] transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <TrendingUp
                            className={cn(
                              'w-5 h-5',
                              anomaly.severity === 'critical'
                                ? 'text-error'
                                : 'text-warning'
                            )}
                          />
                          <span className="font-black uppercase italic text-sm">
                            {anomaly.metric}
                          </span>
                        </div>
                        <Badge
                          variant={
                            anomaly.severity === 'critical'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="border-l-4 border-black pl-3">
                          <p className="text-[10px] font-black text-gray-500 uppercase">
                            ATUAL
                          </p>
                          <p className="text-xl font-black italic">
                            {anomaly.currentValue.toFixed(2)}
                          </p>
                        </div>
                        <div className="border-l-4 border-black pl-3">
                          <p className="text-[10px] font-black text-gray-500 uppercase">
                            LIMITE σ
                          </p>
                          <p className="text-xl font-black italic">
                            {anomaly.threshold.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-gray-600 uppercase">
                        {anomaly.description}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black border-[3px] border-warning">
              <Activity className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic border-b-4 border-black pb-2">
              GARGALOS DO PROCESSO
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bottlenecks.map((bottleneck, index) => (
              <motion.div
                key={bottleneck.stage}
                variants={item}
                whileHover={{ y: -2, x: -2, boxShadow: '6px 6px 0px #000' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="brutal-card p-6 bg-white relative overflow-hidden"
              >
                <div
                  className={cn(
                    'absolute top-0 right-0 px-3 py-1 border-l-[4px] border-b-[4px] border-black font-black text-[10px] uppercase',
                    bottleneck.status === 'normal'
                      ? 'bg-primary text-black'
                      : bottleneck.status === 'congested'
                        ? 'bg-warning text-black'
                        : 'bg-error text-white'
                  )}
                >
                  {bottleneck.status.toUpperCase()}
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                  {bottleneck.stage}
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-black italic leading-none">
                    {bottleneck.currentValue.toFixed(1)}
                  </span>
                  <span className="text-sm font-black text-gray-500 uppercase italic">
                    dias
                  </span>
                </div>
                <div className="border-t-2 border-black pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase">
                      LIMITE
                    </span>
                    <span className="text-sm font-black italic">
                      {bottleneck.threshold}d
                    </span>
                  </div>
                  <div className="h-2 bg-[#f0f0f0] border-[2px] border-black overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((bottleneck.currentValue / bottleneck.threshold) * 100, 100)}%`,
                      }}
                      className={cn(
                        'h-full border-r-[2px] border-black',
                        bottleneck.status === 'normal'
                          ? 'bg-primary'
                          : bottleneck.status === 'congested'
                            ? 'bg-warning'
                            : 'bg-error'
                      )}
                    />
                  </div>
                </div>
                <p className="mt-3 text-[10px] font-bold text-gray-600 uppercase italic leading-tight">
                  {bottleneck.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black border-[3px] border-secondary">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic border-b-4 border-black pb-2">
              CARGA DA EQUIPE
            </h3>
          </div>

          {teamIsSynthetic && (
            <div
              data-testid="team-synthetic-warning"
              className="flex items-start gap-3 p-5 border-[3px] border-black bg-warning/20 shadow-[4px_4px_0px_#000]"
            >
              <AlertTriangle className="w-6 h-6 text-error shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black uppercase italic leading-tight">
                  ⚠️ Dados sintéticos (placeholder) — não derivados do GitLab
                </p>
                <p className="text-[11px] font-bold text-gray-700 uppercase mt-1 leading-tight">
                  A carga por pessoa não é exposta trivialmente pela API. Diferente
                  do DORA medido (dados reais) acima nesta página.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="TAREFAS TOTAIS"
              value={totalTasks}
              status="info"
            />
            <MetricCard
              title="MÉDIA POR MEMBRO"
              value={avgTasksPerMember}
              unit="TAREFAS"
              status="info"
            />
            <MetricCard
              title="MEMBROS SOBRECARREGADOS"
              value={overloadedCount}
              status={
                overloadedCount > 2
                  ? 'error'
                  : overloadedCount > 0
                    ? 'warning'
                    : 'success'
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                variants={item}
                data-testid="team-member-card"
                whileHover={{ y: -2, x: -2, boxShadow: '6px 6px 0px #000' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn(
                  'brutal-card p-5 bg-white relative overflow-hidden',
                  member.overloadFlag && 'border-error'
                )}
              >
                {member.overloadFlag && (
                  <div className="absolute top-0 right-0 px-3 py-1 border-l-[4px] border-b-[4px] border-black font-black text-[10px] uppercase bg-error text-white">
                    SOBRECARREGADO
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 border-[3px] border-black bg-secondary flex items-center justify-center font-black italic text-white">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black uppercase italic leading-none">
                      {member.name}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                      {member.taskCount} TAREFAS
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 border-[2px] border-black bg-gray-50">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-[9px] font-black text-gray-500 uppercase">
                        TODO
                      </span>
                    </div>
                    <span className="text-lg font-black italic">
                      {member.tasksByStatus.todo}
                    </span>
                  </div>
                  <div className="p-2 border-[2px] border-black bg-secondary/10">
                    <div className="flex items-center gap-1 mb-1">
                      <Activity className="w-3 h-3 text-secondary" />
                      <span className="text-[9px] font-black text-gray-500 uppercase">
                        ANDAMENTO
                      </span>
                    </div>
                    <span className="text-lg font-black italic">
                      {member.tasksByStatus.inProgress}
                    </span>
                  </div>
                  <div className="p-2 border-[2px] border-black bg-warning/10">
                    <div className="flex items-center gap-1 mb-1">
                      <GitPullRequest className="w-3 h-3 text-warning" />
                      <span className="text-[9px] font-black text-gray-500 uppercase">
                        REVIEW
                      </span>
                    </div>
                    <span className="text-lg font-black italic">
                      {member.tasksByStatus.review}
                    </span>
                  </div>
                  <div className="p-2 border-[2px] border-black bg-primary/10">
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      <span className="text-[9px] font-black text-gray-500 uppercase">
                        DONE
                      </span>
                    </div>
                    <span className="text-lg font-black italic">
                      {member.tasksByStatus.done}
                    </span>
                  </div>
                </div>

                <div className="border-t-2 border-black pt-3">
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-2">
                    TAREFAS ATIVAS
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {member.currentTasks.slice(0, 3).map((task) => (
                      <span
                        key={task}
                        className="text-[9px] font-bold bg-black text-white px-2 py-0.5 uppercase"
                      >
                        {task}
                      </span>
                    ))}
                    {member.currentTasks.length > 3 && (
                      <span className="text-[9px] font-bold text-gray-500 uppercase">
                        +{member.currentTasks.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-500 uppercase">
                    CYCLE TIME MÉDIO
                  </span>
                  <span className="text-sm font-black italic">
                    {member.avgCycleTime}d
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </motion.div>
    </DashboardLayout>
  );
}
