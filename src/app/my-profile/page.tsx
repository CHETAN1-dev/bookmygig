'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function MyProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) setProfile(profileData);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user || !profile) {
    return <p style={{ textAlign: 'center', marginTop: 40 }}>Loading profile...</p>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        {profile.profile_image_url ? (
          <img
            src={profile.profile_image_url}
            alt="Profile"
            style={styles.avatarImage}
          />
        ) : (
          <div style={styles.avatarPlaceholder}>👤</div>
        )}

        <h2 style={styles.name}>{profile.full_name}</h2>

        <div style={styles.infoRow}>
          <strong>📞 Contact:</strong> {profile.phone}
        </div>
        <div style={styles.infoRow}>
          <strong>📧 Email:</strong> {user.email}
        </div>

        {/* <button
          onClick={() => router.push('/my-bookings')}
          style={styles.buttonSecondary}
        >
          📋 My Bookings
        </button> */}
{/* Button to complete profile if missing data */}
{(!profile.full_name || !profile.contact || !profile.profile_image_url) && (
  <button
    onClick={() => router.push('/complete-profile')}
    style={styles.buttonWarning}
  >
    ✏️ Update Your Profile
  </button>
)}

<button
  onClick={() => router.push('/my-bookings')}
  style={styles.buttonSecondary}
>
  📋 My Bookings
</button>

        <button
          onClick={handleLogout}
          style={styles.buttonDanger}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f7f7f7',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    textAlign: 'center' as const,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    backgroundColor: '#ddd',
    fontSize: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  infoRow: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    textAlign: 'left' as const,
  },
  buttonWarning: {
  marginTop: 16,
  padding: 12,
  width: '100%',
  backgroundColor: '#ffcc00',
  color: '#000',
  fontWeight: 'bold',
  borderRadius: 8,
  border: 'none',
  fontSize: 16,
  cursor: 'pointer',
},

  buttonSecondary: {
    marginTop: 20,
    padding: 12,
    width: '100%',
    backgroundColor: '#000',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 8,
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
  },
  buttonDanger: {
    marginTop: 12,
    padding: 12,
    width: '100%',
    backgroundColor: '#a00',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 8,
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
  },
};
