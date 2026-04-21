// ============================================================
// SyncUs - Results Hook
// ============================================================

import {useCallback, useState} from 'react';
import {useAppStore} from '../store/useAppStore';
import {
  calculateResults,
  saveResults,
  fetchResults,
  fetchHistory,
} from '../services/resultService';

export const useResults = (roomId: string) => {
  const {user, results, setResults, history, setHistory} = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate and save results when both users are done.
   */
  const generateResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Always calculate fresh results to avoid seeing stale ones from previous rounds
      const result = await calculateResults(roomId);
      await saveResults(roomId, result);
      setResults(result);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate results');
      console.error('Error generating results:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId, setResults]);

  /**
   * Load result history for the current user.
   */
  const loadHistory = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    try {
      const items = await fetchHistory(user.uid);
      setHistory(items);
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [user, setHistory]);

  return {results, history, loading, error, generateResults, loadHistory};
};
