'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import BackHeader from '@/app/component/Backheader';
import { checkUserAndProfile } from '../../../../utils/checkUserAcess';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [datesConfirmed, setDatesConfirmed] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);
  const [note, setNote] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });



  const handleBookNow = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // ✅ User is logged in – proceed to show calendar
    setShowCalendar(true);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. Fetch current logged-in user's profile
      if (user) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setCurrentUserProfile(myProfile); // 👈 don't forget useState
      }

      // 3. Fetch gig worker profile using [id]
      const { data: gigProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();



      if (gigProfile) setProfile(gigProfile);

      setLoading(false);
    };

    if (id) fetchProfile();
  }, [id]);


  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     const { data } = await supabase
  //       .from('profiles')
  //       .select('*')
  //       .eq('id', id)
  //       .single();
  //     if (data) setProfile(data);
  //     setLoading(false);
  //   };

  //   if (id) fetchProfile();
  // }, [id]);

  const getDurationInDays = () => {
    const ms = selectedRange.endDate.getTime() - selectedRange.startDate.getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  };

  const handleBookingSubmit = async () => {
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Please login to book.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('bookings').insert({
      gig_worker_id: id,
      user_id: user.id,
      start_date: selectedRange.startDate.toISOString().split('T')[0],
      end_date: selectedRange.endDate.toISOString().split('T')[0],
      duration: getDurationInDays(),
      note,
      contact,
    });

    if (error) {
      console.error('Booking error:', error);
      alert('Booking failed.');
    } else {
      setBookingSent(true);
    }

    setSubmitting(false);
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 40 }}>Loading profile...</p>;
  if (!profile) return <p style={{ textAlign: 'center', marginTop: 40 }}>Profile not found.</p>;

  return (

    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.headerRow}>
          <div style={styles.infoColumn}>
            <h1 style={styles.name}>{profile.full_name}</h1>
            {profile.instagram_handle && (
              <p style={styles.handle}>📸 @{profile.instagram_handle.replace('@', '')}</p>
            )}
            {profile.services?.length > 0 && (
              <p style={styles.service}>🎵 {profile.services.join(', ')}</p>
            )}
            {profile.location && (
              <p style={styles.service}>📍 {profile.location}</p>
            )}

          </div>
          <img
            src={profile.profile_image_url || 'https://via.placeholder.com/100'}
            alt="Profile"
            style={styles.profileSmall}
          />
        </div>
        {profile.bio && (
          <>
            <h3 style={styles.subheading}>Bio</h3>
            <p style={styles.bioText}>{profile.bio}</p>
          </>
        )}

        {!datesConfirmed && !showCalendar && (
          // <button style={styles.button} onClick={() => setShowCalendar(true)}>
          //   Book Now
          // </button>
          <button
            style={styles.button}
            onClick={handleBookNow}
          >
            Book Now
          </button>

        )}

        {showCalendar && (
          <div style={styles.calendarOverlay}>
            <div style={styles.calendarPopup}>
              <DateRange
                editableDateInputs={true}
                onChange={(ranges) => setSelectedRange(ranges.selection)}
                moveRangeOnFirstSelection={false}
                ranges={[selectedRange]}
              />
              <p style={styles.duration}>
                📅 Duration: {getDurationInDays()} day(s)
              </p>
              <button
                style={styles.confirmBtn}
                onClick={() => {
                  setDatesConfirmed(true);
                  setShowCalendar(false);
                }}
              >
                Confirm Dates
              </button>
            </div>
          </div>
        )}

        {datesConfirmed && (
          <>
            <div style={styles.bookingDetails}>
              <h3 style={styles.bookingTitle}>Booking Details</h3>
              <div style={styles.bookingItem}>
                <strong>📅 From:</strong> {selectedRange.startDate.toDateString()}
              </div>
              <div style={styles.divider} />
              <div style={styles.bookingItem}>
                <strong>📅 To:</strong> {selectedRange.endDate.toDateString()}
              </div>
              <div style={styles.divider} />
              <div style={styles.bookingItem}>
                <strong>⏳ Duration:</strong> {getDurationInDays()} day(s)
              </div>
              <div style={styles.divider} />
            </div>

            {bookingSent ? (
              <p style={styles.successMessage}>
                ✅ Booking request is sent.<br />
                Waiting for the gig to accept the request.<br />
                We’ll notify you.
              </p>
            ) : (
              <>
                <textarea
                  placeholder="Add a note or special request"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={styles.textarea}
                />
                <input
                  type="text"
                  placeholder="Your phone or email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  style={styles.input}
                />
                <button
                  style={styles.confirmBtn}
                  disabled={submitting}
                  onClick={handleBookingSubmit}
                >
                  📩 Send Booking Request
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
  },
  headerWrapper: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 12,
  },
  boxWrapper: {
    marginTop: 12,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },

  box: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    maxWidth: 500,
    width: '100%',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoColumn: {
    textAlign: 'left' as const,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    margin: 0,
  },
  handle: {
    fontSize: 14,
    color: '#444',
    margin: '4px 0',
  },
  service: {
    fontSize: 14,
    color: '#444',
  },
  profileSmall: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  subheading: {
    fontSize: 18,
    color: '#000',
    marginBottom: 8,
    marginTop: 20,
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 1.5,
  },
  button: {
    marginTop: 20,
    padding: 12,
    width: '100%',
    backgroundColor: '#000',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 8,
    fontSize: 16,
    cursor: 'pointer',
    border: 'none',
  },
  calendarOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(5px)',
    zIndex: 999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarPopup: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    width: '90%',
    maxWidth: 400,
  },
  duration: {
    color: '#000',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmBtn: {
    marginTop: 16,
    padding: 10,
    width: '100%',
    backgroundColor: '#000',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 8,
    fontSize: 16,
    border: 'none',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ccc',
    marginTop: 16,
    resize: 'vertical' as const,
    minHeight: 60,
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ccc',
    marginTop: 12,
    fontSize: 14,
  },
  bookingDetails: {
    textAlign: 'left' as const,
    marginTop: 24,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  bookingItem: {
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    margin: '8px 0',
  },
  successMessage: {
    backgroundColor: '#e6ffe6',
    color: '#006400',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center' as const,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    lineHeight: 1.6,
  },
};
