'use client';

import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import BrandIcon from '@/components/BrandIcon';

export default function LoginPortalPage() {
    const router = useRouter();

    return (
        <div className={styles.splitContainer}>
            {/* Left Side - Image Panel */}
            <div className={styles.imagePanel}>
                <div className={styles.decorativeAccent}></div>
                <div className={styles.imageContent}>
                    <div className={styles.brandBadge}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                        <span>Staff Management Portal</span>
                    </div>
                    <h2 className={styles.imageTitle}>
                        Welcome to<br />
                        <span>Abbottabad Eats</span>
                    </h2>
                    <p className={styles.imageSubtitle}>
                        Access your dashboard to manage orders, kitchen operations, and restaurant analytics in real-time.
                    </p>
                </div>
            </div>

            {/* Right Side - Portal Selection */}
            <div className={styles.portalPanel}>
                <div className={styles.portalContent}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logoIcon}>
                            <BrandIcon size={40} />
                        </div>
                        <h1 className={styles.title}>Select Portal</h1>
                        <p className={styles.subtitle}>Choose your access point to continue</p>
                    </div>

                    <div className={styles.portalButtons}>
                        <button
                            className={styles.portalButton}
                            onClick={() => router.push('/admin/login')}
                        >
                            <div className={styles.buttonIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div className={styles.buttonContent}>
                                <div className={styles.buttonTitle}>Admin Portal</div>
                                <div className={styles.buttonDesc}>Manage restaurant operations</div>
                            </div>
                            <div className={styles.buttonArrow}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </div>
                        </button>

                        <button
                            className={styles.portalButton}
                            onClick={() => router.push('/kitchen/login')}
                        >
                            <div className={styles.buttonIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                                    <path d="M7 2v20" />
                                    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                                </svg>
                            </div>
                            <div className={styles.buttonContent}>
                                <div className={styles.buttonTitle}>Kitchen Portal</div>
                                <div className={styles.buttonDesc}>View and prepare orders</div>
                            </div>
                            <div className={styles.buttonArrow}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    </div>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <a href="/" className={styles.backLink}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                        </svg>
                        Back to Website
                    </a>
                </div>
            </div>
        </div>
    );
}
