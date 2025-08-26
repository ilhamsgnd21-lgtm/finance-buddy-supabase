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
    // Since we don't have user_profiles table, just use email prefix
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setUsername(user.email.split('@')[0]);
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
    const tempEmail = `${username}@temp.local`;

    const { error } = await supabase.auth.signInWithPassword({
      email: tempEmail,
      password,
    });

    return { error };
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    return { error };
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