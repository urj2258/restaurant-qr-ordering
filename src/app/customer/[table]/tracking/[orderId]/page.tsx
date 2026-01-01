'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchOrder, formatPrice } from '@/lib/storage';
import { Order, OrderStatus } from '@/lib/types';

const statusSteps: { status: OrderStatus; label: string; icon: string }[] = [
    { status: 'pending', label: 'Order Placed', icon: '1' },
    { status: 'accepted', label: 'Accepted', icon: '2' },
    { status: 'preparing', label: 'Preparing', icon: '3' },
    { status: 'ready', label: 'Ready', icon: '4' },
    { status: 'served', label: 'Served', icon: '5' }
];

const getStatusIndex = (status: OrderStatus): number => {
    return statusSteps.findIndex(s => s.status === status);
};

export default function TrackingPage() {
    const params = useParams();
    const router = useRouter();
    const tableId = params.table as string;
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            const foundOrder = await fetchOrder(orderId);
            setOrder(foundOrder || null);
            setLoading(false);
        };

        loadOrder();

        // Poll for updates every 3 seconds
        const interval = setInterval(loadOrder, 3000);

        return () => {
            clearInterval(interval);
        };
    }, [orderId]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)'
            }}>
                <div className="animate-pulse" style={{ fontSize: '24px' }}>Loading...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
                padding: 'var(--space-4)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>?</div>
                    <h2 style={{ marginBottom: 'var(--space-2)' }}>Order Not Found</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                        We couldn&apos;t find this order.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => router.push(`/customer/${tableId}`)}
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        );
    }

    const currentStatusIndex = getStatusIndex(order.status);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            padding: 'var(--space-4)'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-8)'
                }}>
                    <button
                        className="btn btn-icon btn-secondary"
                        onClick={() => router.push(`/customer/${tableId}`)}
                    >
                        ←
                    </button>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-xl)' }}>Order Tracking</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            #{orderId.slice(0, 8)}
                        </p>
                    </div>
                </div>

                {/* Status Timeline */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-6)',
                    marginBottom: 'var(--space-6)'
                }}>
                    <h3 style={{ marginBottom: 'var(--space-6)' }}>Order Status</h3>

                    <div style={{ position: 'relative' }}>
                        {statusSteps.map((step, index) => {
                            const isCompleted = index <= currentStatusIndex;
                            const isCurrent = index === currentStatusIndex;

                            return (
                                <div
                                    key={step.status}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-4)',
                                        marginBottom: index < statusSteps.length - 1 ? 'var(--space-6)' : 0,
                                        position: 'relative'
                                    }}
                                >
                                    {/* Timeline Line */}
                                    {index < statusSteps.length - 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            left: '20px',
                                            top: '40px',
                                            bottom: '-24px',
                                            width: '2px',
                                            background: isCompleted ? 'var(--accent-primary)' : 'var(--border-color)'
                                        }} />
                                    )}

                                    {/* Icon */}
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: isCompleted ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        flexShrink: 0,
                                        zIndex: 1,
                                        boxShadow: isCurrent ? 'var(--shadow-glow)' : 'none',
                                        animation: isCurrent ? 'pulse 2s infinite' : 'none'
                                    }}>
                                        {step.icon}
                                    </div>

                                    {/* Label */}
                                    <div>
                                        <p style={{
                                            fontWeight: isCurrent ? '600' : '400',
                                            color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)'
                                        }}>
                                            {step.label}
                                        </p>
                                        {isCurrent && (
                                            <p style={{
                                                fontSize: 'var(--font-size-sm)',
                                                color: 'var(--accent-primary)'
                                            }}>
                                                Current Status
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Summary */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-6)'
                }}>
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Order Summary</h3>

                    {order.items.map(item => (
                        <div
                            key={item.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: 'var(--space-3) 0',
                                borderBottom: '1px solid var(--border-color)'
                            }}
                        >
                            <div>
                                <span style={{ fontWeight: '500' }}>
                                    {item.quantity}x {item.menuItem.name}
                                </span>
                                {(item.selectedSize || item.selectedExtras.length > 0) && (
                                    <p style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--text-muted)'
                                    }}>
                                        {[
                                            item.selectedSize?.name,
                                            ...item.selectedExtras.map(e => e.name)
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                )}
                            </div>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                {formatPrice(
                                    (item.menuItem.price +
                                        (item.selectedSize?.priceModifier || 0) +
                                        item.selectedExtras.reduce((s, e) => s + e.price, 0)) *
                                    item.quantity
                                )}
                            </span>
                        </div>
                    ))}

                    <div style={{ marginTop: 'var(--space-4)' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 'var(--space-2)',
                            color: 'var(--text-secondary)'
                        }}>
                            <span>Items ({order.items.length})</span>
                            <span>{formatPrice(order.subtotal || 0)}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 'var(--space-4)',
                            color: 'var(--text-secondary)'
                        }}>
                            <span>Tax (16%)</span>
                            <span>{formatPrice(order.tax || 0)}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: '600',
                            fontSize: 'var(--font-size-lg)',
                            paddingTop: 'var(--space-3)',
                            borderTop: '1px solid var(--border-color)'
                        }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--accent-primary)' }}>
                                {formatPrice(order.total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Help Button */}
                <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: 'var(--space-4)' }}
                >
                    Need Help? Call a Waiter
                </button>
            </div>
        </div>
    );
}
