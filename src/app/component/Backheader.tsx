'use client';
import { useRouter } from 'next/navigation';

export default function BackHeader({ title = 'BookMyGig' }: { title?: string }) {
  const router = useRouter();

  return (
    <div style={styles.header}>
      <span onClick={() => router.back()} style={styles.back}>
        ⬅️
      </span>
      <h2 style={styles.title}>{title}</h2>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  back: {
    fontSize: 20,
    cursor: 'pointer',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    margin: 0,
  },
};
