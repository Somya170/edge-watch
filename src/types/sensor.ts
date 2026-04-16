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

export type FaultType = 'bearing fault' | 'misalignment' | 'imbalance' | 'none';

export interface PredictionData {
  failure_risk: number;
  rul_hours: number;
  status: MachineStatus;
  fault_type: FaultType;
  confidence: number;
}

export interface ForecastPoint {
  timestamp: number;
  value: number;
  predicted: boolean;
}

export interface ForecastData {
  vRMSy: ForecastPoint[];
  temperature: ForecastPoint[];
  healthScore: ForecastPoint[];
}

export interface Recommendation {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  category: 'maintenance' | 'risk' | 'optimization';
}
