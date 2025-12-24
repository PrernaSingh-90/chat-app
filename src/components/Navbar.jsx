import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { auth, db } from '../utils/firebase';
import './Navbar.css';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';

const Navbar = () => {
  const { toggleTheme, theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0); // new state for badge

  // Listener: check unread messages
  useEffect(() => {
    if(!currentUser) return;
    // Query: Messages jahan Receiver main hu, aur Read 'false' hai
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', currentUser.uid),
      where('read', '==', false) // sirf bina padhe hua messages
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length); // count update karo
    });
    return () => unsub();
  }, [currentUser]);

  const handleLogout = async() => {
    if(auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isOnline: false
      });
      await auth.signOut();
    }
  };

  return (
    <nav className='navbar'>
      <h2 className='logo'>SocialApp</h2>

      <div className="nav-items">
        <Link to="/" className='nav-link'>Home</Link>

        {/* Chat Link with badge */}
        <div className="nav-icon-container">
        <Link to="/chat" className='nav-link'>Chat</Link>
        {unreadCount > 0 && <span className='notif-badge'>{unreadCount}</span>}
        </div>

        <Link to="/profile" className='nav-link'>Profile</Link>

        <div className="controls">
          <button onClick={toggleTheme} className='icon-btn' title='Toggle Theme'>
          {theme === "light" ? '🌙' : '☀️'}
        </button>
        {currentUser && 
        <button onClick={handleLogout} className='logout-btn'>Logout</button>
        }
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
