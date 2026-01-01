import {
    browserSessionPersistence,
    browserLocalPersistence,
    setPersistence,
    sendEmailVerification,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    User
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { UserRole } from './types';

/**
 * Set Firebase Auth persistence based on user role
 * - Admin: Session only (clears when browser closes)
 * - Kitchen: Local storage (persists, but we check 20hr expiry)
 */
export async function setSessionPersistenceByRole(role: UserRole): Promise<void> {
    if (role === 'admin') {
        await setPersistence(auth, browserSessionPersistence);
    } else {
        // Kitchen and staff use local persistence
        await setPersistence(auth, browserLocalPersistence);
    }
}

/**
 * Record login timestamp for session expiry tracking
 */
export async function recordLoginTimestamp(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
    });
}

/**
 * Check if kitchen session has expired (20 hours)
 */
export async function isSessionExpired(uid: string): Promise<boolean> {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return true;

    const data = userDoc.data();
    const role = data.role as UserRole;

    // Admin sessions don't expire (controlled by browser session)
    if (role === 'admin') return false;

    const lastLogin = data.lastLoginAt?.toDate();
    if (!lastLogin) return true;

    const hoursSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60);
    const SESSION_HOURS = 20;

    return hoursSinceLogin > SESSION_HOURS;
}

/**
 * Send verification email to current user
 */
export async function sendVerification(user: User): Promise<void> {
    await sendEmailVerification(user);
}

/**
 * Change password for logged-in user
 */
export async function changePassword(
    user: User,
    currentPassword: string,
    newPassword: string
): Promise<void> {
    // Re-authenticate first
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
}
