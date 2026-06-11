import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';

export interface Prescription {
  id: string;
  prescriptionId: string;
  diagnosis: string;
  issuedAt: string;
  doctorName: string;
  doctorQualification: string;
  status: string;
  medicationCount: number;
}

export function usePrescriptions(filters: any = {}) {
  const [data, setData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/prescriptions', { params: filters });
      if (response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch prescriptions');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Fetch prescriptions error:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return { data, loading, error, refetch: fetchPrescriptions };
}
