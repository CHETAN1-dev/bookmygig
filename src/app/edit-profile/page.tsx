'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function EditProfilePage() {
const supabase = createClientComponentClient();

const [name, setName] = useState('');
const [bio, setBio] = useState('');
const [contact, setContact] = useState('');
const [services, setServices] = useState<string[]>([]);
const [imageUrl, setImageUrl] = useState('');
const [userId, setUserId] = useState('');
const [uploading, setUploading] = useState(false);
const [success, setSuccess] = useState(false);
const [profileUpdated, setProfileUpdated] = useState(false);

const genreOptions = [
'Rock', 'Funk', 'Jazz', 'Classical', 'Indie', 'Pop', 'Indian Classical'
];

useEffect(() => {
const fetchData = async () => {
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;
  setUserId(user.id);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (data) {
    setName(data.full_name || '');
    setBio(data.bio || '');
    setContact(data.contact || '');
    setServices(data.services || []);
    setImageUrl(data.profile_image_url || '');
  }
};

fetchData();
}, []);

const handleUpload = async (e: any) => {
const file = e.target.files[0];
if (!file) return;
setUploading(true);

const filePath = `avatars/${userId}-${Date.now()}`;
const { data, error } = await supabase.storage
  .from('avatar')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });

if (!error) {
  const { data: publicUrlData } = supabase
    .storage
    .from('avatar')
    .getPublicUrl(filePath);

  setImageUrl(publicUrlData.publicUrl);
}

setUploading(false);
};

const handleToggleGenre = (genre: string) => {
if (services.includes(genre)) {
setServices(services.filter(g => g !== genre));
} else {
setServices([...services, genre]);
}
};

const handleSubmit = async () => {
if (!userId) return;
const { error } = await supabase
  .from('profiles')
  .update({
    full_name: name,
    bio,
    contact,
    services,
    profile_image_url: imageUrl,
  })
  .eq('id', userId);

if (!error) {
  setSuccess(true);
  setProfileUpdated(true);
  setTimeout(() => {
    setSuccess(false);
    // setProfileUpdated(false); // Optional: reset form
  }, 3000);
}
};

