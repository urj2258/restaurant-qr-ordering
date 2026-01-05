'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CartProvider, useCart } from '@/context/CartContext';
import { formatPrice, createOrder, generateId } from '@/lib/storage';
import ThemeToggle from '@/components/ThemeToggle';
import { Order, PaymentMethod } from '@/lib/types';

function CheckoutContent() {
    const params = useParams();
    const router = useRouter();
    const tableId = params.table as string;
    const { items, getTotals, clearCart, isLoaded } = useCart();
    // Default to Cash because it's a restaurant table order
    const selectedMethod: PaymentMethod = 'Cash on Delivery';
    const [isProcessing, setIsProcessing] = useState(false);

    const totals = getTotals();

    const handleConfirmOrder = async () => {
        if (items.length === 0) return;

        setIsProcessing(true);

        // Simulate API call
        const newOrderId = generateId();
        const order: Order = {
            id: newOrderId,
            tableId,
            items: [...items],
            status: 'pending',
            paymentMethod: selectedMethod,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total
        };

        const result = await createOrder(order, newOrderId);
        if (result) {
            clearCart();
            router.push(`/customer/${tableId}/tracking/${newOrderId}`);
        } else {
            setIsProcessing(false);
            alert('Failed to place order. Please try again.');
        }
    };

    // Show loading state while cart is being loaded from localStorage
    if (!isLoaded) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="animate-pulse" style={{
                        fontSize: 'var(--font-size-lg)',
                        color: 'var(--text-muted)'
                    }}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
                padding: 'var(--space-4)',
                textAlign: 'center'
            }}>
                <div>
                    <h2>Cart is Empty</h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => router.push(`/customer/${tableId}`)}
                        style={{ marginTop: 'var(--space-4)' }}
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            padding: 'var(--space-4)'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-6)'
                }}>
                    <button
                        className="btn btn-icon btn-secondary"
                        onClick={() => router.back()}
                    >
                        ←
                    </button>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-xl)' }}>Checkout</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            Table {tableId.length > 8 ? tableId.substring(0, 8) + '...' : tableId}
                        </p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Order Summary Card */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-6)',
                    marginBottom: 'var(--space-6)',
                    border: '1px solid var(--border-color)'
                }}>
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Order Summary</h3>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-2)',
                        color: 'var(--text-secondary)'
                    }}>
                        <span>Items ({items.length})</span>
                        <span>{formatPrice(totals.subtotal)}</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-4)',
                        color: 'var(--text-secondary)'
                    }}>
                        <span>Tax (16%)</span>
                        <span>{formatPrice(totals.tax)}</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: 'var(--space-4)',
                        borderTop: '1px solid var(--border-color)',
                        fontWeight: '600',
                        fontSize: 'var(--font-size-lg)'
                    }}>
                        <span>Total to Pay</span>
                        <span style={{ color: 'var(--accent-primary)' }}>{formatPrice(totals.total)}</span>
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    className="btn btn-primary btn-lg"
                    onClick={handleConfirmOrder}
                    disabled={isProcessing}
                    style={{ width: '100%' }}
                >
                    {isProcessing ? 'Processing Order...' : `Confirm Order - ${formatPrice(totals.total)}`}
                </button>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return <CheckoutContent />;
}
