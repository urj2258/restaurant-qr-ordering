'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { fetchOrders, formatPrice } from '@/lib/storage';
import { Order } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';
import BrandIcon from '@/components/BrandIcon';
import styles from '../admin.module.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler);

export default function AnalyticsPage() {
    const pathname = usePathname();
    const [orders, setOrders] = useState<Order[]>([]);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'year'>('7d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const allOrders = await fetchOrders();
            setOrders(allOrders);
            setLoading(false);
        };
        loadData();
    }, []);

    const stats = useMemo(() => {
        if (orders.length === 0) return {
            totalRevenue: 0,
            orderCount: 0,
            avgOrderValue: 0,
            growth: 0,
            dailyData: [],
            categoryData: { labels: [], datasets: [] as any[] },
            tablePerformance: [] as { id: string, revenue: number }[],
            peakHours: Array(24).fill(0)
        };

        const now = new Date();
        const rangeInDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
        const cutoff = new Date(now.setDate(now.getDate() - rangeInDays));

        const filteredOrders = orders.filter(o => new Date(o.createdAt) >= cutoff);
        const revenue = filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        // Group by day/month for charts
        const grouped: Record<string, { revenue: number, count: number }> = {};
        const hours = Array(24).fill(0);
        const categories: Record<string, number> = {};
        const tableStats: Record<string, number> = {};

        filteredOrders.forEach(order => {
            const dateStr = timeRange === 'year'
                ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' })
                : new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            grouped[dateStr] = {
                revenue: (grouped[dateStr]?.revenue || 0) + (Number(order.total) || 0),
                count: (grouped[dateStr]?.count || 0) + 1
            };

            const hour = new Date(order.createdAt).getHours();
            hours[hour]++;

            order.items.forEach(item => {
                const cat = item.menuItem.categoryName || 'Other';
                // Calculate item total: (price + sizeModifier) * qty + extras
                const itemTotal = (item.menuItem.price + (item.selectedSize?.priceModifier || 0)) * item.quantity +
                    (item.selectedExtras?.reduce((s, e) => s + e.price, 0) || 0);
                categories[cat] = (categories[cat] || 0) + itemTotal;
            });

            if (order.tableId) {
                tableStats[order.tableId] = (tableStats[order.tableId] || 0) + (Number(order.total) || 0);
            }
        });

        // Simple growth calculation vs previous period (7d/30d)
        const prevCutoff = new Date(cutoff);
        prevCutoff.setDate(prevCutoff.getDate() - rangeInDays);
        const prevOrders = orders.filter(o => {
            const d = new Date(o.createdAt);
            return d >= prevCutoff && d < cutoff;
        });
        const prevRevenue = prevOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

        return {
            totalRevenue: revenue,
            orderCount: filteredOrders.length,
            avgOrderValue: filteredOrders.length > 0 ? revenue / filteredOrders.length : 0,
            growth: Math.round(growth),
            dailyData: Object.entries(grouped).map(([label, val]) => ({ label, ...val })),
            categoryData: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: ['#F48222', '#3b82f6', '#34C759', '#FF3B30', '#FF9500'],
                    borderWidth: 0
                }]
            },
            tablePerformance: Object.entries(tableStats)
                .map(([id, rev]) => ({ id, revenue: rev }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10),
            peakHours: hours
        };
    }, [orders, timeRange]);

    const navItems = [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/orders', label: 'Orders' },
        { href: '/admin/tables', label: 'Tables' },
        { href: '/admin/menu', label: 'Menu' },
        { href: '/admin/analytics', label: 'Analytics' }
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(20, 20, 22, 0.9)',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' as const },
                bodyFont: { size: 13 },
                displayColors: false,
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'var(--text-muted)' } }
        }
    };

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
                            <span>{item.label}</span>
                        </Link>
                    ))}
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
                        <h1 className={styles.headerTitle}>Business Intelligence</h1>
                        <p className={styles.headerSubtitle}>Pro-tier analytics and growth tracking</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                            className={`btn ${timeRange === '7d' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setTimeRange('7d')}
                        >
                            7 Days
                        </button>
                        <button
                            className={`btn ${timeRange === '30d' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setTimeRange('30d')}
                        >
                            30 Days
                        </button>
                        <button
                            className={`btn ${timeRange === 'year' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setTimeRange('year')}
                        >
                            Year View
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Revenue ({timeRange})</div>
                        <div className={styles.statValue}>{formatPrice(stats.totalRevenue)}</div>
                        <div className={`${styles.statChange} ${(stats.growth ?? 0) >= 0 ? styles.positive : styles.negative}`}>
                            {(stats.growth ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(stats.growth ?? 0)}% vs prev
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Order Count</div>
                        <div className={styles.statValue}>{stats.orderCount}</div>
                        <div className={styles.statChange}>Total processed</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Avg Order Value</div>
                        <div className={styles.statValue}>{formatPrice(stats.avgOrderValue)}</div>
                        <div className={styles.statChange}>Per transaction</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Peak Activity</div>
                        <div className={styles.statValue}>
                            {stats.peakHours.indexOf(Math.max(...stats.peakHours))}:00
                        </div>
                        <div className={styles.statChange}>Busiest hour</div>
                    </div>
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                    {/* Revenue Trend Chart */}
                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>Revenue Trend ({timeRange})</h3>
                        <div style={{ height: '350px' }}>
                            <Line
                                data={{
                                    labels: stats.dailyData.map(d => d.label),
                                    datasets: [{
                                        label: 'Revenue',
                                        data: stats.dailyData.map(d => d.revenue),
                                        borderColor: '#F48222',
                                        backgroundColor: 'rgba(244, 130, 34, 0.1)',
                                        fill: true,
                                        tension: 0.4
                                    }]
                                }}
                                options={chartOptions}
                            />
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>Category Mix</h3>
                        <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Doughnut
                                data={stats.categoryData}
                                options={{
                                    cutout: '70%',
                                    plugins: { legend: { display: true, position: 'bottom' } }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Second Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                    {/* Table ROI Rank */}
                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>Table Performance (ROI)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {stats.tablePerformance.map((table, idx) => (
                                <div key={table.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                    <span style={{ width: '20px', fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</span>
                                    <span style={{ flex: 1 }}>Table {table.id}</span>
                                    <div style={{ flex: 2, background: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px' }}>
                                        <div style={{
                                            width: `${(table.revenue / stats.tablePerformance[0].revenue) * 100}%`,
                                            height: '100%',
                                            background: 'var(--accent-primary)',
                                            borderRadius: '4px'
                                        }} />
                                    </div>
                                    <span style={{ width: '80px', textAlign: 'right', fontWeight: 600 }}>{formatPrice(table.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Peak Hours Heatmap */}
                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>Peak Hours Heatmap</h3>
                        <div style={{ height: '300px' }}>
                            <Bar
                                data={{
                                    labels: stats.peakHours.map((_, i) => `${i}:00`),
                                    datasets: [{
                                        data: stats.peakHours,
                                        backgroundColor: stats.peakHours.map(v =>
                                            `rgba(244, 130, 34, ${Math.max(0.1, v / Math.max(...stats.peakHours))})`
                                        ),
                                        borderRadius: 4
                                    }]
                                }}
                                options={chartOptions}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
