import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../utils/firebase';
import { setDoc, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { avatarList } from '../utils/avatarMap';
import { addDummyUsers } from '../utils/feedData';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('robot'); // default ID
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // LOGIN LOGIC
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } else {
        // SIGNUP LOGIC
        const res = await createUserWithEmailAndPassword(auth, email, password);
        // User data store karein (Avatar ID ke sath)
       await updateDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        displayName: name,
        email,
        avatarId: selectedAvatar, // sirf ID save kar rahe hain assets ke liye
        isOnline: true,
       });
      }   
    } catch (err) {
      alert(err.message);
    }
  };

  
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        {!isLogin && (
          <div className="avatar-selection">
            <p>Choose your Avatar:</p>
            <div className="avatars">
              {avatarList.map((av) => (
                <img 
                  key={av.id} 
                  src={av.src} 
                  className={selectedAvatar === av.id ? 'selected' : ''}
                  onClick={() => setSelectedAvatar(av.id)}
                  alt="avatar" 
                />
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleAuth}>
          {!isLogin && <input type="text" placeholder="Full Name" onChange={(e) => setName(e.target.value)} required />}
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
         <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <p style={{ fontSize: '12px', color: '#666' }}>For Development Only:</p>
        <button 
          onClick={addDummyUsers} 
          style={{ background: '#28a745', fontSize: '12px' }}
        >
          ➕ Add 10 Demo Friends
        </button>
      </div>
        <p onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
};

export default Login;