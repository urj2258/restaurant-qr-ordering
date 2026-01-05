'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/lib/types';

interface RouteGuardProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
}

export default function RouteGuard({ children, requiredRole }: RouteGuardProps) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            // 1. Not logged in
            if (!user) {
                // Determine login path based on requested route
                if (pathname.startsWith('/admin')) {
                    router.replace('/admin/login');
                } else if (pathname.startsWith('/kitchen')) {
                    router.replace('/kitchen/login');
                } else {
                    router.replace('/'); // Fallback
                }
                return;
            }

            // 2. Logged in but profile loading (wait)
            if (!profile) return;

            // 3. Role mismatch
            if (requiredRole && profile.role !== requiredRole) {
                // If admin tries to access kitchen, or vice versa (though rare in this app structure)
                // Or if 'staff' tries to access admin
                if (requiredRole === 'admin') {
                    // Redirect to home or show unauthorized
                    router.replace('/');
                } else if (requiredRole === 'kitchen') {
                    router.replace('/');
                }
            }
        }
    }, [user, profile, loading, router, pathname, requiredRole]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            }}>
                Loading...
            </div>
        );
    }

    // If no user, render nothing while redirecting
    if (!user) return null;

    // If role required and profile not loaded yet, or role mismatch, render null
    if (requiredRole && (!profile || profile.role !== requiredRole)) {
        return null;
    }

    return <>{children}</>;
}
