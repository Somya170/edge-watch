import { useSensorData } from '@/hooks/useSensorData';
import { usePredictionData } from '@/hooks/usePredictionData';
import TopBar from '@/components/dashboard/TopBar';
import StatusCards from '@/components/dashboard/StatusCards';
import SensorChart from '@/components/dashboard/SensorChart';
import AlertPanel from '@/components/dashboard/AlertPanel';
import LiveDataTable from '@/components/dashboard/LiveDataTable';
import PredictionCard from '@/components/dashboard/PredictionCard';
import ForecastChart from '@/components/dashboard/ForecastChart';
import FaultDetection from '@/components/dashboard/FaultDetection';
import HealthTrend from '@/components/dashboard/HealthTrend';
import RecommendationPanel from '@/components/dashboard/RecommendationPanel';

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
  { key: 'acousticRMS' as const, color: '#8b5cf6', label: 'Acoustic RMS' },
];

const Dashboard = () => {
  const { currentData, chartHistory, anomaly, alerts, isConnected, isLoading, useMock } = useSensorData();
  const { prediction, forecast, recommendations, isLoading: predLoading } = usePredictionData(useMock);

  return (
    <div className="min-h-screen bg-background">
      <TopBar isConnected={isConnected} useMock={useMock} />

      <main className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Machine Status */}
        <StatusCards data={currentData} anomaly={anomaly} isLoading={isLoading} />

        {/* AI Predictions Section */}
        <div>
          <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            AI Predictive Analytics
          </h2>
          <PredictionCard data={prediction} isLoading={predLoading} />
        </div>

        {/* AI Forecast Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forecast?.vRMSy && (
            <ForecastChart data={forecast.vRMSy} title="Vibration Forecast (Y-axis)" color="#22d3ee" />
          )}
          {forecast?.temperature && (
            <ForecastChart data={forecast.temperature} title="Temperature Forecast" color="#f97316" unit="°C" />
          )}
          {forecast?.healthScore && (
            <HealthTrend data={forecast.healthScore} />
          )}
        </div>

        {/* Fault Detection + Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FaultDetection data={prediction} />
          <RecommendationPanel data={recommendations} />
        </div>

        {/* Real-time Charts + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SensorChart data={chartHistory} title="Velocity RMS" lines={velocityLines} />
              <SensorChart data={chartHistory} title="Acceleration RMS" lines={accelLines} />
              <SensorChart data={chartHistory} title="Temperature" lines={tempLines} />
              <SensorChart data={chartHistory} title="Acoustic RMS" lines={acousticLines} />
            </div>
            <LiveDataTable data={chartHistory} />
          </div>
          <div className="lg:col-span-1">
            <AlertPanel alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
