'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { sendVerification } from '@/lib/auth-utils';
import styles from '../login/login.module.css';

export default function VerifyEmailPage() {
    const { user, loading: authLoading } = useAuth();
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        // If already verified, redirect
        if (user?.emailVerified) {
            router.push('/admin');
        }
    }, [user, router]);

    const handleResend = async () => {
        if (!user) return;

        setSending(true);
        setError('');
        setMessage('');

        try {
            await sendVerification(user);
            setMessage('Verification email sent! Check your inbox.');
        } catch (err: any) {
            if (err.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait a few minutes.');
            } else {
                setError(err.message || 'Failed to send verification email');
            }
        } finally {
            setSending(false);
        }
    };

    const handleRefresh = () => {
        // Reload the page to check verification status
        window.location.reload();
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
                        background: '#3b82f6',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        margin: '0 auto 1rem'
                    }}>

                    </div>
                    <h1 className={styles.title} style={{ color: '#3b82f6' }}>Verify Your Email</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        We sent a verification link to:
                    </p>
                    <p style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                        {user?.email}
                    </p>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {message && <div className={styles.success}>{message}</div>}

                <div className={styles.form} style={{ gap: '1rem' }}>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        lineHeight: '1.6'
                    }}>
                        Click the link in your email to verify your account.
                        If you don't see it, check your spam folder.
                    </p>

                    <button
                        type="button"
                        className={styles.button}
                        onClick={handleRefresh}
                        style={{ background: 'var(--accent-primary)' }}
                    >
                        I've Verified My Email
                    </button>

                    <button
                        type="button"
                        className={styles.button}
                        onClick={handleResend}
                        disabled={sending}
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    >
                        {sending ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                </div>

                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center'
                }}>
                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => router.push('/login')}
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
