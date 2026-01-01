'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem } from '@/lib/types';
import { fetchMenu, updateMenuItem, deleteMenuItem, formatPrice } from '@/lib/storage';
import ThemeToggle from '@/components/ThemeToggle';
import BrandIcon from '@/components/BrandIcon';
import styles from '../admin.module.css';

const categoryIcons: Record<string, string> = {
    'Starters': '',
    'Main Course': '',
    'Drinks': '',
    'Desserts': ''
};

export default function MenuManagementPage() {
    const pathname = usePathname();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');

    // Derive categories from menu items
    const categories = useMemo(() => {
        return [...new Set(menuItems.map(item => item.categoryName))];
    }, [menuItems]);

    useEffect(() => {
        const loadMenu = async () => {
            const menu = await fetchMenu();
            setMenuItems(menu.length > 0 ? menu : []);
        };
        loadMenu();
    }, []);

    const handleToggleAvailability = async (itemId: string) => {
        const item = menuItems.find(m => m.id === itemId);
        if (item) {
            // Optimistic update
            const updatedItem = { ...item, isAvailable: !item.isAvailable };
            setMenuItems(prev => prev.map(m => m.id === itemId ? updatedItem : m));

            const success = await updateMenuItem(itemId, { isAvailable: !item.isAvailable });
            if (!success) {
                // Revert if failed
                setMenuItems(prev => prev.map(m => m.id === itemId ? item : m));
                alert('Failed to update availability');
            }
        }
    };

    const filteredItems = activeCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.categoryName === activeCategory);

    const navItems = [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/orders', label: 'Orders' },
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
                        <h1 className={styles.headerTitle}>Menu Management</h1>
                        <p className={styles.headerSubtitle}>Enable, disable, or mark items as out of stock</p>
                    </div>
                    <button className="btn btn-primary">
                        + Add Item
                    </button>
                </div>

                {/* Category Filter */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-6)',
                    flexWrap: 'wrap'
                }}>
                    <button
                        className={`btn ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        All Items
                    </button>
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`btn ${activeCategory === category ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Menu List */}
                <div className={styles.menuList}>
                    {filteredItems.map(item => (
                        <div key={item.id} className={styles.menuRow}>
                            <div className={styles.menuRowImage} style={{ background: 'var(--bg-tertiary)' }}>
                            </div>
                            <div className={styles.menuRowInfo}>
                                <div className={styles.menuRowName}>
                                    {item.name}
                                    {item.isPopular && (
                                        <span className="badge badge-primary" style={{ marginLeft: 'var(--space-2)' }}>
                                            Popular
                                        </span>
                                    )}
                                </div>
                                <div className={styles.menuRowCategory}>{item.categoryName}</div>
                            </div>
                            <div className={styles.menuRowPrice}>{formatPrice(item.price)}</div>
                            <div className={styles.menuRowActions}>
                                <span style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: item.isAvailable ? 'var(--success)' : 'var(--danger)',
                                    minWidth: '80px'
                                }}>
                                    {item.isAvailable ? 'Available' : 'Sold Out'}
                                </span>
                                <button
                                    className={`${styles.toggle} ${item.isAvailable ? styles.active : ''}`}
                                    onClick={() => handleToggleAvailability(item.id)}
                                    title={item.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                                />
                                <button
                                    className="btn btn-sm btn-ghost"
                                    style={{ color: 'var(--danger)', marginLeft: 'var(--space-2)' }}
                                    onClick={async () => {
                                        if (confirm(`Delete ${item.name}?`)) {
                                            const success = await deleteMenuItem(item.id);
                                            if (success) {
                                                setMenuItems(prev => prev.filter(m => m.id !== item.id));
                                            } else {
                                                alert('Failed to delete item');
                                            }
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
