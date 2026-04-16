import { SensorData, AnomalyResponse } from '@/types/sensor';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch {
    clearTimeout(id);
    throw new Error('Connection failed');
  }
}

export async function fetchLiveData(): Promise<SensorData> {
  const res = await fetchWithTimeout(`${API_BASE}/api/live-data`);
  if (!res.ok) throw new Error('Failed to fetch live data');
  return res.json();
}

export async function fetchHistory(params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ data: SensorData[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.startDate) query.set('start_date', params.startDate);
  if (params?.endDate) query.set('end_date', params.endDate);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  const res = await fetchWithTimeout(`${API_BASE}/api/history?${query}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchAnomaly(): Promise<AnomalyResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/api/anomaly`);
  if (!res.ok) throw new Error('Failed to fetch anomaly');
  return res.json();
}
