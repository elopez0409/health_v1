import { Session, User } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { ProfileRow } from '@/lib/types';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null; session: Session | null }>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) {
    return null;
  }
  return data as ProfileRow | null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        setProfile(await fetchProfile(data.session.user.id));
      }
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        setProfile(await fetchProfile(nextSession.user.id));
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: (error as Error | null) ?? null };
      },
      signUp: async (email, password, displayName) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (!error && data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            display_name: displayName || 'HealthHub User',
            onboarding_completed: false,
            privacy_settings: {
              cloudBackupEnabled: true,
              exportAllowed: true,
            },
          });
          if (data.session) {
            setSession(data.session);
            setProfile(await fetchProfile(data.session.user.id));
          }
        }
        return {
          error: (error as Error | null) ?? null,
          session: data?.session ?? null,
        };
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
      },
      completeOnboarding: async () => {
        let currentSession = session;
        if (!currentSession?.user) {
          const { data } = await supabase.auth.getSession();
          currentSession = data?.session ?? null;
        }
        if (!currentSession?.user) return;
        await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', currentSession.user.id);
        const updated = await fetchProfile(currentSession.user.id);
        setProfile(updated);
        if (currentSession !== session) {
          setSession(currentSession);
        }
      },
    }),
    [session, profile, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
