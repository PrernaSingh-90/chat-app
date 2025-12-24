import React, { useState } from 'react';
import {useNavigate, Link} from 'react-router-dom';
import { signup } from '../services/auth';
import './Login.css';

export default function Signup() {
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [avatar,setAvatar] = useState(null);
    const [err,setErr] = useState(null);
    const nav = useNavigate();

    async function handle(e){
     e.preventDefault();
     try{
       await signup({email,password,displayName,avatarFile:avatar});
         nav('/');
     }catch(error){setErr(error.message)}
   }

  return (
    <div className="signup-page">
       <form className="signup-card" onSubmit={handle}>
         <h2>Create account</h2>
         <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Full name" />
         <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
         <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" />
         <label className="file-label">Profile photo
           <input type="file" accept="image/*" onChange={e=>setAvatar(e.target.files[0])} />
         </label>
         <button type="submit">Sign up</button>
         {err && <div className="err">{err}</div>}
         <p>Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}


