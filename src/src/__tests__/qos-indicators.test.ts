// Validação leve dos indicadores QoS contra o metrics.json REAL (TG2.4.4).
//
// Sem framework de teste no projeto (não há vitest/jest em package.json), este
// é um script de validação TS auto-contido baseado em node:assert. Roda com:
//     npx tsx src/__tests__/qos-indicators.test.ts
// (a partir de src/). Falha com exit != 0 se qualquer asserção quebrar; também
// é type-checado por `tsc --noEmit` por estar sob **/*.ts.
//
// O que valida (forma + parse, não performance):
//  1. metrics.json real tem TODAS as chaves do contrato, numéricas.
//  2. fetchQoSSnapshot devolve um indicador por chave de QoS, sem buracos.
//  3. cada indicador com gate tem threshold numérico e veredito booleano;
//     indicadores de contexto não têm veredito.
//  4. o veredito bate com a regra (value <= threshold) para os gates de missão.
//  5. todo indicador exibido tem protocolo (janela/método/aceite não vazios).

import assert from 'node:assert/strict';
import rawMetrics from '@/data/metrics.json';
import { fetchQoSSnapshot, buildQoSSnapshotSync } from '@/services/missionMetrics';
import { getProtocol } from '@/data/qos-protocol';
import type { MissionMetrics, QoSIndicatorId } from '@/types/mission';

const CONTRACT_KEYS: (keyof MissionMetrics)[] = [
  'max_acceleration_m_s2',
  'max_altitude_m',
  'max_battery_drop_pct',
  'mean_altitude_m',
  'mission_duration_s',
  'n_samples',
  'std_altitude_cruise_m',
];

// Indicadores com gate de missão e suas regras esperadas (espelham
// quality_gates.yaml). Mantido aqui de forma independente para detectar
// divergência entre o serviço e o contrato versionado.
const EXPECTED_GATES: Record<string, { threshold: number; direction: 'max' }> = {
  std_altitude_cruise_m: { threshold: 1.0, direction: 'max' },
  max_acceleration_m_s2: { threshold: 15.0, direction: 'max' },
  mission_duration_s: { threshold: 180, direction: 'max' },
};

async function run(): Promise<void> {
  const metrics = rawMetrics as MissionMetrics;

  // 1. Contrato: chaves presentes e numéricas.
  for (const key of CONTRACT_KEYS) {
    assert.ok(key in metrics, `metrics.json sem a chave do contrato: ${key}`);
    assert.equal(
      typeof metrics[key],
      'number',
      `metrics.json[${key}] deveria ser number, veio ${typeof metrics[key]}`,
    );
  }
  assert.ok(metrics.n_samples > 0, 'n_samples deve ser > 0 (missão precisa ter voado)');
  assert.ok(metrics.max_altitude_m > 0, 'max_altitude_m deve ser > 0');

  // 2. Snapshot: um indicador por chave de QoS (sem duplicar nem faltar).
  const snapshot = await fetchQoSSnapshot();
  const ids = snapshot.indicators.map((i) => i.id);
  const expectedIds: QoSIndicatorId[] = [
    'std_altitude_cruise_m',
    'max_acceleration_m_s2',
    'mission_duration_s',
    'max_altitude_m',
    'mean_altitude_m',
    'max_battery_drop_pct',
  ];
  assert.equal(new Set(ids).size, ids.length, 'indicadores QoS duplicados no snapshot');
  for (const id of expectedIds) {
    assert.ok(ids.includes(id), `indicador QoS ausente no snapshot: ${id}`);
  }

  // 3 + 4. Forma e veredito por indicador.
  for (const ind of snapshot.indicators) {
    assert.equal(typeof ind.value, 'number', `valor não-numérico em ${ind.id}`);
    assert.ok(ind.unit.length > 0, `unidade vazia em ${ind.id}`);

    const gate = EXPECTED_GATES[ind.id];
    if (gate) {
      assert.equal(ind.direction, gate.direction, `direção errada em ${ind.id}`);
      assert.equal(ind.threshold, gate.threshold, `threshold errado em ${ind.id}`);
      assert.equal(typeof ind.passing, 'boolean', `veredito ausente em gate ${ind.id}`);
      const expectedPass = ind.value <= gate.threshold;
      assert.equal(
        ind.passing,
        expectedPass,
        `veredito incoerente em ${ind.id}: value=${ind.value} thr=${gate.threshold}`,
      );
    } else {
      assert.equal(ind.direction, 'info', `indicador de contexto deveria ser 'info': ${ind.id}`);
      assert.equal(ind.passing, undefined, `contexto não deveria ter veredito: ${ind.id}`);
    }

    // 5. Protocolo presente e preenchido.
    const p = getProtocol(ind.id);
    assert.ok(p.window.trim().length > 0, `protocolo sem janela em ${ind.id}`);
    assert.ok(p.method.trim().length > 0, `protocolo sem método em ${ind.id}`);
    assert.ok(p.acceptance.trim().length > 0, `protocolo sem aceite em ${ind.id}`);
  }

  // Sanidade extra: versão síncrona produz o mesmo conjunto de ids.
  const sync = buildQoSSnapshotSync(metrics);
  assert.deepEqual(
    sync.indicators.map((i) => i.id).sort(),
    ids.slice().sort(),
    'buildQoSSnapshotSync divergiu de fetchQoSSnapshot',
  );

  console.log(`OK: ${snapshot.indicators.length} indicadores QoS validados contra metrics.json real`);
}

run().catch((err) => {
  console.error('FALHA na validação de indicadores QoS:');
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
