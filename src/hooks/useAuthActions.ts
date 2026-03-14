import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
export const useAuthActions = () => {
  const { signOut: contextSignOut } = useAuth();
const redirectUrl = import.meta.env.VITE_SITE_URL;

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      console.error(`Error signing in with ${provider}:`, errorMessage);
      alert(`Error signing in: ${errorMessage}`);
    }
  };
  const signOut = async () => {
    await contextSignOut();
  };
  return { signInWithOAuth, signOut };
};