import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { ForecastPoint } from '@/types/sensor';

interface ForecastChartProps {
  data: ForecastPoint[];
  title: string;
  color: string;
  unit?: string;
}

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload.find((p: any) => p.value != null);
  if (!entry) return null;
  const isPredicted = entry.dataKey === 'predicted';
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1 font-mono">{formatTime(label)}</p>
      <p className="text-xs font-medium" style={{ color: entry.color }}>
        {isPredicted ? '🔮 Predicted: ' : 'Actual: '}{entry.value?.toFixed(2)}
      </p>
    </div>
  );
};

const ForecastChart = ({ data, title, color, unit }: ForecastChartProps) => {
  const nowTs = data.find(d => d.predicted)?.timestamp;

  // Transform data: split into "actual" and "predicted" keys
  // For the bridge point, both keys have values
  const chartData = data.map((point, i, arr) => {
    const isLast = !point.predicted && arr[i + 1]?.predicted;
    return {
      timestamp: point.timestamp,
      actual: !point.predicted ? point.value : undefined,
      predicted: point.predicted ? point.value : isLast ? point.value : undefined,
    };
  });

  return (
    <div className="glow-card rounded-xl bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 rounded" style={{ background: color }} /> Actual
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 rounded border-dashed border-t-2" style={{ borderColor: color }} /> Predicted
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            tick={{ fill: 'hsl(215 12% 50%)', fontSize: 10 }}
            stroke="hsl(220 14% 16%)"
          />
          <YAxis
            tick={{ fill: 'hsl(215 12% 50%)', fontSize: 10 }}
            stroke="hsl(220 14% 16%)"
            unit={unit}
          />
          <Tooltip content={<CustomTooltip />} />
          {nowTs && (
            <ReferenceLine
              x={nowTs}
              stroke="hsl(215 12% 30%)"
              strokeDasharray="4 4"
              label={{ value: 'Now', fill: 'hsl(215 12% 50%)', fontSize: 10, position: 'top' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="actual"
            stroke={color}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            animationDuration={300}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke={color}
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            connectNulls={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
