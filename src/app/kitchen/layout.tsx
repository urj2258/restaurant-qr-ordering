'use client';

import RouteGuard from '@/components/RouteGuard';

export default function KitchenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard requiredRole="kitchen">
            {children}
        </RouteGuard>
    );
}
