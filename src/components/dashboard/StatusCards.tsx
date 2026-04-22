import { Activity, Thermometer, Volume2, Heart } from 'lucide-react';

type MachineStatus = 'normal' | 'warning' | 'critical';

interface StatusCardsProps {
  data: any; // 🔥 relaxed type (avoid crash)
}

function statusColor(status: MachineStatus) {
  if (status === 'critical') return 'text-red-500';
  if (status === 'warning') return 'text-yellow-400';
  return 'text-green-400';
}

function statusBg(status: MachineStatus) {
  if (status === 'critical') return 'bg-red-500/20';
  if (status === 'warning') return 'bg-yellow-400/20';
  return 'bg-green-400/20';
}

const StatusCards = ({ data }: StatusCardsProps) => {

  // 🔥 SAFE VALUES
  const temperature = data?.temperature ?? 0;
  const acoustic = data?.aucausticRMS ?? 0; // ✅ FIXED

  // 🔥 SIMPLE LOGIC (temporary AI)
  const healthScore = Math.max(0, 100 - (temperature + acoustic) / 2);

  let machineStatus: MachineStatus = 'normal';
  if (temperature > 35 || acoustic > 60) machineStatus = 'critical';
  else if (temperature > 30 || acoustic > 55) machineStatus = 'warning';

  const cards = [
    {
      label: 'Health Score',
      value: `${Math.round(healthScore)}%`,
      icon: Heart,
      status: machineStatus,
    },
    {
      label: 'Machine Status',
      value: machineStatus.charAt(0).toUpperCase() + machineStatus.slice(1),
      icon: Activity,
      status: machineStatus,
    },
    {
      label: 'Temperature',
      value: data ? `${temperature.toFixed(1)}°C` : '--',
      icon: Thermometer,
      status:
        temperature > 35 ? 'critical' :
        temperature > 30 ? 'warning' :
        'normal',
    },
    {
      label: 'Acoustic RMS',
      value: data ? `${acoustic.toFixed(1)} dB` : '--',
      icon: Volume2,
      status:
        acoustic > 60 ? 'critical' :
        acoustic > 55 ? 'warning' :
        'normal',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glow-card rounded-xl bg-card p-5 transition-all duration-300 hover:scale-[1.02]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {card.label}
            </span>
            <div className={`p-1.5 rounded-lg ${statusBg(card.status)}`}>
              <card.icon size={14} className={statusColor(card.status)} />
            </div>
          </div>

          {/* Value */}
          <div className={`text-3xl font-bold tracking-tight ${statusColor(card.status)}`}>
            {card.value}
          </div>

          {/* Status text */}
          <div className="mt-2 flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${statusColor(card.status)} animate-pulse`} />
            <span className={`text-xs ${statusColor(card.status)}`}>
              {card.status === 'normal'
                ? 'Operating normally'
                : card.status === 'warning'
                ? 'Attention needed'
                : 'Immediate action'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCards;