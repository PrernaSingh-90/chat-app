import React, { useState, useEffect, useContext, useRef } from "react";
import { db } from "../utils/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { avatarMap } from "../utils/avatarMap";
import "./Chat.css";

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const { currentUser } = useContext(AuthContext);
  const scrollRef = useRef();
  const [showSidebar, setShowSidebar] = useState(true);
  
  const typingTimeoutRef = useRef(null);

  // 1. Users Fetch Logic
  useEffect(() => {
    if (!currentUser) return;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "!=", currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsub();
  }, [currentUser]);

  // 2. Fetch Messages (Fixed: Client-Side Filtering)
  useEffect(() => {
    if (!selectedUser) return;

    const msgRef = collection(db, "messages");
    const q = query(msgRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredMessages = allMessages.filter(
        (msg) =>
          (msg.senderId === currentUser.uid &&
            msg.receiverId === selectedUser.uid) ||
          (msg.senderId === selectedUser.uid &&
            msg.receiverId === currentUser.uid)
      );

      setMessages(filteredMessages);

      filteredMessages.forEach(async (msg) => {
        if(msg.senderId === selectedUser.uid && msg.read === false) {
          const msgDoc = doc(db, 'messages', msg.id);
          await updateDoc(msgDoc, {read: true});
        }
      });
    });

    return () => unsub();
  }, [selectedUser, currentUser]);

  // 3. Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Delete function
  const handleDelete = async (msgId) => {
    if (!msgId) return console.error("Message ID missing!");
    if (!window.confirm("Delete this message?")) {
      try {
        await deleteDoc(doc(db, "messages", msgId));
      } catch (err) {
        console.error("Delete Error:", err);
        alert("Error deleting message");
      }
    }
  };

  // Smart reply Logic
  const getSmartReply = (userText) => {
    const lower = userText.toLowerCase();
    if (
      lower.includes("hello") ||
      lower.includes("hi") ||
      lower.includes("hey")
    )
      return "Hello! Kaise ho?";
    if (lower.includes("kaise") || lower.includes("how are"))
      return "Main badhiya hu, tum sunao?";
    if (lower.includes("bye") || lower.includes("good night"))
      return "Bye! Take care.";
    if (lower.includes("thank")) return "Welcome ji! 😊";
    if (lower.includes("naam") || lower.includes("name"))
      return "Mera naam Bot hai 🤖";

    // Default answers
    const randoms = ["Sahi kaha!", "Hmm...", "Achha?", "Fir kya hua?", "Nice!"];
    return randoms[Math.floor(Math.random() * randoms.length)];
  };

  // 🟢 NEW: Handle Typing Function
  const handleTyping = async (e) => {
    const newText = e.target.value;
    setText(newText);
    if(!selectedUser || !currentUser) return;

    const myDocRef = doc(db, 'users', currentUser.uid);
    if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if(newText.length > 0) {
      await setDoc(myDocRef, {typingTo: selectedUser.uid}, {merge:true});
    }
    typingTimeoutRef.current = setTimeout(async () => {
      await setDoc(myDocRef, {typingTo: null}, {merge:true});
    }, 2000);
  };


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: text,
        senderId: currentUser.uid,
        receiverId: selectedUser.uid,
        createdAt: new Date().toISOString(),
        read: false   // New field: abhi padha nhi gaya
      });

      if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      await updateDoc(doc(db, 'users', currentUser.uid), {typingTo:null});

      const userMsg = text; // Store for logic
      setText("");

      // Auto Reply
      setTimeout(async () => {
        const replyText = getSmartReply(userMsg); // 🧠 Use Smart Logic

        await addDoc(collection(db, "messages"), {
          text: replyText,
          senderId: selectedUser.uid,
          receiverId: currentUser.uid,
          createdAt: new Date().toISOString(),
          read: false
        });
      }, 1500);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const activeChatUser = users.find(u => u.uid === selectedUser?.uid) || selectedUser;

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <div className={`chat-sidebar ${showSidebar ? "show" : "hide"}`}>
        <div className="sidebar-header">Chats</div>
        <div className="users-list">
          {users.map((user) => {
            const isOnline = user.isOnline || user.displayName === "Tech Bot";
            return (
              <div
                key={user.uid}
                className={`user-row ${
                  selectedUser?.uid === user.uid ? "active" : ""
                }`}
                onClick={() => handleUserSelect(user)}
              >
                <img
                  src={
                    avatarMap[user.avatarId]
                      ? avatarMap[user.avatarId]
                      : avatarMap["default"]
                  }
                  onError={(e) => {
                    e.target.src = avatarMap["default"];
                  }}
                  alt="av"
                />
                <div className="user-details">
                  <span className="name">{user.displayName}</span>
                  <span className={`status ${isOnline ? "online" : "offline"}`}>
                    {isOnline ? "● Online" : "Last seen recently"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`chat-main ${!showSidebar ? "show" : ""}`}>
        {selectedUser ? (
          <>
            {/* A. Header */}
            <div className="chat-header">
              <button className="back-btn" onClick={() => setShowSidebar(true)}>
                ←
              </button>
              <img
                src={avatarMap[activeChatUser?.avatarId] || avatarMap["default"]}
                alt="av"
              />
              <div className="header-info">
                <h4>{activeChatUser?.displayName}</h4>

                {/* Typing Indicator Logic */}
                {activeChatUser?.typingTo === currentUser.uid ? (
                  <span className="typing-status">Typing...</span>
                ) : (
                  <span className="header-status">
                  {activeChatUser?.isOnline ||
                  activeChatUser?.displayName === "Tech Bot"
                    ? "online"
                    : "offline"}
                </span>
                )}
                 </div>
            </div>

            {/* B. Messages Area (Middle) */}
            <div className="messages-container">
              {messages.map((msg) => (
                <div key={msg.id} className={`msg-wrapper ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`}>
                  <div className="msg-bubble">
                    {msg.text}
                  </div>
                  {/* 🗑️ Delete Button sirf apne message par */}
                  {msg.senderId === currentUser.uid && (
                    <span className="delete-icon" onClick={() => handleDelete(msg.id)}>🗑️</span>
                  )}
                </div>
              ))}
              <div ref={scrollRef}></div>
            </div>

            {/* C. Input Area (Bottom) - YAHAN HAI TYPE BAR */}
            <div className="input-area-wrapper">
              <form className="input-area" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={text}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  autoFocus
                />
                <button type="submit">Send</button>
              </form>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <h3>Select a chat to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
