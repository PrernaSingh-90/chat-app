import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

const dummyUsers = [
  {
    uid: "user_1",
    displayName: "Rahul Sharma",
    email: "rahul@demo.com",
    avatarId: "avatar1",
    isOnline: true,
  },
  {
    uid: "user_2",
    displayName: "Priya Verma",
    email: "priya@demo.com",
    avatarId: "avatar2",
    isOnline: false,
  },
  {
    uid: "user_3",
    displayName: "Amit Singh",
    email: "amit@demo.com",
    avatarId: "avatar3",
    isOnline: true,
  },
  {
    uid: "user_4",
    displayName: "Sneha Gupta",
    email: "sneha@demo.com",
    avatarId: "avatar4",
    isOnline: false,
  },
  {
    uid: "user_5",
    displayName: "Vikram Malhotra",
    email: "vikram@demo.com",
    avatarId: "avatar5",
    isOnline: true,
  },
  {
    uid: "user_6",
    displayName: "Rohan Das",
    email: "rohan@demo.com",
    avatarId: "avatar6",
    isOnline: false,
  },
  {
    uid: "user_7",
    displayName: "Anjali Mehra",
    email: "anjali@demo.com",
    avatarId: "avatar7",
    isOnline: true,
  },
  {
    uid: "user_8",
    displayName: "Karan Johar",
    email: "karan@demo.com",
    avatarId: "avatar8",
    isOnline: false,
  },
  {
    uid: "user_9",
    displayName: "Pooja Hegde",
    email: "pooja@demo.com",
    avatarId: "avatar9",
    isOnline: true,
  },
  {
    uid: "user_10",
    displayName: "Tech Bot",
    email: "bot@demo.com",
    avatarId: "avatar10",
    isOnline: true,
  },
];

export const addDummyUsers = async() => {
    try {
        const promises = dummyUsers.map(user => 
            setDoc(doc(db, 'users', user.uid), user)
        );
        await Promise.all(promises);
        alert('✅ 10 Dummy Friends Added Successfully!');
    } catch (error) {
        console.error("Error adding users:", error);
        alert('❌ Error adding users');
    }
};
