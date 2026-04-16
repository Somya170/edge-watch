import { useState, useEffect, useCallback, useRef } from 'react';
import { PredictionData, ForecastData, Recommendation } from '@/types/sensor';
import { fetchPrediction, fetchForecast } from '@/services/api';
import { generateMockPrediction, generateMockForecast, generateMockRecommendations } from '@/services/mockData';

const PREDICTION_INTERVAL = 7000;

export function usePredictionData(useMock: boolean) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const poll = useCallback(async () => {
    try {
      if (useMock) {
        setPrediction(generateMockPrediction());
        setForecast(generateMockForecast());
        setRecommendations(generateMockRecommendations());
      } else {
        try {
          const [pred, fc] = await Promise.all([fetchPrediction(), fetchForecast()]);
          setPrediction(pred);
          setForecast(fc);
          // Recommendations could come from another endpoint; mock for now
          setRecommendations(generateMockRecommendations());
        } catch {
          setPrediction(generateMockPrediction());
          setForecast(generateMockForecast());
          setRecommendations(generateMockRecommendations());
        }
      }
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, [useMock]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, PREDICTION_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [poll]);

  return { prediction, forecast, recommendations, isLoading };
}
