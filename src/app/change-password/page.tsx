'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { changePassword } from '@/lib/auth-utils';
import styles from '../login/login.module.css';

export default function ChangePasswordPage() {
    const { user, loading: authLoading } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validation
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from current password');
            return;
        }

        setLoading(true);

        try {
            await changePassword(user!, currentPassword, newPassword);
            setMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Redirect after success
            setTimeout(() => {
                router.push('/admin');
            }, 2000);
        } catch (err: any) {
            if (err.code === 'auth/wrong-password') {
                setError('Current password is incorrect');
            } else if (err.code === 'auth/requires-recent-login') {
                setError('Please log out and log in again before changing password');
            } else {
                setError(err.message || 'Failed to change password');
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--accent-primary-light)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        margin: '0 auto 1rem'
                    }}>
                        🔐
                    </div>
                    <h1 className={styles.title}>Change Password</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Logged in as: {user?.email}
                    </p>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {message && <div className={styles.success}>{message}</div>}

                <form onSubmit={handleChange} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 6 chars)"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>

                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center'
                }}>
                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => router.back()}
                    >
                        ← Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
