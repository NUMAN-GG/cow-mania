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

    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: sessionUser.id,
              email: sessionUser.email,
              full_name: sessionUser.user_metadata?.full_name || '',
              role: 'customer'
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        data = newProfile;
      } else if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error handling profile:', error.message);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = (email, password, fullName) => {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
  };

  const signIn = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = () => {
    setProfile(null);
    return supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    role: profile?.role || 'customer',
    isAdmin: profile?.role === 'admin',
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => fetchProfile(user)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};