return (
<div style={styles.container}>
<h2 style={styles.heading}>🎨 Edit Profile</h2>
  {!profileUpdated && (
    <>
      <label style={styles.label}>Profile Image</label>
      <div style={styles.imageUpload}>
        {imageUrl ? (
          <img src={imageUrl} style={styles.avatar} />
        ) : (
          <div style={styles.placeholder}>👤</div>
        )}
        <input type="file" onChange={handleUpload} style={styles.fileInput} />
      </div>

      <label style={styles.label}>Name</label>
      <input value={name} onChange={e => setName(e.target.value)} style={styles.input} />

      <label style={styles.label}>Contact (Phone or Email)</label>
      <input value={contact} onChange={e => setContact(e.target.value)} style={styles.input} />

      <label style={styles.label}>Bio</label>
      <textarea value={bio} onChange={e => setBio(e.target.value)} style={styles.textarea} />

      <label style={styles.label}>Services / Genres</label>
      <div style={styles.genreGrid}>
        {genreOptions.map((genre, i) => (
          <div
            key={i}
            onClick={() => handleToggleGenre(genre)}
            style={{
              ...styles.genreItem,
              backgroundColor: services.includes(genre) ? '#000' : '#eee',
              color: services.includes(genre) ? '#fff' : '#000',
            }}
          >
            {genre}
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} style={styles.button} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Update Profile'}
      </button>
    </>
  )}

  {success && (
    <div style={{
      marginTop: 16,
      backgroundColor: '#d4edda',
      color: '#155724',
      padding: '10px 14px',
      borderRadius: 8,
      textAlign: 'center',
      fontWeight: 'bold',
    }}>
      ✅ Profile updated successfully!
    </div>
  )}
</div>
);
}

const styles: any = {
container: {
padding: 20,
maxWidth: 500,
margin: '0 auto',
backgroundColor: '#f9f9f9',
minHeight: '100vh',
},
heading: {
fontSize: 24,
fontWeight: 'bold',
marginBottom: 20,
textAlign: 'center',
color: '#000',
},
label: {
fontWeight: 'bold',
color: '#000',
marginTop: 16,
marginBottom: 6,
display: 'block',
},
input: {
width: '100%',
padding: 10,
borderRadius: 8,
border: '1px solid #ccc',
fontSize: 14,
},
textarea: {
width: '100%',
padding: 10,
borderRadius: 8,
border: '1px solid #ccc',
fontSize: 14,
minHeight: 80,
resize: 'vertical',
},
genreGrid: {
display: 'flex',
flexWrap: 'wrap',
gap: 10,
marginTop: 10,
marginBottom: 20,
},
genreItem: {
padding: '8px 14px',
borderRadius: 20,
border: '1px solid #000',
cursor: 'pointer',
fontSize: 14,
},
button: {
width: '100%',
backgroundColor: '#000',
color: '#fff',
fontWeight: 'bold',
padding: 12,
fontSize: 16,
borderRadius: 8,
border: 'none',
cursor: 'pointer',
marginTop: 20,
},
imageUpload: {
display: 'flex',
alignItems: 'center',
gap: 12,
marginBottom: 10,
},
avatar: {
width: 60,
height: 60,
borderRadius: '50%',
objectFit: 'cover',
},
placeholder: {
width: 60,
height: 60,
borderRadius: '50%',
backgroundColor: '#ddd',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
fontSize: 28,
},
fileInput: {
fontSize: 14,
},
};



// 'use client';

// import { useEffect, useState } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// export default function EditProfilePage() {
//   const supabase = createClientComponentClient();

//   const [name, setName] = useState('');
//   const [bio, setBio] = useState('');
//   const [contact, setContact] = useState('');
//   const [services, setServices] = useState<string[]>([]);
//   const [imageUrl, setImageUrl] = useState('');
//   const [userId, setUserId] = useState('');
//   const [uploading, setUploading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const genreOptions = [
//     'Rock', 'Funk', 'Jazz', 'Classical', 'Indie', 'Pop', 'Indian Classical'
//   ];

//   useEffect(() => {
//     const fetchData = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) return;

//       setUserId(user.id);

//       const { data, error } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', user.id)
//         .single();

//       if (data) {
//         setName(data.full_name || '');
//         setBio(data.bio || '');
//         setContact(data.contact || '');
//         setServices(data.services || []);
//         setImageUrl(data.profile_image_url || '');
//       }
//     };

//     fetchData();
//   }, []);

//   const handleUpload = async (e: any) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setUploading(true);

//     const filePath = `avatars/${userId}-${Date.now()}`;
//     const { data, error } = await supabase.storage
//       .from('avatar')
//       .upload(filePath, file, {
//         cacheControl: '3600',
//         upsert: true,
//       });

//     if (!error) {
//       const { data: publicUrlData } = supabase
//         .storage
//         .from('avatar')
//         .getPublicUrl(filePath);

//       setImageUrl(publicUrlData.publicUrl);
//     }

//     setUploading(false);
//   };

//   const handleToggleGenre = (genre: string) => {
//     if (services.includes(genre)) {
//       setServices(services.filter(g => g !== genre));
//     } else {
//       setServices([...services, genre]);
//     }
//   };
// useEffect(() => {
//   console.log('Selected services:', services);
// }, [services]);

// const handleSubmit = async () => {
//   console.log('Submitting profile...');
//   if (!userId) {
//     console.log('No userId found');
//     return;
//   }

//   const { error } = await supabase
//     .from('profiles')
//     .update({
//       full_name: name,
//       bio,
//       contact,
//       services,
//       profile_image_url: imageUrl,
//     })
//     .eq('id', userId);

//   if (error) {
//     console.error('Update failed:', error.message);
//   } else {
//     console.log('Profile updated successfully');
//     setSuccess(true);
//     setTimeout(() => setSuccess(false), 3000);
//   }
// };
//   return (
//     <div style={styles.container}>
//       <h2 style={styles.heading}>🎨 Edit Profile</h2>

//       <label style={styles.label}>Profile Image</label>
//       <div style={styles.imageUpload}>
//         {imageUrl ? (
//           <img src={imageUrl} style={styles.avatar} />
//         ) : (
//           <div style={styles.placeholder}>👤</div>
//         )}
//         <input type="file" onChange={handleUpload} style={styles.fileInput} />
//       </div>

//       <label style={styles.label}>Name</label>
//       <input value={name} onChange={e => setName(e.target.value)} style={styles.input} />

//       <label style={styles.label}>Contact (Phone or Email)</label>
//       <input value={contact} onChange={e => setContact(e.target.value)} style={styles.input} />

//       <label style={styles.label}>Bio</label>
//       <textarea value={bio} onChange={e => setBio(e.target.value)} style={styles.textarea} />

//       <label style={styles.label}>Services / Genres</label>
//       <div style={styles.genreGrid}>
//         {genreOptions.map((genre, i) => (
//           <div
//             key={i}
//             onClick={() => handleToggleGenre(genre)}
//             style={{
//               ...styles.genreItem,
//               backgroundColor: services.includes(genre) ? '#000' : '#eee',
//               color: services.includes(genre) ? '#fff' : '#000',
//             }}
//           >
//             {genre}
//           </div>
//         ))}
//       </div>

//       <button onClick={handleSubmit} style={styles.button} disabled={uploading}>
//         {uploading ? 'Uploading...' : 'Update Profile'}
//       </button>

//       {
//   success && (
//     <div style={{
//       marginTop: 16,
//       backgroundColor: '#d4edda',
//       color: '#155724',
//       padding: '10px 14px',
//       borderRadius: 8,
//       textAlign: 'center',
//       fontWeight: 'bold',
//     }}>
//       ✅ Profile updated successfully!
//     </div>
//   )
// }

//     </div>
//   );
// }

// const styles: any = {
//   container: {
//     padding: 20,
//     maxWidth: 500,
//     margin: '0 auto',
//     backgroundColor: '#f9f9f9',
//     minHeight: '100vh',
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#000',
//   },
//   label: {
//     fontWeight: 'bold',
//     color: '#000',
//     marginTop: 16,
//     marginBottom: 6,
//     display: 'block',
//   },
//   input: {
//     width: '100%',
//     padding: 10,
//     borderRadius: 8,
//     border: '1px solid #ccc',
//     fontSize: 14,
//   },
//   textarea: {
//     width: '100%',
//     padding: 10,
//     borderRadius: 8,
//     border: '1px solid #ccc',
//     fontSize: 14,
//     minHeight: 80,
//     resize: 'vertical',
//   },
//   genreGrid: {
//     display: 'flex',
//     flexWrap: 'wrap',
//     gap: 10,
//     marginTop: 10,
//     marginBottom: 20,
//   },
//   genreItem: {
//     padding: '8px 14px',
//     borderRadius: 20,
//     border: '1px solid #000',
//     cursor: 'pointer',
//     fontSize: 14,
//   },
//   button: {
//     width: '100%',
//     backgroundColor: '#000',
//     color: '#fff',
//     fontWeight: 'bold',
//     padding: 12,
//     fontSize: 16,
//     borderRadius: 8,
//     border: 'none',
//     cursor: 'pointer',
//     marginTop: 20,
//   },
//   imageUpload: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 10,
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: '50%',
//     objectFit: 'cover',
//   },
//   placeholder: {
//     width: 60,
//     height: 60,
//     borderRadius: '50%',
//     backgroundColor: '#ddd',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: 28,
//   },
//   fileInput: {
//     fontSize: 14,
//   },
//   success: {
//     marginTop: 12,
//     color: 'green',
//     textAlign: 'center',
//   },
// };
