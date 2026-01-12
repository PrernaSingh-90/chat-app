import React, { useContext, useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { getAvatar } from '../utils/assets';
import './ChatSidebar.css';

const ChatSidebar = ({ onSelectUser, activeUser }) => {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('uid', '!=', currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, [currentUser]);

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <h3>Contacts</h3>
      </div>
      <div className="users-list">
        {users.map(user => (
          <div 
            key={user.uid} 
            className={`sidebar-user ${activeUser?.uid === user.uid ? 'active' : ''}`}
            onClick={() => onSelectUser(user)}
          >
            <img src={getAvatar(user.avatarId)} alt="av" />
            <div className="user-details">
              <h4>{user.displayName}</h4>
              <span className={`status-dot ${user.isOnline ? 'online' : 'offline'}`}>
                {user.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;

