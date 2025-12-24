import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { postImages } from "../utils/avatarMap";
import PostCard from "../components/PostCard";
import "./Home.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedImg, setSelectedImg] = useState(null); // photo state
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !selectedImg) return;
    await addDoc(collection(db, "posts"), {
      text: newPost,
      imageIndex: selectedImg, // hum image ka index save kar rahe hau (0,1,2)
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      avatarId: currentUser.avatarId || "default", // ID save kar rahe hain
      likes: [],
      createdAt: new Date().toISOString(),
    });
    setNewPost("");
    setSelectedImg(null);
  };

  const toggleLike = async (postId, likes) => {
    const postRef = doc(db, "posts", postId);
    const isLiked = likes.includes(currentUser.uid);
    await updateDoc(postRef, {
      likes: isLiked
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid),
    });
  };

  // Dummy data generator
  const addDummyData = async () => {
    const dummyPosts = [
      { text: "Loving the weather! 🌧️", img: 0, name: "Rohit", av: "avatar1" },
      { text: "coding late night... 💻", img: 2, name: "Lisa", av: "avatar4" },
      { text: "Coffee Time ☕", img: 1, name: "Aman", av: "avatar8" },
    ];

    dummyPosts.forEach(async (p) => {
      await addDoc(collection(db, "posts"), {
        text: p.text,
        imageIndex: p.img,
        uid: "dummy_user_" + Math.random(),
        displayName: p.name,
        avatarId: p.av,
        likes: [],
        createdAt: new Date().toISOString(),
      });
    });
    alert("Dummy posts added! Refresh maybe.");
  };

  return (
    <div className="home-container">
      {/* Create Post Box */}
      <div className="create-post-box">
        <form onSubmit={handlePost} className="post-form">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={`What's on your mind, ${currentUser?.displayName}?`}
          />

          {/* image selection (Mini Gallery) */}
          <div className="image-selector">
            <p>Add Photo:</p>
            <div className="img-options">
              {postImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className={selectedImg === idx ? "selected" : ""}
                  onClick={() => setSelectedImg(idx)}
                  alt="option"
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!newPost.trim() && selectedImg === null}
          >
            Post
          </button>
        </form>
      </div>

      {/* Button to add fake data (testing ke liye) */}
      <button
        onClick={addDummyData}
        style={{
          marginBottom: 20,
          fontSize: "0.8rem",
          background: "#333",
          color: "#fff",
          padding: "5px 10px",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        + Add Dummy Posts
      </button>
      <div className="feed">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={toggleLike} />
        ))}
      </div>
    </div>
  );
};

export default Home;
