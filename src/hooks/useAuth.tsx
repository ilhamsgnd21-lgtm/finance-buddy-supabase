import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  username: string | null;
  loading: boolean;
  signUp: (username: string, password: string) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsername = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setUsername(data.username);
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUsername(session.user.id);
        } else {
          setUsername(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUsername(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (username: string, password: string) => {
    // Generate a temporary email for Supabase auth
    const tempEmail = `${username}@temp.local`;
    
    const { error } = await supabase.auth.signUp({
      email: tempEmail,
      password,
      options: {
        data: {
          username: username
        }
      }
    });
    return { error };
  };

  const signIn = async (username: string, password: string) => {
    try {
      // First, find the user by username to get their email
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (profileError || !profileData) {
        return { error: { message: 'Username atau password salah' } };
      }

      // Get the user's email from auth.users
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', profileData.id)
        .single();

      if (userError) {
        return { error: { message: 'Username atau password salah' } };
      }

      // Generate temp email for login
      const tempEmail = `${username}@temp.local`;

      const { error } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password,
      });

      return { error };
    } catch (error) {
      return { error: { message: 'Username atau password salah' } };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.rpc('change_user_password', {
        p_current_password: currentPassword,
        p_new_password: newPassword
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    setUsername(null);
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    username,
    loading,
    signUp,
    signIn,
    changePassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};