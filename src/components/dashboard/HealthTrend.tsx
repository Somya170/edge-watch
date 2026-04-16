import { useState } from 'react';
import { TrendingDown, TrendingUp, Minus, Maximize2, X } from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Brush,
} from 'recharts';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ForecastPoint } from '@/types/sensor';

interface HealthTrendProps {
  data: ForecastPoint[];
}

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const HealthTrend = ({ data }: HealthTrendProps) => {
  const [fullScreen, setFullScreen] = useState(false);

  if (!data || data.length < 2) return null;

  const actual = data.filter(d => !d.predicted);
  const first = actual[0]?.value ?? 0;
  const last = actual[actual.length - 1]?.value ?? 0;
  const diff = last - first;
  const trending = diff > 2 ? 'up' : diff < -2 ? 'down' : 'stable';

  const renderChart = (height: number | string, showBrush = false) => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
        <XAxis dataKey="timestamp" tickFormatter={formatTime} tick={{ fill: 'hsl(215 12% 50%)', fontSize: 10 }} stroke="hsl(220 14% 16%)" />
        <YAxis domain={[0, 100]} tick={{ fill: 'hsl(215 12% 50%)', fontSize: 10 }} stroke="hsl(220 14% 16%)" unit="%" />
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
        <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#healthGradient)" animationDuration={300} />
        {showBrush && <Brush dataKey="timestamp" height={28} fill="hsl(220 14% 10%)" stroke="hsl(220 14% 20%)" tickFormatter={formatTime} />}
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <>
      <div
        className="glow-card rounded-xl bg-card p-5 cursor-pointer group transition-all hover:ring-1 hover:ring-accent/30"
        onClick={() => setFullScreen(true)}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Health Score Trend</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {trending === 'up' && <TrendingUp size={14} className="text-status-normal" />}
              {trending === 'down' && <TrendingDown size={14} className="text-status-critical" />}
              {trending === 'stable' && <Minus size={14} className="text-muted-foreground" />}
              <span className={`text-xs font-medium ${trending === 'up' ? 'text-status-normal' : trending === 'down' ? 'text-status-critical' : 'text-muted-foreground'}`}>
                {trending === 'up' ? 'Improving' : trending === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
            <Maximize2 size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        {renderChart(180)}
      </div>

      <Dialog open={fullScreen} onOpenChange={setFullScreen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] bg-card border-border p-0 gap-0">
          <VisuallyHidden><DialogTitle>Health Score Trend</DialogTitle></VisuallyHidden>
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Health Score Trend</h2>
            <button onClick={() => setFullScreen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 p-6 min-h-0">
            {renderChart('100%', true)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HealthTrend;
