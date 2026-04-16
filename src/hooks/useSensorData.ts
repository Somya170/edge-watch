import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, AnomalyResponse, Alert } from '@/types/sensor';
import { fetchLiveData, fetchAnomaly } from '@/services/api';
import { generateMockSensorData, generateMockAnomaly } from '@/services/mockData';

const MAX_CHART_POINTS = 30;
const POLL_INTERVAL = 2000;

export function useSensorData() {
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [chartHistory, setChartHistory] = useState<SensorData[]>([]);
  const [anomaly, setAnomaly] = useState<AnomalyResponse>({
    anomaly: false, status: 'normal', healthScore: 95, alerts: [],
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const poll = useCallback(async () => {
    try {
      let data: SensorData;
      let anomalyRes: AnomalyResponse;

      if (useMock) {
        data = generateMockSensorData();
        anomalyRes = generateMockAnomaly(data);
      } else {
        try {
          [data, anomalyRes] = await Promise.all([fetchLiveData(), fetchAnomaly()]);
        } catch {
          // Fallback to mock if API unavailable
          if (!useMock) setUseMock(true);
          data = generateMockSensorData();
          anomalyRes = generateMockAnomaly(data);
          setIsConnected(false);
        }
      }

      setCurrentData(data);
      setChartHistory(prev => {
        const next = [...prev, data];
        return next.length > MAX_CHART_POINTS ? next.slice(-MAX_CHART_POINTS) : next;
      });
      setAnomaly(anomalyRes);
      if (anomalyRes.alerts.length > 0) {
        setAlerts(prev => [...anomalyRes.alerts, ...prev].slice(0, 20));
      }
      if (!useMock) setIsConnected(true);
      setIsLoading(false);
    } catch {
      setIsConnected(false);
      setIsLoading(false);
    }
  }, [useMock]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [poll]);

  // Try to reconnect to real API periodically
  useEffect(() => {
    if (!useMock) return;
    const reconnect = setInterval(async () => {
      try {
        await fetchLiveData();
        setUseMock(false);
        setIsConnected(true);
      } catch { /* still disconnected */ }
    }, 10000);
    return () => clearInterval(reconnect);
  }, [useMock]);

  return { currentData, chartHistory, anomaly, alerts, isConnected, isLoading, useMock };
}
