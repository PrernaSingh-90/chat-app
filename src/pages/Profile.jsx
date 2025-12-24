import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../utils/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, setDoc} from "firebase/firestore";
import { avatarMap, avatarList } from "../utils/avatarMap"; // Assets import
import "./Profile.css";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [myPosts, setMyPosts] = useState([]);

  // Edit Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  // 1. Fetch Only My Posts
  useEffect(() => {
    if (!currentUser) return;

    // Default values set karein jab page load ho
    setEditName(currentUser.displayName || "");
    setEditBio(currentUser.bio || "Hello, I am using Social Chat!");
    setEditAvatar(currentUser.avatarId || "default");

    const postsRef = collection(db, "posts");
    // Query: Sirf wahi posts jinki uid current user se match kare
    const q = query(
      postsRef,
      where("uid", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMyPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [currentUser]);

  // 2. Update Profile Function
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return alert("Name cannot be empty");
    try {
      const userRef = doc(db, "users", currentUser.uid);
      
      await setDoc(userRef, {
        displayName: editName,
        bio: editBio || "", // Agar bio empty hai to empty string bhejo
        avatarId: editAvatar || "default", // Agar avatar select nahi kiya to default
        uid: currentUser.uid, // Safety ke liye UID bhi save kar lete hain
        email: currentUser.email // Email bhi save rahega
      }, {merge: true });

      setIsEditing(false); // close model
      alert("Profile Update Successfully")

    } catch (error) {
      console.error("Error updating:", error);
      alert("Error:" + error.message);
    }
  };

  if (!currentUser) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      {/* --- Profile Header --- */}
      <div className="profile-header">
        <div className="cover-photo"></div> {/* Blue background */}
        <div className="profile-info-wrapper">
          <div className="profile-img-container">
            {/* Asset Map se Image */}
            <img
              src={
                avatarMap[currentUser.avatarId]
                  ? avatarMap[currentUser.avatarId]
                  : avatarMap["default"]
              }
              onError={(e) => {
                e.target.src = avatarMap["default"];
              }}
              alt="Profile"
              className="profile-avatar"
            />
          </div>

          <div className="profile-text">
            <h1>{currentUser.displayName}</h1>
            <p className="bio">{currentUser.bio || "No bio added yet."}</p>
            <div className="stats">
              <span>
                <strong>{myPosts.length}</strong> Posts
              </span>
              <span className={`status-badge ${currentUser.isOnline ? 'online' : 'offline'}`}>
                  {currentUser.isOnline ? '● Online' : '○ Offline'} Status
               </span>
            </div>
          </div>

          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* --- Edit Modal (Pop-up) --- */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Profile</h3>
            <form onSubmit={handleUpdateProfile}>

              <div className="form-group">
                <label>Choose Avatar</label>
              <div className="avatar-options">
                {avatarList.map((av) => (
                  <img
                    key={av.id}
                    src={av.src}
                    className={editAvatar === av.id ? "selected" : ""}
                    onClick={() => setEditAvatar(av.id)}
                    alt="select-av"
                  />
                ))}
              </div>
              </div>

              <div className="form-group">
                <label>Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}/>
              </div>
              

              <div className="form-group">
                <label>Bio</label>
              <input
                type="text"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Write Something about youself..."/>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- My Posts Section --- */}
      <div className="my-posts-section">
        <h3>My Posts</h3>
        {myPosts.length === 0 ? (
          <p className="no-posts">You haven't posted anything yet.</p>
        ) : (
          <div className="posts-grid">
            {myPosts.map((post) => (
              <div key={post.id} className="profile-post-card">
                <div className="card-top">
                  <span className="date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="post-text">{post.text}</p>
                <div className="card-bottom">
                  <span>❤️ {post.likes?.length || 0} Likes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
