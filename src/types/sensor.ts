export interface SensorData {
  timestamp: number;
  aRMSx: number;
  aRMSy: number;
  aRMSz: number;
  vRMSx: number;
  vRMSy: number;
  vRMSz: number;
  temperature: number;
  acousticRMS: number;
}

export type MachineStatus = 'normal' | 'warning' | 'critical';

export interface Alert {
  id: string;
  message: string;
  severity: MachineStatus;
  timestamp: Date;
}

export interface AnomalyResponse {
  anomaly: boolean;
  status: MachineStatus;
  healthScore: number;
  alerts: Alert[];
}
