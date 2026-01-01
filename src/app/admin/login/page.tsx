'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { setSessionPersistenceByRole, recordLoginTimestamp } from '@/lib/auth-utils';
import { diagnoseFirebase } from '@/lib/check-firebase';
import ThemeToggle from '@/components/ThemeToggle';
import { EyeIcon, EyeOffIcon } from '@/components/Icons';
import styles from '../../login/login.module.css';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await setSessionPersistenceByRole('admin');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            const userDoc = await getDoc(doc(db, 'users', uid));
            if (!userDoc.exists() || userDoc.data().role !== 'admin') {
                await auth.signOut();
                setError('Access denied. Admin credentials required.');
                setLoading(false);
                return;
            }

            await recordLoginTimestamp(uid);
            router.push('/admin');
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.code === 'auth/network-request-failed') {
                setError('Network error: Unable to connect to Firebase.');
            } else {
                setError(err.message || 'Failed to login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                <ThemeToggle />
            </div>
            <div className={styles.card}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--accent-primary)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        margin: '0 auto 1rem',
                        color: '#fff'
                    }}>
                        OR
                    </div>
                    <h1 className={styles.title}>Abbottabad Eats</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Admin Portal Access
                    </p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Signing in...' : 'Enter Dashboard'}
                    </button>

                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => router.push('/reset-password')}
                    >
                        Forgot Password?
                    </button>
                </form>

                <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border-color)',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                }}>
                    Looking for <a href="/kitchen/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Kitchen Portal?</a>
                </div>
            </div>
        </div>
    );
}
