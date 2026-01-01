'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserProfile, UserRole } from '@/lib/types';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { isSessionExpired } from '@/lib/auth-utils';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    emailVerified: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    emailVerified: false,
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [emailVerified, setEmailVerified] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setEmailVerified(firebaseUser?.emailVerified || false);

            if (firebaseUser) {
                const db = getFirestore();
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data() as UserProfile;
                    setProfile(userData);

                    // Check session expiry for non-admin users
                    if (userData.role !== 'admin') {
                        const expired = await isSessionExpired(firebaseUser.uid);
                        if (expired) {
                            console.log('Session expired, logging out...');
                            await firebaseSignOut(auth);
                            setProfile(null);
                            setUser(null);
                        }
                    }
                } else {
                    setProfile(null);
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, emailVerified, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

