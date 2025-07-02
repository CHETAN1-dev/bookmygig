'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const supabase = createClientComponentClient();

    const [profile, setProfile] = useState<any>(null);
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [services, setServices] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [location, setLocation] = useState('');


    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData.session?.user?.id;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile(data);
                setFullName(data.full_name || '');
                setBio(data.bio || '');
                setPhone(data.phone || '');
                setInstagram(data.instagram_handle || '');
                setServices(data.services?.join(', ') || '');
                setProfileImageUrl(data.profile_image_url || '');
            }
        };

        fetchProfile();
    }, []);
const router = useRouter();

const handleSave = async () => {
if (!profile) return;

const { error } = await supabase.from('profiles').update({
full_name: fullName,
bio,
phone,
location,
instagram_handle: instagram,
services: services.split(',').map(s => s.trim()),
profile_image_url: profileImageUrl,
}).eq('id', profile.id);

if (error) {
setMessage('Update failed.');
} else {
setMessage('Profile updated ✅');
setTimeout(() => {
router.push('/gig-dashboard');
}, 1000); // slight delay to show success message
}
};
    // const handleSave = async () => {
    //     if (!profile) return;

    //     const { error } = await supabase.from('profiles').update({
    //         full_name: fullName,
    //         bio,
    //         phone,
    //         location,
    //         instagram_handle: instagram,
    //         services: services.split(',').map(s => s.trim()),
    //         profile_image_url: profileImageUrl,
    //     }).eq('id', profile.id);

    //     if (error) {
    //         setMessage('Update failed.');
    //     } else {
    //         setMessage('Profile updated ✅');
    //     }
    // };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);

        // const { error: uploadError } = await supabase.storage
        //   .from('avatars')
        //   .upload(filePath, file, { upsert: true });

        // if (uploadError) {
        //   console.error(uploadError);
        //   setUploading(false);
        //   setMessage('Image upload failed.');
        //   return;
        // }
        const result = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        console.log('Upload result:', result);

        if (result.error) {
            console.error('Upload error:', result.error.message);
            setMessage(result.error.message || 'Upload failed.');
            setUploading(false);
            return;
        }

        const { data: publicUrlData } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(filePath);

        setProfileImageUrl(publicUrlData.publicUrl);
        setUploading(false);
    };

    if (!profile) return <p style={{ textAlign: 'center', marginTop: 40 }}>Loading profile...</p>;

    return (
        <div style={styles.container}>
            <div style={styles.box}>
                <h2 style={{ color: '#000', fontSize: 24, marginBottom: 20 }}>
                    Complete Your Profile
                </h2>

                {message && <p style={{ color: 'green', marginBottom: 10 }}>{message}</p>}

                <label style={styles.label}>Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} style={styles.input} />

                <label style={styles.label}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ ...styles.input, height: 80 }} />

                <label style={styles.label}>Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} style={styles.input} />

                <label style={styles.label}>Instagram Handle</label>
                <input value={instagram} onChange={e => setInstagram(e.target.value)} style={styles.input} />

                <label style={styles.label}>Services (comma-separated)</label>
                <input value={services} onChange={e => setServices(e.target.value)} style={styles.input} />

                <label style={styles.label}>Location</label>
                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={styles.input}
                />

                <label style={styles.label}>Profile Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: 15 }} />
                {uploading && <p>Uploading...</p>}
                {profileImageUrl && (
                    <img src={profileImageUrl} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', marginBottom: 15 }} />
                )}

                <button onClick={handleSave} style={styles.button}>
                    Save Profile
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: 20,
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f7f7f7',
        minHeight: '100vh',
    },
    box: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        maxWidth: 500,
        width: '100%',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    },
    label: {
        color: '#000',
        fontWeight: 'bold',
        marginBottom: 4,
        display: 'block',
    },
    input: {
        width: '100%',
        padding: 12,
        marginBottom: 15,
        borderRadius: 8,
        border: '1px solid #ccc',
        fontSize: 14,
    },
    button: {
        width: '100%',
        padding: 12,
        backgroundColor: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        fontWeight: 'bold',
        fontSize: 16,
        cursor: 'pointer',
    },
};
