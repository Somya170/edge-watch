import { useState, useEffect, useCallback, useRef } from 'react';
import { PredictionData, ForecastData, Recommendation } from '@/types/sensor';
import { fetchPrediction, fetchForecast } from '@/services/api';
import {
  generateMockPrediction,
  generateMockForecast,
  generateMockRecommendations,
} from '@/services/mockData';

const PREDICTION_INTERVAL = 7000;

export function usePredictionData(useMock: boolean) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const poll = useCallback(async () => {
    try {
      let pred: PredictionData | null = null;
      let fc: ForecastData | null = null;

      if (!useMock) {
        try {
          const [rawPred, rawFc] = await Promise.all([
            fetchPrediction(),
            fetchForecast(),
          ]);

          console.log("RAW PRED:", rawPred);

          // ✅ FINAL FIX
          const health =
            (rawPred as any).health_score !== undefined
              ? Number((rawPred as any).health_score)
              : 100 - Number((rawPred as any).failure_risk ?? 0);

          pred = {
            failure_risk: Number((rawPred as any).failure_risk ?? 0),
            rul_hours: Number((rawPred as any).rul_hours ?? 720),
            status: (rawPred as any).status ?? 'normal',
            fault_type: (rawPred as any).fault_type ?? 'none',
            confidence: Number((rawPred as any).confidence ?? 0),

            // ✅ MAIN FIELD
            health_score: health,
          };

          fc = rawFc;

        } catch (err) {
          console.warn("[usePredictionData] API failed, using mock:", err);
        }
      }

      setPrediction(pred ?? generateMockPrediction());
      setForecast(fc ?? generateMockForecast());
      setRecommendations(generateMockRecommendations());
      setIsLoading(false);

    } catch (err) {
      console.error("[usePredictionData] Poll error:", err);
      setIsLoading(false);
    }
  }, [useMock]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, PREDICTION_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);

  return { prediction, forecast, recommendations, isLoading };
}