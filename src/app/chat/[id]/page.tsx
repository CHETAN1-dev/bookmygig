
'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ChatDetailPage() {
const supabase = createClientComponentClient();
const router = useRouter();
const { id: partnerId } = useParams();
const [currentUser, setCurrentUser] = useState<any>(null);
const [partnerProfile, setPartnerProfile] = useState<any>(null);
const [messages, setMessages] = useState<any[]>([]);
const [newMessage, setNewMessage] = useState('');
const messagesEndRef = useRef<HTMLDivElement>(null);

// Fetch messages & profile
useEffect(() => {
const fetchData = async () => {
const {
data: { user },
} = await supabase.auth.getUser();
if (!user) return;

  setCurrentUser(user);

  const { data: partner } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', partnerId)
    .single();
  setPartnerProfile(partner);

  const { data: fetchedMessages } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: true });

  const relevantMessages = fetchedMessages?.filter(
    (msg) =>
      (msg.sender_id === user.id && msg.receiver_id === partnerId) ||
      (msg.sender_id === partnerId && msg.receiver_id === user.id)
  );

  setMessages(relevantMessages || []);

  // Mark unread messages as read
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', partnerId)
    .eq('receiver_id', user.id)
    .eq('is_read', false);
};

if (partnerId) fetchData();
}, [partnerId]);

// Auto scroll to bottom
useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

const handleSend = async () => {
if (!newMessage.trim() || !currentUser) return;


const { error } = await supabase.from('messages').insert({
  sender_id: currentUser.id,
  receiver_id: partnerId,
  content: newMessage,
  is_read: false,
});

if (!error) {
  setMessages([
    ...messages,
    {
      sender_id: currentUser.id,
      receiver_id: partnerId,
      content: newMessage,
      created_at: new Date().toISOString(),
    },
  ]);
  setNewMessage('');
}
};

if (!partnerProfile) return <p style={styles.loading}>Loading...</p>;

return (
<div style={styles.container}>
{/* Header */}
<div style={styles.header}>
<span style={styles.backArrow} onClick={() => router.back()}>
←
</span>
<img
src={partnerProfile.profile_image_url || 'https://via.placeholder.com/40'}
alt="avatar"
style={styles.avatar}
/>
<p style={styles.partnerName}>{partnerProfile.full_name}</p>
</div>


  {/* Messages */}
  <div style={styles.chatBox}>
    {messages.map((msg, index) => {
      const isSender = msg.sender_id === currentUser?.id;
      return (
        <div
          key={index}
          style={{
            ...styles.messageBubble,
            alignSelf: isSender ? 'flex-end' : 'flex-start',
            backgroundColor: isSender ? '#000' : '#eee',
            color: isSender ? '#fff' : '#000',
          }}
        >
          {msg.content}
        </div>
      );
    })}
    <div ref={messagesEndRef} />
  </div>

  {/* Input */}
  <div style={styles.inputBox}>
    <input
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      placeholder="Type a message..."
      style={styles.input}
    />
    <button onClick={handleSend} style={styles.sendBtn}>
      ➤
    </button>
  </div>
</div>
);
}

const styles: any = {
container: {
backgroundColor: '#fff',
minHeight: '100vh',
display: 'flex',
flexDirection: 'column',
},
header: {
display: 'flex',
alignItems: 'center',
padding: '12px 16px',
borderBottom: '1px solid #eee',
backgroundColor: '#fff',
},
backArrow: {
fontSize: 20,
marginRight: 10,
cursor: 'pointer',
color: '#000',
},
avatar: {
width: 40,
height: 40,
borderRadius: '50%',
objectFit: 'cover',
marginRight: 10,
},
partnerName: {
fontSize: 16,
fontWeight: 'bold',
color: '#000',
},
chatBox: {
flex: 1,
display: 'flex',
flexDirection: 'column',
padding: '12px 16px',
overflowY: 'auto',
},
messageBubble: {
padding: '10px 14px',
borderRadius: 16,
maxWidth: '70%',
marginBottom: 8,
},
inputBox: {
display: 'flex',
padding: 12,
borderTop: '1px solid #eee',
},
input: {
flex: 1,
padding: 10,
borderRadius: 16,
border: '1px solid #ccc',
fontSize: 14,
},
sendBtn: {
marginLeft: 10,
backgroundColor: '#000',
color: '#fff',
border: 'none',
borderRadius: 16,
padding: '10px 14px',
cursor: 'pointer',
},
loading: {
textAlign: 'center',
padding: 40,
},
};