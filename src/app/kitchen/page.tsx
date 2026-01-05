'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { subscribeToOrders, updateOrderStatus, formatPrice, fetchTables } from '@/lib/storage';
import { Order, OrderStatus, Table } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';
import BrandIcon from '@/components/BrandIcon';
import KitchenMenu from './components/KitchenMenu';
import styles from './kitchen.module.css';

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [activeView, setActiveView] = useState<'orders' | 'menu'>('orders');

    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = subscribeToOrders((updatedOrders) => {
            // Include 'served' orders now so we can show them in history
            const active = updatedOrders.filter(
                o => ['pending', 'accepted', 'preparing', 'ready', 'served'].includes(o.status)
            );
            // Sort by oldest first (FIFO)
            active.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setOrders(active);
        });

        // Load tables for name lookup
        fetchTables().then(setTables);

        return () => unsubscribe();
    }, []);

    // Kanban Columns Configuration
    const columns: { id: OrderStatus; label: string; }[] = [
        { id: 'pending', label: 'Pending' },
        { id: 'preparing', label: 'Preparing' },
        { id: 'ready', label: 'Ready' },
        { id: 'served', label: 'Served' }
    ];

    const getNextStatus = (current: OrderStatus): OrderStatus | null => {
        if (current === 'pending' || current === 'accepted') return 'preparing';
        if (current === 'preparing') return 'ready';
        if (current === 'ready') return 'served';
        return null;
    };

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status. Please try again.");
        }
    };

    // Calculate stats
    const stats = {
        pending: orders.filter(o => o.status === 'pending' || o.status === 'accepted').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        served: orders.filter(o => o.status === 'served').length,
    };

    return (
        <div className={styles.kitchenLayout}>
            {/* Sidebar Navigation */}
            <aside className={styles.sidebar}>
                <div className={styles.logoArea}>
                    <div className={styles.logoIcon}>
                        <BrandIcon color="white" size={24} />
                    </div>
                    <span className={styles.titleText}>Abbottabad Kitchen</span>
                </div>

                <nav className={styles.navSection}>
                    <button
                        className={`${styles.navItem} ${activeView === 'orders' ? styles.active : ''}`}
                        onClick={() => setActiveView('orders')}
                    >
                        <span>Live Board</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeView === 'menu' ? styles.active : ''}`}
                        onClick={() => setActiveView('menu')}
                    >
                        <span>Manage Menu</span>
                    </button>
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/" className={styles.navItem}>
                        <span>&larr; Customer View</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={styles.mainContent}>
                {activeView === 'orders' ? (
                    <div className={styles.kanbanBoard}>
                        {columns.map(col => {
                            const colOrders = orders
                                .filter(o => {
                                    // Treat 'accepted' as 'pending' for the board since next step is same
                                    if (col.id === 'pending') return o.status === 'pending' || o.status === 'accepted';
                                    return o.status === col.id;
                                })
                                // Sort served orders by newest first, others by oldest first
                                .sort((a, b) => {
                                    if (col.id === 'served') {
                                        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                                    }
                                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                                });

                            return (
                                <div key={col.id} className={styles.kanbanColumn}>
                                    <div className={styles.columnHeader}>
                                        <div className={styles.columnTitle}>
                                            <span className={styles.columnDot} data-status={col.id}></span>
                                            {col.label}
                                        </div>
                                        <span className={styles.columnCount}>{colOrders.length}</span>
                                    </div>

                                    <div className={styles.orderCards}>
                                        {colOrders.length === 0 ? (
                                            <div className={styles.emptyState} style={{ background: 'transparent', padding: 'var(--space-4)' }}>
                                                No orders
                                            </div>
                                        ) : (
                                            colOrders.map(order => {
                                                const nextStatus = getNextStatus(order.status);

                                                return (
                                                    <div key={order.id} className={styles.card} data-status={order.status}>
                                                        <div className={styles.cardHeader}>
                                                            <span className={styles.tableTag}>
                                                                {order.tableId ?
                                                                    (tables.find(t => t.id === order.tableId)?.name || `Table ${order.tableId}`)
                                                                    : 'Delivery'}
                                                            </span>
                                                            <span className={styles.orderTime}>
                                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>

                                                        <div className={styles.itemList}>
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} className={styles.itemRow}>
                                                                    <span className={styles.itemQty}>{item.quantity}x</span>
                                                                    <span className={styles.itemDetails}>{item.menuItem.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className={styles.cardFooter}>
                                                            <div className={styles.orderTotal}>
                                                                <span>Total</span>
                                                                <span className={styles.totalValue}>{formatPrice(order.total)}</span>
                                                            </div>

                                                            {nextStatus && (
                                                                <div className={styles.actions} style={{ marginTop: 'var(--space-2)' }}>
                                                                    <button
                                                                        className={`btn btn-sm ${order.status === 'pending' || order.status === 'accepted' ? 'btn-primary' : 'btn-secondary'}`}
                                                                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                                                    >
                                                                        {(order.status === 'pending' || order.status === 'accepted') && 'Start Cooking →'}
                                                                        {order.status === 'preparing' && 'Mark Ready →'}
                                                                        {order.status === 'ready' && 'Deliver →'}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.menuView}>
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Menu Management</h2>
                        <KitchenMenu />
                    </div>
                )}
            </main>
        </div>
    );
}
