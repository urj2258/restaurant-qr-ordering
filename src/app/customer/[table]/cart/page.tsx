'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CartProvider, useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/storage';
import { Order } from '@/lib/types';
import { CartIcon, TrashIcon } from '@/components/Icons';

function CartContent() {
    const params = useParams();
    const router = useRouter();
    const tableId = params.table as string;
    const { items, removeItem, updateQuantity, getTotals, clearCart } = useCart();
    const [isPlacing, setIsPlacing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState<string>('');

    const totals = getTotals();

    const handlePlaceOrder = () => {
        if (items.length === 0) return;
        router.push(`/customer/${tableId}/checkout`);
    };

    if (orderPlaced) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
                padding: 'var(--space-4)'
            }}>
                <div style={{
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--accent-primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-6)',
                        fontSize: '40px'
                    }}>
                        ✓
                    </div>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>
                        Order Placed!
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                        Your order has been sent to the kitchen. We&apos;ll notify you when it&apos;s ready.
                    </p>
                    <div style={{
                        background: 'var(--bg-card)',
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--space-6)'
                    }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Order ID</p>
                        <p style={{ fontWeight: '600', fontFamily: 'monospace' }}>{orderId.slice(0, 12)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', flexDirection: 'column' }}>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => router.push(`/customer/${tableId}/tracking/${orderId}`)}
                            style={{ width: '100%' }}
                        >
                            Track Order
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => router.push(`/customer/${tableId}`)}
                            style={{ width: '100%' }}
                        >
                            Order More
                        </button>
                    </div>
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
                {/* Header */}
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
                        <h1 style={{ fontSize: 'var(--font-size-xl)' }}>Your Order</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            Table {tableId?.substring(0, 4)}..
                        </p>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-12)',
                        color: 'var(--text-muted)'
                    }}>
                        <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-muted)' }}><CartIcon size={48} /></div>
                        <p>Your cart is empty</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => router.push(`/customer/${tableId}`)}
                            style={{ marginTop: 'var(--space-4)' }}
                        >
                            Browse Menu
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        gap: 'var(--space-4)',
                                        padding: 'var(--space-4)',
                                        background: 'var(--bg-card)',
                                        borderRadius: 'var(--radius-lg)',
                                        marginBottom: 'var(--space-3)'
                                    }}
                                >
                                    {/* ... existing cart item display ... */}
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '32px',
                                        flexShrink: 0
                                    }}>

                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 'var(--space-2)'
                                        }}>
                                            <h3 style={{ fontWeight: '500' }}>{item.menuItem.name}</h3>
                                            <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                                                {formatPrice(
                                                    (item.menuItem.price +
                                                        (item.selectedSize?.priceModifier || 0) +
                                                        item.selectedExtras.reduce((s, e) => s + e.price, 0)) *
                                                    item.quantity
                                                )}
                                            </span>
                                        </div>
                                        {(item.selectedSize || item.selectedExtras.length > 0) && (
                                            <p style={{
                                                fontSize: 'var(--font-size-sm)',
                                                color: 'var(--text-muted)',
                                                marginBottom: 'var(--space-2)'
                                            }}>
                                                {[
                                                    item.selectedSize?.name,
                                                    ...item.selectedExtras.map(e => e.name)
                                                ].filter(Boolean).join(', ')}
                                            </p>
                                        )}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-2)',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: 'var(--space-1)'
                                            }}>
                                                <button
                                                    className="btn btn-icon btn-ghost"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    style={{ width: '32px', height: '32px' }}
                                                >
                                                    −
                                                </button>
                                                <span style={{ minWidth: '24px', textAlign: 'center' }}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="btn btn-icon btn-ghost"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    style={{ width: '32px', height: '32px' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                className="btn btn-icon"
                                                onClick={() => removeItem(item.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: 'var(--danger)'
                                                }}
                                            >
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Special Instructions */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--space-2)',
                                color: 'var(--text-secondary)',
                                fontSize: 'var(--font-size-sm)'
                            }}>
                                Special Instructions (Optional)
                            </label>
                            <textarea
                                className="input"
                                placeholder="Any special requests for your order..."
                                rows={3}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        {/* Totals */}
                        <div style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-5)',
                            marginBottom: 'var(--space-6)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 'var(--space-2)',
                                color: 'var(--text-secondary)'
                            }}>
                                <span>Subtotal</span>
                                <span>{formatPrice(totals.subtotal)}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 'var(--space-3)',
                                color: 'var(--text-secondary)'
                            }}>
                                <span>Tax (16%)</span>
                                <span>{formatPrice(totals.tax)}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: 'var(--space-3)',
                                borderTop: '1px solid var(--border-color)',
                                fontWeight: '600',
                                fontSize: 'var(--font-size-lg)'
                            }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--accent-primary)' }}>
                                    {formatPrice(totals.total)}
                                </span>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handlePlaceOrder}
                            disabled={isPlacing || items.length === 0}
                            style={{ width: '100%' }}
                        >
                            {isPlacing ? (
                                <>
                                    <span className="animate-pulse">Placing Order...</span>
                                </>
                            ) : (
                                <>Proceed to Payment - {formatPrice(totals.total)}</>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function CartPage() {
    const params = useParams();
    const tableId = params.table as string;

    return (
        <CartProvider tableNumber={tableId}>
            <CartContent />
        </CartProvider>
    );
}
