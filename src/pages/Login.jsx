import React, { useState } from 'react';
import { auth, db } from '../utils/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { avatars } from '../utils/assets';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [data, setData] = useState({ name: '', email: '', password: '' });
  const [selectedAv, setSelectedAv] = useState(0);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault(); 
    console.log("Button Clicked!", data); 

    if (!data.email || !data.password) {
      alert("Please enter Email and Password");
      return;
    }

    setLoading(true); 
    try {
      if (isRegister) {
        console.log("Creating Account...");
        const res = await createUserWithEmailAndPassword(auth, data.email, data.password);
        
        console.log("Account Created! Saving Data...");
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          displayName: data.name || "User",
          email: data.email,
          avatarId: selectedAv,
          isOnline: true,
          bio: "Hey there! I am using SocialApp."
        });
      } else {
        console.log("Logging In...");
        await signInWithEmailAndPassword(auth, data.email, data.password);
      }
      
      console.log("Success! Navigating...");
      window.location.href = '/'; 
      
    } catch (err) {
      console.error("Firebase Error:", err);
      alert("Error: " + err.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="auth-box">
        <h2>{isRegister ? "Join SocialApp" : "Welcome Back"}</h2>
        <form onSubmit={handleAuth}>
          {isRegister && (
            <>
              <div className="avatar-grid">
                {avatars.map((img, idx) => (
                  <img 
                    key={idx} src={img} 
                    className={selectedAv === idx ? "selected" : ""} 
                    onClick={() => setSelectedAv(idx)} 
                  />
                ))}
              </div>
              <input 
                type="text" placeholder="Full Name" 
                value={data.name}
                onChange={(e)=>setData({...data, name:e.target.value})} 
                required 
              />
            </>
          )}
          <input 
            type="email" placeholder="Email" 
            value={data.email}
            onChange={(e)=>setData({...data, email:e.target.value})} 
            required 
          />
          <input 
            type="password" placeholder="Password" 
            value={data.password}
            onChange={(e)=>setData({...data, password:e.target.value})} 
            required 
          />
          
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : (isRegister ? "Sign Up" : "Login")}
          </button>
        </form>
        <p onClick={() => setIsRegister(!isRegister)} style={{cursor: 'pointer', marginTop: '10px', color: 'blue'}}>
          {isRegister ? "Already have account? Login" : "New here? Create Account"}
        </p>
      </div>
    </div>
  );
};
export default Login;
