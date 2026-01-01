import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin status after auth state change
        if (session?.user) {
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      // Check if identifier is an email or username
      let email = identifier;
      
      // If not an email format, look up the email by username
      if (!identifier.includes('@')) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', identifier)
          .maybeSingle();
        
        if (profileError || !profileData) {
          return { error: new Error('Username not found') };
        }
        
        // Get user email from auth - we need to use the profile id to find the user
        // Since we can't query auth.users directly, we'll store email in profiles
        // For now, try using the username as-is (user might have registered with username@domain format)
        // Or look up from profiles if we add email there
        
        // Alternative: Check if there's an email stored in profiles
        const { data: fullProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', identifier)
          .maybeSingle();
          
        if (fullProfile) {
          // Try to get the user's email from the auth metadata
          // Since we can't access auth.users, we need to attempt login with a workaround
          // Best approach: store email in profiles table or use username as email prefix
          
          // For now, let's check common email patterns or require email
          // Actually, Supabase doesn't support username login natively
          // We need to either:
          // 1. Store email in profiles and retrieve it
          // 2. Use a custom lookup
          
          // Let's query the profiles to see if we added email there
          const { data: userEmail } = await supabase
            .rpc('get_user_email_by_username', { p_username: identifier })
            .maybeSingle();
            
          if (userEmail) {
            email = userEmail;
          } else {
            return { error: new Error('Please login with your email address') };
          }
        }
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
          },
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
