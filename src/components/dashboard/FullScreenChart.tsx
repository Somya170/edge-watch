import { useState, useCallback, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush,
  ReferenceArea,
} from 'recharts';
import { X, Download, Maximize2, Pause, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { SensorData } from '@/types/sensor';

interface ChartLine {
  key: keyof SensorData;
  color: string;
  label: string;
}

interface FullScreenChartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SensorData[];
  title: string;
  lines: ChartLine[];
}

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};

const TIME_RANGES = [
  { label: '1 min', ms: 60_000 },
  { label: '5 min', ms: 300_000 },
  { label: '1 hour', ms: 3_600_000 },
  { label: 'All', ms: Infinity },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1.5 font-mono">{formatTime(label)}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-xs font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toFixed(4)}
        </p>
      ))}
    </div>
  );
};

const FullScreenChart = ({ open, onOpenChange, data, title, lines }: FullScreenChartProps) => {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);
  const [timeRange, setTimeRange] = useState(Infinity);
  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null);
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  const pausedDataRef = useRef<SensorData[]>([]);

  // When paused, freeze data
  if (paused) {
    if (pausedDataRef.current.length === 0) pausedDataRef.current = [...data];
  } else {
    pausedDataRef.current = [];
  }

  const displayData = paused ? pausedDataRef.current : data;

  // Apply time range filter
  const filteredData = timeRange === Infinity
    ? displayData
    : displayData.filter(d => d.timestamp >= Date.now() - timeRange);

  // Apply zoom domain
  const chartData = zoomDomain
    ? filteredData.filter(d => d.timestamp >= zoomDomain[0] && d.timestamp <= zoomDomain[1])
    : filteredData;

  const toggleLine = (key: string) => {
    setHiddenLines(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleMouseDown = useCallback((e: any) => {
    if (e?.activeLabel) setRefAreaLeft(e.activeLabel);
  }, []);

  const handleMouseMove = useCallback((e: any) => {
    if (refAreaLeft && e?.activeLabel) setRefAreaRight(e.activeLabel);
  }, [refAreaLeft]);

  const handleMouseUp = useCallback(() => {
    if (refAreaLeft && refAreaRight) {
      const left = Math.min(refAreaLeft, refAreaRight);
      const right = Math.max(refAreaLeft, refAreaRight);
      if (right - left > 500) setZoomDomain([left, right]);
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
  }, [refAreaLeft, refAreaRight]);

  const resetZoom = () => setZoomDomain(null);

  const handleDownload = () => {
    const headers = ['timestamp', ...lines.map(l => l.key)];
    const rows = chartData.map(d => [
      new Date(d.timestamp).toISOString(),
      ...lines.map(l => String(d[l.key])),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] bg-card border-border p-0 gap-0">
        <VisuallyHidden><DialogTitle>{title}</DialogTitle></VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <div className="flex items-center gap-1">
              {TIME_RANGES.map(r => (
                <button
                  key={r.label}
                  onClick={() => { setTimeRange(r.ms); resetZoom(); }}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${
                    timeRange === r.ms
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {zoomDomain && (
              <button onClick={resetZoom} className="text-[10px] text-accent hover:underline">
                Reset Zoom
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaused(p => !p)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={paused ? 'Resume updates' : 'Pause updates'}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Download CSV"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Line toggles */}
        <div className="flex items-center gap-3 px-6 py-2 border-b border-border">
          {lines.map(line => {
            const hidden = hiddenLines.has(line.key);
            return (
              <button
                key={line.key}
                onClick={() => toggleLine(line.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  hidden ? 'opacity-40 line-through' : ''
                }`}
                style={{ color: line.color }}
              >
                <span className="w-3 h-0.5 rounded" style={{ background: hidden ? 'currentColor' : line.color, opacity: hidden ? 0.3 : 1 }} />
                {line.label}
              </button>
            );
          })}
          {paused && (
            <span className="ml-auto text-[10px] text-status-warning font-medium flex items-center gap-1">
              <Pause size={10} /> Updates paused
            </span>
          )}
        </div>

        {/* Chart */}
        <div className="flex-1 p-6 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                tick={{ fill: 'hsl(215 12% 50%)', fontSize: 11 }}
                stroke="hsl(220 14% 16%)"
              />
              <YAxis
                tick={{ fill: 'hsl(215 12% 50%)', fontSize: 11 }}
                stroke="hsl(220 14% 16%)"
              />
              <Tooltip content={<CustomTooltip />} />
              {refAreaLeft && refAreaRight && (
                <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="hsl(var(--accent))" fillOpacity={0.1} />
              )}
              {lines.map(line =>
                !hiddenLines.has(line.key) && (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    name={line.label}
                    stroke={line.color}
                    strokeWidth={2}
                    dot={false}
                    animationDuration={300}
                  />
                )
              )}
              <Brush
                dataKey="timestamp"
                height={28}
                fill="hsl(220 14% 10%)"
                stroke="hsl(220 14% 20%)"
                tickFormatter={formatTime}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { FullScreenChart, type ChartLine };
export default FullScreenChart;
