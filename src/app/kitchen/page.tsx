'use client';

import { useState, useEffect, useMemo } from 'react';
import { subscribeToOrders, updateOrderStatus } from '@/lib/storage';
import { Order, OrderStatus } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';
import BrandIcon from '@/components/BrandIcon';
import KitchenMenu from './components/KitchenMenu';
import styles from './kitchen.module.css';

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeView, setActiveView] = useState<'orders' | 'menu'>('orders'); // Added activeView state

    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = subscribeToOrders((updatedOrders) => {
            // Filter only active orders for kitchen (Pending, Preparing)
            const active = updatedOrders.filter(
                o => o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing' || o.status === 'ready'
            );
            // Sort by oldest first (FIFO)
            active.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setOrders(active);
        });

        return () => unsubscribe();
    }, []);

    // Moved stats calculation outside return
    const stats = useMemo(() => ({
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
    }), [orders]);

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        await updateOrderStatus(orderId, newStatus);
    };

    return (
        <div className={styles.kitchenLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logoArea}>
                    <div className={styles.logoIcon}>
                        <BrandIcon size={24} color="#fff" />
                    </div>
                    <span className={styles.titleText}>Abbottabad Kitchen</span>
                </div>

                <nav className={styles.navSection}>
                    <button
                        className={`${styles.navItem} ${activeView === 'orders' ? styles.active : ''}`}
                        onClick={() => setActiveView('orders')}
                    >
                        <span>Live Orders</span>
                        {stats.pending > 0 && <span className={styles.navBadge}>{stats.pending}</span>}
                    </button>
                    <button
                        className={`${styles.navItem} ${activeView === 'menu' ? styles.active : ''}`}
                        onClick={() => setActiveView('menu')}
                    >
                        <span>Manage Menu</span>
                    </button>
                </nav>

                <div className={styles.sidebarFooter} style={{ marginTop: 'auto' }}>
                    <ThemeToggle />
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {activeView === 'orders' ? (
                    <div className={styles.ordersView}>
                        <header className={styles.header}>
                            <h2 style={{ margin: 0 }}>Active Orders</h2>
                            <div className={styles.stats}>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Pending</span>
                                    <span className={styles.statValue}>{stats.pending}</span>
                                </div>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Preparing</span>
                                    <span className={styles.statValue}>{stats.preparing}</span>
                                </div>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Ready</span>
                                    <span className={styles.statValue}>{stats.ready}</span>
                                </div>
                            </div>
                        </header>

                        <div className={styles.grid}>
                            {orders.length === 0 ? (
                                <div className={styles.emptyState}>No active orders</div>
                            ) : (
                                orders.map((order) => {
                                    const ageMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                                    const isAged = ageMinutes >= 15;

                                    return (
                                        <div
                                            key={order.id}
                                            className={`${styles.card} ${styles[order.status]} ${isAged ? styles.aged : ''}`}
                                        >
                                            <div className={styles.cardHeader}>
                                                <span className={styles.orderNumber}>#{order.id.slice(-4).toUpperCase()}</span>
                                                <span className={styles.tableTag}>Table {order.tableId}</span>
                                            </div>

                                            <div className={styles.itemList}>
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className={styles.itemRow}>
                                                        <span className={styles.itemQty}>{item.quantity}x</span>
                                                        <div className={styles.itemDetails}>
                                                            <div className={styles.itemName}>{item.menuItem.name}</div>
                                                            {item.selectedSize && <div className={styles.itemVariant}>{item.selectedSize.name}</div>}
                                                            {item.selectedExtras.length > 0 && (
                                                                <div className={styles.itemExtras}>
                                                                    + {item.selectedExtras.map(e => e.name).join(', ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className={styles.cardFooter}>
                                                <div className={styles.orderMeta}>
                                                    <span className={styles.timeTag}>
                                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className={`${styles.ageTag} ${isAged ? styles.warn : ''}`}>
                                                        {ageMinutes}m ago
                                                    </span>
                                                </div>
                                                <div className={styles.actions}>
                                                    {order.status === 'pending' && (
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                                        >
                                                            Start Prep
                                                        </button>
                                                    )}
                                                    {order.status === 'preparing' && (
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleStatusUpdate(order.id, 'ready')}
                                                        >
                                                            Mark Ready
                                                        </button>
                                                    )}
                                                    {order.status === 'ready' && (
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => handleStatusUpdate(order.id, 'served')}
                                                        >
                                                            Served
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.menuView}>
                        <header className={styles.header}>
                            <h2 style={{ margin: 0 }}>Menu Management</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Mange items across all platforms</p>
                        </header>
                        <KitchenMenu />
                    </div>
                )}
            </main>
        </div>
    );
}
