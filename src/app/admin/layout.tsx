'use client';

import RouteGuard from '@/components/RouteGuard';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard requiredRole="admin">
            {children}
        </RouteGuard>
    );
}
