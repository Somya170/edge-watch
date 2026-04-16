import { SensorData } from '@/types/sensor';

interface LiveDataTableProps {
  data: SensorData[];
}

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false });
};

const columns = [
  { key: 'timestamp', label: 'Time', format: (v: number) => formatTime(v) },
  { key: 'aRMSx', label: 'aRMS-X' },
  { key: 'aRMSy', label: 'aRMS-Y' },
  { key: 'aRMSz', label: 'aRMS-Z' },
  { key: 'vRMSx', label: 'vRMS-X' },
  { key: 'vRMSy', label: 'vRMS-Y' },
  { key: 'vRMSz', label: 'vRMS-Z' },
  { key: 'temperature', label: 'Temp (°C)' },
  { key: 'acousticRMS', label: 'Acoustic' },
] as const;

function getCellColor(key: string, value: number): string {
  if (key === 'temperature' && value > 33) return 'status-critical';
  if (key === 'temperature' && value > 30) return 'status-warning';
  if (key === 'vRMSy' && value > 1.2) return 'status-warning';
  if (key === 'acousticRMS' && value > 58) return 'status-warning';
  return 'text-foreground';
}

const LiveDataTable = ({ data }: LiveDataTableProps) => {
  const recent = [...data].reverse().slice(0, 15);

  return (
    <div className="glow-card rounded-xl bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Live Sensor Data</h3>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {columns.map(col => (
                <th key={col.key} className="py-2 px-3 text-left text-muted-foreground font-medium uppercase tracking-wider whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((row, i) => (
              <tr
                key={row.timestamp}
                className={`border-b border-border/50 transition-colors hover:bg-secondary/30 ${i === 0 ? 'bg-primary/5' : ''}`}
              >
                {columns.map(col => {
                  const value = row[col.key as keyof SensorData];
                  const formatted = 'format' in col && col.format
                    ? col.format(value as number)
                    : typeof value === 'number' ? value.toFixed(3) : String(value);
                  return (
                    <td
                      key={col.key}
                      className={`py-2 px-3 font-mono whitespace-nowrap ${getCellColor(col.key, value as number)}`}
                    >
                      {formatted}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveDataTable;
