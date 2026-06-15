'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, MetricCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  fetchBuildMetrics,
  fetchTestDefectMetrics,
  fetchCycleTimeMetrics,
  fetchThroughputMetrics,
  fetchBacklogHealthMetrics
} from '@/services/metrics';
import { fetchPipelineSnapshot } from '@/services/pipeline';
import { PipelineStatus } from '@/components/PipelineStatus';
import type { PipelineSnapshot } from '@/types/pipeline';
import {
  Zap,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  GitBranch,
  Package
} from 'lucide-react';
import { formatPercentage, getRelativeTime, cn } from '@/lib/utils';

export default function HomePage() {
  const [metrics, setMetrics] = useState({
    buildSuccess: 0,
    testPassRate: 0,
    cycleTime: 0,
    deploymentsPerWeek: 0,
    backlogHealth: 0,
    integrationUptime: 0,
  });
  const [pipeline, setPipeline] = useState<PipelineSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [build, test, cycle, throughput, backlog, pipelineSnap] =
          await Promise.all([
            fetchBuildMetrics(),
            fetchTestDefectMetrics(),
            fetchCycleTimeMetrics(),
            fetchThroughputMetrics(),
            fetchBacklogHealthMetrics(),
            fetchPipelineSnapshot(),
          ]);

        setPipeline(pipelineSnap);
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
      <DashboardLayout title="CARREGANDO..." description="Sincronizando dados brutais">
        <div className="flex flex-col items-center justify-center h-96">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-[6px] border-black border-t-primary"
          />
          <p className="mt-6 font-black uppercase italic animate-pulse">ALINHADO PIPELINES...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="DASHBOARD CENTRAL" description="VISÃO GERAL DOS INDICADORES DE QUALIDADE E PROCESSO">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        {/* Header Section with Decorative Elements */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-[6px] border-black pb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary opacity-20 rotate-12 -z-10 border-4 border-black"></div>
          <div>
            <h2 className="text-5xl font-black text-black leading-none mb-2">SISTEMA STATUS</h2>
            <div className="flex items-center gap-3">
              <Badge variant="primary" size="lg">SISTEMA ATIVO</Badge>
              <Badge variant="secondary" size="lg">TODOS OS SENSORES OK</Badge>
              <span className="text-xs font-black uppercase italic text-gray-500">
                ÚLTIMA ATUALIZAÇÃO: {getRelativeTime(new Date()).toUpperCase()}
              </span>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="brutal-btn bg-primary"
          >
            RELATÓRIO COMPLETO
          </motion.button>
        </div>

        {/* Status do pipeline — snapshot REAL do ultimo run (TG5.1) */}
        {pipeline && <PipelineStatus snapshot={pipeline} />}

        {/* Top Level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <MetricCard 
            title="TAXA DE SUCESSO DE BUILD" 
            value={formatPercentage(metrics.buildSuccess)} 
            status={metrics.buildSuccess > 90 ? 'success' : 'warning'}
            trend={2.4}
            trendLabel="VS. ÚLTIMA SEMANA"
          />
          <MetricCard 
            title="TEMPO MÉDIO DE CICLO" 
            value={metrics.cycleTime} 
            unit="DIAS"
            status="info"
            trend={-15}
            trendLabel="OTIMIZADO"
          />
          <MetricCard 
            title="SAÚDE DO BACKLOG" 
            value={metrics.backlogHealth.toFixed(0)} 
            unit="%"
            status={metrics.backlogHealth > 80 ? 'success' : 'warning'}
          />
        </div>

        {/* Main Categories Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Link href="/qos" className="group">
            <Card className="bg-primary/5 hover:bg-primary/10 border-primary">
              <div className="flex items-start justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-black border-4 border-primary shadow-[4px_4px_0px_000000]">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-black">QoS</h3>
                      <p className="text-sm font-bold text-gray-600 uppercase italic">Quality of Service</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="border-l-4 border-black pl-4">
                      <p className="text-[10px] font-black uppercase text-gray-500">UPTIME</p>
                      <p className="text-2xl font-black italic">{formatPercentage(metrics.integrationUptime)}</p>
                    </div>
                    <div className="border-l-4 border-black pl-4">
                      <p className="text-[10px] font-black uppercase text-gray-500">COBERTURA</p>
                      <p className="text-2xl font-black italic">87.5%</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-4 border-black bg-white group-hover:bg-black group-hover:text-white transition-colors">
                  <ArrowRight className="w-8 h-8" />
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/qop" className="group">
            <Card className="bg-secondary/5 hover:bg-secondary/10 border-secondary">
              <div className="flex items-start justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-black border-4 border-secondary shadow-[4px_4px_0px_000000]">
                      <TrendingUp className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-black">QoP</h3>
                      <p className="text-sm font-bold text-gray-600 uppercase italic">Quality of Process</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="border-l-4 border-black pl-4">
                      <p className="text-[10px] font-black uppercase text-gray-500">THROUGHPUT</p>
                      <p className="text-2xl font-black italic">{metrics.deploymentsPerWeek} DEPLOYS</p>
                    </div>
                    <div className="border-l-4 border-black pl-4">
                      <p className="text-[10px] font-black uppercase text-gray-500">LEAD TIME</p>
                      <p className="text-2xl font-black italic">4.2 DIAS</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-4 border-black bg-white group-hover:bg-black group-hover:text-white transition-colors">
                  <ArrowRight className="w-8 h-8" />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Detailed Metrics & Infrastructure */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <Card 
            title="PIPELINE INSIGHTS" 
            className="xl:col-span-2 border-black"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'BUILDS TOTAIS', value: '156', trend: '+12%', icon: GitBranch, color: 'text-blue-600' },
                { label: 'FEATURES', value: '12', trend: 'SPRINT', icon: Package, color: 'text-orange-600' },
                { label: 'SUCESSO', value: formatPercentage(metrics.buildSuccess), trend: 'META >95%', icon: CheckCircle, color: 'text-green-600' },
                { label: 'MÉDIA', value: '8.5m', trend: 'PIPELINE', icon: Clock, color: 'text-purple-600' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.05, backgroundColor: '#f9f9f9' }}
                  className="p-5 border-[3px] border-black bg-white shadow-[4px_4px_0px_000000]"
                >
                  <stat.icon className={cn("w-6 h-6 mb-3", stat.color)} />
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{stat.label}</p>
                  <p className="text-3xl font-black italic">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">{stat.trend}</p>
                </motion.div>
              ))}
            </div>
            
            {/* Visual Decorative Grid */}
            <div className="mt-8 grid grid-cols-12 gap-2">
              {Array.from({ length: 48 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-2 border border-black/10",
                    i % 7 === 0 ? "bg-primary" : i % 5 === 0 ? "bg-secondary" : "bg-gray-100"
                  )}
                />
              ))}
            </div>
          </Card>

          <Card title="INFRAESTRUTURA" description="ESTADO DOS SERVIÇOS CRÍTICOS">
            <div className="space-y-4">
              {[
                { name: 'GITLAB CI/CD', status: 'OPERACIONAL', color: 'bg-primary' },
                { name: 'PX4 SITL/HITL', status: 'OPERACIONAL', color: 'bg-primary' },
                { name: 'FIRMWARE CORE', status: 'SAUDÁVEL', color: 'bg-primary' },
                { name: 'JIRA API', status: 'LATÊNCIA', color: 'bg-warning' },
                { name: 'MAVLINK HUB', status: 'OFFLINE', color: 'bg-error' },
              ].map((svc, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center justify-between p-4 bg-[#f9f9f9] border-[3px] border-black hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 border-2 border-black", svc.color)}></div>
                    <span className="text-sm font-black uppercase italic">{svc.name}</span>
                  </div>
                  <Badge variant={svc.status === 'OPERACIONAL' || svc.status === 'SAUDÁVEL' ? 'primary' : svc.status === 'LATÊNCIA' ? 'warning' : 'error'}>
                    {svc.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-black text-primary font-mono text-[10px] overflow-hidden whitespace-nowrap border-[3px] border-black">
              <motion.div
                animate={{ x: [0, -500] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                SYSTEM_LOG: INITIALIZING_BRUTAL_OVERRIDE... STATUS_OK... PIPELINE_SYNC_100%... DRONE_HEARTBEAT_ACTIVE...
              </motion.div>
            </div>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}