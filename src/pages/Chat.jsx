import React, { useState, useEffect, useContext, useRef } from 'react';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy, doc, updateDoc, setDoc, or, and, getDocs, deleteDoc } from 'firebase/firestore'; 
import { AuthContext } from '../context/AuthContext';
import { getAvatar } from '../utils/assets'; 
import './Chat.css';

const Chat = () => {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);          
  const [selectedUser, setSelectedUser] = useState(null); 
  const [messages, setMessages] = useState([]);    
  const [text, setText] = useState('');  
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const scrollRef = useRef(); 

  // 1. Fetch Users
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users'), where('uid', '!=', currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, [currentUser]);

  // 2. Fetch Messages
  useEffect(() => {
    if (!selectedUser) return;

    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      const chatMsgs = allMsgs.filter(m => 
        (m.sender === currentUser.uid && m.receiver === selectedUser.uid) ||
        (m.sender === selectedUser.uid && m.receiver === currentUser.uid)
      );
      setMessages(chatMsgs);

      chatMsgs.forEach(async (m) => {
        if(m.receiver === currentUser.uid && !m.isRead) {
           await updateDoc(doc(db, 'messages', m.id), { isRead: true });
        }
      });
    });
    return () => unsub();
  }, [selectedUser]);

  // 3. Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  // 4. Send Message & Auto Reply Logic
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await addDoc(collection(db, 'messages'), {
      text: text,
      sender: currentUser.uid,
      receiver: selectedUser.uid,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    const userText = text.toLowerCase();
    setText('');
    await updateDoc(doc(db, "users", currentUser.uid), { typingTo: null });

    const isBot = selectedUser.uid.startsWith('demo_user_');
    const isOnline = selectedUser.isOnline;

    if (isBot && isOnline) {
    setTimeout(async () => {
      let reply = "I am a bit busy, talk later! 👍";
      if (userText.includes('hi') || userText.includes('hello')) reply = "Hello! 👋 How are you?";
      else if (userText.includes('How')) reply = "I am Fine! and you?";
      else if (userText.includes('bye')) reply = "Bye! Take care. 👋";
      else if (userText.includes('good morning')) reply = "Good Morning! ☀️";
      else if (userText.includes('love')) reply = "Aww, so sweet! ❤️";

      await addDoc(collection(db, 'messages'), {
        text: reply,
        sender: selectedUser.uid,
        receiver: currentUser.uid,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }, 1500);
   }
  };

  const handleTyping = async (e) => {
    setText(e.target.value);
    await updateDoc(doc(db, "users", currentUser.uid), {
      typingTo: e.target.value ? selectedUser.uid : null
    });
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowChatOnMobile(true);
  };

  const handleBackToSidebar = () => {
    setShowChatOnMobile(false);
    setSelectedUser(null);
  };

 
  const fixDatabase = async () => {
    if(!confirm("⚠️ Delete old wrong users & Add YOUR correct list?")) return;
    try {
        const q = query(collection(db, "users"));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map((d) => {
            if (d.data().uid !== currentUser.uid) {
                return deleteDoc(doc(db, "users", d.id));
            }
        });
        await Promise.all(deletePromises);

        const friends = [
          { name: "Aditya Roy", av: 1, email: "aditya@example.com" }, 
          { name: "Simran Kaur", av: 0, email: "simarn@example.com" }, 
          { name: "Rohan Das", av: 5, email: "rohan@example.com" }, 
          { name: "Anjali Sharma", av: 6, email: "anjali@example.com" }, 
          { name: "Vikram Singh", av: 2, email: "vikarm@example.com" }, 
          { name: "Pooja Verma", av: 7, email: "pooja@example.com"}, 
          { name: "Angle Singh", av: 3, email: "angle@example.com" }, 
          { name: "Neha Gupta", av: 8, email: "neha@example.com" }, 
          { name: "Kabir Raina", av: 4, email: "kabir@example.com" }, 
          { name: "Tara Garg", av: 9, email: "tara@example.com" } 
        ];

        const addPromises = friends.map((u, i) => {
            const uid = `demo_user_${i}`;
            return setDoc(doc(db, "users", uid), {
                uid: uid,
                displayName: u.name,
                email: u.email,
                avatarId: u.av,
                isOnline: Math.random() < 0.5, 
                bio: "Hey there! I am using SocialApp."
            });
        });

        await Promise.all(addPromises);
        alert("✅ FIXED! Page will reload now.");
        window.location.reload();

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
  };

  const activeChatUser = users.find(u => u.uid === selectedUser?.uid);

  return (
    <div className="chat-container">
       <div className={`chat-sidebar ${showChatOnMobile ? 'hidden-mobile' : ''}`}> 
        <div className="sidebar-header" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px'}}>
          <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
             <h3>Chats ({users.length})</h3>
             {/* <button 
                onClick={fixDatabase} 
                style={{
                    fontSize:'0.7rem', 
                    background:'#ff4d4d', 
                    color:'white', 
                    border:'none', 
                    padding:'6px 12px', 
                    borderRadius:'20px', 
                    cursor:'pointer',
                    fontWeight: 'bold'
                }}
             >
                ⚠️ Reset & Fix
             </button> */}
          </div>
        </div>

        <div className="users-list">
          {users.length === 0 ? (
            <div className="no-users">
              <p>No friends found.</p>
            </div>
          ) : (
            users.map((user) => (
              <div 
                key={user.uid} 
                className={`user-item ${selectedUser?.uid === user.uid ? 'active' : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="avatar-wrapper">
                  <img src={getAvatar(user.avatarId)} alt="av" />
                  {user.isOnline && <span className="online-dot"></span>}
                </div>
                <div className="user-info-side">
                  <h4>{user.displayName}</h4>
                  <p className={user.isOnline ? "green-txt" : "gray-txt"}>
                    {user.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

       <div className={`chat-area ${showChatOnMobile ? 'visible-on-mobile' : ''}`}>
        {selectedUser ? (
          <>
             <div className="chat-header">
              <button className="back-btn" onClick={handleBackToSidebar}>⬅</button>
              <div className="header-user-info">
                  <img src={getAvatar(activeChatUser?.avatarId)} alt="av" />
                  <div className="header-text">
                    <h4>{activeChatUser?.displayName}</h4>
                    {activeChatUser?.typingTo === currentUser.uid ? (
                        <span className="typing-text">Typing...</span>
                    ) : (
                        <span className="status-text">
                            {activeChatUser?.isOnline ? "Online" : "Last seen recently"}
                        </span>
                    )}
                  </div>
              </div>
            </div>

           <div className="messages-box">
              {messages.map((msg, index) => (
                <div key={index} className={`message-bubble ${msg.sender === currentUser.uid ? 'sent' : 'received'}`}>
                  <p>{msg.text}</p>
                </div>
              ))}
              <div ref={scrollRef}></div> 
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={text} 
                onChange={handleTyping}
              />
              <button type="submit">➤</button>
            </form>
          </>
        ) : (
         <div className="empty-chat">
            <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="chat" width="80"/>
            <h3>Select a friend to chat</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;