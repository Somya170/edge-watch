import { Brain, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { PredictionData, MachineStatus } from '@/types/sensor';

interface PredictionCardProps {
  data: PredictionData | null;
  isLoading: boolean;
}

function statusColor(status: MachineStatus) {
  if (status === 'critical') return 'text-status-critical';
  if (status === 'warning') return 'text-status-warning';
  return 'text-status-normal';
}

function statusBg(status: MachineStatus) {
  if (status === 'critical') return 'bg-status-critical/20';
  if (status === 'warning') return 'bg-status-warning/20';
  return 'bg-status-normal/20';
}

function riskColor(risk: number): string {
  if (risk > 70) return 'text-status-critical';
  if (risk > 40) return 'text-status-warning';
  return 'text-status-normal';
}

function riskBgColor(risk: number): string {
  if (risk > 70) return 'bg-status-critical';
  if (risk > 40) return 'bg-status-warning';
  return 'bg-status-normal';
}

function formatRUL(hours: number): string {
  if (hours >= 48) return `${Math.round(hours / 24)}d`;
  return `${hours}h`;
}

function Skeleton() {
  return <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />;
}

const PredictionCard = ({ data, isLoading }: PredictionCardProps) => {
  if (!data) return null;

  const cards = [
    {
      label: 'Failure Risk',
      value: `${data.failure_risk}%`,
      icon: AlertTriangle,
      color: riskColor(data.failure_risk),
      bg: `${riskBgColor(data.failure_risk)}/10`,
    },
    {
      label: 'Remaining Life',
      value: formatRUL(data.rul_hours),
      icon: Clock,
      color: data.rul_hours < 48 ? 'text-status-critical' : data.rul_hours < 168 ? 'text-status-warning' : 'text-status-normal',
      bg: data.rul_hours < 48 ? 'bg-status-critical/10' : data.rul_hours < 168 ? 'bg-status-warning/10' : 'bg-status-normal/10',
    },
    {
      label: 'AI Predicted Status',
      value: data.status.charAt(0).toUpperCase() + data.status.slice(1),
      icon: Brain,
      color: statusColor(data.status),
      bg: statusBg(data.status),
    },
    {
      label: 'AI Confidence',
      value: `${Math.round(data.confidence * 100)}%`,
      icon: TrendingUp,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glow-card rounded-xl bg-card p-5 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2 bg-accent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</span>
            <div className={`p-1.5 rounded-lg ${card.bg}`}>
              <card.icon size={14} className={card.color} />
            </div>
          </div>
          {isLoading ? (
            <Skeleton />
          ) : (
            <div className={`text-3xl font-bold tracking-tight ${card.color} transition-colors duration-500`}>
              {card.value}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PredictionCard;
