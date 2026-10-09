import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (sessionUser) => {
    if (!sessionUser) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error.message);
      setProfile(null);
      return;
    }
    setProfile(data);
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (event === 'TOKEN_REFRESHED') return;

      // Deferred to avoid a Supabase deadlock when calling the API inside this callback
      setTimeout(async () => {
        await fetchProfile(currentUser);
        setLoading(false);
      }, 0);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = (email, password, fullName) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value = {
    user,
    profile,
    role: profile?.role || 'customer',
    isAdmin: profile?.role === 'admin',
    isViewer: profile?.role === 'viewer',
    canView: profile?.role === 'admin' || profile?.role === 'viewer',
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => fetchProfile(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);