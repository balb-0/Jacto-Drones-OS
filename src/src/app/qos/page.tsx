'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, MetricCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { fetchQoSSnapshot } from '@/services/metrics';
import type { QoSIndicator, QoSSnapshot } from '@/types/mission';
import { getProtocol } from '@/data/qos-protocol';
import { Activity, Gauge, Timer, CheckCircle2, AlertTriangle, Info, Play } from 'lucide-react';
import { FlightReplay } from '@/components/FlightReplay';
import { AnomalyEvidenceLog } from '@/components/AnomalyEvidenceLog';
import { ScenarioSelector, type FlightScenario } from '@/components/ScenarioSelector';
import { cn } from '@/lib/utils';

// Mapa de ícone por indicador — leitura rápida do que cada card representa.
const INDICATOR_ICON: Record<QoSIndicator['id'], React.ComponentType<{ className?: string }>> = {
  std_altitude_cruise_m: Activity,
  max_acceleration_m_s2: Gauge,
  mission_duration_s: Timer,
  max_altitude_m: Activity,
  mean_altitude_m: Activity,
  max_battery_drop_pct: Gauge,
};

/** Formata o valor com no máximo 3 casas, sem zeros à toa. */
function fmt(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(value < 1 ? 3 : 2);
}

/** Card de um indicador QoS: valor real + veredito de gate + protocolo inline. */
function IndicatorCard({ indicator }: { indicator: QoSIndicator }) {
  const protocol = getProtocol(indicator.id);
  const Icon = INDICATOR_ICON[indicator.id];
  const hasGate = indicator.threshold !== undefined && indicator.direction !== 'info';

  // Veredito visual: passa / reprova / contexto.
  const verdict = hasGate
    ? indicator.passing
      ? { label: 'DENTRO DO LIMITE', variant: 'primary' as const, Mark: CheckCircle2 }
      : { label: 'ACIMA DO LIMITE', variant: 'error' as const, Mark: AlertTriangle }
    : { label: 'CONTEXTO', variant: 'secondary' as const, Mark: Info };

  return (
    <Card className="border-black">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black border-[3px] border-primary">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h4 className="text-lg font-black italic uppercase leading-tight">{indicator.label}</h4>
        </div>
        <Badge variant={verdict.variant} size="sm">
          {verdict.label}
        </Badge>
      </div>

      {/* Valor medido + threshold do gate (quando há) */}
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-black text-black italic leading-none">{fmt(indicator.value)}</span>
        <span className="text-lg font-black text-black uppercase italic">{indicator.unit}</span>
      </div>
      {hasGate && (
        <p className="mt-2 text-xs font-bold uppercase tracking-tight text-gray-700">
          Limite: {indicator.direction === 'max' ? '<=' : '>='} {fmt(indicator.threshold as number)} {indicator.unit}
        </p>
      )}

      {/* Protocolo de medição renderizado JUNTO do indicador (evidência no entorno) */}
      <div className="mt-5 border-t-[3px] border-black pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <verdict.Mark className="w-4 h-4 text-black" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            Protocolo de medição
          </span>
        </div>
        <dl className="space-y-2 text-xs">
          <div>
            <dt className="font-black uppercase text-gray-500">Janela</dt>
            <dd className="font-bold text-gray-800">{protocol.window}</dd>
          </div>
          <div>
            <dt className="font-black uppercase text-gray-500">Método</dt>
            <dd className="font-bold text-gray-800">{protocol.method}</dd>
          </div>
          <div>
            <dt className="font-black uppercase text-gray-500">Aceite</dt>
            <dd className="font-bold text-gray-800">{protocol.acceptance}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}

export default function QOSPage() {
  const [snapshot, setSnapshot] = useState<QoSSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState<FlightScenario>('motor_failure');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchQoSSnapshot();
        setSnapshot(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  if (loading) {
    return (
      <DashboardLayout title="QOS LOADING..." description="LENDO METRICS.JSON DO PIPELINE">
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

  const indicators = snapshot?.indicators ?? [];
  const gated = indicators.filter((i) => i.direction !== 'info');
  const passingGates = gated.filter((i) => i.passing).length;

  return (
    <DashboardLayout
      title="QUALITY OF SERVICE"
      description="QoS DE PRODUTO (FIRMWARE) A PARTIR DA MISSÃO SITL — DADO REAL"
    >
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
        {/* Header: origem do dado (rastreabilidade) + resumo de gates */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-[6px] border-black pb-8">
          <div>
            <h2 className="text-5xl font-black text-black leading-none mb-2">MISSÃO square_50m</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="primary" size="lg">DADO REAL</Badge>
              <Badge variant="secondary" size="lg">
                GATES {passingGates}/{gated.length} OK
              </Badge>
            </div>
            <p className="mt-3 text-xs font-bold text-gray-600 uppercase tracking-tight max-w-2xl">
              Fonte: {snapshot?.source}
            </p>
          </div>
          <div className="p-4 border-[3px] border-black bg-white shadow-[4px_4px_0px_#000000] font-black italic">
            AMOSTRAS: {snapshot?.raw.n_samples ?? 0}
          </div>
        </div>

        {/* Indicadores QoS reais, cada um com seu protocolo de medição inline */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black border-[3px] border-primary">
              <Gauge className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic">INDICADORES QoS DE PRODUTO</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {indicators.map((indicator) => (
              <IndicatorCard key={indicator.id} indicator={indicator} />
            ))}
          </div>
        </section>

        {/* Resumo numérico rápido dos indicadores com gate */}
        <section className="space-y-6">
          <h3 className="text-2xl font-black text-black uppercase italic">RESUMO DE CONFORMIDADE</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gated.map((i) => (
              <MetricCard
                key={i.id}
                title={i.label}
                value={fmt(i.value)}
                unit={i.unit}
                status={i.passing ? 'success' : 'error'}
              />
            ))}
          </div>
        </section>

        {/* Flight Replay - Scenario Simulation */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black border-[3px] border-primary">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-black uppercase italic">FLIGHT REPLAY</h3>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-tight">
                SIMULAÇÃO DE VOO — SELECIONE O CENÁRIO
              </p>
            </div>
          </div>
          <ScenarioSelector selected={scenario} onChange={setScenario} />
          {/* Flight Replay + LOG DE ANOMALIAS (contrato TG2) lado a lado: o log
              lista as anomalias do run com link direto p/ evidencia no GitLab. */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2">
              <FlightReplay scenario={scenario} />
            </div>
            <div className="xl:col-span-1">
              <AnomalyEvidenceLog />
            </div>
          </div>
        </section>

        {/* Painéis legados (build/defeito/integração) — claramente PROJETADOS */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="text-xl font-black text-black uppercase italic">
              PAINÉIS LEGADOS — PENDENTE/PROJETADO
            </h3>
          </div>
          <Card className={cn('border-black bg-warning/10')}>
            <p className="text-sm font-bold text-gray-800 uppercase tracking-tight leading-relaxed">
              Os painéis de build, densidade de defeitos e estabilidade de integração foram
              despromovidos do QoS por dependerem de fontes ainda não disponíveis (histórico de
              pipelines/defeitos via API). Permanecem MOCK em services/metrics.ts e estão marcados
              como projetados; o QoS de produto exibido acima usa exclusivamente o metrics.json real
              da missão SITL.
            </p>
          </Card>
        </section>
      </motion.div>
    </DashboardLayout>
  );
}
