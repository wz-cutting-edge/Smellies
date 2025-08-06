import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../client';

const LoginPage = () => {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '2rem 1rem'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '3rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          textAlign: 'center'
        }}
      >
        <h1 
          style={{
            color: 'var(--primary)',
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '0.5rem'
          }}
        >
          Welcome to SMELLIES
        </h1>
        
        <p 
          style={{
            color: 'var(--mutedText)',
            fontSize: '1rem',
            marginBottom: '2rem'
          }}
        >
          Join the fragrance community
        </p>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'var(--primary)',
                  brandAccent: 'var(--secondary)',
                  inputBackground: 'var(--background)',
                  inputBorder: 'var(--border)',
                  inputText: 'var(--text)',
                }
              }
            },
            style: {
              button: {
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              },
              input: {
                background: 'var(--background)',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '1rem',
                color: 'var(--text)'
              },
              label: {
                color: 'var(--text)',
                fontWeight: '600'
              },
              message: {
                color: 'var(--mutedText)'
              }
            }
          }}
          providers={[]}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default LoginPage;
