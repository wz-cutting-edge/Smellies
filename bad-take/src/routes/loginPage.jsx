import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../client';

const LoginPage = () => {
  return (
    <div className="login-page">
      <Auth
        className="login-auth-form"
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
      />
    </div>
  );
};

export default LoginPage;
