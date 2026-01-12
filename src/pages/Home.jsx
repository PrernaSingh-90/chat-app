import React, { useState, useEffect, useContext } from 'react';
import { db } from '../utils/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { postImages } from '../utils/assets';
import PostCard from '../components/PostCard';
import './Home.css';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handlePost = async () => {
    if(!text && selectedImg === null) return;
    
    await addDoc(collection(db, 'posts'), {
      text,
      imgIndex: selectedImg,
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      avatarId: currentUser.avatarId,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    });
    setText('');
    setSelectedImg(null);
  };

  // ONE TIME USE: Reset Feed Button Logic
  const resetFeed = async () => {
    if(!confirm("Are you sure? Old posts will be deleted and 5 fresh posts will be added.")) return;
    const snapshot = await getDocs(collection(db, "posts"));
    snapshot.forEach(async (d) => {
      await deleteDoc(doc(db, "posts", d.id));
    });

    const dummyPosts = [
      { name: "Shurti Sharma", text: "Loving the view! 🏔️", av: 0, img: 6 }, // girl
      { name: "Rahul Verma", text: "Coffee time ☕", av: 5, img: 4 }, // boy
      { name: "Amit Singh", text: "Beautiful Flower 🌺", av: 2, img: 0 }, // Boy
      { name: "Sneha Gupta", text: "Coding late night 💻", av: 6, img: 5 }, // Girl
      { name: "saina Malhotra", text: "Nature is beautiful 🌿", av: 3, img: 6 } // girl
    ];

    dummyPosts.forEach(async (p) => {
      await addDoc(collection(db, "posts"), {
        text: p.text,
        imgIndex: p.img,
        uid: "dummy_uid_" + p.name,
        displayName: p.name,
        avatarId: p.av, 
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      });
    });
    
    alert("Feed Reset Successfully!");
  };

  return (
    <div className="home-container">
      
      {/* Create Post Box */}
      <div className="create-post-card">
        <div className="input-section">
           <textarea 
             placeholder={`What's on your mind, ${currentUser?.displayName}?`} 
             value={text} 
             onChange={(e)=>setText(e.target.value)} 
           />
        </div>
        
        {/* Image Selection Strip */}
        <div className="img-strip">
          {postImages.map((img, i) => (
            <img 
              key={i} src={img} 
              className={`select-img ${selectedImg === i ? 'active' : ''}`} 
              onClick={() => setSelectedImg(i)} 
            />
          ))}
        </div>

        <div className="post-actions">
           {/* Temporary Reset Button (Development Only) */}
           {/* <button onClick={resetFeed} style={{background:'red', fontSize:'0.7rem'}}>⚠ Reset Feed</button> */}
           
           <button className="post-btn" onClick={handlePost} disabled={!text && selectedImg === null}>
             Post
           </button>
        </div>
      </div>

      {/* Feed */}
      <div className="feed-list">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
};
export default Home;
