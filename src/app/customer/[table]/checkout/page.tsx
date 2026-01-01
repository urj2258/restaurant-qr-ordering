'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice, createOrder, generateId } from '@/lib/storage';
import ThemeToggle from '@/components/ThemeToggle';
import { Order, PaymentMethod } from '@/lib/types';

const paymentMethods: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: 'EasyPaisa', label: 'EasyPaisa', icon: '' },
    { id: 'JazzCash', label: 'JazzCash', icon: '' },
    { id: 'Bank Transfer', label: 'Bank Transfer', icon: '' },
    { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: '' }
];

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const tableId = params.table as string;
    const { items, getTotals, clearCart } = useCart();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Cash on Delivery');
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

        const result = await createOrder(order);
        if (result) {
            clearCart();
            router.push(`/customer/${tableId}/tracking/${newOrderId}`);
        } else {
            setIsProcessing(false);
            alert('Failed to place order. Please try again.');
        }
    };

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

                {/* Payment Method Selection */}
                <div style={{ marginBottom: 'var(--space-8)' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Select Payment Method</h3>
                    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                        {paymentMethods.map(method => (
                            <label
                                key={method.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-4)',
                                    padding: 'var(--space-4)',
                                    background: selectedMethod === method.id ? 'var(--accent-primary-light)' : 'var(--bg-card)',
                                    border: selectedMethod === method.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    checked={selectedMethod === method.id}
                                    onChange={() => setSelectedMethod(method.id)}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        accentColor: 'var(--accent-primary)'
                                    }}
                                />
                                <span style={{ fontSize: '24px' }}>{method.icon}</span>
                                <span style={{ fontWeight: '500', flex: 1 }}>{method.label}</span>
                            </label>
                        ))}
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
