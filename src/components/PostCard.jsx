import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAvatar, postImages } from '../utils/assets';
import './PostCard.css';

const PostCard = ({ post }) => {
  const { currentUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // 3-Dots Toggle

  const isOwner = currentUser?.uid === post.uid;
  const isLiked = post.likes?.includes(currentUser?.uid);

  const handleLike = async () => {
    const postRef = doc(db, 'posts', post.id);
    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
    });
  };

  const handleDelete = async () => {
    if(confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, 'posts', post.id));
    }
  };

  const handleUpdate = async () => {
    await updateDoc(doc(db, 'posts', post.id), { text: editText });
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if(!commentText.trim()) return;
    const newComment = {
      text: commentText,
      uid: currentUser.uid,
      name: currentUser.displayName,
      avatarId: currentUser.avatarId,
      createdAt: new Date().toISOString()
    };
    await updateDoc(doc(db, 'posts', post.id), {
      comments: arrayUnion(newComment)
    });
    setCommentText('');
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="user-info">
          <img src={getAvatar(post.avatarId)} alt="user" className="avatar-small" />
          <div>
            <h4>{post.displayName}</h4>
            <span className="time">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* 3-Dots Menu Logic */}
        {isOwner && (
          <div className="menu-container">
            <button className="dots-btn" onClick={() => setShowMenu(!showMenu)}>⋮</button>
            {showMenu && (
              <div className="menu-dropdown">
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>✏️ Edit</button>
                <button onClick={handleDelete} style={{color:'red'}}>🗑️ Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-body">
        {isEditing ? (
          <div className="edit-box">
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
            <div className="edit-actions">
                <button onClick={handleUpdate} className="save-btn">Save</button>
                <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="post-text">{post.text}</p>
        )}
        
        {post.imgIndex !== undefined && post.imgIndex !== null && (
          <img src={postImages[post.imgIndex]} alt="Post" className="post-image" />
        )}
      </div>

      <div className="post-footer">
        <button className={`btn-action ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          {isLiked ? '❤️' : '🤍'} {post.likes?.length || 0} Likes
        </button>
        <button className="btn-action" onClick={() => setShowComments(!showComments)}>
          💬 {post.comments?.length || 0} Comments
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {post.comments?.map((c, i) => (
            <div key={i} className="comment">
              <img src={getAvatar(c.avatarId)} alt="av" />
              <div className="bubble">
                <strong>{c.name}</strong>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} className="comment-input">
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." />
            <button type="submit">➤</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;