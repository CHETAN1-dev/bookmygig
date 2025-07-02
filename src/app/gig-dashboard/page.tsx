'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function GigDashboardPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data?.role !== 'gig_worker') {
        router.push('/');
      }
    };

    checkAccess();
  }, []);

  const cards = [
    { title: '📋 My Bookings', route: '/bookings' },
    { title: '💬 Chat With Users', route: '/chat' },
    { title: '👤 My Profile', route: '/gig-profile' },
    { title: '🎨 Update Services & Bio', route: '/edit-profile' },
    { title: '📅 Calendar View', route: '/calendar' },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📍 BookMyGig Dashboard</h1>

      <div style={styles.grid}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            style={styles.card}
            onClick={() => router.push(card.route)}
          >
            {card.title}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    backgroundColor: '#000',
    color: '#fff',
    minHeight: '100vh',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 16,
    maxWidth: 400,
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 10,
    textAlign: 'center',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 18,
    border: '1px solid #333',
    transition: '0.2s',
  },
};
