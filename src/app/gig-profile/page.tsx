'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function GigProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data?.role !== 'gig_worker') {
        router.push('/'); // ❌ Not a gig user → go home
        return;
      }

      setProfile({ ...data, email: user.email });
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <p style={styles.center}>Loading...</p>;
  if (!profile) return <p style={styles.center}>Profile not found</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>👤 My Profile</h2>

      {profile.profile_image_url ? (
        <img src={profile.profile_image_url} style={styles.avatar} alt="Avatar" />
      ) : (
        <div style={styles.avatarPlaceholder}>👤</div>
      )}

      <p><strong>Name:</strong> {profile.full_name || 'Unnamed'}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Contact:</strong> {profile.contact || 'Not provided'}</p>

      <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Logout</button>
    </div>
  );
}

const styles: any = {
  container: {
    padding: 20,
    maxWidth: 400,
    margin: '0 auto',
    backgroundColor: '#000',
    borderRadius: 12,
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    marginTop: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    backgroundColor: '#ddd',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 40,
    marginBottom: 16,
  },
  logoutBtn: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#000',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  center: {
    textAlign: 'center',
    marginTop: 40,
  },
};
