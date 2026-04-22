import { useState, useEffect } from "react";
import TopBar from '@/components/dashboard/TopBar';
import StatusCards from '@/components/dashboard/StatusCards';
import SensorChart from '@/components/dashboard/SensorChart';
import AlertPanel from '@/components/dashboard/AlertPanel';
import LiveDataTable from '@/components/dashboard/LiveDataTable';

// 🔥 AI imports wapas la
import { usePredictionData } from '@/hooks/usePredictionData';
import PredictionCard from '@/components/dashboard/PredictionCard';
import ForecastChart from '@/components/dashboard/ForecastChart';
import HealthTrend from '@/components/dashboard/HealthTrend';
import FaultDetection from '@/components/dashboard/FaultDetection';
import RecommendationPanel from '@/components/dashboard/RecommendationPanel';

// 🔥 Lines config
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

const Dashboard = () => {

  const [data, setData] = useState<any>({});
  const [history, setHistory] = useState<any[]>([]);

  // 🔥 AI hook wapas la
  const { prediction, forecast, recommendations, isLoading } = usePredictionData(false);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://127.0.0.1:5005/api/live-data")
        .then(res => res.json())
        .then(res => {
          const newData = {
            ...res,
            timestamp: Date.now(),
          };

          setData(newData);

          setHistory(prev => [
            ...prev.slice(-20),
            newData,
          ]);
        })
        .catch(err => console.log(err));
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      <TopBar isConnected={true} useMock={false} />

      <main className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">

        {/* 🔥 STATUS */}
        <StatusCards data={data} anomaly={prediction} isLoading={isLoading} />

        {/* 🔥 AI SECTION */}
        <div>
          <h2 className="text-sm font-semibold text-accent uppercase mb-3">
            AI Predictive Maintenance
          </h2>

          <PredictionCard data={prediction} isLoading={isLoading} />
        </div>

        {/* 🔥 FORECAST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ForecastChart
            data={forecast?.vRMSy || history}
            title="Vibration Forecast"
            color="#22d3ee"
          />

          <ForecastChart
            data={forecast?.temperature || history}
            title="Temperature Forecast"
            color="#f97316"
          />

          <HealthTrend data={forecast?.healthScore || history} />
        </div>

        {/* 🔥 FAULT + RECOMMENDATION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FaultDetection data={prediction} />
          <RecommendationPanel data={recommendations} />
        </div>

        {/* 🔥 LIVE CHARTS */}
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