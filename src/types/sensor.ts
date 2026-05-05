// ─── Sensor Data ──────────────────────────────────────────────
export interface SensorData {
  timestamp:    number;
  seq?:         number;
  key?:         string;
  aRMSx:        number;
  aRMSy:        number;
  aRMSz:        number;
  vRMSx:        number;
  vRMSy:        number;
  vRMSz:        number;
  temperature:  number;
  aucausticRMS: number;
  acousticRMS?: number;
  mac?:         string;
  extra?:       string;
}

// ─── Status ───────────────────────────────────────────────────
export type MachineStatus = 'normal' | 'warning' | 'critical';

// ─── Alerts ───────────────────────────────────────────────────
export interface Alert {
  id:        string;
  message:   string;
  severity:  MachineStatus;
  timestamp: Date;
}

// ─── Anomaly ──────────────────────────────────────────────────
export interface AnomalyResponse {
  anomaly:     boolean;
  status:      MachineStatus;
  healthScore: number;
  alerts:      Alert[];
}

// ─── Fault Types ──────────────────────────────────────────────
export type FaultType = 'bearing fault' | 'misalignment' | 'imbalance' | 'none';

// ─── Prediction (FINAL FIXED) ─────────────────────────────────
export interface PredictionData {
  failure_risk: number;   // %
  rul_hours: number;      // hours
  status: MachineStatus;
  fault_type: FaultType;
  confidence: number;     // 0–1

  // ✅ MAIN FIELD (important)
  health_score: number;   // 0–100
}

// ─── Forecast ─────────────────────────────────────────────────
export interface ForecastPoint {
  timestamp: number;
  value:     number;
  predicted: boolean;
}

export interface ForecastData {
  vRMSy:       ForecastPoint[];
  temperature: ForecastPoint[];
  healthScore: ForecastPoint[];
}

// ─── Recommendations ──────────────────────────────────────────
export interface Recommendation {
  id:       string;
  message:  string;
  priority: 'high' | 'medium' | 'low';
  category: 'maintenance' | 'risk' | 'optimization';
}