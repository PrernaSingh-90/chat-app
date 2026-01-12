import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { getAvatar, avatars } from '../utils/assets';
import PostCard from '../components/PostCard';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [myPosts, setMyPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit States
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newAvatar, setNewAvatar] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setNewName(currentUser.displayName);
      setNewBio(currentUser.bio || '');
      setNewAvatar(currentUser.avatarId || 0);
      const q = query(collection(db, 'posts'), where('uid', '==', currentUser.uid), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        setMyPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsub();
    }
  }, [currentUser]);


  const handleSaveProfile = async () => {
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      displayName: newName,
      bio: newBio,
      avatarId: newAvatar
    });
    setIsEditing(false);
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="cover-photo"></div>
        <div className="profile-info">
          <img src={getAvatar(currentUser.avatarId)} alt="Profile" className="profile-pic" />
          <div className="info-text">
            <h1>{currentUser.displayName}</h1>
            <p className="bio">{currentUser.bio || "No bio available"}</p>
            <div className="stats">
              <span><strong>{myPosts.length}</strong> Posts</span>
              <span><strong>120</strong> Followers</span>
              <span><strong>80</strong> Following</span>
            </div>
          </div>
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Profile</h3>
            <div className="avatar-select">
              {avatars.map((av, i) => (
                <img key={i} src={av} className={newAvatar === i ? 'selected' : ''} onClick={() => setNewAvatar(i)} />
              ))}
            </div>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" />
            <textarea value={newBio} onChange={(e) => setNewBio(e.target.value)} placeholder="Bio" />
            <div className="modal-actions">
              <button onClick={handleSaveProfile}>Save</button>
              <button onClick={() => setIsEditing(false)} className="cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* User's Posts */}
      <div className="my-posts">
        <h3>My Posts</h3>
        {myPosts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
};

export default Profile;
