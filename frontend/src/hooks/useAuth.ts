import { useState, useEffect } from 'react';
import { getMe } from '../services/auth.service';
import type { AuthUser } from '../services/auth.service';

export type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
