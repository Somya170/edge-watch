import { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { SensorData } from '@/types/sensor';
import { generateMockHistory } from '@/services/mockData';
import TopBar from '@/components/dashboard/TopBar';

const ITEMS_PER_PAGE = 20;

const formatDateTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleString('en-US', { hour12: false });
};

const History = () => {
  const [allData] = useState<SensorData[]>(() => generateMockHistory(200));
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = allData;
    if (startDate) {
      const s = new Date(startDate).getTime();
      result = result.filter(d => d.timestamp >= s);
    }
    if (endDate) {
      const e = new Date(endDate).getTime() + 86400000;
      result = result.filter(d => d.timestamp <= e);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        Object.values(d).some(v => String(v).toLowerCase().includes(q))
      );
    }
    return result;
  }, [allData, search, startDate, endDate]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search, startDate, endDate]);

  const columns = [
    'timestamp', 'aRMSx', 'aRMSy', 'aRMSz', 'vRMSx', 'vRMSy', 'vRMSz', 'temperature', 'acousticRMS',
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <TopBar isConnected={false} useMock={true} />

      <main className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            <span className="text-primary glow-text">History</span>
            <span className="text-muted-foreground ml-2 text-sm font-normal">Sensor Data Records</span>
          </h2>
        </div>

        <div className="glow-card rounded-xl bg-card p-5">
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search data..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-muted-foreground" />
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {columns.map(col => (
                    <th key={col} className="py-2 px-3 text-left text-muted-foreground font-medium uppercase tracking-wider whitespace-nowrap">
                      {col === 'timestamp' ? 'Time' : col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map(row => (
                  <tr key={row.timestamp} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    {columns.map(col => (
                      <td key={col} className="py-2 px-3 font-mono whitespace-nowrap text-foreground">
                        {col === 'timestamp' ? formatDateTime(row[col]) : row[col].toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted-foreground">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-secondary text-foreground disabled:opacity-30 hover:bg-secondary/80 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-muted-foreground font-mono">{page}/{totalPages || 1}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg bg-secondary text-foreground disabled:opacity-30 hover:bg-secondary/80 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
