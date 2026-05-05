import { Shield, AlertCircle } from 'lucide-react';
import { PredictionData } from '@/types/sensor';

interface FaultDetectionProps {
  data: PredictionData | null;
}

const faultLabels: Record<string, { label: string; icon: string }> = {
  'bearing fault': { label: 'Bearing Fault', icon: '⚙️' },
  'misalignment': { label: 'Misalignment', icon: '↔️' },
  'imbalance': { label: 'Imbalance', icon: '⚖️' },
  'none': { label: 'No Fault Detected', icon: ' ' },
};

const FaultDetection = ({ data }: FaultDetectionProps) => {
  if (!data) return null;

  const fault = faultLabels[data.fault_type] || faultLabels['none'];
  const hasFault = data.fault_type !== 'none';
  const confidencePct = Math.round(data.confidence * 100);

  return (
    <div className="glow-card rounded-xl bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-accent" />
        <h3 className="text-sm font-semibold text-foreground">AI Fault Detection</h3>
      </div>

      <div className={`rounded-lg p-4 mb-3 border ${hasFault ? 'border-status-warning/30 bg-status-warning/5' : 'border-status-normal/30 bg-status-normal/5'}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{fault.icon}</span>
          <div>
            <p className={`font-bold text-lg ${hasFault ? 'text-status-warning' : 'text-status-normal'}`}>
              {fault.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {hasFault ? 'Fault detected by AI model' : 'System operating normally'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Model Confidence</span>
          <span className="font-mono text-foreground">{confidencePct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {hasFault && (
        <div className="mt-3 flex items-start gap-2 p-2 rounded-lg bg-status-warning/5 border border-status-warning/20">
          <AlertCircle size={14} className="text-status-warning mt-0.5 shrink-0" />
          <p className="text-xs text-status-warning">
            {data.fault_type === 'bearing fault' && 'Bearing degradation pattern detected. Schedule inspection soon.'}
            {data.fault_type === 'misalignment' && 'Shaft misalignment indicators detected. Check coupling.'}
            {data.fault_type === 'imbalance' && 'Rotational imbalance detected. Balance check recommended.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FaultDetection;
