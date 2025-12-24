import avatar1 from '../assets/Images/avatar1.png';
import avatar2 from '../assets/Images/avatar2.png';
import avatar3 from '../assets/Images/avatar3.png';
import avatar4 from '../assets/Images/avatar4.png';
import avatar5 from '../assets/Images/avatar5.png';
import avatar6 from '../assets/Images/avatar6.png';
import avatar7 from '../assets/Images/avatar7.png';
import avatar8 from '../assets/Images/avatar8.png';
import avatar9 from '../assets/Images/avatar9.png';
import avatar10 from '../assets/Images/avatar10.png';

// Post Images
import post1 from '../assets/postImages/post1.jpg'; //Nature view
import post2 from '../assets/postImages/post2.jpg';
import post3 from '../assets/postImages/post3.jpg';
import post4 from '../assets/postImages/post4.jpg';
import post5 from '../assets/postImages/post5.jpg';
import post6 from '../assets/postImages/post6.jpg';
import post7 from '../assets/postImages/post7.jpg';

export const avatarMap = {
   'avatar1': avatar1,
   'avatar2': avatar2,
   'avatar3': avatar3,
   'avatar4': avatar4,
   'avatar5': avatar5,
   'avatar6': avatar6,
   'avatar7': avatar7,
   'avatar8': avatar8,
   'avatar9': avatar9,
   'avatar10': avatar10,

   // 🔥 FIX: Puraane IDs ko Nayi Images se connect kar rahe hain
   'boy': avatar2,   // Jahan database me 'boy' hai, wahan 'avatar1' dikhega
   'girl': avatar4,  // Jahan database me 'girl' hai, wahan 'avatar4' dikhega
   'robot': avatar5, // Tech Bot ke liye
   'cat': avatar10,  // Kisi aur ke liye

   // 🔥 VERY IMPORTANT: Fallback Key
   'default': avatar1 // Agar kuch match na ho, to ye dikhega
};


export const avatarList = [
    { id: 'avatar1', src:avatar1 },
    { id: 'avatar2', src:avatar2 },
    { id: 'avatar3', src:avatar3 },
    { id: 'avatar4', src:avatar4 },
    { id: 'avatar5', src:avatar5 },
    { id: 'avatar6', src:avatar6 },
    { id: 'avatar7', src:avatar7 },
    { id: 'avatar8', src:avatar8 },
    { id: 'avatar9', src:avatar9 },
    { id: 'avatar10', src:avatar10 },
];

// New post images list
export const postImages = [post7, post5, post6, post1, post2, post3, post4]; 