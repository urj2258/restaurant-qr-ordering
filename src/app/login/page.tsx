'use client';

import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPortalPage() {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        background: 'var(--accent-primary)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        margin: '0 auto 1rem',
                        color: '#fff'
                    }}>

                    </div>
                    <h1 className={styles.title}>Abbottabad Eats</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Select your portal to login
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        className={styles.button}
                        onClick={() => router.push('/admin/login')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            padding: '1rem',
                            fontSize: '1rem'
                        }}
                    >
                        Admin Portal
                    </button>

                    <button
                        className={styles.button}
                        onClick={() => router.push('/kitchen/login')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            padding: '1rem',
                            fontSize: '1rem',
                            background: '#f59e0b'
                        }}
                    >
                        Kitchen Portal
                    </button>
                </div>

                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                }}>
                    <a
                        href="/"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        ← Back to Website
                    </a>
                </div>
            </div>
        </div>
    );
}
