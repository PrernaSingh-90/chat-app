import React, { useContext, useState } from 'react';
import { avatarMap, postImages } from '../utils/avatarMap';
import { auth, db } from '../utils/firebase';
import { AuthContext } from '../context/AuthContext';
import './PostCard.css';
import { arrayRemove, arrayUnion, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const PostCard = ({ post }) => {
  const { currentUser } = useContext(AuthContext);
  const isOwner = currentUser?.uid === post.uid;
  const isLiked = post.likes?.includes(currentUser?.uid);

  // status
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  // 1. Delete Post
  const handleDelete = async() => {
    if(window.confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, 'posts', post.id));
    }
  };

  // 2. Edit post
  const handleEdit = async() => {
    if(!editText.trim() !== '') {
      await updateDoc(doc(db, 'posts', post.id), {
        text: editText
      });
      setIsEditing(false);
    }
  };

  // 3. Like Post
  const handleLike = async() => {
    const postRef = doc(db, 'posts', post.id);
    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
    });
  };

  // 4. Add Comment
  const handleAddComment = async(e) => {
    e.preventDefault();
    if(!commentText.trim()) return;

    const newComment = {
      text: commentText,
      uid: currentUser.uid,
      name: currentUser.displayName,
      avatarId: currentUser.avatarId || 'default',
      time: new Date().toISOString()
    };

    await updateDoc(doc(db, 'posts', post.id), {
      comments: arrayUnion(newComment)
    });
    setCommentText('');
  };

 return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <div className="user-info">
          <img 
            src={avatarMap[post.avatarId] ? avatarMap[post.avatarId] : avatarMap['default']} 
            onError={(e) => { e.target.src = avatarMap['default']; }} 
            alt="User" 
          />
          <div>
             <h4>{post.displayName}</h4>
             <span className="post-time">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Edit/Delete Options (Only for Owner) */}
        {isOwner && (
          <div className="post-options">
            {isEditing ? (
               <>
                 <button onClick={handleEdit} className="save-btn">✅ Save</button>
                 <button onClick={() => setIsEditing(false)} className="cancel-btn">❌</button>
               </>
            ) : (
               <>
                 <button onClick={() => setIsEditing(true)} className="icon-btn-small" title="Edit">✏️</button>
                 <button onClick={handleDelete} className="icon-btn-small delete" title="Delete">🗑️</button>
               </>
            )}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="post-content">
        {isEditing ? (
            <textarea 
               className="edit-input" 
               value={editText} 
               onChange={(e) => setEditText(e.target.value)} 
            />
        ) : (
            <p>{post.text}</p>
        )}
        
        {post.imageIndex !== undefined && post.imageIndex !== null && (
            <div className="post-image-container">
                <img src={postImages[post.imageIndex]} alt="Post" className="post-img-display" />
            </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="post-footer">
        <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          {isLiked ? '❤️' : '🤍'} {post.likes?.length || 0} Likes
        </button>
        
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          💬 {post.comments?.length || 0} Comments
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
            <div className="comments-list">
                {post.comments?.map((c, idx) => (
                    <div key={idx} className="comment-item">
                        <img src={avatarMap[c.avatarId] || avatarMap['default']} alt="av" className="comment-av" />
                        <div className="comment-bubble">
                            <strong>{c.name}</strong>
                            <p>{c.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <form className="comment-input-area" onSubmit={handleAddComment}>
                <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="submit">Post</button>
            </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
