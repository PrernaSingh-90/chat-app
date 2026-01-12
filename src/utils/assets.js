// Avatars Imports
import av1 from '../assets/avatars/av1.png';  // girl 0
import av2 from '../assets/avatars/av2.png';  // boy 1
import av3 from '../assets/avatars/av3.png';  // boy 2
import av4 from '../assets/avatars/av4.png';  // girl 3
import av5 from '../assets/avatars/av5.png';  // boy 4
import av6 from '../assets/avatars/av6.png';   // boy 5 
import av7 from '../assets/avatars/av7.png';   // girl 6
import av8 from '../assets/avatars/av8.png';   // girl 7
import av9 from '../assets/avatars/av9.png';   // girl 8
import av10 from '../assets/avatars/av10.png';  // girl 9

// Posts imports
import p1 from '../assets/posts/p1.jpg';  // flower
import p2 from '../assets/posts/p2.jpg';   // dog
import p3 from '../assets/posts/p3.jpg';   // flower
import p4 from '../assets/posts/p4.jpg';   // mountains
import p5 from '../assets/posts/p5.jpg';   // coffee
import p6 from '../assets/posts/p6.jpg';   // coding
import p7 from '../assets/posts/p7.jpg';   // nature
import p8 from '../assets/posts/p8.jpg';   // effile tower
import p9 from '../assets/posts/p9.jpg';   // architecture
import p10 from '../assets/posts/p10.jpg';  // paintings
import p11 from '../assets/posts/p11.jpg';  // exhibition
import p12 from '../assets/posts/p12.jpg';  // painting
import p13 from '../assets/posts/p13.jpg';  // nature
import p14 from '../assets/posts/p14.jpg';  // cat


export const avatars = [av1, av2, av3, av4, av5, av6, av7, av8, av9, av10];
export const postImages = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14];
// Helper to get avatar by ID (0-9)
export const getAvatar = (index) => avatars[index] || avatars[0];