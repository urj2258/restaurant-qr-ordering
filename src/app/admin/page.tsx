'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Order, Table } from '@/lib/types';
import { fetchOrders, formatPrice, fetchTables } from '@/lib/storage';
import ThemeToggle from '@/components/ThemeToggle';
import BrandIcon from '@/components/BrandIcon';
import styles from './admin.module.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function AdminDashboard() {
    const pathname = usePathname();
    const [orders, setOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    // Memoized Stats to avoid unnecessary recalculations
    const dashboardStats = useMemo(() => {
        const today = new Date().toDateString();
        const todayOrders = orders.filter(o =>
            new Date(o.createdAt).toDateString() === today
        );

        // Stats
        const revenue = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const pending = orders.filter(o => o.status === 'pending').length;

        // Yesterday's stats for growth
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        const yesterdayOrders = orders.filter(o =>
            new Date(o.createdAt).toDateString() === yesterdayStr
        );
        const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        const orderGrowth = yesterdayOrders.length > 0
            ? Math.round(((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100)
            : todayOrders.length > 0 ? 100 : 0;

        const revenueGrowth = yesterdayRevenue > 0
            ? Math.round(((revenue - yesterdayRevenue) / yesterdayRevenue) * 100)
            : revenue > 0 ? 100 : 0;

        // Calculate 7-day trend
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toDateString();
        });

        const dailyRevenue = last7Days.map(dateStr => {
            const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === dateStr);
            return dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        });

        const dailyOrderCounts = last7Days.map(dateStr => {
            const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === dateStr);
            return dayOrders.length;
        });

        const chart = {
            labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
            datasets: [
                {
                    label: 'Revenue (PKR)',
                    data: dailyRevenue,
                    borderColor: '#F48222',
                    backgroundColor: 'rgba(244, 130, 34, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Orders',
                    data: dailyOrderCounts,
                    borderColor: '#3b82f6',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        };

        const feedback = orders
            .filter(o => o.feedback)
            .sort((a, b) => new Date(b.feedback!.createdAt).getTime() - new Date(a.feedback!.createdAt).getTime())
            .slice(0, 5);

        return {
            todayOrders: todayOrders.length,
            todayRevenue: revenue,
            orderGrowth,
            revenueGrowth,
            pendingOrders: pending,
            avgOrderTime: 12,
            chartData: chart,
            reviews: feedback
        };
    }, [orders]);

    useEffect(() => {
        const loadDashboardData = async () => {
            const [allOrders, allTables] = await Promise.all([
                fetchOrders(),
                fetchTables()
            ]);
            setOrders(allOrders);
            setTables(allTables);
        };
        loadDashboardData();
    }, []);

    const navItems = [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/orders', label: 'Orders', badge: dashboardStats.pendingOrders },
        { href: '/admin/tables', label: 'Tables' },
        { href: '/admin/menu', label: 'Menu' },
        { href: '/admin/analytics', label: 'Analytics' }
    ];

    return (
        <div className={styles.adminLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <BrandIcon size={24} color="var(--accent-primary)" />
                    </div>
                    <span className={styles.logoText}>Abbottabad Eats</span>
                </div>

                <nav className={styles.navSection}>
                    <div className={styles.navLabel}>Main Menu</div>
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                        >
                            <span className={styles.navIcon}></span>
                            <span>{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className={styles.navBadge}>{item.badge}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                <nav className={styles.navSection}>
                    <div className={styles.navLabel}>Quick Links</div>
                    <Link href="/" className={styles.navItem}>
                        <span>Customer View</span>
                    </Link>
                    <div className={styles.navItem} style={{ marginTop: 'auto', padding: '0 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            <span>Theme</span>
                            <ThemeToggle />
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.headerTitle}>Dashboard</h1>
                        <p className={styles.headerSubtitle}>Welcome back! Here&apos;s what&apos;s happening today.</p>
                    </div>
                    <button className="btn btn-primary">
                        + New Order
                    </button>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Today&apos;s Orders</div>
                        <div className={styles.statValue}>{dashboardStats.todayOrders}</div>
                        <div className={`${styles.statChange} ${dashboardStats.orderGrowth >= 0 ? styles.positive : styles.negative}`}>
                            {dashboardStats.orderGrowth >= 0 ? '+' : ''}{dashboardStats.orderGrowth}% from yesterday
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Today&apos;s Revenue</div>
                        <div className={styles.statValue}>{formatPrice(dashboardStats.todayRevenue)}</div>
                        <div className={`${styles.statChange} ${dashboardStats.revenueGrowth >= 0 ? styles.positive : styles.negative}`}>
                            {dashboardStats.revenueGrowth >= 0 ? '+' : ''}{dashboardStats.revenueGrowth}% from yesterday
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Pending Orders</div>
                        <div className={styles.statValue}>{dashboardStats.pendingOrders}</div>
                        <div className={styles.statChange}>
                            Needs attention
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            Avg. Order Time
                        </div>
                        <div className={styles.statValue}>{dashboardStats.avgOrderTime}m</div>
                        <div className={`${styles.statChange} ${styles.positive}`}>
                            -2 min from last week
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                {dashboardStats.chartData && (
                    <div className={styles.chartGallery}>
                        <div className={styles.chartContainer}>
                            <h3 className={styles.chartTitle}>Revenue & Order Trend (Last 7 Days)</h3>
                            <div style={{ height: '300px' }}>
                                <Line
                                    data={dashboardStats.chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: 'rgba(255,255,255,0.05)' }
                                            },
                                            y1: {
                                                position: 'right',
                                                beginAtZero: true,
                                                grid: { display: false }
                                            }
                                        },
                                        plugins: {
                                            legend: { display: true, position: 'bottom' }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.dashboardGrid}>
                    {/* Recent Orders */}
                    <div className={styles.ordersSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Recent Orders</h2>
                            <Link href="/admin/orders" className="btn btn-secondary btn-sm">
                                View All
                            </Link>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)' }}>
                            {orders.slice(0, 4).map(order => (
                                <div key={order.id} className={styles.orderCard}>
                                    <div className={styles.orderCardHeader}>
                                        <div className={styles.tableNumber}>
                                            {order.tableId ?
                                                (tables.find(t => t.id === order.tableId)?.name || `Table ${order.tableId}`)
                                                : 'Delivery'}
                                        </div>
                                        <span className={styles.orderTime}>
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={styles.orderItems}>
                                        {order.items.slice(0, 2).map(item => (
                                            <div key={item.id} className={styles.orderItem}>
                                                {item.quantity}x {item.menuItem.name}
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <div className={styles.orderItem} style={{ fontStyle: 'italic', fontSize: '0.75rem' }}>
                                                +{order.items.length - 2} more items
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.orderFooter}>
                                        <span className={styles.orderTotalValue}>{formatPrice(order.total)}</span>
                                        <span
                                            className={`badge`}
                                            style={{
                                                background: order.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                color: order.status === 'pending' ? 'var(--warning)' : 'var(--success)',
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Reviews */}
                    <div className={styles.reviewsSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Latest Reviews</h2>
                        </div>
                        <div className={styles.reviewsList}>
                            {dashboardStats.reviews.length === 0 ? (
                                <div className={styles.emptyState}>No reviews yet</div>
                            ) : (
                                dashboardStats.reviews.map(order => (
                                    <div key={order.id} className={styles.reviewCard}>
                                        <div className={styles.reviewHeader}>
                                            <div className={styles.reviewStars}>
                                                {'★'.repeat(order.feedback!.rating)}
                                                {'☆'.repeat(5 - order.feedback!.rating)}
                                            </div>
                                            <span className={styles.reviewDate}>
                                                {new Date(order.feedback!.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className={styles.reviewComment}>&quot;{order.feedback?.comment}&quot;</p>
                                        <div className={styles.reviewCustomer}>
                                            {order.tableId ?
                                                (tables.find(t => t.id === order.tableId)?.name || `Table ${order.tableId}`)
                                                : 'Delivery'} • {order.items[0]?.menuItem.name}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
