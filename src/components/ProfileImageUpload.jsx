import React, { useState } from 'react';

function ProfileImageUpload({ user, onImageUpdate }) {
  // Helper to get correct image src
  const getImageSrc = (imgPath) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http')) return imgPath;
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}${imgPath}`;
  };
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', image);
    formData.append('userId', user._id);
    try {
      const res = await fetch('/api/users/profile-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setPreview(data.imageUrl);
        if (onImageUpdate) onImageUpdate(data.imageUrl);
      } else {
        setError('Upload failed.');
      }
    } catch (err) {
      setError('Error uploading image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
  <img src={getImageSrc(preview)} alt="Profile" style={{ width: 120, height: 120, borderRadius: '50%' }} />
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default ProfileImageUpload;
