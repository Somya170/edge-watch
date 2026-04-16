import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { ForecastPoint } from '@/types/sensor';

interface HealthTrendProps {
  data: ForecastPoint[];
}

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const HealthTrend = ({ data }: HealthTrendProps) => {
  if (!data || data.length < 2) return null;

  const actual = data.filter(d => !d.predicted);
  const first = actual[0]?.value ?? 0;
  const last = actual[actual.length - 1]?.value ?? 0;
  const diff = last - first;
  const trending = diff > 2 ? 'up' : diff < -2 ? 'down' : 'stable';

  return (
    <div className="glow-card rounded-xl bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Health Score Trend</h3>
        <div className="flex items-center gap-1.5">
          {trending === 'up' && <TrendingUp size={14} className="text-status-normal" />}
          {trending === 'down' && <TrendingDown size={14} className="text-status-critical" />}
          {trending === 'stable' && <Minus size={14} className="text-muted-foreground" />}
          <span className={`text-xs font-medium ${trending === 'up' ? 'text-status-normal' : trending === 'down' ? 'text-status-critical' : 'text-muted-foreground'}`}>
            {trending === 'up' ? 'Improving' : trending === 'down' ? 'Declining' : 'Stable'}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            tick={{ fill: 'hsl(215 12% 50%)', fontSize: 10 }}
            stroke="hsl(220 14% 16%)"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'hsl(215 12% 50%)', fontSize: 10 }}
            stroke="hsl(220 14% 16%)"
            unit="%"
          />
          <Tooltip
            content={({ active, payload, label }: any) => {
              if (!active || !payload?.length) return null;
              const pt = payload[0]?.payload as ForecastPoint;
              return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                  <p className="text-xs text-muted-foreground font-mono">{formatTime(label)}</p>
                  <p className="text-xs font-medium text-accent">
                    {pt?.predicted ? '🔮 ' : ''}Health: {payload[0]?.value?.toFixed(1)}%
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            fill="url(#healthGradient)"
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthTrend;
