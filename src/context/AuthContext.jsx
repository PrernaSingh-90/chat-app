import React, { createContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { auth, db} from '../utils/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [ currentUser, setCurrentUser] = useState(null);
    const [ loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if(user) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    await setDoc(userRef, {isOnline: true}, {merge: true});
                    const docSnap = await getDoc(userRef);
                    if(docSnap.exists()) {
                        setCurrentUser({...user, ...docSnap.data(), isOnline:true});
                    } else {
                        setCurrentUser(user);
                    }
                } catch (error) {
                    console.error("Error setting online status:", error);
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
