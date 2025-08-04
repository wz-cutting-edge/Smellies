/*here you can either sign up or login using supabase, you must be signed in to comment, post, upvote, or downvote, you can still use the other features like reading through posts*/
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from './supabaseClient';

function AuthPage() {
  return (
    <Auth 
      supabaseClient={supabase} 
      appearance={{ theme: ThemeSupa }} 
      providers={[]}
    />
  );
}

