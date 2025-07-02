'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function BookingsPage() {
    const supabase = createClientComponentClient();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const fetchBookings = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            //   const { data, error } = await supabase
            //     .from('bookings')
            //     .select('*, user:profiles(*)') // joins sender info
            //     .eq('gig_worker_id', user.id)
            //     .order('created_at', { ascending: false });
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('gig_worker_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setBookings(data);
            setLoading(false);
        };

        fetchBookings();
    }, []);

    // const updateStatus = async (bookingId: string, newStatus: string) => {
    //     await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    //     setBookings((prev) =>
    //         prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    //     );
    //     setShowModal(false);
    // };

    const updateStatus = async (bookingId: string, newStatus: string) => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Update booking status
        const { data: updatedBookingData, error: updateError } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', bookingId)
            .select()
            .single();

        if (updateError) {
            console.error('Failed to update booking status:', updateError.message);
            return;
        }

        // Fetch gig worker's name (you)
        const { data: gigProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        const gigName = gigProfile?.full_name || 'Gig Worker';

        if (newStatus === 'accepted') {
            // Auto message logic
            const messageText = ` Hey, ${gigName} just accepted your booking request. You can chat here for any further update!`;
            const { error: messageError } = await supabase.from('messages').insert({
                sender_id: user.id,
                receiver_id: updatedBookingData.user_id,
                content: messageText,
            });

            if (messageError) {
                console.error('Failed to send auto-message:', messageError.message);
            }
        }

        // Update UI
        setBookings((prev) =>
            prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        setShowModal(false);
    };


    if (loading) return <p style={styles.center}>Loading bookings...</p>;
    if (bookings.length === 0) return <p style={styles.center}>No bookings found.</p>;

    return (
        <div style={styles.container}>
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#000',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                }}
                onClick={() => router.push('/gig-profile')}
            >
                👤
            </div>

            <h2 style={styles.heading}>📋 Booking Requests</h2>

            {bookings.map((booking) => (
                <div
                    key={booking.id}
                    style={styles.card}
                    onClick={() => {
                        setSelectedBooking(booking);
                        setShowModal(true);
                    }}
                >
                    <p><strong>From:</strong> {booking.start_date}</p>
                    <p><strong>To:</strong> {booking.end_date}</p>
                    <p><strong>Duration:</strong> {booking.duration} day(s)</p>
                    <p><strong>Status:</strong> {booking.status}</p>
                </div>
            ))}

            {showModal && selectedBooking && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <button onClick={() => setShowModal(false)} style={styles.modalClose}>✖</button>

                        {/* Avatar */}
                        {selectedBooking.user?.profile_image_url ? (
                            <img src={selectedBooking.user.profile_image_url} alt="User" style={styles.modalAvatar} />
                        ) : (
                            <div style={styles.modalPlaceholder}>👤</div>
                        )}

                        <h3>{selectedBooking.user?.full_name || 'Unnamed User'}</h3>
                        <p><strong>📞 Contact:</strong> {selectedBooking.contact || 'N/A'}</p>
                        <p><strong>📧 Email:</strong> {selectedBooking.user?.email || 'N/A'}</p>
                        <p><strong>📝 Note:</strong> {selectedBooking.note || 'None'}</p>
                        <p><strong>📅 From:</strong> {selectedBooking.start_date}</p>
                        <p><strong>📅 To:</strong> {selectedBooking.end_date}</p>
                        <p><strong>⏳ Duration:</strong> {selectedBooking.duration} day(s)</p>
                        <p><strong>Status:</strong> {selectedBooking.status}</p>

                        {selectedBooking.status === 'pending' && (
                            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                                <button
                                    onClick={() => updateStatus(selectedBooking.id, 'accepted')}
                                    style={{ ...styles.button, backgroundColor: '#0a0' }}
                                >
                                    ✅ Accept
                                </button>
                                <button
                                    onClick={() => updateStatus(selectedBooking.id, 'rejected')}
                                    style={{ ...styles.button, backgroundColor: '#a00' }}
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles: any = {
    container: {
        padding: 20,
        maxWidth: 600,
        margin: '0 auto',
        backgroundColor: '#fff',  // 💥
        minHeight: '100vh',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000'
    },
    card: {
        backgroundColor: '#111',  // Dark card
        color: '#fff',
        padding: 16,
        borderRadius: 8,
        boxShadow: '0 2px 6px rgba(255,255,255,0.1)', // light glow
        marginBottom: 20,
        cursor: 'pointer',
    },
    center: {
        textAlign: 'center',
        marginTop: 40,
    },
    button: {
        padding: 10,
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontWeight: 'bold',
        cursor: 'pointer',
        flex: 1,
    },

    // Modal styles
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    modalContent: {
        backgroundColor: '#000',       // black bg
        color: '#fff',                 // white text
        padding: 20,
        borderRadius: 12,
        maxWidth: 400,
        width: '90%',
        textAlign: 'center',
        position: 'relative',
    },
    modalClose: {
        position: 'absolute',
        top: 10,
        right: 10,
        fontSize: 18,
        border: 'none',
        backgroundColor: 'transparent',
        color: '#f44336',                // make visible on dark bg
        cursor: 'pointer',
    },
    modalAvatar: {
        width: 80,
        height: 80,
        borderRadius: '50%',
        objectFit: 'cover',
        marginBottom: 12,
    },
    modalPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: '50%',
        backgroundColor: '#333',     // dark gray
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        marginBottom: 12,
        color: '#fff',               // 👤 visible
    }

};
