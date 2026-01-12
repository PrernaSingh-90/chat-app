import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { auth, db } from '../utils/firebase';
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAvatar } from '../utils/assets';
import './Navbar.css';

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [msgCount, setMsgCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Notification Badge Logic
  useEffect(() => {
    if(!currentUser) return;
    const q = query(
      collection(db, 'messages'), 
      where('receiver', '==', currentUser.uid),
      where('isRead', '==', false) 
    );

    const unsub = onSnapshot(q, (snap) => {
       if (location.pathname === '/chat') {
         setMsgCount(0);
       } else {
         setMsgCount(snap.size); 
       }
    });
    return () => unsub();
  }, [currentUser, location.pathname]); 

  const handleLogout = async () => {
    if (currentUser) {
      await updateDoc(doc(db, "users", currentUser.uid), { isOnline: false });
      await auth.signOut();
      navigate('/login');
    }
  };


  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">SocialApp</Link>
      </div>

      <div className="nav-center">
       <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>🏠 Home</Link>
         <Link to="/chat" className={`nav-link ${location.pathname === '/chat' ? 'active' : ''}`} style={{position:'relative'}}>
           💬 Chat
           {msgCount > 0 && location.pathname !== '/chat' && (
             <span className="nav-badge">{msgCount}</span>
           )}
        </Link>
        <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>👤 Profile</Link>
      </div>

      <div className="nav-right">
        <button onClick={toggleTheme} className="icon-btn">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
         {currentUser && (
          <div className="user-menu">
            <Link to="/profile" className="profile-link">
               <img src={getAvatar(currentUser.avatarId)} alt="user" className="nav-avatar" />
            </Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

