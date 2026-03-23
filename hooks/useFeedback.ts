import { useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase';

import { useAuth } from './useAuth';

export function useFeedback() {
  const { user } = useAuth();
  const [history, setHistory] = useState<number[]>([7, 8, 8, 6, 7, 9, 8]);

  const streakDays = useMemo(() => history.length, [history]);

  const submitFeeling = async (score: number) => {
    if (user) {
      await supabase.from('user_feedback').insert({
        user_id: user.id,
        date: new Date().toISOString().slice(0, 10),
        feeling_score: score,
      });
    }

    setHistory((prev) => {
      const next = [...prev, score];
      return next.slice(-30);
    });
  };

  return {
    submitFeeling,
    streakDays,
    feedbackTrend: history.slice(-7),
  };
}
