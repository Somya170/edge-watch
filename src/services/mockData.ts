import { SensorData, AnomalyResponse, Alert, MachineStatus } from '@/types/sensor';

let baseTimestamp = Date.now();

function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 1000) / 1000;
}

export function generateMockSensorData(): SensorData {
  baseTimestamp += 2000;
  return {
    timestamp: baseTimestamp,
    aRMSx: rand(0.02, 0.12),
    aRMSy: rand(0.05, 0.15),
    aRMSz: rand(0.03, 0.1),
    vRMSx: rand(0.3, 0.9),
    vRMSy: rand(0.5, 1.5),
    vRMSz: rand(0.3, 0.8),
    temperature: rand(20, 35),
    acousticRMS: rand(40, 65),
  };
}

export function generateMockAnomaly(data: SensorData): AnomalyResponse {
  const alerts: Alert[] = [];
  let status: MachineStatus = 'normal';
  let healthScore = rand(85, 99);

  if (data.vRMSy > 1.2) {
    alerts.push({ id: crypto.randomUUID(), message: 'High vibration detected on Y-axis', severity: 'warning', timestamp: new Date() });
    status = 'warning';
    healthScore = rand(60, 80);
  }
  if (data.temperature > 30) {
    alerts.push({ id: crypto.randomUUID(), message: 'Temperature exceeded threshold', severity: 'warning', timestamp: new Date() });
    status = 'warning';
    healthScore = Math.min(healthScore, rand(55, 75));
  }
  if (data.temperature > 33) {
    alerts.push({ id: crypto.randomUUID(), message: 'Critical temperature level!', severity: 'critical', timestamp: new Date() });
    status = 'critical';
    healthScore = rand(20, 45);
  }
  if (data.acousticRMS > 58) {
    alerts.push({ id: crypto.randomUUID(), message: 'Anomaly detected in acoustic signature', severity: 'warning', timestamp: new Date() });
    if (status === 'normal') status = 'warning';
  }

  return { anomaly: alerts.length > 0, status, healthScore, alerts };
}

export function generateMockHistory(count = 50): SensorData[] {
  const data: SensorData[] = [];
  let ts = Date.now() - count * 2000;
  for (let i = 0; i < count; i++) {
    ts += 2000;
    data.push({
      timestamp: ts,
      aRMSx: rand(0.02, 0.12),
      aRMSy: rand(0.05, 0.15),
      aRMSz: rand(0.03, 0.1),
      vRMSx: rand(0.3, 0.9),
      vRMSy: rand(0.5, 1.5),
      vRMSz: rand(0.3, 0.8),
      temperature: rand(20, 35),
      acousticRMS: rand(40, 65),
    });
  }
  return data;
}
