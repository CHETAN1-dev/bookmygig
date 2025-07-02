'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { checkUserRole } from '../../../utils/checkRole';

export default function AuthPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'gig_worker' | 'user'>('user');
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    useEffect(() => {
  const check = async () => {
    const role = await checkUserRole();
    if (role === 'gig_worker') {
      router.push('/gig-dashboard'); // Redirect gig worker
    }
  };
  check();
}, []);

    const handleSubmit = async () => {
  if (!email || !password) {
    setError('Email and password are required.');
    return;
  }

  setLoading(true);
  setError('');

  let userId = '';
  if (mode === 'register') {
    // 1. Register user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !signUpData?.user?.id) {
      setError(signUpError?.message || 'Signup failed.');
      setLoading(false);
      return;
    }

    userId = signUpData.user.id;

    // 2. Insert into profiles
    const { error: insertError } = await supabase.from('profiles').insert({
      id: userId,
      role,
    });

    if (insertError) {
      setError('Signup succeeded but profile creation failed.');
      console.error(insertError);
      setLoading(false);
      return;
    }
  } else {
    // 3. Login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !loginData.session) {
      setError(loginError?.message || 'Login failed.');
      setLoading(false);
      return;
    }

    userId = loginData.user.id;
  }

  // 4. Fetch role from profiles
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileError || !profileData) {
    setError('Login succeeded but profile fetch failed.');
    setLoading(false);
    return;
  }

if (profileData.role === 'gig_worker') {
  // Fetch full profile details
  const { data: fullProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const isIncomplete =
    !fullProfile?.full_name ||
    !fullProfile?.services ||
    fullProfile.services.length === 0;

  if (isIncomplete) {
    router.push('/dashboard');
  } else {
    router.push('/gig-dashboard');
  }
} else {
  router.push('/');
}


  setLoading(false);
};


    return (
        <div style={styles.container}>
            <div style={styles.box}>
                {/* <h2>{mode === 'login' ? 'Login' : 'Register'}</h2> */}
                <h2 style={{ color: '#000', fontSize: 24, marginBottom: 20 }}>
                    {mode === 'login' ? 'Login' : 'Register'}
                </h2>

                <div style={styles.toggle}>
                    <button
                        onClick={() => setMode('login')}
                        style={{ ...styles.toggleButton, backgroundColor: mode === 'login' ? '#000' : '#ddd', color: mode === 'login' ? '#fff' : '#000' }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setMode('register')}
                        style={{ ...styles.toggleButton, backgroundColor: mode === 'register' ? '#000' : '#ddd', color: mode === 'register' ? '#fff' : '#000' }}
                    >
                        Register
                    </button>
                </div>

                <label style={{ color: '#000', fontWeight: 'bold', marginBottom: 4 }}>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={styles.input}
                />

                <label style={{ color: '#000', fontWeight: 'bold', marginBottom: 4 }}>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={styles.input}
                />

                {mode === 'register' && (
                    <>
                        <label style={{ color: '#000', fontWeight: 'bold', marginBottom: 4 }}>Role</label>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 15 }}>
                            <label
                                style={{
                                    color: role === 'gig_worker' ? '#000' : '#888',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                               <input
                                    type="radio"
                                    name="role"
                                    checked={role === 'gig_worker'}
                                    onChange={() => setRole('gig_worker')}
                                    style={{ marginRight: 6 }}
                                />
                                Gig Worker
                            </label>

                            <label
                                style={{
                                    color: role === 'user' ? '#000' : '#888',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    checked={role === 'user'}
                                    onChange={() => setRole('user')}
                                    style={{ marginRight: 6 }}
                                />
                                User
                            </label>
                        </div>

                    </>
                )}

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button onClick={handleSubmit} style={styles.button} disabled={loading}>
                    {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7f7f7',
    },
    box: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 8,
        maxWidth: 400,
        width: '90%',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    },
    input: {
        width: '100%',
        padding: 12,
        marginBottom: 15,
        borderRadius: 8, // was 4
        border: '1px solid #ccc',
        backgroundColor: '#fff',
        color: '#000',
        fontSize: 14,
    },
    button: {
        width: '100%',
        padding: 12,
        backgroundColor: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: 8, // more rounded
        fontWeight: 'bold',
        fontSize: 16,
        cursor: 'pointer',
    },

    toggle: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    toggleButton: {
        flex: 1,
        padding: 10,
        border: 'none',
        borderRadius: 8, // more rounded
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: 14,
    },

};
