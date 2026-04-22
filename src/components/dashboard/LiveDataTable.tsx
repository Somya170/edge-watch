import React from 'react';

interface LiveDataTableProps {
  data: any[]; // 🔥 relaxed type
}

const formatTime = (ts: number) => {
  if (!ts) return '--';
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
  { key: 'aucausticRMS', label: 'Acoustic' }, // 🔥 FIXED
] as const;

function getCellColor(key: string, value: number): string {
  if (!value) return 'text-foreground';

  if (key === 'temperature' && value > 35) return 'text-red-500';
  if (key === 'temperature' && value > 30) return 'text-yellow-400';

  if (key === 'vRMSy' && value > 1.2) return 'text-yellow-400';

  if (key === 'aucausticRMS' && value > 60) return 'text-red-500';
  if (key === 'aucausticRMS' && value > 55) return 'text-yellow-400';

  return 'text-foreground';
}

const LiveDataTable = ({ data = [] }: LiveDataTableProps) => {

  const recent = [...data].reverse().slice(0, 15);

  return (
    <div className="glow-card rounded-xl bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Live Sensor Data
      </h3>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          
          {/* HEADER */}
          <thead>
            <tr className="border-b border-border">
              {columns.map(col => (
                <th
                  key={col.key}
                  className="py-2 px-3 text-left text-muted-foreground font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {recent.map((row, i) => (
              <tr
                key={row.timestamp || i}
                className={`border-b border-border/50 transition-colors hover:bg-secondary/30 ${
                  i === 0 ? 'bg-primary/5' : ''
                }`}
              >
                {columns.map(col => {
                  const value = row[col.key];

                  let formatted = '--';

                  if ('format' in col && col.format) {
                    formatted = col.format(value);
                  } else if (typeof value === 'number') {
                    formatted = value.toFixed(3);
                  } else if (value !== undefined && value !== null) {
                    formatted = String(value);
                  }

                  return (
                    <td
                      key={col.key}
                      className={`py-2 px-3 font-mono whitespace-nowrap ${getCellColor(
                        col.key,
                        Number(value)
                      )}`}
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