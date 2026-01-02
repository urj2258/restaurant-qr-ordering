'use client';

import { useState, useEffect } from 'react';
import { fetchOrders } from '@/lib/storage'; // We might want a more specialized query for ranges later
import { Order, CartItem } from '@/lib/types';
import { PrinterIcon } from '@/components/Icons';
import styles from '../admin.module.css';

export default function ReportsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [dateRange]);

    const loadData = async () => {
        setLoading(true);
        const allOrders = await fetchOrders(); // Fetches all for now (optimize later with Firestore queries)

        // Filter by date
        const now = new Date();
        const filtered = allOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            if (dateRange === 'today') {
                return orderDate.toDateString() === now.toDateString();
            } else if (dateRange === 'week') {
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                return orderDate > weekAgo;
            } else { // month
                return orderDate.getMonth() === new Date().getMonth();
            }
        });

        setOrders(filtered);
        setLoading(false);
    };

    const calculateStats = () => {
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Item Popularity
        const itemMap = new Map<string, { name: string; count: number; revenue: number }>();
        orders.forEach(order => {
            order.items.forEach(item => {
                const existing = itemMap.get(item.menuItem.id) || { name: item.menuItem.name, count: 0, revenue: 0 };
                existing.count += item.quantity;
                existing.revenue += item.menuItem.price * item.quantity;
                itemMap.set(item.menuItem.id, existing);
            });
        });

        const topItems = Array.from(itemMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return { totalRevenue, totalOrders, avgOrderValue, topItems };
    };

    const stats = calculateStats();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={styles.adminLayout}>
            <main className={`${styles.mainContent} ${styles.printLayout}`}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.headerTitle}>Business Reports</h1>
                        <p className={styles.headerSubtitle}>Revenue, Operations and Performance</p>
                    </div>
                    <div className={styles.headerActions}>
                        <select
                            className={styles.selectInput}
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as any)}
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                        <button className="btn btn-secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PrinterIcon size={16} /> Print / Save PDF
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div>Loading reports...</div>
                ) : (
                    <div className={styles.reportContainer}>
                        {/* KPI Cards */}
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Total Revenue</div>
                                <div className={styles.statValue}>Rs. {(stats.totalRevenue || 0).toLocaleString()}</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Total Orders</div>
                                <div className={styles.statValue}>{stats.totalOrders}</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Avg. Order Value</div>
                                <div className={styles.statValue}>Rs. {Math.round(stats.avgOrderValue || 0).toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Top Items Table */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Top Selling Items</h2>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th>Units Sold</th>
                                        <th>Revenue Generated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.name}</td>
                                            <td>{item.count}</td>
                                            <td>Rs. {(item.revenue || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
