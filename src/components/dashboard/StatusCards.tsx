import { Activity, Thermometer, Volume2, Heart } from 'lucide-react';
import { SensorData, AnomalyResponse, MachineStatus } from '@/types/sensor';

interface StatusCardsProps {
  data: SensorData | null;
  anomaly: AnomalyResponse;
  isLoading: boolean;
}

function statusColor(status: MachineStatus) {
  if (status === 'critical') return 'status-critical';
  if (status === 'warning') return 'status-warning';
  return 'status-normal';
}

function statusBg(status: MachineStatus) {
  if (status === 'critical') return 'bg-status-critical';
  if (status === 'warning') return 'bg-status-warning';
  return 'bg-status-normal';
}

function Skeleton() {
  return <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />;
}

const StatusCards = ({ data, anomaly, isLoading }: StatusCardsProps) => {
  const cards = [
    {
      label: 'Health Score',
      value: `${Math.round(anomaly.healthScore)}%`,
      icon: Heart,
      status: anomaly.status,
    },
    {
      label: 'Machine Status',
      value: anomaly.status.charAt(0).toUpperCase() + anomaly.status.slice(1),
      icon: Activity,
      status: anomaly.status,
    },
    {
      label: 'Temperature',
      value: data ? `${data.temperature.toFixed(1)}°C` : '--',
      icon: Thermometer,
      status: data && data.temperature > 33 ? 'critical' as MachineStatus : data && data.temperature > 30 ? 'warning' as MachineStatus : 'normal' as MachineStatus,
    },
    {
      label: 'Acoustic RMS',
      value: data ? `${data.acousticRMS.toFixed(1)} dB` : '--',
      icon: Volume2,
      status: data && data.acousticRMS > 58 ? 'warning' as MachineStatus : 'normal' as MachineStatus,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glow-card rounded-xl bg-card p-5 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</span>
            <div className={`p-1.5 rounded-lg ${statusBg(card.status)}`}>
              <card.icon size={14} className={statusColor(card.status)} />
            </div>
          </div>
          {isLoading ? (
            <Skeleton />
          ) : (
            <div className={`text-3xl font-bold tracking-tight ${statusColor(card.status)} transition-colors duration-500`}>
              {card.value}
            </div>
          )}
          <div className="mt-2 flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${statusColor(card.status)} glow-dot animate-pulse-glow`} />
            <span className={`text-xs ${statusColor(card.status)}`}>
              {card.status === 'normal' ? 'Operating normally' : card.status === 'warning' ? 'Attention needed' : 'Immediate action'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCards;
