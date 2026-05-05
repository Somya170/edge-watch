import { useState, useEffect, useCallback } from "react";
import TopBar from '@/components/dashboard/TopBar';
import StatusCards from '@/components/dashboard/StatusCards';
import SensorChart from '@/components/dashboard/SensorChart';
import AlertPanel from '@/components/dashboard/AlertPanel';
import LiveDataTable from '@/components/dashboard/LiveDataTable';
import { usePredictionData } from '@/hooks/usePredictionData';
import PredictionCard from '@/components/dashboard/PredictionCard';
import ForecastChart from '@/components/dashboard/ForecastChart';
import HealthTrend from '@/components/dashboard/HealthTrend';
import FaultDetection from '@/components/dashboard/FaultDetection';
import RecommendationPanel from '@/components/dashboard/RecommendationPanel';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5005';

// ─── Chart line configs ────────────────────────────────────────
const velocityLines = [
  { key: 'vRMSx' as const, color: '#3b82f6', label: 'vRMS-X' },
  { key: 'vRMSy' as const, color: '#22d3ee', label: 'vRMS-Y' },
  { key: 'vRMSz' as const, color: '#a78bfa', label: 'vRMS-Z' },
];
const accelLines = [
  { key: 'aRMSx' as const, color: '#f59e0b', label: 'aRMS-X' },
  { key: 'aRMSy' as const, color: '#ef4444', label: 'aRMS-Y' },
  { key: 'aRMSz' as const, color: '#10b981', label: 'aRMS-Z' },
];
const tempLines = [
  { key: 'temperature' as const, color: '#f97316', label: 'Temperature' },
];
const acousticLines = [
  { key: 'aucausticRMS' as const, color: '#8b5cf6', label: 'Acoustic RMS' },
];
// ──────────────────────────────────────────────────────────────

const RANGE_LIMITS: Record<string, number> = {
  "1m": 60,
  "5m": 300,
  "1h": 1000,
};

const Dashboard = () => {

  const [data, setData] = useState<any>({});
  const [history, setHistory] = useState<any[]>([]);
  const [range, setRange] = useState("5m");
  const [rangeLoading, setRangeLoading] = useState(false);

  // ✅ NEW: Health History (FIX)
  const [healthHistory, setHealthHistory] = useState<any[]>([]);

  // ─── Fetch History ──────────────────────────────────────────
  const fetchHistory = useCallback((selectedRange: string) => {
    setRangeLoading(true);
    const limit = RANGE_LIMITS[selectedRange] || 1000;

    fetch(`${API_BASE}/api/history?range=${selectedRange}&limit=${limit}`)
      .then(res => res.json())
      .then((res: any[]) => {
        if (!Array.isArray(res)) return;

        const formatted = res
          .map(item => ({ ...item, timestamp: Number(item.timestamp) }))
          .sort((a, b) => a.timestamp - b.timestamp);

        setHistory(formatted);
      })
      .catch(err => console.error("History error:", err))
      .finally(() => setRangeLoading(false));
  }, []);

  useEffect(() => {
    fetchHistory(range);
  }, [range, fetchHistory]);

  // ─── Live Data Polling ──────────────────────────────────────
  useEffect(() => {
    const fetchLive = () => {
      fetch(`${API_BASE}/api/live-data`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((res: any) => {
          const newPoint = {
            ...res,
            timestamp: Number(res.timestamp),
          };

          setData(newPoint);

          setHistory(prev => {
            const lastTs = prev.length > 0 ? prev[prev.length - 1].timestamp : 0;
            if (newPoint.timestamp <= lastTs) return prev;

            const now = Date.now();
            const rangeMs: Record<string, number> = {
              "1m": 60_000,
              "5m": 300_000,
              "1h": 3_600_000,
            };

            const cutoff = now - (rangeMs[range] || 300_000);
            if (newPoint.timestamp < cutoff) return prev;

            const updated = [...prev, newPoint];
            return updated.length > 1000 ? updated.slice(-1000) : updated;
          });
        })
        .catch(err => console.error("Live error:", err));
    };

    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => clearInterval(interval);
  }, [range]);

  // ─── ML Prediction Hook ─────────────────────────────────────
  const { prediction, forecast, recommendations, isLoading } = usePredictionData(false);

  // ✅ NEW: Health Trend Fix (MAIN LOGIC)
  useEffect(() => {
    console.log("Prediction:", prediction);

    if (prediction && typeof prediction.health_score === "number") {
      setHealthHistory(prev => [
        ...prev.slice(-50),
        {
          timestamp: Date.now(),
          value: prediction.health_score,
          predicted: false
        }
      ]);
    }
  }, [prediction]);
  return (
    <div className="min-h-screen bg-background">

      <TopBar isConnected={true} useMock={false} />

      <main className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">

        {/* ── Time Range Selector ── */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
            Time Range:
          </span>

          <div className="flex gap-2">
            {["1m", "5m", "1h", "all"].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                disabled={rangeLoading}
                className={`px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wide border transition-all
                  ${range === r
                    ? "bg-accent text-white border-accent"
                    : "text-muted-foreground border-border hover:border-accent"}
                  ${rangeLoading ? "opacity-50 cursor-wait" : ""}`}
              >
                {r}
              </button>
            ))}
          </div>

          <span className="text-xs text-muted-foreground ml-2">
            {rangeLoading ? "Loading..." : `${history.length} points`}
          </span>
        </div>

        {/* ── Status Cards ── */}
        <StatusCards data={data} anomaly={prediction} isLoading={isLoading} />

        {/* ── Prediction ── */}
        <div>
          <h2 className="text-sm font-semibold text-accent uppercase mb-3">
            AI Predictive Maintenance
          </h2>
          <PredictionCard data={prediction} isLoading={isLoading} />
        </div>

        {/* ── Forecast + Health Trend ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <ForecastChart
            data={forecast?.vRMSy || []}
            title="Vibration Forecast"
            color="#22d3ee"
          />

          <ForecastChart
            data={forecast?.temperature || []}
            title="Temperature Forecast"
            color="#f97316"
          />

          {/* ✅ FIXED HEALTH GRAPH */}
          <HealthTrend data={healthHistory} />

        </div>

        {/* ── Fault + Recommendations ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FaultDetection data={prediction} />
          <RecommendationPanel data={recommendations} />
        </div>

        {/* ── Live Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <SensorChart data={history} title="Velocity RMS" lines={velocityLines} />
              <SensorChart data={history} title="Acceleration RMS" lines={accelLines} />
              <SensorChart data={history} title="Temperature" lines={tempLines} />
              <SensorChart data={history} title="Acoustic RMS" lines={acousticLines} />

            </div>

            <LiveDataTable data={history} />
          </div>

          <div className="lg:col-span-1">
            <AlertPanel alerts={[]} />
          </div>

        </div>

      </main>
    </div>
  );
};

export default Dashboard;