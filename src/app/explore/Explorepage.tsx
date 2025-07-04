'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { checkUserRole } from '../../../utils/checkRole';
export default function ExplorePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const search = searchParams.get('search');
  const genre = searchParams.get('genre');

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
    const fetchGigWorkers = async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'gig_worker');

      if (search) {
        const orFilter = `
    full_name.ilike.%${search}%,
    bio.ilike.%${search}%,
    instagram_handle.ilike.%${search}%
  `.replace(/\s+/g, '');

        query = query.or(orFilter);
      }

      if (genre) {
        query = query.contains('services', [genre]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase Error:', error.message);
      }

      let filtered = data || [];

      // Manual case-insensitive search inside services array
      if (search) {
        filtered = filtered.filter((worker) =>
          worker.services?.some((service: string) =>
            service.toLowerCase().includes(search.toLowerCase())
          )
        ).concat(filtered.filter((worker) =>
          (worker.full_name?.toLowerCase().includes(search.toLowerCase())) ||
          (worker.bio?.toLowerCase().includes(search.toLowerCase())) ||
          (worker.instagram_handle?.toLowerCase().includes(search.toLowerCase()))
        ));
      }

      // Remove duplicates if any
      const uniqueById = new Map();
      filtered.forEach(p => uniqueById.set(p.id, p));
      setProfiles([...uniqueById.values()]);

      setLoading(false);
    };

    fetchGigWorkers();
  }, [search, genre]);


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.backBtn} onClick={() => router.back()}>←</span>
        <h2 style={styles.logo}>BookMyGig</h2>
         <p style={{ color: '#666', marginTop: 4 }}>Find top gig professionals near you</p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: 40 }}>Loading gig workers...</p>
      ) : profiles.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: 40 }}>No gig workers found.</p>
      ) : (
        <div style={styles.grid}>
          {profiles.map((worker) => (
            <div
              key={worker.id}
              style={styles.card}
              onClick={() => router.push(`/profile/${worker.id}`)}
            >
              <img
                src={worker.profile_image_url || 'https://via.placeholder.com/100'}
                alt={worker.full_name}
                style={styles.avatar}
              />
              <h3 style={styles.name}>{worker.full_name || 'Unnamed'}</h3>
              <p style={styles.services}>{worker.services?.join(', ')}</p>
              <p style={styles.bio}>{worker.bio?.slice(0, 60)}...</p>
            </div>
          ))}
        </div>
      )}

      {/* <ChatIcon
  onClick={() => router.push('/chat')}
  style={styles.chatButton}
/> */}

    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    minHeight: '100vh',
  }, chatButton: {
    position: 'fixed',
    bottom: 20,
    left: 10,
    width: 48,
    height: 60,
    cursor: 'pointer',
    zIndex: 1000,
    borderRadius: '50%',
    backgroundColor: '#000',
    padding: 10,
    boxShadow: '0 4px 8px rgba(244, 157, 157, 0.2)',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: 30,
  },
    backBtn: {
    fontSize: 24,
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#000',
    marginRight:300,
  },
  logo: {
    flex: 1,
    // textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    textAlign: 'center' as const,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    color: '#000',
    marginBottom: 6,
  },
  services: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  bio: {
    fontSize: 13,
    color: '#777',
  },
};
