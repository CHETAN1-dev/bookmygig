'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);

  const fetchChats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) return;

    const { data: messages } = await supabase
      .from('messages')
      .select(`
        id, sender_id, receiver_id, content, created_at, is_read,
        sender:sender_id (full_name, profile_image_url),
        receiver:receiver_id (full_name, profile_image_url)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!messages) return;

    const chatMap = new Map();

    for (let msg of messages) {
      const isSender = msg.sender_id === user.id;
      const partner = isSender ? msg.receiver : msg.sender;
      const partnerId = isSender ? msg.receiver_id : msg.sender_id;

      if (!chatMap.has(partnerId)) {
        chatMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: msg.content,
          unreadCount: 0,
          time: msg.created_at,
        });
      }

      // Count unread messages only if receiver is current user
      if (msg.receiver_id === user.id && !msg.is_read) {
        chatMap.get(partnerId).unreadCount += 1;
      }
    }

    setChats(Array.from(chatMap.values()));
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.backBtn} onClick={() => router.back()}>←</span>
        <h2 style={styles.logo}>BookMyGig</h2>
      </div>

      <h3 style={styles.heading}>💬 Chats</h3>

      {chats.map((chat) => (
        <div
          key={chat.partnerId}
          style={styles.chatCard}
          onClick={() => router.push(`/chat/${chat.partnerId}`)}
        >
          <img
            src={chat.partner.profile_image_url || 'https://via.placeholder.com/40'}
            style={styles.avatar}
          />
          <div style={{ flex: 1 }}>
            <p style={styles.name}>{chat.partner.full_name}</p>
            <p style={styles.message}>
              {chat.lastMessage.length > 40
                ? `${chat.lastMessage.slice(0, 32)}...`
                : chat.lastMessage}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles: any = {
  container: {
    backgroundColor: '#fff',
    minHeight: '100vh',
    padding: '20px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    fontSize: 24,
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#000',
    marginRight: 12,
  },
  logo: {
    flex: 1,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
    color: '#000',
  },
  chatCard: {
    backgroundColor: '#f4f4f4',
    padding: 12,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    marginBottom: 12,
    cursor: 'pointer',
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#555',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: '#000',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 12,
    padding: '4px 8px',
    minWidth: 24,
    textAlign: 'center',
  },
};
