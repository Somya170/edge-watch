import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Maximize2 } from 'lucide-react';
import FullScreenChart from './FullScreenChart';

interface SensorChartProps {
  data: any[]; // 🔥 relaxed type (avoid TS crash)
  title: string;
  lines: { key: string; color: string; label: string }[];
}

// 🔥 SAFE time formatter
const formatTime = (ts: number) => {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};

// 🔥 Tooltip fix (no crash)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1.5 font-mono">
        {formatTime(label)}
      </p>
      {payload.map((entry: any) => (
        <p
          key={entry.dataKey}
          className="text-xs font-medium"
          style={{ color: entry.color }}
        >
          {entry.name}: {entry.value ? entry.value.toFixed(3) : "0"}
        </p>
      ))}
    </div>
  );
};

const SensorChart = ({ data = [], title, lines }: SensorChartProps) => {
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <>
      <div
        className="glow-card rounded-xl bg-card p-5 cursor-pointer group transition-all hover:ring-1 hover:ring-accent/30"
        onClick={() => setFullScreen(true)}
      >
        {/* 🔥 Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <Maximize2
            size={14}
            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>

        {/* 🔥 Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            
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
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

            {/* 🔥 Dynamic lines */}
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={300}
              />
            ))}

          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 Fullscreen */}
      <FullScreenChart
        open={fullScreen}
        onOpenChange={setFullScreen}
        data={data}
        title={title}
        lines={lines}
      />
    </>
  );
};

export default SensorChart;