'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { setSessionPersistenceByRole, recordLoginTimestamp } from '@/lib/auth-utils';
import ThemeToggle from '@/components/ThemeToggle';
import { EyeIcon, EyeOffIcon } from '@/components/Icons';
import styles from '../../login/login.module.css';

export default function KitchenLoginPage() {
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
            await setSessionPersistenceByRole('kitchen');
            const userCredential = await signInWithEmailAndPassword(auth, email, password).catch(err => {
                if (err.code === 'auth/invalid-credential') {
                    throw new Error('Invalid email or password. Please try again.');
                }
                throw err;
            });

            const uid = userCredential.user.uid;

            const userDoc = await getDoc(doc(db, 'users', uid));
            if (!userDoc.exists()) {
                await auth.signOut();
                setError('Access denied. Please contact admin.');
                setLoading(false);
                return;
            }

            const role = userDoc.data().role;
            if (role !== 'kitchen' && role !== 'admin') {
                await auth.signOut();
                setError('Access denied. Kitchen credentials required.');
                setLoading(false);
                return;
            }

            // Don't let timestamp recording block the transition if it takes too long
            try {
                await Promise.race([
                    recordLoginTimestamp(uid),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
                ]);
            } catch (tsError) {
                console.warn('Logging session timestamp failed/timed out, proceeding anyway:', tsError);
            }

            router.push('/kitchen');
        } catch (err: any) {
            console.error('Kitchen login error:', err);
            setError(err.message || 'Failed to login');
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
                        color: '#fff',
                        fontWeight: 700
                    }}>
                        OR
                    </div>
                    <h1 className={styles.title}>Abbottabad Kitchen</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Order Management System
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

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Starting Shift...' : 'Start Shift'}
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
                    Admin? <a href="/admin/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Login here</a>
                </div>
            </div>
        </div>
    );
}
