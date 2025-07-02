'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { checkUserRole } from '../../utils/checkRole';

const categories = [
  { name: 'Rock', emoji: '🎸' },
  { name: 'Funk', emoji: '🕺' },
  { name: 'Jazz', emoji: '🎷' },
  { name: 'Classical', emoji: '🎻' },
  { name: 'Indie', emoji: '🎧' },
  { name: 'Pop', emoji: '🎤' },
  { name: 'Indian Classical', emoji: '🪕' },
];

export default function HomePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const check = async () => {
      const role = await checkUserRole();
      if (role === 'gig_worker') {
        router.push('/gig-dashboard'); // Redirect gig worker
      }
    };
    check();
  }, []);


  useEffect(() => {
    const fetchUser = async () => {
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

    fetchUser();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      router.push(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCategoryClick = (genre: string) => {
    router.push(`/explore?genre=${genre}`);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>BookMyGig</h2>
        <div style={styles.navActions}>
          {user ? (
            profile?.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt="Profile"
                style={styles.avatarImage}
                onClick={() => {
                  if (profile?.full_name && profile?.phone) {
                    router.push('/my-profile');
                  } else {
                    router.push('/complete-profile');
                  }
                }}
              // onClick={() => router.push('/complete-profile')}
              />
            ) : (
              <div
                style={styles.avatar}
                onClick={() => {
                  if (profile?.full_name && profile?.phone) {
                    router.push('/my-profile');
                  } else {
                    router.push('/complete-profile');
                  }
                }}
                // onClick={() => router.push('/complete-profile')}
                title="Go to profile"
              >
                👤
              </div>
            )
          ) : (
            <>
              <button style={styles.navBtn} onClick={() => router.push('/login')}>Login</button>
              <button style={styles.navBtn} onClick={() => router.push('/login')}>Sign Up</button>
            </>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heading}>Find top gig professionals near you</h1>
        <input
          placeholder="Search by name, service or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.searchInput}
        />
        <button style={styles.searchBtn} onClick={handleSearch}>🔍</button>

        <button style={styles.cta} onClick={() => router.push('/explore')}>
          Explore Now
        </button>
      </div>

      {/* Categories */}
      <h3 style={styles.sectionTitle}>Categories</h3>
      <div style={styles.categoryGrid}>
        {categories.map((cat, index) => (
          <div
            key={index}
            style={styles.categoryCard}
            onClick={() => handleCategoryClick(cat.name)}
          >
            <span style={styles.emoji}>{cat.emoji}</span>
            <p style={styles.categoryName}>{cat.name}</p>
          </div>
        ))}
      </div>
      <div
        style={styles.floatingButton}
        onClick={() => router.push('/chat')}
      >
        💬
      </div>


      {/* Featured Placeholder */}
      <h3 style={styles.sectionTitle}>Featured Providers</h3>
      <div style={styles.featuredBox}>
        <p style={styles.featuredNote}>We'll add real gig workers here from Supabase soon.</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    minHeight: '100vh',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navActions: {
    display: 'flex',
    gap: 10,
  },
  navBtn: {
    padding: '6px 14px',
    border: '1px solid #000',
    borderRadius: 6,
    backgroundColor: '#000',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: '#000',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    cursor: 'pointer',
  },
  hero: {
    textAlign: 'center' as const,
    marginBottom: 30,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 14,
  },
  searchInput: {
    width: '100%',
    maxWidth: 400,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ccc',
    marginBottom: 16,
  },
  searchBtn: {
    color: '#fff',
    borderRadius: 8,
    border: 'none',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    cursor: 'pointer',
  },
  cta: {
    backgroundColor: '#000',
    color: '#fff',
    padding: 14,
    borderRadius: 8,
    border: 'none',
    fontSize: 16,
    fontWeight: 'bold',
    width: '100%',
    maxWidth: 300,
    margin: '0 auto',
    display: 'block',
    cursor: 'pointer',
  },
  floatingButton: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: '#000',
    color: '#fff',
    fontSize: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    zIndex: 999,
  },

  sectionTitle: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 12,
  },
  categoryGrid: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  categoryCard: {
    flex: '0 0 30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    textAlign: 'center' as const,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  emoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 14,
    color: '#000',
    marginTop: 6,
  },
  featuredBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    textAlign: 'center' as const,
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  featuredNote: {
    color: '#777',
    fontSize: 14,
  },
};
