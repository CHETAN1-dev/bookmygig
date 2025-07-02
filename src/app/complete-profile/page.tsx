'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CompleteProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (!name || !phone) return alert('Please fill all required fields');
    setLoading(true);

    let imageUrl = null;

    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, image, { upsert: true });

      if (uploadError) {
        alert('Image upload failed');
        console.error(uploadError);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        phone,
        profile_image_url: imageUrl,
      })
      .eq('id', userId);

    if (updateError) {
      alert('Profile update failed');
      console.error(updateError);
      setLoading(false);
      return;
    }

    router.push('/');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Complete Your Profile</h2>

        <label style={styles.label}>Full Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          placeholder="Enter your name"
        />

        <label style={styles.label}>Phone Number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
          placeholder="Enter your phone number"
        />

        <label style={styles.label}>Upload Profile Image (optional)</label>
        <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: 12 }} />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 16 }}
          />
        )}

        <button onClick={handleSubmit} disabled={loading} style={styles.button}>
          {loading ? 'Saving...' : 'Save Profile'}
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
    maxWidth: 400,
    width: '90%',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  label: {
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 6,
    display: 'block',
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#000',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 8,
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
  },
};
